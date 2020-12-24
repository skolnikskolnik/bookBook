const express = require("express");
const path = require('path');
const orm = require("../config/orm.js");
const books = require("../models/books.js");
// const bcrypt = require('bcrypt');


const router = express.Router();


//This is required to do the google books backend stuff
const fetch = require("node-fetch");
const dotenv = require('dotenv');
//require("dotenv").config();
dotenv.config();

const API_KEY = process.env.API_KEY;


// Import the model (cat.js) to use its database functions.
const bookbook = require("../models/books.js");


//Server side API calls go here
router.get("/allbooks", function (req, res) {
    books.selectAll(function (data) {
        res.json({ books: data });
    });
});

//Presents all of the users - maybe this should be more secure?
router.get("/api/bookUser", function (req, res) {
    books.allUsers(function (data) {
        res.json({ books: data });
    });

});


//Gets entry from table from book id
router.get("/api/bookById/:id", function (req, res) {
    let id = req.params.id;
    books.selectWhere("isbn", id, function (data) {
        res.json(data);
    })
});


//Gets entry from table from book by ownerId
router.get("/api/bookByOwnerId/:id", function (req, res) {
    let id = req.params.id;
    //id = 1
    books.selectWhere("ownerId", id, function (data) {
        // console.log("owned books: " + data )
        res.json(data);
    })
});


//User can mark a book as Unavailble for borrowing
router.put("/api/bookUnavailable/:bookId", function (req, res) {
    //change availability from true to false
    //change checkedout from false to true

    var condition = "id = " + req.params.bookId;


    books.updateOne({
        available: false
    }, condition, function (result) {
        condition = condition
        if (result.changedRows == 0) {
            return res.status(404).end();
        } else {
            let id = req.params.bookId;
            console.log("\n \n \n \n \n " + id + "\n \n \n ")
            books.selectWhere("id", id, function (data) {
                console.log("the data in book from the update request is \n \n \n  " + JSON.stringify(data))
                return res.json(data)

            })

        }
    });


});


//User can mark a book as Availble for borrowing
router.put("/api/bookAvailable/:bookId", function (req, res) {
    //change availability from true to false
    //change checkedout from false to true


    let condition = "id = " + req.params.bookId;
    //console.log("the condition is " + condition)

    books.updateOne({
        available: true
    }, condition, function (result) {

        if (result.changedRows == 0) {
            return res.status(404).end();
        } else {
            let id = req.params.bookId;
            console.log("\n \n \n \n \n " + id + "\n \n \n ")
            books.selectWhere("id", id, function (data) {
                console.log("the data in book from the update request is \n \n \n  " + JSON.stringify(data))
                return res.json(data)

            })

        }
    });


});



//Can mark a book as returned
router.put("/api/:bookId/return", function (req, res) {
    //change availability from false to true
    //change checkedout from true to false

    let condition = "id = " + req.params.bookId;

    books.updateOne({
        available: true
    }, condition, function (result) {
        if (result.changedRows == 0) {
            return res.status(404).end();
        } else {
            changeSecondOne();
        }
    });

    function changeSecondOne() {
        books.updateOne({
            checkedOut: false
        }, condition, function (result) {
            if (result.changedRows == 0) {
                return res.status(404).end();
            } else {
                changeSecondOne();
                res.json({ id: req.params.id });
            }
        });
    }

});

//User can delete a book from their library
router.delete("/api/:bookId/delete", function (req, res) {
    let condition = "id = " + req.params.bookId;

    books.deleteOne(condition, function (result) {
        if (result.affectedRows == 0) {
            // If no rows were changed, then the ID must not exist, so 404
            return res.status(404).end();
        } else {
            res.status(200).end();
        }
    });
});

