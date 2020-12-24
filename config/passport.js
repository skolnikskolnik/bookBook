const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy
const books = require("../models/books.js");
const bcrypt = require('bcrypt');


passport.use(new LocalStrategy(
    {
        usernameField: "email",
        passwordField: "password"

    },
    function (email, password, done) {
        books.selectUser("email", email, async function (user) {

            if (user.length === 0) {
                return done(null, false, {
                    message: "No Email on file"
                });
            }
            try {
                //compares password enteted into database.
                if (await bcrypt.compare(password, user[0].secret)) {
                    return done(null, user)
                } else {
                    return done(null, false, { message: "password incorrect" })
                }
            } catch (e) {
                if (e)
                    throw e;

            }

            return done(null, user)

        })
    }
))
passport.serializeUser(function (user, cb) {
    cb(null, user);
})
passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
})


module.exports = passport;