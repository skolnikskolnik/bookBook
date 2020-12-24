$(function () {
    $.ajax("/api/user_data", {
        TYPE: "GET"
    }).then(function (data) {
        let userId = data.user.id;
        let firstName = data.user.first_name;
        let userEmail = data.user.email;


        //We want the span to populate with the user's first name
        let nameSpan = $(".firstName");
        nameSpan.empty();
        nameSpan.text(firstName);

        //Will change this but I made it this to not refresh the page
        let searchBox = $("#searchForm");

        //If the person presses the key it searches 
        $(searchBox).on("submit", function (event) {
            event.preventDefault();
            // play();
            searchGBooks();
        });




        //When "add to library" is clicked, we need to send the backend title, author, genre, gbooksId

        $(document).on("click", ".addToLibrary", function (event) {
            //Should dynamically make the data-gbooksId of the element the id number
            event.preventDefault();

            let isbn = $(this).data("isbn13");
            let bookTitle = $(this).data("booktitle");


            $.get(`/gbooks/${isbn}`, function (data) {
                let totalItems = data.totalItems;
                if(totalItems ==0){
                    //This particular copy won't work with the database so the user needs to select a different item
                    let alertEl = $(`<div class="avail-alert">`);
                    alertEl.html("This version of this book is incompatible with our database. Please select a different version or a different book.");
                    $("#searchForm").append(alertEl);
        
                    //We want the alert to disappear in the event of the user hitting the enter key
                    timeFunction();
        
                    function timeFunction() {
                        setTimeout(function () {
                            let alertElDel = $(".avail-alert");
                            alertElDel.empty();
                        }, 5000);
                    }
                }
                else{
                let item = data.items[0].volumeInfo;
                let title = item.title;
                let author = item.authors[0];
                let genre = item.categories[0];
                let imageURL = item.imageLinks.thumbnail;


                //Now need a backend route to feed this data into
                let newBook = {
                    title: title,
                    author: author,
                    genre: genre,
                    isbn: isbn,
                    ownerId: userId,
                    ownerEmail: userEmail,
                    imgUrl: imageURL
                };


                //This inserts into the books table
                $.ajax("/library/new/", {
                    type: "POST",
                    data: JSON.stringify(newBook),
                    dataType: 'json',
                    contentType: 'application/json'
                }).then(function () {
                    location.reload();
                });
            }//This ends the else statement
            });

        });


        //When "request to borrow" is clicked, look through books and find all available books
        $(document).on("click", ".requestToBorrow", function (event) {
            event.stopImmediatePropagation();

            //Search through the books table, find all available books of that isbn number
            let isbn = $(this).data("isbn13");


            let newAvailability = {
                borrowed: true
            }


            $.ajax(`/borrow/${isbn}`, {
                type: "PUT",
                data: JSON.stringify(newAvailability),
                dataType: 'json',
                contentType: 'application/json',
                error: function (jqXHR, textStatus, errorThrown) {
                    if (jqXHR.status === 400) {
                        addToWishList(isbn, userId);
                    } else {
                        console.log("Other type of error");
                    }
                }
            }).then(function () {
                location.reload();
            });
        });

        //A list of available books will populate 
        let availableEl = $(".available-book");

        $.ajax(`/books/available/${userId}`, {
            type: "GET"
        }).then(function (data) {
            if (!data) {
                return data;
            }

            //For right now take the first five elements of the index
            availableEl.empty();

            let numberBooks = data.length;

            for (let i = 0; i < numberBooks; i++) {
                let bookTitle = data[i].title;
                let bookAuthor = data[i].author;
                let bookId = data[i].id;
                let isbnNumber = data[i].isbn;
                let imageThumbnail = data[i].imgUrl;


                //Now generate the images
                $(availableEl[i]).html(`<a><img src  = "${imageThumbnail}" alt = "book-result ${bookTitle}"></a>`);
                let btnsEl = $("<div>");
                $(btnsEl).html(`<button type=button class="btn btn-primary available-borrow" 
                data-isbn13="${isbnNumber}" data-bookAuthor="${bookAuthor}" data-bookTitle="${bookTitle}"
                data-bookid="${bookId}">Request to borrow</button>`);
                $(availableEl[i]).append(btnsEl);
            }

        });

        //When "request to borrow" on one of the available books is clicked, make it borrowed
        $(document).on("click", ".available-borrow", function () {
            event.preventDefault();

            let id = $(this).data("bookid");


            //We want to mark it as borrowed by the user

            let newAvailability = {
                available: false,
                borrowed: true
            }


            $.ajax({
                url: `/available/borrow/${id}`,
                type: "PUT",
                data: JSON.stringify(newAvailability),
                success: function (data) {
                    insertBorrowerId(id);
                }
            })
            //We want to add borrowerId and borrowerEmail to books table
            //userId becomes the borrower ID
        });

        //Insert the borrower Id in when a user requests to borrow a book
        function insertBorrowerId(id) {
            $.ajax({
                url: `/insert/${userId}/${id}`,
                type: "PUT",
                data: `borrowerId=${userId}`,
                success: function (data) {
                    insertBorrowerEmail(id);
                }
            })
        }

        //insert the borrower email into the table
        function insertBorrowerEmail(id) {
            $.ajax({
                url: `/insertemail/${userEmail}/${id}`,
                type: "PUT",
                data: `borrowerId=${userId}`,
                success: function (data) {
                    location.reload();
                }
            });
        }

        //Function to add to wishlist if the book is not available
        function addToWishList(isbn, userId) {

            $.get("/gbooks/" + isbn, function (data) {
                let item = data.items[0];
                let author = item.volumeInfo.authors[0];
                let genre = item.volumeInfo.categories[0];
                let title = item.volumeInfo.title;
                let imgThum = item.volumeInfo.imageLinks.thumbnail;

                let wishListEntry = {
                    userId: userId,
                    title: title,
                    author: author,
                    genre: genre,
                    isbn: isbn,
                    imgUrl: imgThum
                }


                $.ajax("/wishlist", {
                    type: "POST",
                    data: JSON.stringify(wishListEntry),
                    dataType: 'json',
                    contentType: 'application/json'
                }).then(function () {
                    //Need to alert user that the item isn't available and that item is added to wishList
                    wishListAlert();
                });
            })
            //Need to alert user that the item isn't available
        }

        //Alerts the user that the book isn't available and that it is added to their wishlist
        function wishListAlert() {
            let alertEl = $(`<div class="avail-alert">`);
            alertEl.html("This book is not currently available. It is being added to your wishlist.");
            $("#searchForm").append(alertEl);

            //We want the alert to disappear in the event of the user hitting the enter key
            timeFunction();

            function timeFunction() {
                setTimeout(function () {
                    let alertElDel = $(".avail-alert");
                    alertElDel.empty();
                }, 5000);
            }
        }

        function searchGBooks() {

            //Need to save what the user searches
            let searchInput = $(".uk-search-input");

            let searchValue = searchInput.val();


            //Spaces must be replaced with "+"
            searchValue = searchValue.replace(/ /g, "+");

            $.get("/gbooks/" + searchValue, function (data) {

                let imageEl = $(".results-images");

                imageEl.empty();
                //We want to generate a button under each one to add to library or request to borrow
                for (let i = 0; i < imageEl.length; i++) {
                    let item = data.items[i].volumeInfo;
                    let normImage = item.imageLinks.thumbnail;
                    let bookTitle = item.title;
                    isbn_13 = item.industryIdentifiers[0].identifier;
                    $(imageEl[i]).html(`<a><img src  = "${normImage}" alt = "book-result ${bookTitle}"></a>`);
                    let btnsEl = $("<div>");
                    $(btnsEl).html(`<button type=button class="btn btn-primary addToLibrary" data-isbn13="${isbn_13}"  data-booktitle="${bookTitle}">Add to library</button>
            <button type=button class="btn btn-primary requestToBorrow" data-isbn13="${isbn_13}" data-booktitle="${bookTitle}" onclick="play()">Request to borrow</button>`);
                    $(imageEl[i]).append(btnsEl);

                }

            });
        }


    });//Ends function for  getting user information


    $(".target").on("click", function (event) {
        $.ajax("/logout", {
            type: "GET"
        }).then(function () {
            window.location.replace("/login")
        })
    })







})


// Zo's homepage page - do not delete thanks =)


