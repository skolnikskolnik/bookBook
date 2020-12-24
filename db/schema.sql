Drop Database If Exists bookbookdb;
Create Database bookbookdb;
USE bookbookdb;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT Auto_Increment,
    first_name varchar(50),
    last_name varchar(50),
    email varchar(50),
    secret CHAR(60) BINARY,
    CONSTRAINT UC_users_email UNIQUE (email),  
    Primary Key (id)    
);


DROP Table if Exists books;
Create Table books (
    id INT Auto_Increment,
    title varchar(50),
    author varchar(50),
    genre varchar(50),
    isbn varchar(50),
    ownerId INT,
    ownerEmail varchar(50),
    book_nickname varchar(50),
    available boolean DEFAULT FALSE,    
    borrowed boolean DEFAULT FALSE,
    borrowerId INT DEFAULT NULL,
    borrowerEmail varchar(50) DEFAULT NULL,
    imgUrl text DEFAULT NULL,
    CONSTRAINT FK_Books_OwnerId FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_Books_OwnerEmail FOREIGN KEY (ownerEmail) REFERENCES users(email) ON DELETE CASCADE,
    CONSTRAINT FK_Books_BorrowerId FOREIGN KEY (borrowerId) REFERENCES users(id),
    CONSTRAINT FK_Books_BorrowerEmail FOREIGN KEY (borrowerEmail) REFERENCES users(email) ON DELETE CASCADE,
    Primary Key (id)  
);

DROP TABLE IF EXISTS wishlist;
CREATE TABLE wishlist (
    id INT Auto_Increment,
    userId INT NOT NULL,
	title varchar(50),
    author varchar(50),
    genre varchar(50),
    isbn varchar(50),
    imgUrl text DEFAULT NULL,
    CONSTRAINT FK_WishList_UserId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    Primary Key (id)
);





