const express = require("express");

const ejs = require("ejs");

const app = express();

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ encoded: true }));

app.set("view engine", "ejs");

app.use(express.static("public"));


const lodash = require("lodash");


//mongoose connection

const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect("mongodb+srv://Admin-Bhavya:Test%40123@cluster0.d7z9nxb.mongodb.net/todolistDB");
    console.log("successfully cvonnect3ed to mongo db");
}

//mongooose schema defining for / route

const todoSchema = new mongoose.Schema({
    name: String
})

// collection creation using momngoose model


const Item = new mongoose.model("Item", todoSchema);

//item in our todolist with mongoose

const item1 = new Item({
    name: "Connnecting to Mongooose and making page work all the time"
});

// adding the item1 we have created above to a default Array

const defaultArray = [item1];

// define mongoose schema for our dynamic routes which comes through user input. Array listValues is going to be the one that is going to
// store the new items entered by the user.

const ListSchema = new mongoose.Schema({
    name: String,
    listValues: [todoSchema]
})

//creating a collection called List for our dynamic user to do list pages

const List = mongoose.model("List", ListSchema);




/* Item.deleteMany(function(err){
    if(err){
        console.log(err);
    }
    else{
        console.log("deleted sucessfullly");
    }
}) */

//let items = [];
var count = 0;


app.get("/", function (req, res) {

    let today = new Date;

    let options = {
        weekday: "long",
        date: "numeric",
        month: "long"
    }

    var typeOfDay = today.toLocaleDateString("en-US", options);

    //console logingg the name in our Hyper terminal with find()

    // if the item(Today list) already exists, the preventing mongo  from creating another list

    Item.find(function (err, items) {
        if (err) {
            console.log(err);
        }
        else if (items.length === 0) {
            item1.save();
            res.redirect("/");
        }
        else {
            res.render("list", { kindOfDay: "Today", items: items});
        }
    });

});

//Adding a new item to the list and making sure that it gets added to the correct page

app.post("/", function (req, res) {

    let newitem = req.body.newitem

    // each button has a name and value, we can define. here we are using that to differentiate between different lists we have

    let buttonValue = req.body.listbutton

    //creating a new item2 for user entered new item

    let item2 = new Item({
        name: newitem
    })

    //if it is / route then redirect to home route
    if(buttonValue === "Today"){
        
        item2.save();
        res.redirect("/");

    }
    // if it is not, then find the route and from that found list, take the listvalues that we defined to store user input and add 
    //it to the array, then rediredct to the corresponding page
    else{
        List.findOne({name: buttonValue}, function(err, found){
            console.log(buttonValue);
            found.listValues.push(item2);
            console.log(found.listValues);
            //found.listValues.push(item2);
            found.save();
            res.redirect("/" + buttonValue);
        })
    }

});

app.post("/delete", function (req, res) {
    let checkedbox = req.body.checkbox
    let listName = req.body.listName;

    if(listName ==="Today"){
        Item.deleteOne({ _id: checkedbox }, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                
                res.redirect("/")
            }
        });
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull: {listValues: {_id: checkedbox}}}, function(err, found){
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/" + listName);
            }
        });
    }    
});


app.get("/:lists", function (req, res) {
    List.findOne({ name: req.params.lists }, function (err, listFound) {
        if (err) {
            console.log(err);
        }
        else if (!listFound) {
            console.log(req.params.lists);
            const list1 = new List({
                name: req.params.lists,
                listValues: defaultArray
            })
            list1.save();
            res.redirect("/" + req.params.lists);
        }
        else{
                res.render("list" , {kindOfDay: req.params.lists, items: listFound.listValues }); 
        }
    })


})

app.listen(process.env.PORT || 3000, function () {

    console.log("server has started sucessfully on 3000");
});
