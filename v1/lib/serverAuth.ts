import jwt from "jsonwebtoken";

type JwtPayload = {
  sub?: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
};

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret";

export function verifyJwtFromRequest(request: Request): JwtPayload | null {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.split(/;\s*/).find((c) => c.startsWith("tm_session="));
    if (!match) return null;
    const token = match.split("=").slice(1).join("=");
    if (!token) return null;
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}

export function isAdminFromRequest(request: Request): boolean {
  const payload = verifyJwtFromRequest(request);
  return !!(payload && payload.role === "admin");
}

export { verifyJwtFromRequest, isAdminFromRequest };
