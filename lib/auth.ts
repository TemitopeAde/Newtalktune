import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function getSession() {
  return await getServerSession(authOptions);
}
