export function errorHandler(err, req, res, next) {
  // Custom AppError
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  console.error("❌ Unknown error:", err);

  return res.status(500).json({
    message: "Internal server error",
  });
}
