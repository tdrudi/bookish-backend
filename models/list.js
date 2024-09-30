const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sqlUpdate");

class List {

    //Get all lists by a user
    static async getAll(userId) {
        try {
            const result = await db.query(
                `SELECT l.id, l.list_name, l.is_private, l.book_count
                 FROM Lists l
                 WHERE l.user_id = $1`,
                [userId]
            );
            return result.rows;           // This will return the lists with book counts
        } catch (err) {
            throw new Error('Error fetching user lists')
        }
    }
    //Get one list by a user
    static async get(listId) {
        try {
            const result = await db.query(
                `SELECT * FROM lists
                 WHERE id = $1`,
                [listId]);
            if (result.rows.length === 0) {
                throw new Error('List not found');
            }

            return result.rows[0];

        } catch (error) {
            throw new Error('Error retrieving the list');
        }
    }

    //create list
    static async create({ userId, listName, isPrivate }) {
        const result = await db.query(
            `INSERT INTO lists (user_id, list_name, is_private)
             VALUES ($1, $2, $3)
             RETURNING id, list_name AS "listName", is_private AS "isPrivate", created_at AS "createdAt"`,
            [userId, listName, isPrivate]
        );
        return result.rows[0];
    }

    //delete list
    static async delete(listId) {
        await db.query(
            `DELETE FROM lists
             WHERE id = $1`,
            [listId]
        );
    }
    //update list
    static async update(listId, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {
            listName: "list_name",
            isPrivate: "is_private",
        });

        const listIdVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE lists
                          SET ${setCols}
                          WHERE id = ${listIdVarIdx}
                          RETURNING id, list_name AS "listName", is_private AS "isPrivate", created_at AS "createdAt"`;
        const result = await db.query(querySql, [...values, listId]);
        const updatedList = result.rows[0];

        if (!updatedList) {
            throw new NotFoundError(`List not found or user does not have access to this list`);
        }
        return updatedList;
    }

    //Get books on list
    static async getBooksOnList(listId) {
        try {
            const result = await db.query(
                `SELECT *
                 FROM List_Books lb
                 WHERE lb.list_id = $1`, [listId]);

            const bookIds = result.rows.map(row => row.book_id);

            let books = [];
            if (bookIds.length > 0) {
                const bookPromises = bookIds.map(async (olid) => {
                    const book = await db.query(`SELECT * FROM books WHERE olid = $1`, [olid]);
                    return book.rows[0];
                });
                books = await Promise.all(bookPromises);
            }
            return books;

        } catch (err) {
            throw new Error('Error getting books from list.');
        }
    }


    //Add book to list
    static async addBook(listId, bookId) {
        try {
            const existingBookCheck = await db.query(
                `SELECT * FROM list_books 
                 WHERE list_id = $1 AND book_id = $2`,
                [listId, bookId]
            );
            if (existingBookCheck.rows.length == 0) {
                const result = await db.query(
                    `INSERT INTO list_books (list_id, book_id) 
                 VALUES ($1, $2)
                 RETURNING list_id, book_id`,
                    [listId, bookId]
                );

                await db.query(
                    `UPDATE Lists 
                 SET book_count = book_count + 1 
                 WHERE id = $1`,
                    [listId]
                );
                return result.rows[0];
            }
        } catch (err) {
            throw new Error('Error adding book to the list');
        }
    }

    //Remove book from list
    static async removeBook(listId, bookId) {
        try {
            const result = await db.query(
                `DELETE FROM list_books
                 WHERE list_id = $1 AND book_id = $2
                 RETURNING list_id, book_id`,
                [listId, bookId]
            );
            if (result.rows.length === 0) {
                throw new Error('Book not found in the list');
            }

            await db.query(
                `UPDATE Lists 
                 SET book_count = book_count - 1 
                 WHERE id = $1`,
                [listId]
            );
            return result.rows[0];
        } catch (err) {
            throw new Error('Error removing book from the list');
        }
    }
}


module.exports = List;
