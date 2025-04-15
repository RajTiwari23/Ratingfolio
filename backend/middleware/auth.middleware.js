import { db, verifyJWTToken } from "../utils.js";

export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const token_data = verifyJWTToken(token.substring(7));
  if (!token_data) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  let user = null;
  try {
    user = await db.user.findUnique({
      where: {
        id: token_data.id,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    if (!user.verified) {
      throw new Error("User is not verified");
    }
  } catch (error) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }
  req.user = user;
  next();
}
