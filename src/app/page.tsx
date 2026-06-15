import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ROUTES, SITE } from "@/lib/constants";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect(ROUTES.DASHBOARD);
  }

  // Unauthenticated landing — minimal, just redirect to sign-in
  redirect(ROUTES.SIGN_IN);
}
