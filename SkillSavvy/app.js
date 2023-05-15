require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const multer = require("multer");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

mongoose.connect(process.env.MONGO_URL);

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  thumbnail: String,
  video: String
});

const Course = mongoose.model("Course", courseSchema);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fieldname = file.fieldname === 'image' ? 'public/images' : 'public/videos';
    cb(null, fieldname);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension);
  }
});

const upload = multer({ storage: storage });

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String,
  secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/"
},
function(accessToken, refreshToken, profile, cb) {
  console.log(profile);
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));

app.get("/", async function(req, res){

  let coursesFound = await Course.find({});

  res.render("home", {
    courses : coursesFound,
    user: req.user
  });

});

app.get("/create", (req, res) => {
  res.render("create", {
    user: req.user
  });
})

app.post("/create", upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), (req, res) => {

  const image = req.files['image'][0].filename;
  const video = req.files['video'][0].filename;

  const course = new Course({
    title: req.body.title,
    description: req.body.description,
    thumbnail: image,
    video: video
  });

  course.save();

  res.redirect("/");
});

app.get("/courses/:courseId", async function(req, res){
  const requestedId = req.params.courseId;

  let storedCourse = await Course.findById({ _id: requestedId });

  res.render("course", {
    course: storedCourse,
    user: req.user
  });

});

app.get("/login", (req, res) => {
  res.render("login", {
    user: req.user
  });
});

app.get("/signup", (req, res) => {
  res.render("signup", {
    user: req.user
  });
});

app.post("/signup", (req,res) => {
  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/");
      });
    }
  });
});

app.post("/login", async function(req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/");
      });
    }
  });
});

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get('/logout', (req, res) => {
  req.session.destroy(function (err) {
    res.redirect('/login');
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});


app.get("/contact", (req, res) => {
  res.render("contact");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
