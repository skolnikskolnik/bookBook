// Import the ORM to create functions that will interact with the database.
var orm = require("../config/orm.js");

const books = {
    //Will fill in based on group discussion 
    selectAll: function (cb) {
        orm.selectAll("books", function (res) {
            cb(res);
        })
    },
    allUsers: function (cb) {
        orm.selectAll("users", function (res) {
            cb(res);
        })
    },
    selectWhere: function (col, vals, cb) {
        orm.selectWhere("books", col, vals, function (res) {
            cb(res);
        })
    },
    insertOne: function (cols, vals, cb) {
        orm.insertOne("books", cols, vals, function (res) {
            cb(res);
        })
    },
    insertOneWish: function (cols, vals, cb) {
        orm.insertOne("wishlist", cols, vals, function (res) {
            cb(res);
        })
    },
    updateOne: function (objColVals, condition, cb) {
        orm.updateOne("books", objColVals, condition, function (res) {
            cb(res);
        })
    },
    updateOneLimit: function (objColVals, condition1, condition2, condition3, cb) {
        orm.updateOneLimit("books", objColVals, 1, condition1, condition2, condition3, function (res) {
            cb(res);
        })
    },
    updateOneWhere: function (objColVals, condition1, condition2, condition3, cb) {
        orm.updateOneWhere("books", objColVals, condition1, condition2, condition3, function (res) {
            cb(res);
        })
    },
    deleteOne: function (condition, cb) {
        orm.deleteOne("books", condition, function (res) {
            cb(res);
        })
    },
    deleteOneWishlist: function (condition, cb) {
        orm.deleteOne("wishlist", condition, function (res) {
            cb(res);
        })
    },
    //Needed to create this function to add user to the users table of the database
    createUser: function (cols, vals, cb) {
        orm.createUser("users", cols, vals, function (res) {
            cb(res);
        });
    },
    selectUser: function (cols, vals, cb) {
        orm.selectWhere("users", cols, vals, function (res) {
            cb(res);

        });
    },
    selectWhereTwo: function (col1, val1, col2, val2, cb) {
        orm.selectWhereTwo("books", col1, val1, col2, val2, function (res) {
            cb(res);
        })
    },
    selectWhereNot: function (col1, val1, col2, val2, col3, val3, limit, cb) {
        orm.selectWhereNot("books", col1, val1, col2, val2, col3, val3, limit, function (res) {
            cb(res);
        })
    },
    selectWhereWishlist: function (col, vals, cb) {
        orm.selectWhere("wishlist", col, vals, function (res) {
            cb(res);
        })
    }
}
// Export the database functions for the controller (catsController.js).
module.exports = books;


