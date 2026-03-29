import { Hono } from "hono";
import { login } from "../../crud/AuthController";
import { getUserId } from "../../lib/utils";
import { serialize } from "hono/utils/cookie";
const router = new Hono();

router.post(`/login`, async (c) => {
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
router.post(`/logout`, async (c) => {
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

// router.post(`/register`, async (c) => {
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

// router.post(`/send_verify_email`, async (c) => {
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
// router.post(`/send_reset_email`, async (c) => {
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

// router.post(`/validate_reset_code`, async (c) => {
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
// router.post(`/change_password_forgot`, async (c) => {
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
// router.post(`/verify_email`, async (c) => {
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

export default router;
