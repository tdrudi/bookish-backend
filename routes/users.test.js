"use strict";

const request = require("supertest");
const app = require("../app");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    adminToken,
} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /users */

describe("GET /users", function () {
    test("works for admin", async function () {
        const resp = await request(app)
            .get("/users")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            users: expect.any(Array),
        });
    });

    test("unauth for non-admin", async function () {
        const resp = await request(app)
            .get("/users")
            .set("Authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });
});

/************************************** GET /users/:username */

describe("GET /users/:username", function () {
    test("works for existing user", async function () {
        const resp = await request(app).get(`/users/u1`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            user: expect.objectContaining({
                username: "u1",
                firstName: "U1F",
                lastName: "U1L",
                email: "user1@user.com",
            }),
        });
    });

    test("not found for non-existing user", async function () {
        const resp = await request(app).get(`/users/no-such-user`);
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", function () {
    test("works for updating own profile", async function () {
        const resp = await request(app)
            .patch(`/users/u1`)
            .set("Authorization", `Bearer ${u1Token}`)
            .send({
                email: "newemail@user.com",
                firstName: "NewU1F",
            });
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            user: expect.objectContaining({
                username: "u1",
                email: "newemail@user.com",
                firstName: "NewU1F",
            }),
        });
    });

    test("works for admin updating user", async function () {
        const resp = await request(app)
            .patch(`/users/u2`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                email: "newemail@user2.com",
            });
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            user: expect.objectContaining({
                username: "u2",
                email: "newemail@user2.com",
            }),
        });
    });

    test("unauth for non-admin updating another user", async function () {
        const resp = await request(app)
            .patch(`/users/u2`)
            .set("Authorization", `Bearer ${u1Token}`)
            .send({
                email: "newemail@user2.com",
            });
        expect(resp.statusCode).toEqual(401);
    });

    test("bad request for invalid data", async function () {
        const resp = await request(app)
            .patch(`/users/u1`)
            .set("Authorization", `Bearer ${u1Token}`)
            .send({
                email: "not-an-email",
            });
        expect(resp.statusCode).toEqual(400);
    });
});

/************************************** DELETE /users/:username */

describe("DELETE /users/:username", function () {
    test("works for deleting own account", async function () {
        const resp = await request(app)
            .delete(`/users/u1`)
            .set("Authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            deleted: "u1",
        });
    });

    test("works for admin deleting another user", async function () {
        const resp = await request(app)
            .delete(`/users/u2`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            deleted: "u2",
        });
    });

    test("unauth for non-admin deleting another user", async function () {
        const resp = await request(app)
            .delete(`/users/u2`)
            .set("Authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("not found for non-existing user", async function () {
        const resp = await request(app)
            .delete(`/users/no-such-user`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });
});