import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const cookieName = "rw_admin_session";

function getSecret() {
  return new TextEncoder().encode(process.env.SESSION_SECRET ?? "development-session-secret");
}

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function createAdminSession(email: string, role: "admin" | "editor") {
  const token = await new SignJWT({ email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const store = await cookies();
  store.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
}

export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { email: String(payload.email), role: String(payload.role) as "admin" | "editor" };
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export function validateAdminCredentials(email: string, password: string) {
  return email === (process.env.ADMIN_EMAIL ?? "admin@example.com") && password === (process.env.ADMIN_PASSWORD ?? "change-me");
}