//We want to add an item to the wishlist
router.post("/wishlist", function (req, res) {
    books.insertOneWish([
        "userId", "title", "author", "genre", "isbn", "imgUrl"
    ], [
        req.body.userId, req.body.title, req.body.author, req.body.genre, req.body.isbn, req.body.imgUrl
    ], function (result) {
        res.json(result);
    });
})


//Google Books

//When the user gives a search entry, we return the JSON from google books - get request
router.get("/gbooks/:book", function (req, res) {
    //API_KEY will give the API key just to the server, but not to the client
    let bookSearch = req.params.book;
    let apiURL = "https://www.googleapis.com/books/v1/volumes?q=";
    apiURL += bookSearch;
    apiURL += "&printType=books&key="
    apiURL += API_KEY;

    fetch(apiURL).then(function (result) {
        return result.json();
    }).then(function (response) {
        res.json(response);
    });

});

//When "add to library" is clicked, we need to send the backend title, author, genre, gbooksId
router.post("/library/new/", function (req, res) {
    books.insertOne([
        //STILL NEED TO FIGURE OUT THE USER ID SITUATION
        "title", "author", "genre", "isbn", "ownerId", "ownerEmail", "imgUrl"
    ], [
        req.body.title, req.body.author, req.body.genre, req.body.isbn,
        req.body.ownerId, req.body.ownerEmail, req.body.imgUrl
    ], function (result) {
        res.json(result);
    });
});


//When "request to borrow" is clicked, we check for the ISBN # in the "books" table WHERE available = true
router.put("/borrow/:isbn", function (req, res) {
    //We want to set borrowed=true for ONE entry where available=true AND borrowed=false
    let isbn2 = req.params.isbn;

    isbn2 = isbn2.replace(/:/g,'');
    
    let condition1 = `isbn = + ${isbn2}`;
    let condition2 = "available=true";
    let condition3 = "borrowed=false";
    books.updateOneLimit({
        borrowed: true
    }, condition1, condition2, condition3, function (result) {
        if (result.changedRows == 0) {
            return res.status(400).end();
        } else {
            res.json({ isbn: isbn2 });
        }
    });



});

//We want to be able to get all of the books that are available 
router.get("/books/available/:ownerId", function (req, res) {
    //Need to change this to be select where available = true AND borrowed = false AND ownerId = user's owner ID
    let ownerId = req.params.ownerId;

    books.selectWhereNot("available", "TRUE", "borrowed", "FALSE", "ownerId", ownerId, "5", function (data) {
        console.log("test");
        res.json(data);
    });



})


// API route to get logged in user's data
router.get("/api/user_data", function (req, res) {

    let user;
    if (!req.user) {
        console.log("retrieving test user");
        books.selectUser('id', 1, function (result) {
            console.log(result)
            user = {
                id: result[0].id,
                first_name: result[0].first_name,
                last_name: result[0].last_name,
                email: result[0].email,
            }
            console.log("this is the test user \n " + JSON.stringify(user))
            //console.log("this is the test user \n " + JSON.stringify(user))
            res.json({ user })
        });

    }
    else {
        // user = {
        //     id: req.user[0].id,
        //     first_name: req.user.first_name,
        //     last_name: req.user.last_name,
        //     email: req.user.email,
        // }

        // books.selectUser('id', req.user[0].id, function (result) {
        books.selectUser('id', req.user[0].id, function (result) {
            console.log(result)

            user = {
                id: result[0].id,
                first_name: result[0].first_name,
                last_name: result[0].last_name,
                email: result[0].email,
            }

            console.log("this is the user info \n " + JSON.stringify(user))
            res.json({ user })
        })
        console.log("sent Json with User info")

    }//Ends else statement

})

