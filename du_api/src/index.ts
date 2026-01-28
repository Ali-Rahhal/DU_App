import { serve } from "@hono/node-server";
import { Context, Hono } from "hono";
import tokenAuth from "./lib/tokenAuth";
import { cors } from "hono/cors";
import { login, getUserDetails, changePassword } from "./crud/AuthController";
import { getCookie } from "hono/cookie";
import { serialize } from "hono/utils/cookie";
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
import {
  getProductsSurvey,
  getSurveyElements,
  getSurveys,
  saveSurveyAnswer,
} from "./crud/surveyController";
import {
  getComplaints,
  getComplaintsElements,
  getUserComplaints,
  saveComplaintAnswer,
} from "./crud/complaintController";
import path = require("path");
import { serveStatic } from "@hono/node-server/serve-static";
import { saveAudioReturnUrl } from "./lib/utils";
import { getAllAvailablePromotions } from "./crud/PromotionController";
//@ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};
const PUBLIC_API = "/api";
const PRIVATE_API = "/api/auth";
const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: (origin: string) => {
      return origin;
    },
    maxAge: 600,
    credentials: true,
  })
);

async function authMiddleware(c, next) {
  const token = getCookie(c, "auth");

  if (!token)
    return c.json({ message: "No token provided", result: null }, 401);
  const userId = await tokenAuth(token);
  if (!userId) return c.json({ message: "Invalid token", result: null }, 401);
  c.req.user_id = userId;
  await next();
}

app.use("*", compress());
app.use(`${PRIVATE_API}/*`, authMiddleware);
//request too large fix
app.use;
async function getUserId(c) {
  const userId = c.req.user_id;
  return userId;
}
async function getUserIdFromToken(c: Context) {
  // const token = c.req.header("Authorization");
  const token = getCookie(c, "auth");
  if (!token) throw new Error("No token provided");
  const userId = await tokenAuth(token);
  return userId;
}

