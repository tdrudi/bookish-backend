const db = require("../db");
const { NotFoundError } = require("../expressError");

class Review {
    // ----------------- REVIEWS ---------------

    //add review
    static async addReview({ bookId, userId, reviewText, rating }) {
        const existingReview = await db.query(
            `SELECT id FROM reviews 
             WHERE book_id = $1 AND user_id = $2`,
            [bookId, userId]
        );
        if (existingReview.rows.length > 0) {
            throw new Error("User has already reviewed this book.");
        }
        const result = await db.query(
            `INSERT INTO reviews (book_id, user_id, review_text, rating) 
             VALUES ($1, $2, $3, $4)
             RETURNING id, book_id AS "bookId", user_id AS "userId", review_text AS "reviewText", rating, created_at AS "createdAt"`,
            [bookId, userId, reviewText, rating]
        );
        return result.rows[0];
    }


    //update review
    static async updateReview(reviewId, reviewText, rating) {
        const result = await db.query(
            `UPDATE reviews SET review_text = $1, rating = $2
             WHERE id = $3
             RETURNING id, book_id AS "bookId", user_id AS "userId", review_text AS "reviewText", rating, created_at AS "createdAt"`,
            [reviewText, rating, reviewId]
        );

        const updatedReview = result.rows[0];

        if (!updatedReview) {
            throw new NotFoundError(`Review not found`);
        }

        return updatedReview;
    }

    //delete review
    static async deleteReview(reviewId) {
        const result = await db.query(
            `DELETE FROM reviews
             WHERE id = $1
             RETURNING id`,
            [reviewId]
        );

        const deletedReview = result.rows[0];

        if (!deletedReview) {
            throw new NotFoundError(`Review not found`);
        }

        return { message: "Review deleted successfully" };
    }

    //all reviews for book
    static async getAllByBook(bookId) {
        const result = await db.query(
            `SELECT r.id, 
                    r.review_text AS "reviewText", 
                    r.user_id AS "userId",
                    r.rating AS "rating",
                    r.created_at AS "createdAt", 
                    u.username 
             FROM reviews AS r
             JOIN users AS u ON r.user_id = u.id
             WHERE r.book_id = $1
             ORDER BY r.created_at DESC`,
            [bookId]
        );

        return result.rows;
    }

    //get sepecific review
    static async getReview(bookId, reviewId) {
        const result = await db.query(
            `SELECT r.id, 
                    r.review_text AS "reviewText", 
                    r.user_id AS "userId",
                    r.rating AS "rating",
                    r.created_at AS "createdAt",
                    u.username 
             FROM reviews AS r
             JOIN users AS u ON r.user_id = u.id
             WHERE r.book_id = $1 AND r.id = $2
             ORDER BY r.created_at DESC`,
            [bookId, reviewId]
        );

        return result.rows[0];
    }

    //calculate avg rating
    static async avgRating(bookId) {
        const result = await db.query(
            `SELECT AVG(rating) AS avg_rating
             FROM reviews
             WHERE book_id = $1`,
            [bookId]
        );
        const avg = result.rows[0].avg_rating;
        return avg ? parseFloat(avg).toFixed(2) : null;
    }
}

module.exports = Review;