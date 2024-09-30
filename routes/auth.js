const jsonschema = require("jsonschema");
const { BadRequestError, UnauthorizedError } = require("../expressError");
const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const newUser = require("../schema/newUser.json");
const { createToken } = require("../helpers/token");


//POST auth/register: {user} returns roken
router.post("/register", async function (req, res, next) {
    try {
        const { username, password, firstName, lastName, email, isAdmin } = req.body;
        const userData = {
            username,
            password,
            first_name: firstName,
            last_name: lastName,
            email,
            is_admin: isAdmin || false,
        };

        const validator = jsonschema.validate(userData, newUser);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const createUser = await User.register(userData);
        const token = createToken(createUser);
        return res.status(201).json({ token });
    } catch (err) {
        return next(err);
    }
});

router.post("/login", async function (req, res, next) {
    try {
        const { username, password } = req.body;
        // Check if username and password are provided
        const user = await User.authenticate(username, password);
        const token = createToken(user);
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                profile_img_url: user.profile_img_url,
            },
            token,
        });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
