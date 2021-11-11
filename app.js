//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://admin-keshav:keshav2647@cluster0.9cq7p.mongodb.net/todolistDB",
  { useNewUrlParser: true }
);

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "welcome to our TodoList!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item!",
});

const item3 = new Item({
  name: "Hit this to delete an item!",
});

const defaultsItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const lists = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length == 0) {
      Item.insertMany(defaultsItems, function (err) {
        if (err) {
          console.log("There is an error!");
        } else {
          console.log("Congratulations!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const ListName = req.body.list;
  const item = new Item({
    name: itemName,
  });

  if (ListName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    lists.findOne({ name: ListName }, function (err, FoundList) {
      FoundList.items.push(item);
      FoundList.save();
      res.redirect("/" + ListName);
    });
  }
});

app.post("/delete", function (req, res) {
  const itemTo = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(itemTo, function (err) {
      if (!err) {
        console.log("Sucessfully Deleted Item ");
        res.redirect("/");
      }
    });
  } else {
    lists.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: itemTo } } },
      function (err, foundlist) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:customListName", function (req, res) {
  const customlistname = _.capitalize(req.params.customListName);

  lists.findOne({ name: customlistname }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const listss = new lists({
          name: customlistname,
          items: defaultsItems,
        });

        listss.save();
        res.redirect("/" + customlistname);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });

  const listss = new lists({
    name: req.params.customListName,
    items: defaultsItems,
  });

  listss.save();
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started on port 3000");
});
