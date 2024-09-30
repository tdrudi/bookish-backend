const db = require("../db.js");
const bcrypt = require("bcrypt");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError.js");
const { sqlForPartialUpdate } = require("../helpers/sqlUpdate.js");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

class User {
    //authenticate user with username, password. Returns user details
    static async authenticate(username, password) {
        // try to find the user first
        try {
            const result = await db.query(
                `SELECT id,
                username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email, profile_img_url
           FROM users
           WHERE username = $1`,
                [username],
            );

            const user = result.rows[0];
            if (user) {
                // compare hashed password to a new hash from password
                const isValid = await bcrypt.compare(password, user.password);
                if (isValid === true) {
                    delete user.password;
                    return user;
                }
            }
        } catch (err) {
            throw new UnauthorizedError("Invalid username/password");
        }
    }

    //Register user with data. Returns user details
    static async register(
        { username, password, first_name, last_name, email, is_admin }) {
        const duplicateCheck = await db.query(
            `SELECT username
           FROM users
           WHERE username = $1`,
            [username],
        );

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate username: ${username}`);
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        const result = await db.query(
            `INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            email,
            profile_img_url, 
            is_admin)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`,
            [
                username,
                hashedPassword,
                first_name,
                last_name,
                email,
                'default-profile.jpg',
                is_admin
            ],
        );

        const user = result.rows[0];

        return user;
    }

    //Find all users. Returns user details
    static async findAll() {
        const result = await db.query(
            `SELECT id,
                  username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           ORDER BY username`,
        );

        return result.rows;
    }

    //Given a username, return data about user.
    static async get(username) {
        const userRes = await db.query(
            `SELECT id,
                  username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  profile_img_url,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
            [username],
        );

        const user = userRes.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);
        return user;
    }

    //Update user data with `data`, this is a partial update. 
    static async update(username, data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                username: "username",
                firstName: "first_name",
                lastName: "last_name",
                profileImgUrl: "profile_img_url",
                email: "email"
            });
        const usernameVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE users 
                            SET ${setCols} 
                            WHERE username = ${usernameVarIdx} 
                            RETURNING username,
                                      first_name AS "firstName",
                                      last_name AS "lastName",
                                      email,
                                      profile_img_url,
                                      is_admin AS "isAdmin"`;

        const result = await db.query(querySql, [...values, username]);
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

        delete user.password;
        return user;
    }
    //Delete given user from database; returns undefined.
    static async remove(username) {
        let result = await db.query(
            `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
            [username],
        );
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);
    }

    // ---------------------------- FOLLOWERS/FOLLOWING -------------------------------

    //Get followers list
    static async getFollowers(username) {
        const res = await db.query(
            `SELECT u.username, u.first_name AS "firstName", u.last_name AS "lastName"
            FROM following AS F JOIN users AS u ON f.follwer_id = u.id
            WHERE f.user_id = (SELECT id FROM users WHERE username =$1) and f.status = 'accepted`,
            [username]);
        return res.rows;
    }

    //Get user following list
    static async getFollowing(username) {
        const res = await db.query(`
            SELECT u.username, u.first_name AS "firstName", u.last_name AS "lastName"
             FROM following AS f 
             JOIN users AS u ON f.user_id = u.id
             WHERE f.follower_id = (SELECT id FROM users WHERE username = $1) AND f.status = 'accepted'`,
            [username]);

        return res.rows;
    }

    //Follow user
    static async follow(toFollowUser, followingUser) {
        const followerResult = await db.query(
            `SELECT id FROM users WHERE username = $1`,
            [toFollowUser]
        );
        const userToFollowResult = await db.query(
            `SELECT id FROM users WHERE username = $1`,
            [followingUser]
        );

        const followerId = followerResult.rows[0];
        const userId = userToFollowResult.rows[0];

        if (!followerId || !userId) {
            throw new NotFoundError(`User(s) not found`);
        }

        const res = await db.query(
            `INSERT INTO following (user_id, follower_id, status) 
             VALUES ($1, $2, 'pending') 
             RETURNING id`,
            [userId, followerId]
        );
        return res.rows[0];
    }

    //Unfollow user
    static async unfollow(followingUsername, unfollowingUser) {
        const followerResult = await db.query(
            `SELECT id FROM users WHERE username = $1`,
            [followingUsername]
        );
        const userToUnfollowResult = await db.query(
            `SELECT id FROM users WHERE username = $1`,
            [unfollowingUser]
        );

        const followerId = followerResult.rows[0];
        const userId = userToUnfollowResult.rows[0];

        if (!followerId || !userId) {
            throw new NotFoundError(`User(s) not found`);
        }

        const result = await db.query(
            `DELETE FROM following 
             WHERE user_id = $1 AND follower_id = $2`,
            [userId, followerId]
        );

        if (result.rowCount === 0) {
            throw new NotFoundError(`Follow relationship not found`);
        }
    }
}

module.exports = User;
