const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "bX4+YKIneD$bDvRr=O88|9l0v^Gq5#ioc7vy.UTFh@,";


// TODO: Implement authenticateJWT middleware for Assignment 3.
// Requirements:
// - Read the Authorization header: "Bearer <token>".
// - Verify the token using jwt.verify and SECRET.
// - If valid, attach the decoded payload to req.user.
// - If missing/invalid/expired, pass an appropriate error into next(err)
//   (do NOT send the response directly here — let errorHandler.js do that).

module.exports = function authenticateJWT(req, res, next) {
  // TODO: implement
  const authHeader = req.headers["authorization"];

  // Check header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const err = new Error("Authorization header missing. Expected to start with Bearer <token>");
    err.statusCode = 401;
    return next(err);
  }

  // Extract token from header
  const token = authHeader.slice(7);
  
  try {

    // Verify the token
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();

  } catch (jwtErr) {


    // Check if token is expired
    if (jwtErr.name === "TokenExpiredError") {
      const err = new Error("Token has expired. Please log in again.");
      err.statusCode = 401;
      return next(err);
    }else{

      // Check if Token is invalid
      const err = new Error("Invalid token. Please log in again.");
      err.statusCode = 401;
      return next(err);
    }

  }
};