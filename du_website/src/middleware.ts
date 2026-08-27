import { NextResponse, type NextRequest } from "next/server";

import { validateAuth } from "./utils/apiCalls";

const publicRoutes = ["/login", "/register", "/create-password"];

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isPublicRoute = publicRoutes.some((route) =>
    matchesRoute(pathname, route),
  );

  const headers = new Headers(request.headers);
  headers.set("x-url", pathname);

  let isAuth = false;

  try {
    const cookie = request.headers.get("cookie");
    const result = await validateAuth(cookie);

    isAuth = result.status === 200;
  } catch {
    isAuth = false;
  }

  // Authenticated user
  if (isAuth) {
    if (isPublicRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next({
      request: {
        headers,
      },
    });
  }

  // Unauthenticated user
  if (!isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Public route
  return NextResponse.next({
    request: {
      headers,
    },
  });
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icon/|\\.well-known/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
