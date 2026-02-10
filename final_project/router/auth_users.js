const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  const userMatches = users.filter (user => user.username === username);
  return userMatches.length === 0;
};

const authenticatedUser = (username,password)=>{
  let validUsers = users.find ((user) => user.username === username && user.password === password);
  if (validUsers) { return true}
  else {return false};
};

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body;
  if (!username || !password) {
    return res.status(400).json({message: "Username and Password are required!"});
  } else {
    if (!authenticatedUser (username, password)) {
      return res.status(404).json({message: "Invalid login. Please check Username and Password!"});
    } else {
      let accessToken = jwt.sign({data: password}, 'access', {expiresIn: 60*60});
      req.session.authorization = {accessToken, username};
      return res.status(200).send("User successfully logged in!");
    };
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  let username = req.session.authorization['username'];
  if (books[isbn]) {
    let book = books[isbn];
    book.reviews[username] = review;
    return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.`);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization['username'];
  const review = books[isbn].reviews;
  if (review[username]) {
    delete review[username];
    return res.status(200).send(`Review for ISBN ${isbn} posted by user ${username} deleted.`);
  } else {
    return res.status(404).json({message: "Review not found for this user"});
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
