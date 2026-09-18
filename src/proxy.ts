import { clerkMiddleware } from "@clerk/nextjs/server";

// The public Vercel alias is not registered as a Clerk Frontend API proxy host.
// Use Clerk's managed frontend API host so authentication remains available.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
