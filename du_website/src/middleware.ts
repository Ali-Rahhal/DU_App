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
  "/open-invoice",
  "/sales-invoice",
  "/dashboard",
  "/survey",
  "/complaint",
  "/fidelity",
  "/my-complaints",
  //  "/child-accounts",
  "/users",
  "/item-alternatives",
  "/restock",
  "/expiry-deal",
  "/ai-order-proposal",
  "/returns",
  "/return-admin",
];
export async function middleware(request: NextRequest) {
  const isServer = typeof window === "undefined";
  let API_BASE_URL = "";
  if (isServer) {
    API_BASE_URL = process.env.NEXT_PUBLIC_API_SERVER_URL!;
  } else {
    const { protocol, hostname } = window.location;

    const isLocal =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.");

    if (isLocal) {
      // Direct/internal access
      API_BASE_URL = `${protocol}//${hostname}:${process.env.NEXT_PUBLIC_DIRECT_API_PORT}/api`;
    } else {
      // Domain/nginx access
      API_BASE_URL = process.env.NEXT_PUBLIC_API_BROWSER_URL;
    }
  }

  // const isServer = typeof window === "undefined";

  // const API_BASE_URL = isServer
  //   ? process.env.NEXT_PUBLIC_API_SERVER_URL
  //   : process.env.NEXT_PUBLIC_API_BROWSER_URL;

  // your middleware stuff here
  const headers = new Headers(request.headers);
  headers.set("x-url", request.nextUrl.pathname);
  const cookie = request.headers.get("cookie");
  const result = await fetch(API_BASE_URL + "/auth/user", {
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