app.get("/test", async (c) => {
  try {
    // const t = await createSession({
    //   orderId: "1236",
    //   amount: 100,
    // });
    const test = await getAllAvailablePromotions();

    return c.json({ message: "Test success", result: test }, 200);

    // await authorize({
    //   amount: 100,
    //   orderId: "123",
    //   description: "test",
    //   transactionId: "123",
    //   userId: "123",
    // });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

// app.post(`${PUBLIC_API}/register`, async (c) => {
//   try {
//     const body = await c.req.json();

//     const email = body["email"];
//     const password = body["password"];
//     const first_name = body["first_name"];
//     const last_name = body["last_name"];
//     const phone_number = body["phone_number"];

//     if (!email) {
//       throw new Error("Email not provided");
//     }
//     if (!password) {
//       throw new Error("Password not provided");
//     }
//     if (!first_name) {
//       throw new Error("First name not provided");
//     }
//     if (!last_name) {
//       throw new Error("Last name not provided");
//     }
//     // if (!phone_number) {
//     //   throw new Error("Phone number not provided");
//     // }
//     const result = await register({
//       email,
//       password,
//       first_name,
//       last_name,
//       phone_number,
//     });
//     return c.json({ message: "Creation success", result: result });
//   } catch (e) {
//     return c.json({ message: e.message, result: null }, 400);
//   }
// });
app.get(`${PRIVATE_API}/user`, async (c) => {
  try {
    const userId = await getUserId(c);
    // console.log(userId);
    const result = "";
    return c.json({ message: "Get user success", result: result }, 200);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 401);
  }
});
app.post(`${PUBLIC_API}/login`, async (c) => {
  try {
    const body = await c.req.json();

    const code = body["code"];
    const password = body["password"];

    if (!code || !password) throw new Error("email or password not provided");
    const result = await login({ code, password }, c);
    return result;
    // return c.json({ message: "Login success", result: result });
  } catch (e) {
    const serialized = serialize("auth", "", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      secure: process.env.NODE_ENV === "production" ? true : false,
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return c.json({ message: e.message, result: null }, 401, {
      "Set-Cookie": serialized,
    });
  }
});
app.post(`${PUBLIC_API}/logout`, async (c) => {
  try {
    const userId = await getUserId(c);
    const serialized = serialize("auth", "", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      secure: process.env.NODE_ENV === "production" ? true : false,
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return c.json({ message: "Logout success", result: [] }, 200, {
      "Set-Cookie": serialized,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 401);
  }
});
// app.post(`${PUBLIC_API}/send_verify_email`, async (c) => {
//   try {
//     const body = await c.req.json();

//     const email = body["email"];

//     if (!email) throw new Error("email or code not provided");
//     const result = await sendVerify(email, c);
//     return result;
//   } catch (e) {
//     return c.json({ message: e.message, result: null }, 402);
//   }
// });
// app.post(`${PUBLIC_API}/send_reset_email`, async (c) => {
//   try {
//     const body = await c.req.json();

//     const email = body["email"];

//     if (!email) throw new Error("email or code not provided");
//     const result = await forgotPassword(email, c);
//     return result;
//   } catch (e) {
//     return c.json({ message: e.message, result: null }, 400);
//   }
// });

// app.post(`${PUBLIC_API}/validate_reset_code`, async (c) => {
//   try {
//     const body = await c.req.json();

//     const key = body["key"];

//     if (!key) throw new Error("code not provided");
//     const result = await validateResetCode(key, c);
//     return result;
//   } catch (e) {
//     return c.json({ message: e.message, result: null }, 400);
//   }
// });
// app.post(`${PUBLIC_API}/change_password_forgot`, async (c) => {
//   try {
//     const body = await c.req.json();

//     const newPassword = body["new_password"];
//     const confirmedPassword = body["confirmed_password"];
//     const key = body["key"];

//     if (!newPassword || !confirmedPassword || !key)
//       throw new Error("email or code not provided");
//     const result = await changePasswordReset(
//       newPassword,
//       confirmedPassword,
//       key,
//       c
//     );
//     return result;
//   } catch (e) {
//     return c.json({ message: e.message, result: null }, 401);
//   }
// });
// app.post(`${PUBLIC_API}/verify_email`, async (c) => {
//   try {
//     const body = await c.req.json();

//     const email = body["email"];
//     const key = body["key"];

//     if (!email || !key) throw new Error("email or code not provided");
//     const result = await verifyEmail(email, key, c);
//     return result;
//   } catch (e) {
//     return c.json({ message: e.message, result: null }, 401);
//   }
// });
// app.get(`${PRIVATE_API}/user`, async (c) => {
//   try {
//     const userId = await getUserId(c);
//     // console.log(userId);
//     const result = "";
//     return c.json({ message: "Get user success", result: result }, 200);
//   } catch (e) {
//     return c.json({ message: e.message, result: null }, 401);
//   }
// });
app.get(`${PRIVATE_API}/user_details`, async (c) => {
  try {
    const userId = await getUserId(c);
    const result = await getUserDetails(userId);
    return c.json({ message: "Get user success", result: result }, 200);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

// app.post(`${PRIVATE_API}/update_user_detail`, async (c) => {
//   try {
//     const userId = await getUserId(c);
//     const { first_name, last_name, phone_number, address } = await c.req.json();
//     const result = await updateUserDetails({
//       userId: userId,
//       first_name: first_name,
//       last_name: last_name,
//       phone: phone_number,
//       address: address,
//     });
//     return c.json({ message: "Get user success", result: result }, 200);
//   } catch (e) {
//     return c.json({ message: e.message, result: null }, 401);
//   }
// });
// // const changePassword = async ({
// //   userId,
// //   oldPassword,
// //   newPassword,
// //   confirmedPassword,
// // }: {
app.post(`${PRIVATE_API}/change_password`, async (c) => {
  try {
    const userId = await getUserId(c);
    const { old_password, new_password, confirmed_password } =
      await c.req.json();
    const result = await changePassword({
      userId: userId,
      oldPassword: old_password,
      newPassword: new_password,
      confirmedPassword: confirmed_password,
    });
    return c.json({ message: "Password changed", result: result }, 200);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 401);
  }
});

app.get(`${PUBLIC_API}/get_side_bar`, async (c) => {
  try {
    const result = await getSideBarMenu();
    return c.json({
      message: "Fetched side bar",
      result: result,
    });
  } catch (e) {
    console.log(e.message);
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
        });

        return result;
      });

    return c.json({ message: "Fetched Products", result: result }, 200);
  } catch (e) {
    console.log(e.message);
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
    return c.json({ message: e.message, result: null }, 400);
  }
});
app.post(`${PRIVATE_API}/add_to_favorite`, async (c) => {
  try {
    const userId = await getUserId(c);
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
    const body = await c.req.json();
    const itemCode = body["item_code"];
    const result = await removeItemFromFavorite(userId, itemCode);
    return c.json({
      message: "Added item to favorite",
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
      parseInt(quantity)
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
    const body = await c.req.json();

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

app.get(`${PRIVATE_API}/survey/get_surveys`, async (c) => {
  try {
    const userId = await getUserId(c);
    const result = await getSurveys();
    return c.json({
      message: "Fetched surveys",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

app.get(`${PRIVATE_API}/survey/get_survey_elements`, async (c) => {
  try {
    const userId = await getUserId(c);
    const surveyId = c.req.query("survey_id");
    const result = await getSurveyElements(parseInt(surveyId));
    return c.json({
      message: "Fetched surveys",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

app.get(`${PUBLIC_API}/survey/get-products`, async (c) => {
  try {
    const userId = await getUserId(c);
    const { skip, take, search } = c.req.query();
    const result = await getProductsSurvey({
      skip: parseInt(skip as string) || 0,
      take: parseInt(take as string) || 25,
      search: search,
    });
    return c.json({
      message: "Fetched Products",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

// const saveSurveyAnswer = async (
//   surveyId: number,
//   answers: {
//     key: string;
//     value: string;
//     question_type_id: number;
//     type: string;
//   }[],
//   userId: number
// ) => {

app.post(`${PRIVATE_API}/survey/save_survey_answer`, async (c) => {
  try {
    const userId = await getUserId(c);
    const body = await c.req.json();
    const surveyId = body["survey_id"];
    const answers = body["answers"];
    if (!surveyId) throw new Error("Survey id not provided");
    if (!answers) throw new Error("Answers not provided");
    const result: any = await saveSurveyAnswer(surveyId, answers, userId);

    return c.json({
      message: "Survey Answer saved",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

app.get(`${PRIVATE_API}/complaint/get-complaint-types`, async (c) => {
  try {
    const userId = await getUserId(c);
    const result = await getComplaints();
    return c.json({
      message: "Fetched Complaint Types",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
//const getComplaintsElements = async (complaintId: number) => {

app.get(`${PRIVATE_API}/complaint/get-complaint-elements`, async (c) => {
  try {
    const userId = await getUserId(c);
    const complaintId = c.req.query("complaint_id");
    const result = await getComplaintsElements(parseInt(complaintId));
    return c.json({
      message: "Fetched Complaint Elements",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
app.post(`${PRIVATE_API}/complaint/save_complaint_answer`, async (c) => {
  try {
    const userId = await getUserId(c);
    const body = await c.req.json();
    const compId = body["complaint_id"];
    const answers = body["answers"];
    if (!compId) throw new Error("Complaint id not provided");
    if (!answers) throw new Error("Answers not provided");
    const result: any = await saveComplaintAnswer(compId, answers, userId);

    return c.json({
      message: "Complaint Answer saved",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

// getUserComplaints
app.get(`${PRIVATE_API}/complaint/get-user-complaints`, async (c) => {
  try {
    const userId = await getUserId(c);
    const result = await getUserComplaints(userId);
    return c.json({
      message: "Fetched Complaints",
      result: result,
    });
  } catch (e) {
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
const port = 4503;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
