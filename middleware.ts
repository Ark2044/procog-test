import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware() {
  // Middleware should be lightweight and fast
  // Database initialization should happen elsewhere
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  /* match all request paths except for the ones that start with:
    - api
    - _next/static
    - _next/image
    - favicon.ico
    */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
