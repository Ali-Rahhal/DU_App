import { serve } from "@hono/node-server";
import { Hono } from "hono";
import tokenAuth from "./lib/tokenAuth";
import { cors } from "hono/cors";
import { getCookie } from "hono/cookie";
import {
  addItemToCart,
  addItemToFavorite,
  getCartItems,
  getDashboardData,
  getFavoriteItems,
  getInvoiceDetails,
  getInvoices,
  getOpenInvoices,
  getOrderDetails,
  getProductInfo,
  getProducts,
  getSideBarMenu,
  getUserOrder,
  getUserOrders,
  placeOrder,
  removeItemFromCart,
  removeItemFromFavorite,
  updateItemInCart,
} from "./crud/EcomController";
import { compress } from "hono/compress";

import path = require("path");

import authPrivateRoutes from "./routes/private/auth.routes";
import authPublicRoutes from "./routes/public/auth.routes";
import childAccountRoutes from "./routes/private/childAccount.routes";
import usersRoutes from "./routes/private/users.routes";
import surveyPrivateRoutes from "./routes/private/survey.routes";
import surveyPublicRoutes from "./routes/public/survey.routes";
import complaintRoutes from "./routes/private/complaint.routes";
import promotionPrivateRoutes from "./routes/private/promotion.routes";
import promotionPublicRoutes from "./routes/public/promotion.routes";
import {
  checkStock,
  ensureAccountPermission,
  getItemStock,
  getUserId,
  getUserIdFromToken,
} from "./lib/utils";
import { ALL_PERMISSIONS } from "./lib/constants";
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
      "http://localhost:5006", // optional for dev
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
app.route(`${PRIVATE_API}`, authPrivateRoutes);
//app.route("/", childAccountRoutes);
app.route(`${PRIVATE_API}/users`, usersRoutes);
app.route(`${PUBLIC_API}/survey`, surveyPublicRoutes);
app.route(`${PRIVATE_API}/survey`, surveyPrivateRoutes);
app.route(`${PRIVATE_API}/complaint`, complaintRoutes);
app.route(`${PUBLIC_API}`, promotionPublicRoutes);
app.route(`${PRIVATE_API}`, promotionPrivateRoutes);

