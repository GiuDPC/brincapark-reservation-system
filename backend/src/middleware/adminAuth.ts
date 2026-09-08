import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: string | JwtPayload;
}

function adminAuth(req: AuthRequest, res: Response, next: NextFunction): Response | void {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Acceso denegado" });
  }

  const token = authHeader.split(" ")[1]; 

  try {
    const jwtSecret = process.env.JWT_SECRET || "brincapark_jwt_secure_key_2026";
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Acceso denegado" });
  }
}

export default adminAuth;
