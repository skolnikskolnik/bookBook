# Use the database
use bookbookdb;

#Insert Test Users
INSERT into users (first_name, last_name, email, secret) VALUES ("John", "Travolta", "travoltaDances@yahoo.com","$2b$10$chimlCdP.3Wqdkf2BdgdAut18k2HxP7v.FnzcZ4lXMnNXK2bAC6Xm");
INSERT into users (first_name, last_name, email, secret) VALUES ("Woody", "Allen", "ThetoolGuy123@aol.com","$2b$10$chimlCdP.3Wqdkf2BdgdAut18k2HxP7v.FnzcZ4lXMnNXK2bAC6Xm");
INSERT into users (first_name, last_name, email, secret) VALUES ("Alex", "Morgan", "soccerGirl2011@yahoo.com","$2b$10$chimlCdP.3Wqdkf2BdgdAut18k2HxP7v.FnzcZ4lXMnNXK2bAC6Xm");

#Insert Test Books
INSERT into books (title, author, genre, isbn, ownerId, ownerEmail, book_nickname, available, borrowed, borrowerId, borrowerEmail, imgUrl) VALUES ('test title', 'test author', 'mystery', '2', 1, "travoltaDances@yahoo.com", "nickname1", false, false, null, null, null);
INSERT into books (title, author, genre, isbn, ownerId, ownerEmail, book_nickname, available, borrowed, borrowerId, borrowerEmail, imgUrl) VALUES ('The Big Sleep', 'Raymond Chandler', 'Mystery', '6132$', 2, "ThetoolGuy123@aol.com", "nickname2", false, true, 3, "soccerGirl2011@yahoo.com", null);
INSERT into books (title, author, genre, isbn, ownerId, ownerEmail, book_nickname, available, borrowed, borrowerId, borrowerEmail, imgUrl) VALUES ('The Maltese Falcon', 'Dashiell Hammet', 'Mystery', '#32$', 3, "soccerGirl2011@yahoo.com", "nickname3", true, false, null, null, null);


########################################
#Inserting into wishlist (TBD how this will actually function)
INSERT into wishlist (userId, title, author, genre, isbn) VALUES (
(SELECT id FROM users WHERE id = 1),
"The Big Sleep", "Raymond Chandler", "Mystery", "1234"
);


########################################
/*
Testing scripts
Delete from users where id = 2;

Select * from books;
SELECT * FROM users;	
Select * from wishlist;
SELECT secret from users where email = "travoltaDances@yahoo.com"*/
