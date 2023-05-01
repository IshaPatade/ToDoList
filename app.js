

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose= require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewURLParser: true});
mongoose.connect('mongodb+srv://admin-Isha:admin-Isha@cluster0.hdpwduw.mongodb.net/todolistDB');

const itemsSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});


const Item = mongoose.model("Item",itemsSchema);

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Wake up"
});
const item2 = new Item({
  name: "Gym"
});
const item3 = new Item({
  name: "Nap"
});

const defaultitems=[item1, item2, item3];


app.get("/", function(req, res) {


    Item.find().then((foundItems) => {

      if(foundItems.length== 0){
        Item.insertMany(defaultitems)
        .then(function(){
          console.log("Successfully saved into our DB.");
        })
        .catch(function(err){
          console.log(err);
        });
       
        res.redirect("/");
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
      
     })

});

app.post("/", function(req, res){

  const newItem = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: newItem
  })

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}).then(function(foundList){
        
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+ listName);
  })
  .catch(function(err){});
  }

  
  
});

app.post("/delete", function(req,res){

  const itemid = req.body.checkbox;
  const listName = req.body.listName;
  
  if(listName==="Today"){
    Item.findByIdAndRemove(itemid).then(function(){
      console.log("Sucessful removed");
      res.redirect("/");
    }).catch( err => console.log(err));
    
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull:{ items:{_id:itemid }}}, {new: true}).then(function(foundlist){
      res.redirect("/" + listName);
    }).catch( err => console.log(err));
    
}})

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName})
  .then(function(foundList){
      
        if(!foundList){
          const list = new List({
            name:customListName,
            items:defaultitems
          });
        
          list.save();
          console.log("saved");
          res.redirect("/"+customListName);
        }
        else{
          res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
        }
  })
  .catch(function(err){});

});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
