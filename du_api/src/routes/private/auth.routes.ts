import { Hono } from "hono";
import {
  getUserDetails,
  changePassword,
  switchCompany,
  getCompanies,
} from "../../crud/AuthController";
import {
  ensureAccountPermission,
  getPortalUserId,
  getUserId,
} from "../../lib/utils";
import { ALL_PERMISSIONS } from "../../lib/constants";
const router = new Hono();

router.get(`/validate`, async (c) => {
  try {
    const userId = await getUserId(c);
    if (!userId) {
      return c.json(
        {
          authenticated: false,
          result: null,
        },
        401,
      );
    }
    return c.json(
      {
        authenticated: true,
        result: {
          userId,
        },
      },
      200,
    );
  } catch {
    return c.json(
      {
        authenticated: false,
        result: null,
      },
      401,
    );
  }
});

router.get(`/user_details`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const userId = await getUserId(c);
    const result = await getUserDetails(userId, companyId);
    return c.json({ message: "Get user success", result: result }, 200);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

// router.post(`/update_user_detail`, async (c) => {
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
router.post(`/change_password`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const userId = await getUserId(c);
    if (
      !(await ensureAccountPermission(
        userId,
        ALL_PERMISSIONS.ChangePassword,
        companyId,
      ))
    ) {
      throw new Error("You don't have permission to change password");
    }
    const { old_password, new_password, confirmed_password } =
      await c.req.json();
    const result = await changePassword(
      {
        userId: userId,
        oldPassword: old_password,
        newPassword: new_password,
        confirmedPassword: confirmed_password,
      },
      companyId,
    );
    return c.json({ message: "Password changed", result: result }, 200);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 401);
  }
});
// router.get(`/user`, async (c) => {
//   try {
//     const userId = await getUserId(c);
//     const result = "";
//     return c.json({ message: "Get user success", result: result }, 200);
//   } catch (e) {
//     return c.json({ message: e.message, result: null }, 401);
//   }
// });

router.get(`/companies/get_companies`, async (c) => {
  try {
    const portalUserId = await getPortalUserId(c);

    if (!portalUserId) {
      return c.json({ message: "Not Authorized", result: null }, 401);
    }

    return await getCompanies(portalUserId, c);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 401);
  }
});

router.post("/companies/switch_company", async (c) => {
  try {
    const portalUserId = await getPortalUserId(c);

    if (!portalUserId) {
      return c.json({ message: "Not Authorized", result: null }, 401);
    }

    const body = await c.req.json();
    const companyIdToSwitchTo = body.company_id_to_switch_to;

    if (typeof companyIdToSwitchTo !== "string") {
      return c.json({ message: "Invalid company id", result: null }, 400);
    }

    return await switchCompany(portalUserId, companyIdToSwitchTo, c);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";

    return c.json({ message, result: null }, 500);
  }
});

export default router;
