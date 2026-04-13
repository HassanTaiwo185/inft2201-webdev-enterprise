const express = require("express");
const jwt = require("jsonwebtoken");
const users = require("../data/users");

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "bX4+YKIneD$bDvRr=O88|9l0v^Gq5#ioc7vy.UTFh@,";


// POST /login
// Body: { username, password }
// On success: return a JWT that includes { userId, role } as claims.
router.post("/login", (req, res, next) => {
  // TODO: implement:
   const { username, password } = req.body;

   if (!username || !password) {
        const err = new Error("Username and password are required");
        err.statusCode = 400;
        return next(err);
  }

  // - Look up user in users.js
  const user = users.find((u) => u.username === username);
  if (!user) {
    const err = new Error("Invalid username or password.");
    err.statusCode = 401;
    return next(err);
  }

  // - Check password (plain text is fine for this assignment)
  // - If invalid, pass an appropriate auth error into next(err)
  if (user.password !== password) {
    const err = new Error("Invalid username or password.");
    err.statusCode = 401;
    return next(err);
  }


  // - If valid, sign a JWT and return { token }
  const token = jwt.sign({ userId: user.id, role: user.role }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

module.exports = router;