const express = require("express");
const cors = require("cors");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const bookRoutes = require("./routes/books");
const listRoutes = require("./routes/lists");

const app = express();
app.use(cors());

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/books", bookRoutes);
app.use("/lists", listRoutes);

app.use(authenticateJWT);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
    res.status(404).send("Not Found");
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
        error: { message, status },
    });
});

module.exports = app;
