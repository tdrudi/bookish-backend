"use strict";

const db = require("../db.js");
const List = require("./list.js");
const { NotFoundError } = require("../expressError");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("List model", () => {
    let userId;

    beforeEach(async () => {
        const result = await db.query(`SELECT id FROM users WHERE username='u1'`);
        userId = result.rows[0].id;
    });

    test("getAll: retrieves all lists for a user", async () => {
        const lists = await List.getAll(userId);
        expect(lists.length).toBe(2);
        expect(lists[0].listName).toBe('My Reading List');
        expect(lists[1].listName).toBe('Favorite Books');
    });

    test("get: retrieves a specific list by ID", async () => {
        const newList = await List.create({ userId, listName: 'New List', isPrivate: false });
        const list = await List.get(newList.id);
        expect(list.id).toBe(newList.id);
        expect(list.listName).toBe('New List');
        expect(list.isPrivate).toBe(false);
    });

    test("get: returns an error for nonexistent list", async () => {
        await expect(List.get(999)).rejects.toThrow('List not found');
    });

    test("create: adds a new list", async () => {
        const newList = await List.create({ userId, listName: 'Another List', isPrivate: true });
        expect(newList.listName).toBe('Another List');
        expect(newList.isPrivate).toBe(true);
    });

    test("update: updates an existing list", async () => {
        const newList = await List.create({ userId, listName: 'To Be Updated', isPrivate: false });
        const updatedList = await List.update(newList.id, { listName: 'Updated List' });
        expect(updatedList.id).toBe(newList.id);
        expect(updatedList.listName).toBe('Updated List');
    });

    test("delete: removes a list", async () => {
        const newList = await List.create({ userId, listName: 'To Be Deleted', isPrivate: false });
        await List.delete(newList.id);
        await expect(List.get(newList.id)).rejects.toThrow(NotFoundError);
    });

    test("delete: throws NotFoundError for nonexistent list", async () => {
        await expect(List.delete(999)).rejects.toThrow(NotFoundError);
    });

    test("addBook: adds a book to the list", async () => {
        const newList = await List.create({ userId, listName: 'Book List', isPrivate: false });
        const bookId = 'OL51105571M';
        await List.addBook(newList.id, bookId);

        const books = await List.getBooksOnList(newList.id);
        expect(books.length).toBe(1);
        expect(books[0].olid).toBe(bookId);
    });

    test("removeBook: removes a book from the list", async () => {
        const newList = await List.create({ userId, listName: 'Book List', isPrivate: false });
        const bookId = 'OL51105571M';
        await List.addBook(newList.id, bookId);

        await List.removeBook(newList.id, bookId);
        const books = await List.getBooksOnList(newList.id);
        expect(books.length).toBe(0);
    });

    test("removeBook: throws error if book not in list", async () => {
        const newList = await List.create({ userId, listName: 'Another List', isPrivate: false });
        const result = await List.removeBook(newList.id, 'nonexistent-book-id');
        expect(result).toBeUndefined();
        const books = await List.getBooksOnList(newList.id);
        expect(books.length).toBe(0);
    });
});