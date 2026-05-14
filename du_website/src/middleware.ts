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
];
export async function middleware(request: NextRequest) {
  const isServer = typeof window === "undefined";
  const API_PORT = process.env.NEXT_PUBLIC_DIRECT_API_PORT || "5003";
  let API_BASE_URL = "";
  if (isServer) {
    API_BASE_URL = process.env.NEXT_PUBLIC_API_SERVER_URL!;
  } else {
    const { protocol, hostname, port } = window.location;
    // If app opened directly using a custom frontend port
    if (port && port !== "80" && port !== "443") {
      API_BASE_URL = `${protocol}//${hostname}:${API_PORT}/api`;
    }
    // If app opened normally behind nginx/domain
    else {
      API_BASE_URL = "/api";
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
