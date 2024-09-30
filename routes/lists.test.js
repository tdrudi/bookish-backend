"use strict";

const request = require("supertest");
const app = require("../app");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /users/:userId */

describe("GET /users/:userId", function () {
    test("works: get all lists by user", async function () {
        const resp = await request(app).get("/lists/users/u1");
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            lists: expect.any(Array),
        });
    });

    test("not found: user does not exist", async function () {
        const resp = await request(app).get("/lists/users/nonexistent-user");
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** POST / */

describe("POST /", function () {
    test("works: add a new list", async function () {
        const resp = await request(app)
            .post("/lists/")
            .set("Authorization", `Bearer ${u1Token}`)
            .send({
                userId: "u1",
                listName: "My Reading List",
                isPrivate: false,
            });
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            message: "List created",
            data: expect.any(Object),
        });
    });

    test("bad request: missing list name", async function () {
        const resp = await request(app)
            .post("/lists/")
            .set("Authorization", `Bearer ${u1Token}`)
            .send({
                userId: "u1",
                isPrivate: false,
            });
        expect(resp.statusCode).toEqual(400);
        expect(resp.body).toEqual({
            message: "List name is required.",
        });
    });

    test("unauth: no token provided", async function () {
        const resp = await request(app).post("/lists/").send({
            userId: "u1",
            listName: "My List",
            isPrivate: false,
        });
        expect(resp.statusCode).toEqual(401);
    });
});

/************************************** GET /:listId */

describe("GET /:listId", function () {
    test("works: get specific list by ID", async function () {
        const resp = await request(app).get("/lists/1");
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(expect.objectContaining({
            id: expect.any(Number),
            listName: expect.any(String),
        }));
    });

    test("not found: list does not exist", async function () {
        const resp = await request(app).get("/lists/nonexistent-list");
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** DELETE /:listId */

describe("DELETE /:listId", function () {
    test("works: delete list", async function () {
        const resp = await request(app)
            .delete("/lists/1")
            .set("Authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            message: "List deleted successfully",
        });
    });

    test("not found: list does not exist", async function () {
        const resp = await request(app)
            .delete("/lists/nonexistent-list")
            .set("Authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(404);
    });

    test("unauth: no token provided", async function () {
        const resp = await request(app).delete("/lists/1");
        expect(resp.statusCode).toEqual(401);
    });
});

/************************************** PUT /:listId */

describe("PUT /:listId", function () {
    test("works: update a list", async function () {
        const resp = await request(app)
            .put("/lists/1")
            .set("Authorization", `Bearer ${u1Token}`)
            .send({
                listName: "Updated List Name",
            });
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            message: "List updated successfully",
            data: expect.any(Object),
        });
    });

    test("not found: list does not exist", async function () {
        const resp = await request(app)
            .put("/lists/nonexistent-list")
            .set("Authorization", `Bearer ${u1Token}`)
            .send({
                listName: "Updated List Name",
            });
        expect(resp.statusCode).toEqual(404);
    });

    test("unauth: no token provided", async function () {
        const resp = await request(app)
            .put("/lists/1")
            .send({
                listName: "Updated List Name",
            });
        expect(resp.statusCode).toEqual(401);
    });
});

/************************************** GET /:listId/books */

describe("GET /:listId/books", function () {
    test("works: get books from list", async function () {
        const resp = await request(app).get("/lists/1/books");
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            result: expect.any(Array),
        });
    });

    test("not found: list does not exist", async function () {
        const resp = await request(app).get("/lists/nonexistent-list/books");
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** POST /:listId/books */

describe("POST /:listId/books", function () {
    test("works: add a book to the list", async function () {
        const resp = await request(app)
            .post("/lists/1/books")
            .set("Authorization", `Bearer ${u1Token}`)
            .send({
                bookId: "OL51105571M",
            });
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual(expect.any(Object));
    });

    test("not found: list does not exist", async function () {
        const resp = await request(app)
            .post("/lists/nonexistent-list/books")
            .set("Authorization", `Bearer ${u1Token}`)
            .send({
                bookId: "OL51105571M",
            });
        expect(resp.statusCode).toEqual(404);
    });

    test("unauth: no token provided", async function () {
        const resp = await request(app).post("/lists/1/books").send({
            bookId: "OL51105571M",
        });
        expect(resp.statusCode).toEqual(401);
    });
});

/************************************** DELETE /:listId/:bookId */

describe("DELETE /:listId/:bookId", function () {
    test("works: remove a book from the list", async function () {
        const resp = await request(app)
            .delete("/lists/1/OL51105571M") // Use a valid list and book ID
            .set("Authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            message: "Book removed from list",
        });
    });

    test("not found: book or list does not exist", async function () {
        const resp = await request(app)
            .delete("/lists/nonexistent-list/nonexistent-book")
            .set("Authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(404);
    });

    test("unauth: no token provided", async function () {
        const resp = await request(app).delete("/lists/1/OL51105571M");
        expect(resp.statusCode).toEqual(401);
    });
});