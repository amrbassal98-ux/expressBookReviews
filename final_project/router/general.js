const express = require('express');
const { validate, registerSchema } = require('../middleware/validate.js');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", validate(registerSchema), (req,res) => {
  const {username, password} = req.body;
  if (!isValid(username)) {
    return res.status(409).json({message: "User already exists!"});
  } else {
    users.push({"username": username, "password": password});
    return res.status(200).json({message: `The user ${username} was added successfully`});
  }
});

// Get the book list available in the shop


public_users.get('/', function (req, res) {
  const getBooks = new Promise ((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject ("Books database not found");
    }
  });
  getBooks
    .then((bookData) => res.status(200).send(JSON.stringify(bookData, null, 4)))
    .catch((err)=>res.status(404).json({message: err}));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  const getBook = new Promise ((resolve, reject) => {
    if(book) {
      resolve (book);
    } else {
      reject ("Book not found");
    }
  });
  getBook
    .then((bookData) => res.status(200).send(JSON.stringify(bookData, null, 4)))
    .catch((err) => res.status(404).json({message: err}));
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const getBookByAuthor = new Promise ((resolve, reject) => {
    const keys = Object.keys(books);
    const filteredBooks = [];
    keys.forEach((key) => {
      if (books[key].author.toLowerCase() === author.toLocaleLowerCase()) {
        filteredBooks.push(books[key]);}
    });
    if (filteredBooks.length > 0) {
      resolve (filteredBooks);
    } else {
      reject ("No books found for this author");
    } 
  });
  getBookByAuthor
    .then((bookData) => res.status(200).send(JSON.stringify(bookData, null, 4)))
    .catch ((err) => res.status(404).json({message: err}));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const getBookByTitle = new Promise ((resolve, reject) => {
    const keys = Object.keys(books);
    const filteredBooks = [];
    keys.forEach ((key) => {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        filteredBooks.push(books[key]);
      }
    })
    if (filteredBooks.length > 0) {
      resolve (filteredBooks);
    } else {
      reject ("No book was found for this title");
    };
  })
  getBookByTitle 
    .then((bookData) => res.status(200).send(JSON.stringify(bookData, null, 4)))
    .catch((err) => res.status(404).json({message: err}));
  
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const bookReview = books[isbn].reviews;

  if (bookReview) {
    res.status(200).send(JSON.stringify(bookReview, null, 4));
  } else {
    res.status(404).json({message: "Book not found"});
  };
});

module.exports.general = public_users;
