const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  const userRole = req.user.role;
  const allowed = roles.flat();

  if (!allowed.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: `Role '${userRole}' is not allowed to access this resource`,
    });
  }

  next();
};

module.exports = { authorize };
