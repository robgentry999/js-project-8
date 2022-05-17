var express = require('express');
var router = express.Router();

//importing book model
var Book = require('../models').Book;

function asyncHandler(cb) {
  return async (req,res,next) => {
    try {
      await cb(req,res,next);
    } catch (err) {
      res.render('error', {error:err});
    }
  }
}

//*****Routes

//redirecting main route to /books
router.get("/", (req, res) => {
  res.redirect("/books");
});

//shows full list of books
router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  res.render('index', { books, title: "Books" });
}));

//new book form
router.get('/books/new', asyncHandler(async(req, res) => {
  const books = await Book.findAll();
    console.log(books);
    res.render('new-book');
}));

//"post"ing new book to database
router.post('/books/new', asyncHandler(async(req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect('/books');
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render('new-book', { book, errors: error.errors, title: 'New Book'});
    } else {
      throw error;
    }
  }

}));

//update book
router.get('/books/:id', asyncHandler(async(req, res, next) => {
   const book = await Book.findByPk(req.params.id);
   if (book) {
     res.render('update-book', { book, title: book.title });
   } else {
     next();
   }
  })
);
  
//posts updated book in database
router.post('/books/:id', asyncHandler(async(req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect('/books');
    } else {
      res.render('page-not-found');
    }

  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('update-book', { book, errors: error.errors, title: 'Edit Book'});
    } else {
      throw error;
    }
  }
}));

//delete a book
router.post('/books/:id/delete', asyncHandler(async(req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect('/books');
  } else {
    res.render('page-not-found');
  }

}));




module.exports = router;