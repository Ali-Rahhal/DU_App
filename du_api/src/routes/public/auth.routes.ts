import { Hono } from "hono";
import {
  createPassword,
  login,
  sendRegistrationCode,
  verifyRegistrationCode,
} from "../../crud/AuthController";
import { getUserId } from "../../lib/utils";
import { serialize } from "hono/utils/cookie";
import { getPrisma } from "../../lib/prisma";
const router = new Hono();

router.post(`/login`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const body = await c.req.json();

    const moh_number = body["moh_number"];
    const password = body["password"];

    if (!moh_number || !password)
      throw new Error("moh_number or password not provided");
    const result = await login({ moh_number, password }, c, companyId);
    return result;
    // return c.json({ message: "Login success", result: result });
  } catch (e) {
    const serialized = serialize("authCustomerPortalApp", "", {
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
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const prisma = getPrisma(companyId);
    if (userId) {
      await prisma.web_accounts.update({
        where: { id: userId },
        data: { token_version: { increment: 1 } },
      });
    }
    const serialized = serialize("authCustomerPortalApp", "", {
      maxAge: 0,
      path: "/",
    });
    return c.json({ message: "Logout success", result: [] }, 200, {
      "Set-Cookie": serialized,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 401);
  }
});

router.post("/register/send-code", async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );

    const body = await c.req.json();

    const result = await sendRegistrationCode(companyId, body);

    return c.json({
      message: result.message,
      result,
    });
  } catch (e: any) {
    return c.json(
      {
        message: e?.message ?? "Failed to send verification code",
        result: null,
      },
      400,
    );
  }
});

router.post("/register/verify-code", async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );

    const body = await c.req.json();

    const result = await verifyRegistrationCode(companyId, body);

    return c.json({
      message: result.message,
      result,
    });
  } catch (e: any) {
    return c.json(
      {
        message: e?.message ?? "Verification failed",
        result: null,
      },
      400,
    );
  }
});

router.post("/create-password", async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );

    const body = await c.req.json();

    const { token, password } = body;

    if (!token) {
      throw new Error("Password setup token not provided");
    }

    if (!password) {
      throw new Error("Password not provided");
    }

    const result = await createPassword(companyId, {
      token,
      password,
    });

    return c.json({
      message: result.message,
      result,
    });
  } catch (e: any) {
    return c.json(
      {
        message: e?.message ?? "Password creation failed",
        result: null,
      },
      400,
    );
  }
});

router.get("/companies/status", async (c) => {
  const prisma = getPrisma("Global");
  const rows = await prisma.$queryRaw<
    Array<{ company_id: string; is_enabled: boolean }>
  >`
    SELECT company_id, is_enabled
    FROM company_config
  `;

  const statusMap = Object.fromEntries(
    rows.map((r) => [String(r.company_id), r.is_enabled]),
  );

  return c.json({ result: statusMap }, 200);
});

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

export default router;
