import { NextResponse, type NextRequest } from "next/server";
import { user } from "./utils/apiCalls";
const unauthRoutes = ["/login", "/register", "/create-password"];
const authRoutes = [
  "/",
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
  "/products",
  "/category",
  "/collection",
];
export async function middleware(request: NextRequest) {
  // your middleware stuff here
  const headers = new Headers(request.headers);
  headers.set("x-url", request.nextUrl.pathname);
  const cookie = request.headers.get("cookie");
  const result = await user(cookie).catch((err) => {
    console.log("middleware: ", err.message);
    return { status: 401 };
  });

  const pathname = request.nextUrl.pathname;
  // Check if path matches any auth route (exact match or starts with route/)
  const isAuthRoute = authRoutes.some((route) => {
    return pathname === route || pathname.startsWith(route + "/");
  });
  const isAuth = result.status === 200;

  if (isAuth) {
    if (
      unauthRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/"),
      )
    )
      return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next({
      request: {
        headers: headers,
      },
    });
  } else if (isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
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
