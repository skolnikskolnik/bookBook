// *********************************************************************************
// html-routes.js - this file offers a set of routes for sending users to the various html pages
// *********************************************************************************

// Dependencies
// =============================================================
var path = require("path");
const isUser = require("../config/middleware/isUser")
const isNotUser = require("../config/middleware/isNotUser")
const bcrypt = require('bcrypt');
const books = require('../models/books.js')
const passport = require("../config/passport");


// Routes
// =============================================================
module.exports = function (app) {

    // Each of the below routes just handles the HTML page that the user gets sent to.

    app.get("/", function (req, res) {
        console.log("Sent to registration page because no user was found")
        //we should not have req.user since they did not pass authentication and were redirected here 
        // console.log(req)
        res.sendFile(path.join(__dirname, "../public/html/registration.html"), { message: req.flash("test") });

    });

    //ascynhronous library bcrypt needed.  Need async, await, try and catch
    app.post("/", async function (req, res) {

        try {
            //part of the 2 arguments needed to create hashed password ** I can use a number only if needed and delete the salt variable.  Default is 10
            const salt = await bcrypt.genSalt();
            //takes user password and scrambles it
            const scrambled = await bcrypt.hash(req.body.password, salt)
            console.log(scrambled);
            books.createUser(["first_name", "last_name", "email", "secret"], [req.body.first_name, req.body.last_name, req.body.email, scrambled], function (result) {

            })

        } catch (error) {
            if (error)
                throw error;

        }
        res.redirect("/login")
        console.log("Sent to login ")
    })

    app.get("/registration", function (req, res) {
        res.sendFile(path.join(__dirname, "../public/html/registration.html"));
        console.log("routes")
    });

    app.post("/login", passport.authenticate("local", {
        failureRedirect: "/login",
        successRedirect: "/home",
        failureMessage: true
    }), function (req, res) {
        console.log("test")
        res.redirect("/home")
        // res.json({ user: req.user, path: '/home' })
        // res.send(req.user)

    })

    app.get("/home", isUser, function (req, res) {
        //after authenticate that happends in the post login route, the redirect to /home makes req.user available
        res.sendFile(path.join(__dirname, "../public/html/homepage.html"));
        console.log("Made it to home page!")
        console.log(req.user, "line71 html")
    })

    // Able to get the login page

    app.get("/login", function (req, res) {
        console.log("heres login!")
        res.sendFile(path.join(__dirname, "../public/html/login.html"));
        // console.log(req.session.passport)
        console.log(req.user, "line80 html")
    })

    app.get("/logout", function (req, res) {
        req.logOut();
        res.redirect("/login");
        // console.log(req.session.passport)

    })





};