const express = require("express");
const mailData = require("../data/mail");
const authenticateJWT = require("../middleware/authenticateJWT");
const authorize = require("../middleware/authorize");
const canViewMail = require("../policies/canViewMail");
const rateLimit = require("../middleware/rateLimit");

const router = express.Router();

// Resource loader for /mail/:id
function loadMail(req, res, next) {
  const id = parseInt(req.params.id, 10);
  const mail = mailData.find(m => m.id === id);

  if (!mail) {
    // TODO: create a "not found" error object and pass to next(err)
    const err = new Error(`Mail with id ${id} not found`);
    err.statusCode = 404;
    return next(err);
  }

  req.mail = mail;
  next();
}

// GET /mail/:id
// Requirements:
// - Must be authenticated (JWT)
// - Must satisfy canViewMail policy (admin OR owner)
router.get("/:id",
  authenticateJWT,
  rateLimit,
  loadMail,
  authorize(canViewMail),
  (req, res) => {
    // At this point, user is authenticated and authorized.
    res.json(req.mail);
  }
);

module.exports = router;