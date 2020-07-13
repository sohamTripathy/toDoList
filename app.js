//jshint esversion: 6

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const ejs = require('ejs');
const mongoose = require('mongoose');
const _ = require('lodash');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });
const itemSchema = new mongoose.Schema({
    name: String
});

const reqSchema = new mongoose.Schema({
    name: String,
    contents: [itemSchema] 
});

const ReqItem = mongoose.model('ReqItem', reqSchema);
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "welcome to todolist page"
});

const item2 = new Item({
    name: "click + to add items"
});

const item3 = new Item({
    name: "<-- click to delete items"
});

const commonItems = [item1, item2, item3];
var formattedToday = date.getDay();


app.get('/', (req, res) => {
    
    Item.find({}, (err, item) => {
        if(item.length == 0) {
            Item.insertMany(commonItems, (err) => {
                if(!err) {
                    console.log('sucessfully saved 3 items');        
                } else {
                    console.log(err);        
                }
            });
            res.redirect('/');
        } else {
            
            res.render('index', {today: formattedToday, list: item});
        }
    });
    
    
    
});

app.get('/:title', (req, res) => {
    const title = _.capitalize(req.params.title);
    
    

    ReqItem.findOne({name: title}, (err, result) => {
        if(!result) {
            const newPageContent = new ReqItem({
                name: title,
                contents: commonItems    
            });
            newPageContent.save();
            res.redirect('/' + title);
            
            
        } else {
            res.render('index', {today: title, list: result.contents});
            
        }
        
    });

    
});

app.post('/', (req, res) => {
    var newItemName = req.body.listItem;
    const customTitle = req.body.list;
    const newItem = new Item({
        name: newItemName
    });

    if(customTitle == formattedToday) {        
    
        newItem.save();
    
        res.redirect('/');
    } else {
        ReqItem.findOne({name: customTitle}, (err, foundList) => {              
            foundList.contents.push(newItem);
            foundList.save();            
        });
        res.redirect('/' + customTitle);
    }

    
});

app.post('/delete', (req, res) => {
    const delName = req.body.checkbox;
    const title = req.body.title;
    
    if (title == formattedToday) {
        Item.deleteOne({name: delName}, (err) => {
            if(!err) {
                console.log('sucessfully delted the item');            
            } else{
                console.log(err);            
            }
        });
        res.redirect('/');
    } else {
        ReqItem.findOneAndUpdate({
            name: title
        }, {
            $pull:{contents: {name: delName
            }}}, 
            (err, foundList) => {
                if(!err) {
                    res.redirect('/' + title);
                }
            }
        );
    }
           
});



app.listen(3000 || process.env.PORT, () => {
    console.log("system is running on port 3000.");
    
});