app.get(`${PUBLIC_API}/get_side_bar`, async (c) => {
  try {
    const result = await getSideBarMenu();
    return c.json({
      message: "Fetched side bar",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
app.post(`${PUBLIC_API}/get_products`, async (c) => {
  try {
    const skip = c.req.query("skip");
    const take = c.req.query("take");
    const {
      category_code,
      sub_category_code,
      sort_by,
      sort_direction,
      show_only_best_deals,
      min_price,
      max_price,
      search,
      onPromotionOnly,
    } = await c.req.json();
    const result = await getUserIdFromToken(c)
      .then(async (res) => {
        const result = await getProducts({
          skip: parseInt(skip as string) || 0,
          take: parseInt(take as string) || 10,
          category_code:
            !category_code || (category_code as string[]).includes("all")
              ? []
              : category_code,

          sort_by: sort_by || "date",
          sort_direction: sort_direction || "DESC",
          show_only_best_deals: show_only_best_deals,
          min_price: min_price || null,
          max_price: max_price || null,
          user_id: res,
          search: search,
          onPromotionOnly: onPromotionOnly || false,
        });

        return result;
      })
      .catch(async (e) => {
        const result = await getProducts({
          skip: parseInt(skip as string) || 0,
          take: parseInt(take as string) || 10,
          category_code:
            !category_code || (category_code as string[]).includes("all")
              ? []
              : category_code,

          sort_by: sort_by || "date",
          sort_direction: sort_direction || "DESC",
          show_only_best_deals: show_only_best_deals,
          min_price: min_price || null,
          max_price: max_price || null,
          search: search,
          onPromotionOnly: onPromotionOnly || false,
        });

        return result;
      });

    return c.json({ message: "Fetched Products", result: result }, 200);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

app.get(`${PUBLIC_API}/get_product/:item_code`, async (c) => {
  try {
    const item_code = c.req.param("item_code");
    const result: any = await getUserIdFromToken(c)
      .then(async (res) => {
        const result = await getProductInfo(item_code, res);
        return result;
      })
      .catch(async (e) => {
        const result = await getProductInfo(item_code, null);
        return result;
      });

    // const result = await getProductInfo(item_code);
    return c.json({ message: "Fetched Products", result: result }, 200);
  } catch (e) {
    console.error(e);
    console.log(e.message);
    return c.json({ message: e.message, result: null }, 400);
  }
});
app.post(`${PRIVATE_API}/add_to_favorite`, async (c) => {
  try {
    const userId = await getUserId(c);
    if (!(await ensureAccountPermission(userId, ALL_PERMISSIONS.Wishlist))) {
      throw new Error("You don't have permission to use wishlist");
    }
    const body = await c.req.json();
    const itemCode = body["item_code"];
    const result = await addItemToFavorite(userId, itemCode);
    return c.json({
      message: "Added item to favorite",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
app.post(`${PRIVATE_API}/remove_from_favorite`, async (c) => {
  try {
    const userId = await getUserId(c);
    if (!(await ensureAccountPermission(userId, ALL_PERMISSIONS.Wishlist))) {
      throw new Error("You don't have permission to use wishlist");
    }
    const body = await c.req.json();
    const itemCode = body["item_code"];
    const result = await removeItemFromFavorite(userId, itemCode);
    return c.json({
      message: "Removed item to favorite",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
app.get(`${PRIVATE_API}/get_favorite_items`, async (c) => {
  try {
    const userId = await getUserId(c);
    const take = c.req.query("take");
    const skip = c.req.query("skip");
    const result = await getFavoriteItems(userId, {
      take: parseInt(take as string),
      skip: parseInt(skip as string),
    });
    return c.json({
      message: "Fetched account info",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

app.post(`${PRIVATE_API}/add_to_cart`, async (c) => {
  try {
    const userId = await getUserId(c);
    const body = await c.req.json();
    const itemCode = body["item_code"];
    const barcode = body["barcode"];
    const quantity = body["quantity"];
    if (!quantity) throw new Error("Quantity not provided");
    if (!barcode) throw new Error("Barcode not provided");
    if (!itemCode) throw new Error("Item code not provided");
    const result = await addItemToCart(
      userId,
      itemCode,
      barcode,
      parseInt(quantity),
    );
    return c.json({
      message: "Added item to favorite",
      result: result,
    });
  } catch (e) {
    console.log(e.message);
    return c.json({ message: e.message, result: null }, 400);
  }
});
app.post(`${PRIVATE_API}/remove_from_cart`, async (c) => {
  try {
    const userId = await getUserId(c);
    const body = await c.req.json();
    const itemCode = body["item_code"];

    const result = await removeItemFromCart(userId, itemCode);
    return c.json({
      message: "Added item to favorite",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
app.post(`${PRIVATE_API}/update_cart_item`, async (c) => {
  try {
    const userId = await getUserId(c);
    const body = await c.req.json();
    const itemCode = body["item_code"];

    const quantity = body["quantity"];
    if (!quantity) throw new Error("Quantity not provided");
    if (!itemCode) throw new Error("Item code not provided");
    const stock = await getItemStock(itemCode);
    if (stock < parseInt(quantity)) {
      throw new Error(`Only ${stock} items available`);
    }
    const result = await updateItemInCart(userId, itemCode, parseInt(quantity));
    return c.json({
      message: "Cart Updated",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
app.get(`${PRIVATE_API}/get_cart_items`, async (c) => {
  try {
    const userId = await getUserId(c);
    const result = await getCartItems(userId, {});
    return c.json({
      message: "Fetched Cart items",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
app.post(`${PRIVATE_API}/place_order`, async (c) => {
  try {
    const userId = await getUserId(c);

    if (!(await ensureAccountPermission(userId, ALL_PERMISSIONS.Order))) {
      throw new Error("You don't have permission to place order");
    }
    const body = await c.req.json();

    await checkStock(userId);

    const result = await placeOrder(userId);
    return c.json({
      message: "Order placed",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
app.get(`${PRIVATE_API}/dashboard_data`, async (c) => {
  try {
    const userId = await getUserId(c);

    const result = await getDashboardData(userId);

    return c.json({
      message: "Order placed",
      result: result,
    });
  } catch (e) {
    console.log(e.message);
    return c.json({ message: e.message, result: null }, 400);
  }
});

// app.post(`${PRIVATE_API}/place_order`, async (c) => {
//   try {
//     const userId = await getUserId(c);
//     const body = await c.req.json();
//     const user = body["user"];
//     const address = body["address"];
//     const payment = body["payment"];
//     if (!user) throw new Error("User info not provided");
//     if (!address) throw new Error("Address not provided");
//     if (!payment) throw new Error("Payment not provided");
//     const result = await placeOrder(userId, user, address, payment);
//     return c.json({
//       message: "Order placed",
//       result: result,
//     });
//   } catch (e) {
//     return c.json({ message: e.message, result: null }, 400);
//   }
// });
// // D8FC8C9B0348986F6C7562262FD87D64
// // app.post(`${PUBLIC_API}/bob_webhook_1`, async (c) => {
// //   try {
// //     const body = await c.req.json();
// //     const XNotificationSecret = c.req.header("X-Notification-Secret");
// //     if (XNotificationSecret !== "D8FC8C9B0348986F6C7562262FD87D64")
// //       throw new Error("Invalid secret");
// //     const result = await webhookHandler(body);
// //     return c.json({
// //       message: "Order placed",
// //       result: [],
// //     });
// //   } catch (e) {
// //     return c.json({ message: e.message, result: null }, 400);
// //   }
// // });

app.get(`${PRIVATE_API}/get_orders`, async (c) => {
  try {
    const userId = await getUserId(c);
    const { search } = c.req.query();
    const result = await getUserOrders(userId, search);
    return c.json({
      message: "Fetched orders",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
app.get(`${PRIVATE_API}/get_order`, async (c) => {
  try {
    const userId = await getUserId(c);
    const orderId = c.req.query("order_id");
    const result = await getUserOrder(parseInt(orderId), userId);

    return c.json({
      message: "Fetched order",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
app.get(`${PRIVATE_API}/get_order_details`, async (c) => {
  try {
    const userId = await getUserId(c);
    const orderId = c.req.query("order_id");
    if (!orderId) throw new Error("Order id not provided");
    if (!userId) throw new Error("User id not provided");
    const result = await getOrderDetails(parseInt(orderId), userId);
    return c.json({
      message: "Fetched orders",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

app.get(`${PRIVATE_API}/get_open_invoices`, async (c) => {
  try {
    const userId = await getUserId(c);
    const result = await getOpenInvoices(userId);
    return c.json({
      message: "Fetched Open Invoices ",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
app.get(`${PRIVATE_API}/get_sales_invoices`, async (c) => {
  try {
    const userId = await getUserId(c);
    const result = await getInvoices(userId);
    return c.json({
      message: "Fetched Sales Invoices ",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
// const getInvoiceDetails = async (invoice_no: string, userId: number) => {

app.get(`${PRIVATE_API}/get_invoice_details`, async (c) => {
  try {
    const userId = await getUserId(c);
    const invoice_no = c.req.query("invoice_no");
    if (!invoice_no) throw new Error("Invoice no not provided");
    const result = await getInvoiceDetails(invoice_no, userId);
    return c.json({
      message: "Fetched Invoice Details ",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

// app.post(`${PRIVATE_API}/check_last_order`, async (c) => {
//   try {
//     const userId = await getUserId(c);

//     const result = await checkLastOrder(userId);
//     return c.json({
//       message: "Order Checked",
//       result: result,
//     });
//   } catch (e) {
//     console.log(e.message);
//     return c.json({ message: e.message, result: null }, 400);
//   }
// });
// app.post(`${PRIVATE_API}/reinitiate_checkout`, async (c) => {
//   try {
//     const userId = await getUserId(c);
//     const body = await c.req.json();
//     const orderId = body["order_id"];
//     const result = await reinitiateCheckout(orderId, userId);
//     return c.json({
//       message: "Order placed",
//       result: result,
//     });
//   } catch (e) {
//     console.log(e.message);
//     return c.json({ message: e.message, result: null }, 400);
//   }
// });
// server ./images folder
// app.use(
//   "/images/*",
//   serveStatic({
//     root: "../images",
//   })
// );

const port = 5005;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
