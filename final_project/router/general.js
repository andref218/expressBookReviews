const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  const added = users.some((user) => user.username === username);

  if (added) {
    return res.status(201).json({ message: "User registered successfully" });
  } else {
    return res.status(500).json({ message: "Could not register user" });
  }
});

// Get the book list available in the shop
public_users.get("/books-async", async function (req, res) {
  try {
    const response = await axios.get("http://localhost:5000/");
    res.send(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching books", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get("/isbn-async/:isbn", async function (req, res) {
  const isbn = req.params.isbn;
  const getBookByISBN = (isbn) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (books[isbn]) {
          resolve(books[isbn]);
        } else {
          reject(new Error("Book not found"));
        }
      }, 100);
    });

  try {
    const book = await getBookByISBN(isbn);
    res.send(book);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

// Get book details based on author
public_users.get("/author-async/:author", async function (req, res) {
  const author = req.params.author;
  const getBooksByAuthor = (author) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const keys = Object.keys(books);
        let result = [];

        keys.forEach((key) => {
          if (books[key].author.toLowerCase() === author.toLowerCase()) {
            result.push(books[key]);
          }
        });

        if (result.length > 0) resolve(result);
        else reject(new Error("No books found for this author"));
      }, 100);
    });

  try {
    const booksByAuthor = await getBooksByAuthor(author);
    res.send(booksByAuthor);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

// Get all books based on title
public_users.get("/title-async/:title", async function (req, res) {
  const title = req.params.title;
  const getBooksByTitle = (title) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const keys = Object.keys(books);
        let result = [];

        keys.forEach((key) => {
          if (books[key].title.toLowerCase() === title.toLowerCase()) {
            result.push(books[key]);
          }
        });

        if (result.length > 0) resolve(result);
        else reject(new Error("No books found for this title"));
      }, 100);
    });

  try {
    const booksByTitle = await getBooksByTitle(title);
    res.send(booksByTitle);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.send(book.reviews);
  } else {
    res.status(404).json({
      message: "Book not found",
    });
  }
});

module.exports.general = public_users;
