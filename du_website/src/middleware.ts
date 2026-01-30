import { NextResponse, type NextRequest } from "next/server";
const unauthRoutes = [];
const authRoutes = [
  "/account",
  "/checkout",
  "/cart",
  "/wishlist",
  "/change-password",
  "/orders",
  "/orders-details",
  "/dashboard",
  "/survey",
  "/complaint",
  "/fidelity",
  "/my-complaints",
  "/child-accounts",
];
export async function middleware(request: NextRequest) {
  // your middleware stuff here
  const headers = new Headers(request.headers);
  headers.set("x-url", request.nextUrl.pathname);
  const cookie = request.headers.get("cookie");
  const result = await fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/user", {
    headers: {
      Cookie: cookie,
    },
  }).catch((err) => {
    console.log(err.message);
    return { status: 401 };
  });
  const isAuth = result.status === 200;
  if (isAuth) {
    if (unauthRoutes.includes(request.nextUrl.pathname))
      return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next({
      request: {
        headers: headers,
      },
    });
  } else if (authRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next({
    request: {
      headers: headers,
    },
  });
}
// export const config = {
//   matcher: ["/account/:path*", "/account", "/checkout/"],
// };
