"use server";

import { redirect } from "next/navigation";
import { createAdminSession, loginSchema, validateAdminCredentials } from "@/lib/server/auth";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });
  if (!parsed.success) {
    redirect("/admin/login?error=invalid");
  }
  if (!validateAdminCredentials(parsed.data.email, parsed.data.password)) {
    redirect("/admin/login?error=invalid");
  }
  await createAdminSession(parsed.data.email, "admin");
  redirect("/admin");
}
