const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // User must be authenticated first
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized.",
            });
        }

        // Check user's role
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message:
                    "You do not have permission to perform this action.",
            });
        }

        next();
    };
};

module.exports = authorize;