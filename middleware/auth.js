const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

//Verify token an dif valid, store payload
function authenticateJWT(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace(/^[Bb]earer /, "").trim();
            jwt.verify(token, SECRET_KEY, (err, user) => {
                if (err) {
                    return res.sendStatus(403);
                }
                req.user = user;
                next();

            });
        } else {
            res.sendStatus(401);
        }
    } catch (err) {
        return next();
    }
}

module.exports = {
    authenticateJWT
};
