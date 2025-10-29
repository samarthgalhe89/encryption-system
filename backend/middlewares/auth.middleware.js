import jwt from "jsonwebtoken";

// Middleware function to protect routes
const authMiddleware = (req, res, next) => {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    // This assumes your JWT payload includes the user/hospital ID (id: hospital._id)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the hospital ID to the request object
    req.hospitalId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" }, err);
  }
};

export default authMiddleware;