//When a book in the "available" section is clicked it is marked as borrowed
//To mark a book as borrowed from the available list
router.put("/available/borrow/:id", function (req, res) {
    //First need to set available=false  where isbn=value and checkedOut = false
    //THEN set checkedOut = true where isbn = value
    let id = req.params.id;

    let condition1 = "id=" + id;
    let condition2 = "available = true";
    let condition3 = "borrowed = false";

    //First set available equal to false
    books.updateOneWhere({
        available: false
    }, condition1, condition2, condition3, function (result) {
        if (result.changedRows == 0) {
            return res.status(400).end();
        } else {
            changeSecondOne();
        }
    });

    //Change borrowed to be true
    function changeSecondOne() {
        books.updateOne({
            borrowed: true
        }, condition1, function (result) {
            if (result.changedRows == 0) {
                return res.status(400).end();
            } else {
                res.json({ id: id });
            }
        })
    }


})




//When a book from the available list is borrowed, we want to insert the userId as the borrowed id
router.put("/insert/:borrowerId/:bookId", function (req, res) {
    let borrowerId = req.params.borrowerId;
    let bookId = req.params.bookId;
    let condition = "id = " + bookId;


    books.updateOne({
        "borrowerId": borrowerId
    }, condition, function (result) {
        if (result.changedRows == 0) {
            return res.status(404).end();
        } else {
            res.json({ id: req.params.id });
        }
    });

});

//Inserts a borrowers email into the table
router.put("/insertemail/:borrowerEmail/:bookId", function (req, res) {
    let borrowerEmail = req.params.borrowerEmail;
    let bookId = req.params.bookId;
    let condition = "id = " + bookId;

    books.updateOne({
        "borrowerEmail": borrowerEmail
    }, condition, function (result) {
        if (result.changedRows == 0) {
            return res.status(404).end();
        } else {
            res.json({ id: req.params.id });
        }
    });
})


/*
 
COMMENTING THIS OUT SINCE IT'S NOT BEING USED
 
//Gets entry from books where id = id AND borrowed = true
router.get("/api/bookIdWhereBorrowed/:id", function (req, res) {
    let id = req.params.id;
    books.selectWhereTwo("id", id, "borrowed", "true", function (data) {
        console.log("data is " + data)
        res.json(data);
    })
    
});
*/


//Returning Books will set avail to true and borrowed to false
router.put("/api/returnBook/:id", function (req, res) {
    //First need to set available=false  where isbn=value and checkedOut = false
    //THEN set checkedOut = true where isbn = value
    let id = req.params.id;
    console.log(JSON.stringify(req.body))

    let condition = "id=" + id;


    //First set available equal to true
    books.updateOne({
        borrowed: false
    }, condition, function (result) {
        condition = condition
        if (result.changedRows == 0) {
            return res.status(404).end();
        } else {
            let id = req.params.bookId;
            console.log("\n \n \n \n \n " + id + "\n \n \n ")
            books.selectWhere("id", id, function (data) {
                console.log("the data in book from the update request is \n \n \n  " + JSON.stringify(data))
                return res.json(data)

            })

        }
    });
})

//User can delete a book from their wishlist
router.delete("/api/:isbn/removeWishlistitem", function (req, res) {
    let isbn = req.params.isbn;
    let userId = req.user[0].id
    let condition = `isbn =  ${isbn} AND userId = ${userId}`


    books.deleteOneWishlist(condition, function (result) {
        if (result.affectedRows == 0) {
            // If no rows were changed, then the ID must not exist, so 404
            return res.status(404).end();
        } else {
            res.status(200).end();
        }
    });
});


//Gets books from wishlist
router.get("/api/WishlistByUserId/:id", function (req, res) {
    let id = req.params.id;
    //id = 1
    books.selectWhereWishlist("userId", id, function (data) {
        // console.log("owned books: " + data )
        res.json(data);
    })
});


//Gets entry from table from book by borrowedId
router.get("/api/bookByBorrowerId/:id", function (req, res) {
    let id = req.params.id;
    //id = 1
    books.selectWhere("borrowerId", id, function (data) {
        // console.log("owned books: " + data )
        res.json(data);
    })
});
 

// Export routes for server.js to use.
module.exports = router;


