const bcrypt = require("bcrypt");
const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
    await db.query("DELETE FROM reviews");
    await db.query("DELETE FROM lists");
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM books");

    await db.query(`
        INSERT INTO books(olid, title, author)
        VALUES 
            ('OL51105571M', 'Fourth Wing', 'Rebecca Yarros'),
            ('OL1846076W', 'The Giver', 'Lois Lowry'),
            ('OL17352669W', 'A Court of Thorns and Roses', 'Sarah J. Maas')`);

    await db.query(`
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES 
            ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
            ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`,
        [
            await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
            await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
        ]);

    const result = await db.query(`
        INSERT INTO lists(user_id, list_name, is_private)
        VALUES 
            (1, 'My Reading List', false),
            (1, 'Favorite Books', true),
            (2, 'To Read', false)
        RETURNING id`);

    const lists = result.rows.map(row => row.id);

    await db.query(`
        INSERT INTO reviews(user_id, book_id, content)
        VALUES 
            (1, 'OL51105571M', 'An amazing book about flying dragons.'),
            (2, 'OL1846076W', 'A interesting tale of perspectives.')
        RETURNING id`);
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

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
};