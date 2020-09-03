"use strict";
const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const passport = require('passport');
const session = require('express-session');
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const pug = require('pug');
const app = express();
const mongoose = require('mongoose');


// user model
const User = require('./models/user');
const users = [];

//passport stuff
const initializePassport = require('./passport-config');
initializePassport(
  passport,
  username => User.findOne({username: username}),
  id => User.findById(mongoose.Types.ObjectId(id))
);

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect(process.env.DB_NAME, {useNewUrlParser: true,
   useUnifiedTopology: true})
   .then(() => console.log("MongoDB Connected"))
   .catch(err => console.log(err));

//ensuring authentication
function ensureAuthenticated (req, res, next){
  if (req.isAuthenticated()){
    next();
  } else{
    res.redirect('/');
  }
}

    //ROUTES
app.get("/", (req, res) => {
  res.render('./pug/index',{ title: 'Hello',
  message: 'Please login', showLogin: true, showRegistration: true });
})
app.post('/login', passport.authenticate('local',{failureRedirect: '/'}),
(req, res) => {
  res.redirect('/profile');
})
app.get('/profile', ensureAuthenticated, (req, res) =>{
  console.log(req.user);
  res.render('./pug/profile',{ username: req.user.username})
})
app.post('/register', async (req, res, next) => {
  const newUser = new User({username: req.body.username, password: req.body.password});
  try {
    let preMadeUser = await User.findOne({username: newUser.username});
    if (!preMadeUser){
      await newUser.save();
      next()
  } else(res.send('user already registered.'))
  } catch (error) {
    console.error();
  }
}, passport.authenticate('local', {failureRedirect: '/',
    successRedirect: '/profile'}))

app.get('/logout', (req, res)=>{
  req.logout();
  res.redirect('/');
})


  //listening
app.listen(process.env.PORT || 8000, () => {
  console.log("Listening on port " + process.env.PORT);
})





