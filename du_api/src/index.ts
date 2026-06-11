import { serve } from "@hono/node-server";
import { Hono } from "hono";
import tokenAuth from "./lib/tokenAuth";
import { cors } from "hono/cors";
import { getCookie } from "hono/cookie";
import { compress } from "hono/compress";

import authPrivateRoutes from "./routes/private/auth.routes";
import authPublicRoutes from "./routes/public/auth.routes";
import childAccountRoutes from "./routes/private/childAccount.routes";
import usersRoutes from "./routes/private/users.routes";
import surveyPrivateRoutes from "./routes/private/survey.routes";
import surveyPublicRoutes from "./routes/public/survey.routes";
import complaintRoutes from "./routes/private/complaint.routes";
import promotionPrivateRoutes from "./routes/private/promotion.routes";
import promotionPublicRoutes from "./routes/public/promotion.routes";
import orderRoutes from "./routes/private/orders.routes";
import productRoutes from "./routes/public/products.routes";
import otherPrivateRoutes from "./routes/private/other.routes";
import otherPublicRoutes from "./routes/public/other.routes";
import cartAndFavRoutes from "./routes/private/cartAndFav.routes";
import restockAndAlternativesPrivateRoutes from "./routes/private/restockAndAlternatives.routes";
import restockAndAlternativesPublicRoutes from "./routes/public/restockAndAlternatives.routes";
import expiryDealRoutes from "./routes/private/expiryDeal.routes";
import fidelityRoutes from "./routes/private/fidelity.routes";
import aiRoutes from "./routes/private/ai.routes";
import returnRoutes from "./routes/private/returns.routes";

//@ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};
const PUBLIC_API = "/api";
const PRIVATE_API = "/api/auth";
const app = new Hono();

// app.use(
//   "/api/*",
//   cors({
//     origin: (origin: string) => {
//       return origin;
//     },
//     maxAge: 600,
//     credentials: true,
//   }),
// );

app.use(
  "/api/*",
  cors({
    origin: [
      "http://159.195.23.130:5006",
      "http://cloud.quayomobility.ca:5006",
      "http://localhost:5006",
      //du Server:
      // "https://duquayo-test.d-union.com",
      // "https://duquayo-test.d-union.com:5004",
      // "http://192.168.160.18:5005",
      // "http://localhost:5005",
    ],
    credentials: true,
    maxAge: 600,
  }),
);

async function authMiddleware(c, next) {
  const token = getCookie(c, "auth");

  if (!token) return c.json({ message: "Not Authorized", result: null }, 401);
  const userId = await tokenAuth(token);
  if (!userId) return c.json({ message: "Invalid token", result: null }, 401);
  c.req.user_id = userId;
  await next();
}

app.use("*", compress());
app.use(`${PRIVATE_API}/*`, authMiddleware);

app.route(`${PUBLIC_API}`, authPublicRoutes);
app.route(`${PUBLIC_API}`, productRoutes);
app.route(`${PUBLIC_API}`, otherPublicRoutes);
app.route(`${PUBLIC_API}`, promotionPublicRoutes);
app.route(`${PUBLIC_API}/survey`, surveyPublicRoutes);
app.route(`${PUBLIC_API}/restockAndAlt`, restockAndAlternativesPublicRoutes);

app.route(`${PRIVATE_API}`, authPrivateRoutes);
app.route(`${PRIVATE_API}`, cartAndFavRoutes);
app.route(`${PRIVATE_API}`, otherPrivateRoutes);
app.route(`${PRIVATE_API}`, promotionPrivateRoutes);
app.route(`${PRIVATE_API}`, orderRoutes);
app.route(`${PRIVATE_API}/users`, usersRoutes);
//app.route(`${PRIVATE_API}/child`, childAccountRoutes);
app.route(`${PRIVATE_API}/survey`, surveyPrivateRoutes);
app.route(`${PRIVATE_API}/complaint`, complaintRoutes);
app.route(`${PRIVATE_API}/restockAndAlt`, restockAndAlternativesPrivateRoutes);
app.route(`${PRIVATE_API}/expiryDeal`, expiryDealRoutes);
app.route(`${PRIVATE_API}/fidelity`, fidelityRoutes);
app.route(`${PRIVATE_API}/ai`, aiRoutes);
app.route(`${PRIVATE_API}/returns`, returnRoutes);

// server ./images folder
// app.use(
//   "/images/*",
//   serveStatic({
//     root: "../images",
//   })
// );

const port = Number(process.env.PORT) || 5003;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
