"use strict";
const Book = require("./book");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testcommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Book model", () => {
    test("getAll: retrieves all books", async () => {
        const books = await Book.getAll();
        expect(books).toEqual([
            {
                olid: 'OL51105571M',
                title: 'Fourth Wing',
                author: 'Rebecca Yarros',
                coverUrl: null,
                description: null
            },
            {
                olid: 'OL1846076W',
                title: 'The Giver',
                author: 'Lois Lowry',
                coverUrl: null,
                description: null
            },
            {
                olid: 'OL17352669W',
                title: 'A Court of Thorns and Roses',
                author: 'Sarah J. Maas',
                coverUrl: null,
                description: null
            }
        ]);
    });

    test("getBookById: retrieves a specific book", async () => {
        const book = await Book.getBookById('OL51105571M');
        expect(book).toEqual({
            olid: 'OL51105571M',
            title: 'Fourth Wing',
            author: 'Rebecca Yarros',
            coverUrl: null,
            description: null
        });
    });

    test("getBookById: returns false for nonexistent book", async () => {
        const book = await Book.getBookById('nonexistent-id');
        expect(book).toBe(false);
    });

    test("create: adds a new book", async () => {
        const newBook = await Book.create({
            olid: 'OL99999999X',
            title: 'New Book',
            author: 'New Author',
            coverUrl: 'http://example.com/newcover.jpg',
            description: 'New Description',
        });
        expect(newBook).toEqual({
            olid: 'OL99999999X',
            title: 'New Book',
            author: 'New Author',
            coverUrl: 'http://example.com/newcover.jpg',
            description: 'New Description',
        });
    });

    test("delete: removes a book", async () => {
        await Book.delete('OL51105571M');
        const book = await Book.getBookById('OL51105571M');
        expect(book).toBe(false);
    });

    test("delete: throws NotFoundError for nonexistent book", async () => {
        const result = await Book.delete('nonexistent-id');
        expect(result).toBeUndefined();
        const books = await Book.getAll();
        expect(books.length).toBe(3);
    });
});