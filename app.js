//jshint esversion:6

// mongo "mongodb+srv://cluster0.ayuhvlb.mongodb.net/myFirstDatabase" --username admin-vishesh
//mongo "mongodb+srv://cluster0.ayuhvlb.mongodb.net/myFirstDatabase" --username admin-vishesh

const express = require("express");
const bodyParser = require("body-parser");
const ld = require("lodash");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//connecting to local database
mongoose.connect(
  "mongodb+srv://admin-vishesh:Test123@cluster0.aurruci.mongodb.net/todoListDB",
  {
    useNewUrlParser: true,
  }
);

//creating a schema
const itemSchema = {
  name: String,
};

const Item = mongoose.model("item", itemSchema);

const homework = new Item({
  name: "homework",
});
const dance = new Item({
  name: "Dance Class",
});
const grocery = new Item({
  name: "Grocery shop",
});

const defaultItems = [homework, dance, grocery];
const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("list", listSchema);

app.get("/", function (req, res) {
  Item.find({}, (err, foundItem) => {
    // console.log(foundItem);
    if (foundItem.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Data Inserted !!");
        }
      });
      res.redirect("/");
    }
    res.render("list", { listTitle: "Today", newListItems: foundItem });
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  // In below line of code i was getting error i.e
  // const checkedItem = req.body.checkbox;
  // error : Your request parameter must be a string of 12 bytes or a string of 24 hex characters Check the _id in your request params. It must be a 24 hex as this: 61d634706a98a61edd42bf45
  // when you log the error you will see that an extra space is added in the end of mongodb _id field i.e "61d634706a98a61edd42bf45 " so use trim() method to remove the unneccessary space and it solved.
  //it is also solved by just removing extra space from ejs file i.e list.ejs. Inside " " there should not be a space else it will add the space in value.
  //wrong : value="<%=item._id%> " here you will se space
  //correct : value="<%=item._id%>" here not.

  const checkedItem = req.body.checkbox; //use this line of code if you facing above error.
  //const checkedItem = req.body.checkbox.trim(); or
  //const checkedItem = mongoose.Types.objectId(req.body.checkbox.trim());
  // console.log(checkedItem);
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItem, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Data deleted successfully");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItem } } },
      (err, foundList) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.get("/:customListName", (req, res) => {
  const customListName = ld.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // Show an existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

// app.get("/about", function (req, res) {
//   res.render("about");
// });

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
