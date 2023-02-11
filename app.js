require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema
const encrypt = require('mongoose-encryption');

const port = process.env.PORT || 3000;

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const url = 'mongodb://127.0.0.1:27017/userDB';
mongoose.set('strictQuery', true);

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(url);
    console.log("***************MongoDB connected Successfully***************")
};

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const secret = process.env.secret;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });


const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {
    var newUser = new User({
        email: req.body.username,
        password: req.body.password,
    });
    User.findOne({ email: req.body.username }, function (err, foundItem) {
        if (foundItem) {
            res.send("User with this email already exists");
        } else {            
            console.log("User is able to register.")
            newUser.save(function (err, doc) {
                if (!err) {
                    console.log('User added successfully!');
                    res.render("secrets");
                } else {
                    console.log('Error during record insertion : ' + err);
                }
            });
        }
    });

});

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ email: username }, function (err, foundItem) {
        if (err) {
            console.log("ERROR!" + err);
        } else {
            if (foundItem) {
                console.log("User with this email exists. You can login");
                if (password === foundItem.password) {
                    console.log("Login successfull")
                    res.render("secrets");
                } else {
                    console.log("Incorrect Password!");
                }
            } else {
                console.log("User doesnot exist");
            }
        }

    });

});

app.listen(port, function () {
    console.log("***************Server is Up and Running***************");
});