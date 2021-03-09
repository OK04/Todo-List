//jshint esversion:6

const express = require("express");
const bodyParser=require("body-parser");
const ejs = require("ejs");
const mongoose=require("mongoose");
const _ =require("lodash");
// const date=require(__dirname+"/date.js");



const app=express();

// let additems=["Buy Food", "Cook Food" , "Eat Food"];
// let workitems=[]

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-ok:soldierok@cluster0.zxklh.mongodb.net/todolist",{useNewUrlParser:true, useUnifiedTopology: true});

const itemsSchema=new mongoose.Schema({
  name: String
});

const Item=new mongoose.model("Item", itemsSchema);

const item1=new Item({
  name:"Welcome to your Todolist!"
});

const item2=new Item({
  name:"Hit the + button to add new item!"
});

const item3=new Item({
  name:"< Hit the button to delete an item!"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items: [itemsSchema]
};

const List=new mongoose.model("List",listSchema);

app.get("/",function(req,res){
// let day=date.getDay();

Item.find({},function(err,foundItems){

if(foundItems.length === 0){
  Item.insertMany(defaultItems,function(err){
    if (err){
      console.log(err);
    }else{
      console.log("Successfully added to data-base");
    }
  });
  res.redirect("/");
}else{
  res.render("list",{
    listTitle:"Today",
    newItems:foundItems});
  }
});
});

app.post("/",function(req,res){
// let additem=req.body.additem;

// if(req.body.list === "Work"){
//   workitems.push(additem);
//    res.redirect("/work");
// }else
// {
//   additems.push(additem);
//  res.redirect("/");
// }

const itemName=req.body.additem;
const listName=req.body.list;

const item=new Item({
  name:itemName
});

if(listName === "Today"){
  item.save();
  res.redirect("/");
}else
{
  List.findOne({name: listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+ listName);
  })
}


});

// app.get("/work",function(req,res){
//   res.render("list",{
//     listTitle:"Work List",
//     newItems:workitems
//   });
// })

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);

List.findOne({name: customListName},function(err,foundList){
  if(!err){
    if(!foundList){
      //create an new list
      const list=new List({
        name:customListName,
        items:defaultItems
      })
      list.save();
      res.redirect("/"+customListName);
    }else{
      res.render("list",{
        listTitle:foundList.name,
        newItems:foundList.items});
    }
  }
});


})

app.post("/work",function(req,res){
  let item=req.body.additem;
  workitems.push(item);
  res.redirect("/work");
})


app.post("/delete",function(req,res){
  const checkedItemID=req.body.checkbox;
  const listName=req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemID,function(err){
      if(!err){
        console.log("Successfully deleted");
        res.redirect("/");
      }
    });
  }else{
     List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemID}}}, function(err,foundList){
       if(!err){
         res.redirect("/"+ listName);
       }
     });
  }


})

let port = process.env.PORT;
if(port== null || port== ""){
  port = 3000;
}


app.listen(port,function(){
  console.log("server started");
})
