
const express = require("express");
const router = express.Router();
const List = require("../models/list");
const { authenticateJWT } = require("../middleware/auth");
const { BadRequestError, NotFoundError } = require("../expressError");

//GET (All lists by user)
router.get("/users/:userId", async function (req, res, next) {
    try {
        const userId = req.params.userId;
        const lists = await List.getAll(userId);
        if (!lists) {
            throw new NotFoundError(`No lists found for user ID ${userId}`);
        }
        res.status(200).json({ lists });
    } catch (err) {
        next(err);
    }
});

//POST (add a list)
router.post("/", authenticateJWT, async function (req, res, next) {
    try {
        const { userId, listName, isPrivate } = req.body;
        if (!listName) {
            throw new BadRequestError("List name is required.");
        }
        const newList = await List.create({ userId, listName, isPrivate });
        return res.status(201).json({ message: "List created", data: newList });
    } catch (err) {
        next(err);
    }
});

//GET (specific list by user)
router.get("/:listId", async function (req, res, next) {
    try {
        const { listId } = req.params;
        const list = await List.get(listId);
        if (!list) {
            throw new NotFoundError(`List with ID ${listId} not found`);
        }
        res.status(200).json(list);
    } catch (err) {
        next(err);
    }
});


//DELETE (delete list - author)
router.delete("/:listId", authenticateJWT, async function (req, res, next) {
    try {
        const { listId } = req.params;
        await List.delete(listId);
    } catch (err) {
        next(err);
    }
});


//PUT (EDIT A LIST - Name)
router.put("/:listId", authenticateJWT, async function (req, res, next) {
    try {
        const { listId } = req.params;
        const data = req.body;

        // Assuming the List model has a method `updateList`
        const updatedList = await List.update(listId, data);
        if (!updatedList) {
            throw new NotFoundError(`List with ID ${listId} not found`);
        }
        res.status(200).json({ message: "List updated successfully", data: updatedList });
    } catch (err) {
        next(err);
    }
});



//Get (books from list)
router.get("/:listId/books", async function (req, res, next) {
    try {
        const { listId } = req.params;
        const result = await List.getBooksOnList(listId);
        res.status(200).json({ result });
    } catch (err) {
        next(err);
    }
});


//POST (add a book to the list)
router.post("/:listId/books", authenticateJWT, async function (req, res, next) {
    try {
        const { listId } = req.params;
        const { bookId } = req.body;
        if (!bookId) {
            throw new BadRequestError("Book ID is required.");
        }

        const result = await List.addBook(listId, bookId);
        if (!result) {
            throw new NotFoundError(`List with ID ${listId} not found`);
        }
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});


//DELETE (remove a book from list)
router.delete("/:listId/:bookId", authenticateJWT, async function (req, res, next) {
    try {
        const { listId, bookId } = req.params;
        const result = await List.removeBook(listId, bookId);
        if (!result) {
            throw new NotFoundError(`Book or list not found`);
        }
        res.status(200).json({ message: "Book removed from list" });

    } catch (err) {
        next(err);
    }
});


module.exports = router;