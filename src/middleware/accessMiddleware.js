const userOnly = (req, res, next) => {
  try {
    // Extract accountId from different possible sources
    const accountId =
      req.params.accountId || req.query.accountId || req.body.accountId;

    if (!accountId) {
      return res.status(400).json({ error: "Account ID is required." });
    }

    // Check if the user is authenticated and has access
    if (req.user && req.user.accountId == accountId) {
      return next(); // User authorized
    }

    // Unauthorized response
    return res
      .status(403)
      .json({
        error:
          "Access denied. You do not have permission to access this account.",
      });
  } catch (error) {
    console.error("Middleware error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { userOnly };
