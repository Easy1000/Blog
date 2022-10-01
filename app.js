const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();

mongoose.connect(process.env.mongoose, () =>
  console.log("connected to mongodb")
);

app.set("view engine", "ejs");
app.use(express.static(`${__dirname}/public`));
app.use(express.urlencoded({ extended: true }));

const entrySchema = new mongoose.Schema({
  title: String,
  body: String,
});

const postsSchema = new mongoose.Schema({
  title: String,
  posts: [entrySchema],
});

const Entry = mongoose.model("Entry", entrySchema);
const Posts = mongoose.model("Post", postsSchema);

app.get("/", (req, res) => {
  Posts.find({}, (err, docs) => {
    console.log(docs);
    res.render("frontPage", { posts: docs });
  });
});

app.get("/create", (req, res) => {
  res.render("create");
});

app.get("/posts/:param", (req, res) => {
  Posts.findOne({ title: req.params.param }, (err, docs) => {
    res.render("entries", { entries: docs });
  });
});

app.get("/createEntry/:param", (req, res) => {
  res.render("createEntry", { title: req.params.param });
});

app.post("/create", (req, res) => {
  console.log(req.body.title);

  Posts.findOne({ title: req.body.title }, (err, docs) => {
    if (!docs) {
      console.log("no doc");
      const newPost = new Posts({
        title: req.body.title,
        posts: [],
      }).save();

      res.redirect("/");
    } else {
      res.redirect("/create");
    }
  });
});

app.post("/createEntry/:param", (req, res) => {
  Posts.findOne({ title: req.params.param }, (err, docs) => {
    if (req.body.title === "" || req.body.body === "") {
      console.log("empty");
      res.redirect(`/createEntry/${req.params.param}`);
    } else {
      const newEntry = new Entry({
        title: req.body.title,
        body: req.body.body,
      });
      docs.posts.push(newEntry);
      docs.save();
      res.redirect(`/posts/${req.params.param}`);
    }
  });
});

app.post('/delete/:param', (req, res) => {
  Posts.findOneAndDelete({title: req.params.param}, () => {
    console.log('deleted')
    res.redirect('/')
  })
})

app.listen(3000, () => console.log("connected to 3000"));
