import { Hono } from "hono";
import {
  getInvoiceDetails,
  getInvoices,
  getOpenInvoices,
  getOrderDetails,
  getUserOrder,
  getUserOrders,
  placeOrder,
} from "../../crud/ordersController";
import {
  checkStock,
  ensureAccountPermission,
  getUserId,
} from "../../lib/utils";
import { ALL_PERMISSIONS } from "../../lib/constants";
const router = new Hono();

router.post(`/place_order`, async (c) => {
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

// router.post(`/place_order`, async (c) => {
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

router.get(`/get_orders`, async (c) => {
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
router.get(`/get_order`, async (c) => {
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
router.get(`/get_order_details`, async (c) => {
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

router.get(`/get_open_invoices`, async (c) => {
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
router.get(`/get_sales_invoices`, async (c) => {
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

router.get(`/get_invoice_details`, async (c) => {
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

// router.post(`/check_last_order`, async (c) => {
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
// router.post(`/reinitiate_checkout`, async (c) => {
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
export default router;
