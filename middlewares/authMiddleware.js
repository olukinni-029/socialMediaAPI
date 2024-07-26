import { verifyToken } from "../utils/jwt.js";

export const authenticateUserToken = async (req, res, next) => {
    try {
      const header = req.headers.authorization;
  
      if (!header) {
        return res.status(403).json({ error: "Auth header is missing" });
      }
  
      const token = header.split("Bearer ")[1];
      
      if (!token) {
        return res.status(403).json({ error: "Auth token is missing" });
      }
  
      try {
        // Verify user token
        const decodedUser = verifyToken(token);
        req.user = decodedUser;
        next();
      } catch (error) {
        console.error("Error decoding user token:", error.message);
        return res.status(403).json({ error: "Invalid user token, or an expired token"});
      }
    } catch (err) {
      console.error("Authentication error:", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };