// Centralized error handler.
// This should be the LAST app.use(...) in server.js.

module.exports = function errorHandler(err, req, res, next) {
  // TODO: Implement centralized error handling.
  // Requirements:
  // - Do NOT leak stack traces or internal details to the client.
  // - Always return a consistent JSON structure, e.g.:
  //   { error, message, statusCode, requestId, timestamp }
  // - Use correct HTTP status codes based on the type of error
  //   (you can attach a statusCode on your custom error objects).
  // - Include req.requestId in the response if available.

  

  console.error("Unhandled error for request", req.requestId, err);

  // use Error statuscode  from error object or fall back to 500
  const statusCode = err.statusCode || 500;


  // Map known error types to HTTP status codes
  const errorCategories = {
    400: "BadRequest",
    401: "Unauthorized",
    403: "Forbidden",
    404: "NotFound",
    429: "TooManyRequests",
    500: "InternalServerError"
  }

  // Determine the error type based on status code
  const errorType = errorCategories[statusCode] || "InternalServerError";

  // Determine the error message based on status code (show only client errors details and hide internal details (server errors))
  let errorMessage;
  if(statusCode < 500){
      errorMessage = err.message;
    }else{
      errorMessage = "An unexpected error occurred.";
  }

  // Retry-After header for rate limit errors
  if (statusCode === 429 && err.retryAfter) {
    res.set("Retry-After", err.retryAfter);
  }

  res.status(statusCode).json({
    error: errorType,
    message: errorMessage,
    statusCode: statusCode,
    requestId: req.requestId || null,
    timestamp: new Date().toISOString()
  });
};