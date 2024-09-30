const db = require("../db");
const { NotFoundError } = require("../expressError");

class Book {

    //get list of all books
    static async getAll() {
        const result = await db.query(
            `SELECT olid AS "olid", title, author, cover_url AS "coverUrl", description
             FROM books
             ORDER BY title ASC, author ASC`
        );

        return result.rows;
    }

    //get specific book
    static async getBookById(bookId) {
        const result = await db.query(
            `SELECT olid AS "olid", title, author, cover_url AS "coverUrl", description
             FROM books
             WHERE olid = $1`,
            [bookId]
        );
        const book = result.rows[0];
        if (!book) {
            return false;
        }
        return book;
    }

    //get books by genre
    static async getByGenre(genreId) {
        const result = await db.query(
            `SELECT b.olid AS "olid", b.title, b.author, b.cover_url AS "coverUrl", description
             FROM books AS b
             JOIN book_genres AS bg ON b.olid = bg.book_id
             WHERE bg.genre_id = $1`,
            [genreId]
        );

        return result.rows;
    }


    //get books by author
    static async getByAuthor(author) {
        const result = await db.query(
            `SELECT olid AS "olid", title, author, cover_url AS "coverUrl", description
             FROM books
             WHERE author ILIKE $1`,
            [author]
        );

        return result.rows;
    }

    //Add book
    static async create({ olid, title, author, coverUrl, description }) {
        const result = await db.query(
            `INSERT INTO books (olid, title, author, cover_url, description)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING olid AS "olid", title, author, cover_url AS "coverUrl", description`,
            [olid, title, author, coverUrl, description]
        );

        return result.rows[0];
    }

    //delete book
    static async delete(bookId) {
        const result = await db.query(
            `DELETE FROM books
                 WHERE olid = $1
                 RETURNING olid`,
            [bookId]
        );

        const deletedBook = result.rows[0];

        if (!deletedBook) {
            return `No book found with ID: ${bookId}`;
        }
        return `Book with ID: ${bookId} deleted successfully.`
    }
}

module.exports = Book;