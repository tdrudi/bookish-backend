
const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Review = require("../models/review");
const BookishAPI = require("../backendAPI");
const { authenticateJWT } = require("../middleware/auth");
const { NotFoundError } = require("../expressError");

//Get all books in DB
router.get("/", async function (req, res, next) {
    try {
        let bookList = await Book.getAll();
        return res.status(200).json({ books: bookList });
        //Can throw error - no books found
    } catch (err) {
        return next(err);
    }
});

//     /books - GET (specific book)
router.get("/:bookId", async function (req, res, next) {
    try {
        const { bookId } = req.params;
        //Check if book already exists in database
        let authorNames;
        let existingBook = await Book.getBookById(bookId);
        if (existingBook) {
            return res.status(200).json({ book: existingBook });
        }
        else {
            //Get book from API
            const bookData = await BookishAPI.getBookDetails(bookId);
            if (!bookData) {
                throw new NotFoundError(`Book with ID ${bookId} not found`);
            }
            let authorIDs = bookData.authors;
            let description;
            if (authorIDs) {
                authorNames = await Promise.all(
                    authorIDs.map(async (id) => {
                        let auth = id.author.key.replace('/authors/', '');
                        const authorDetails = await BookishAPI.getAuthorDetails(auth);
                        return (authorDetails || "Unknown Author");
                    }));
            } else {
                authorNames = 'Unknown Author';
            }

            const coverUrl = bookData.covers
                ? `https://covers.openlibrary.org/b/id/${bookData.covers[0]}-L.jpg`
                : '/default-book-cover.png';

            if (bookData.description && bookData.description.value) {
                description = '<p>' + bookData.description.value.replace(/\r\n\r\n/g, '</p><p>') + '</p>';
            } else if (bookData.description) {
                description = '<p>' + bookData.description.replace(/\r\n\r\n/g, '</p><p>') + '</p>';
            }
            else {
                description = "<p>This book does not have a description.</p>"

            }

            const addBook = await Book.create({
                olid: bookId,
                title: bookData.title,
                author: authorNames,
                coverUrl,
                description: description,
            });
            return res.json({ book: addBook });
        }
    } catch (err) {
        return next(err);
    }
});

//     /books/author - GET (get author details)
router.get("/:authorId", async function (req, res, next) {
    try {
        const { authorId } = req.params;
        const author = await BookishAPI.getAuthorDetails(authorId);
        return res.json({ author });
    } catch (err) {
        return next(err);
    }
});

//     /books/genre - GET (get books by genre)
router.get("/:genre", async function (req, res, next) {
    try {
        const { genre } = req.params;
        const genreBooks = await BookishAPI.getByGenre(genre);
        return res.json({ genreBooks });
    } catch (err) {
        return next(err);
    }
});


//--------------------------------------- Reviews and Ratings ----------------------------------------

//     /books/reviews - POST (add a review for a book)
router.post("/:bookId/reviews", authenticateJWT, async function (req, res, next) {
    try {
        const { reviewText, rating } = req.body;
        const userId = req.user.id;
        const { bookId } = req.params;
        const review = await Review.addReview({ bookId, userId, reviewText, rating });
        return res.status(201).json({ review });
    } catch (err) {
        return next(err);
    }
});


//     /books/reviews - GET (get reviews for a book)
router.get("/:bookId/reviews", async function (req, res, next) {
    try {
        const { bookId } = req.params;
        const reviews = await Review.getAllByBook(bookId);
        const avgRating = await Review.avgRating(bookId);
        return res.json({ data: reviews, avgRating });
    } catch (err) {
        return next(err);
    }
});

//     /books/reviews - GET (get specific review for a book)
router.get("/:bookId/reviews/:reviewId", async function (req, res, next) {
    try {
        const { bookId, reviewId } = req.params;
        const review = await Review.getReview(bookId, reviewId);
        if (!review) {
            throw new NotFoundError(`Review with ID ${reviewId} not found for book ${bookId}`);
        }
        return res.json({ review });
    } catch (err) {
        return next(err);
    }
});


//     /books/reviews - PUT (update a review - author)
router.put("/:bookId/reviews/:reviewId", authenticateJWT, async function (req, res, next) {
    try {
        const { reviewId } = req.params;
        const { reviewText, rating } = req.body;
        const updatedReview = await Review.updateReview(reviewId, reviewText, rating);
        if (!updatedReview) {
            throw new NotFoundError(`Review with ID ${reviewId} not found for book.`);
        }
        return res.json({ updatedReview });
    } catch (err) {
        return next(err);
    }
});


//     /books/reviews - DELETE (delete a review - author or admin)
router.delete("/:bookId/reviews/:reviewId", authenticateJWT, async function (req, res, next) {
    try {
        const { reviewId } = req.params;
        const review = await Review.deleteReview(reviewId);
        if (!review) {
            throw new NotFoundError(`Review with ID ${reviewId} not found for book.`);
        }
        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
});



module.exports = router;