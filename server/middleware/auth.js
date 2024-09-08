import jwt from "jsonwebtoken";

// middleware for authorization, allows some paths for guests
export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization"); // get token

    if (!token) {
      return res.status(403).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; //?
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
