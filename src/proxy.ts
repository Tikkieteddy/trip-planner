import { NextRequest } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function proxy(request: NextRequest) {
  return auth0.middleware(request);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
