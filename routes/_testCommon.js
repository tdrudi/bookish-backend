"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Book = require("../models/book");
const List = require("../models/list");
const Review = require("../models/review");
const { createToken } = require("../helpers/token");

async function commonBeforeAll() {
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM companies");

    await User.register({
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        password: "password1",
        isAdmin: false,
    });
    await User.register({
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        email: "user2@user.com",
        password: "password2",
        isAdmin: false,
    });
    await User.register({
        username: "u3",
        firstName: "U3F",
        lastName: "U3L",
        email: "user3@user.com",
        password: "password3",
        isAdmin: false,
    });

    await Book.create({
        olid: 'OL51105571M',
        title: 'Fourth Wing',
        author: 'Rebecca Yarros',
        coverUrl: 'http://example.com/cover1.jpg',
        description: 'A fantasy novel about dragons.',
    });
    await Book.create({
        olid: 'OL1846076W',
        title: 'The Giver',
        author: 'Lois Lowry',
        coverUrl: 'http://example.com/cover2.jpg',
        description: 'A dystopian novel about memory.',
    });

    await List.create({ userId: 1, listName: 'My Reading List', isPrivate: false });
    await List.create({ userId: 2, listName: 'Favorite Books', isPrivate: true });

    await Review.create({
        userId: 1,
        bookId: 'OL51105571M',
        rating: 5,
        comment: 'Amazing book!',
    });

    await Review.create({
        userId: 2,
        bookId: 'OL51105571M',
        rating: 2,
        comment: 'Bad book!',
    });
}

async function commonBeforeEach() {
    await db.query("BEGIN");
}

async function commonAfterEach() {
    await db.query("ROLLBACK");
}

async function commonAfterAll() {
    await db.end();
}


const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });


module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    adminToken,
};
