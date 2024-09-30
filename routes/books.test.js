"use strict"


const request = require("supertest");
const app = require("../app");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, u1Token } = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /books */

describe("GET /books", function () {
    test("works: get all books", async function () {
        const resp = await request(app).get("/books");
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            books: expect.any(Array),
        });
    });
});

/************************************** GET /books/:bookId */

describe("GET /books/:bookId", function () {
    test("works: get existing book from DB", async function () {
        const resp = await request(app).get("/books/OL12345678M");
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            book: expect.objectContaining({
                olid: "OL12345678M",
                title: expect.any(String),
                author: expect.any(Array),
                coverUrl: expect.any(String),
                description: expect.any(String),
            }),
        });
    });

    test("works: fetch book from API and save to DB", async function () {
        const resp = await request(app).get("/books/OL87654321M");
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            book: expect.objectContaining({
                olid: "OL87654321M",
                title: expect.any(String),
                author: expect.any(Array),
                coverUrl: expect.any(String),
                description: expect.any(String),
            }),
        });
    });

    test("not found: book does not exist", async function () {
        const resp = await request(app).get("/books/nonexistent-id");
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** POST /books/:bookId/reviews */

describe("POST /books/:bookId/reviews", function () {
    test("works: add a review", async function () {
        const resp = await request(app)
            .post("/books/OL51105571M/reviews")
            .set("Authorization", `Bearer ${u1Token}`)
            .send({
                reviewText: "Great book!",
                rating: 5,
            });
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            review: expect.any(Object),
        });
    });

    test("unauth: no token provided", async function () {
        const resp = await request(app)
            .post("/books/OL51105571M/reviews")
            .send({
                reviewText: "Great book!",
                rating: 5,
            });
        expect(resp.statusCode).toEqual(401);
    });
});

/************************************** GET /books/:bookId/reviews */

describe("GET /books/:bookId/reviews", function () {
    test("works: get reviews for a book", async function () {
        const resp = await request(app).get("/books/OL51105571M/reviews");
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            data: expect.any(Array),
            avgRating: expect.any(Number),
        });
    });
});

/************************************** GET /books/:bookId/reviews/:reviewId */

describe("GET /books/:bookId/reviews/:reviewId", function () {
    test("works: get a specific review", async function () {
        const resp = await request(app).get("/books/OL51105571M/reviews/1");
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            review: expect.any(Object),
        });
    });

    test("not found: review does not exist", async function () {
        const resp = await request(app).get("/books/OL12345678M/reviews/nonexistent-review");
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** PUT /books/:bookId/reviews/:reviewId */

describe("PUT /books/:bookId/reviews/:reviewId", function () {
    test("works: update a review", async function () {
        const resp = await request(app)
            .put("/books/OL51105571M/reviews/1")
            .set("Authorization", `Bearer ${u1Token}`)
            .send({
                reviewText: "Updated review text",
                rating: 4,
            });
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            updatedReview: expect.any(Object),
        });
    });

    test("unauth: no token provided", async function () {
        const resp = await request(app)
            .put("/books/OL12345678M/reviews/reviewIdExample")
            .send({
                reviewText: "Updated review text",
                rating: 4,
            });
        expect(resp.statusCode).toEqual(401);
    });
});

/************************************** DELETE /books/:bookId/reviews/:reviewId */

describe("DELETE /books/:bookId/reviews/:reviewId", function () {
    test("works: delete a review", async function () {
        const resp = await request(app)
            .delete("/books/OL51105571M/reviews/1")
        expect(resp.statusCode).toEqual(204);
    });

    test("unauth: no token provided", async function () {
        const resp = await request(app)
            .delete("/books/OL51105571M/reviews/1");
        expect(resp.statusCode).toEqual(401);
    });

    test("not found: review does not exist", async function () {
        const resp = await request(app)
            .delete("/books/OL12345678M/reviews/nonexistent-reviewId")
            .set("Authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(404);
    });
});