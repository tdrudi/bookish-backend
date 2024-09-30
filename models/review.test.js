"use strict";

const db = require("../db.js");
const Review = require("./review.js");
const { NotFoundError } = require("../expressError");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testBookId,
    testUserId,
} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Review Model", () => {
    let testReviewId;

    test("addReview: successfully adds a review", async () => {
        const review = await Review.addReview({
            bookId: 1,
            userId: 1,
            reviewText: "Great book!",
            rating: 5,
        });
        expect(review).toEqual({
            id: expect.any(Number),
            bookId: 1,
            userId: 1,
            reviewText: "Great book!",
            rating: 5,
            createdAt: expect.any(Date),
        });
        testReviewId = review.id;
    });

    test("addReview: throws an error if user already reviewed the book", async () => {
        await Review.addReview({
            bookId: 1,
            userId: 1,
            reviewText: "Duplicate review",
            rating: 4,
        });

        await expect(
            Review.addReview({
                bookId: 1,
                userId: 1,
                reviewText: "Another duplicate review",
                rating: 3,
            })
        ).rejects.toThrow("User has already reviewed this book.");
    });

    test("updateReview: successfully updates a review", async () => {
        const updatedReview = await Review.updateReview(1, "Updated review", 4);
        expect(updatedReview).toEqual({
            id: 1,
            bookId: 1,
            userId: 1,
            reviewText: "Updated review",
            rating: 4,
            createdAt: expect.any(Date),
        });
    });

    test("updateReview: throws NotFoundError if review not found", async () => {
        await expect(
            Review.updateReview(9999, "Nonexistent review", 3)
        ).rejects.toThrow(NotFoundError);
    });

    test("deleteReview: successfully deletes a review", async () => {
        const response = await Review.deleteReview(1);
        expect(response).toEqual({ message: "Review deleted successfully" });
    });

    test("deleteReview: throws NotFoundError if review not found", async () => {
        await expect(
            Review.deleteReview(9999)
        ).rejects.toThrow(NotFoundError);
    });

    test("getAllByBook: retrieves all reviews for a book", async () => {
        const reviews = await Review.getAllByBook(1);
        expect(reviews).toEqual(expect.any(Array));
    });

    test("getReview: retrieves a specific review", async () => {
        const review = await Review.getReview(1, 1);
        expect(review).toEqual(expect.objectContaining({
            id: 1,
            reviewText: "Updated review",
            rating: 4,
            userId: 1,
        }));
    });

    test("avgRating: calculates average rating", async () => {
        const avg = await Review.avgRating(testBookId);
        expect(avg).toEqual(expect.any(String));
    });
});