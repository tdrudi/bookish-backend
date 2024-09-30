const express = require("express");
const jsonschema = require("jsonschema");
const { BadRequestError, NotFoundError } = require("../expressError");
const User = require("../models/user");
const userSchema = require("../schema/updateUser");
const { authenticateJWT } = require("../middleware/auth");


const router = express.Router();

//      /users - GET (get list of all users)
router.get("/", async function (req, res, next) {
    try {
        const users = await User.findAll();
        return res.json({ users });
    } catch (err) {
        return next(err);
    }
});

//     /users/[username] - GET (get details about specific user by username)
router.get("/:username", async function (req, res, next) {
    try {
        const user = await User.get(req.params.username);
        if (!user) {
            throw new NotFoundError(`User ${req.params.username} not found`);
        }
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});

//      /users/[username] - PATCH (update profile, must be admin or user)
router.patch("/:username", authenticateJWT, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const user = await User.update(req.params.username, req.body);
        if (!user) {
            throw new NotFoundError(`User ${req.params.username} not found`);
        }
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});

//      /users/[username] - DELETE (delete user - admin or user)
router.delete("/:username", authenticateJWT, async function (req, res, next) {
    try {
        await User.remove(req.params.username);
        return res.json({ deleted: req.params.username });
    } catch (err) {
        return next(err);
    }
});


//--------------------------------------- Following/Followers  ----------------------------------------


//     /following - POST (follow a user)
router.post("/:userId/follow", authenticateJWT, async function (req, res, next) {
    try {
        const userId = req.user.id;
        const userToFollow = req.params.userId;

        const following = await User.follow(userToFollow, userId);
        return res.status(201).json({ following });
    } catch (err) {
        return next(err);
    }
});


//     /following - DELETE (unfollow a user)
router.delete("/:userId/follow", authenticateJWT, async function (req, res, next) {
    try {
        const userId = req.user.id;
        const userToUnfollow = req.params.userId;

        await User.unfollow(userId, userToUnfollow);
        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
});

//      /following - GET (list of following)
router.get("/:userId/following", async function (req, res, next) {
    try {
        const userId = req.params.userId;
        const followingList = await User.getFollowing(userId);
        return res.json({ following: followingList });
    } catch (err) {
        return next(err);
    }
});

//      /followers - GET (list of following)
router.get("/:userId/followers", async function (req, res, next) {
    try {
        const userId = req.params.userId;
        const followersList = await User.getFollowers(userId);
        return res.json({ followers: followersList });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;