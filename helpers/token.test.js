const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const { SECRET_KEY } = require("../config");

describe("authenticateJWT", function () {
    // A sample protected route to test against
    beforeAll(() => {
        app.get("/some-protected-route", (req, res) => {
            return res.json({ user: req.user }); // Send back the user info
        });
    });

    test("works: via header", async function () {
        const user = { username: "test", isAdmin: false };
        const token = jwt.sign(user, SECRET_KEY);

        const resp = await request(app)
            .get(`/users/${user.id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            user: {
                iat: expect.any(Number),
                username: "test",
                isAdmin: false,
            },
        });
    });

    test("unauthorized without token", async function () {
        const resp = await request(app)
            .get(`/users/${user.id}`);

        expect(resp.statusCode).toEqual(401);
    });

    test("forbidden with invalid token", async function () {
        const resp = await request(app)
            .get(`/users/${user.id}`)
            .set("Authorization", "Bearer invalidtoken");

        expect(resp.statusCode).toEqual(403);
    });
});