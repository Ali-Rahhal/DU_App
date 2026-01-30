import { Hono } from "hono";
import {
  createChild,
  deleteChild,
  disableChild,
  editChild,
  enableChild,
  getAllUserPermisions,
  getChildAccounts,
  updatePermissions,
} from "../crud/ChildAccountController";
import { ensureParentAccount } from "../lib/utils";
const CARouter = new Hono();
const PUBLIC_API = "/api";
const PRIVATE_API = "/api/auth";

async function getUserId(c) {
  const userId = c.req.user_id;
  return userId;
}
// const createChild = async ({
//     password,
//     first_name,
//     last_name,
//     phone_number,
//     parent_id,
//   }: {
//     password: string;
//     first_name: string;
//     last_name: string;
//     phone_number: string;
//     parent_id: number;
//   }) => {

async function parentMiddleware(c, next) {
  const userId = await getUserId(c);
  try {
    await ensureParentAccount(parseInt(userId));
    await next();
  } catch (e) {
    return c.json({ message: e.message, result: null }, 401);
  }
}

CARouter.use(`${PRIVATE_API}/child/*`, parentMiddleware);
CARouter.post(`${PRIVATE_API}/child/create`, async (c) => {
  try {
    const parent_id = await getUserId(c);
    const body = await c.req.json();
    const { password, first_name, last_name, phone_number } = body;
    const result = await createChild({
      password,
      first_name,
      last_name,
      phone_number,
      parent_id,
    });
    if (!password) throw new Error("Password is required");
    if (!first_name) throw new Error("First name is required");
    if (!last_name) throw new Error("Last name is required");

    return c.json({
      message: "Child account created successfully",
      result: [],
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

CARouter.get(`${PRIVATE_API}/child`, async (c) => {
  try {
    const parent_id = await getUserId(c);
    const result = await getChildAccounts({ parent_id });
    return c.json({ message: "Child accounts fetched", result });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

CARouter.post(`${PRIVATE_API}/child/edit`, async (c) => {
  try {
    const parent_id = await getUserId(c);
    const body = await c.req.json();
    const { child_id, password, first_name, last_name, phone_number } = body;
    if (!child_id) throw new Error("Child ID is required");
    if (!password) throw new Error("Password is required");
    if (!first_name) throw new Error("First name is required");
    if (!last_name) throw new Error("Last name is required");
    const result = await editChild({
      child_id,
      password,
      first_name,
      last_name,
      phone_number,
      parent_id,
    });
    return c.json({ message: "Child account updated", result: null });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
// const disableChild = async ({
//   child_id,
//   parent_id,
// }: {
CARouter.post(`${PRIVATE_API}/child/disable`, async (c) => {
  try {
    const parent_id = await getUserId(c);
    const body = await c.req.json();
    const { child_id } = body;
    const result = await disableChild({ child_id, parent_id });
    return c.json({ message: "Child account disabled", result: null });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
CARouter.post(`${PRIVATE_API}/child/enable`, async (c) => {
  try {
    const parent_id = await getUserId(c);
    const body = await c.req.json();
    const { child_id } = body;
    const result = await enableChild({ child_id, parent_id });
    return c.json({ message: "Child account enabled", result: null });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
// const deleteChild = async ({
//   child_id,
//   parent_id,
CARouter.post(`${PRIVATE_API}/child/delete`, async (c) => {
  try {
    const parent_id = await getUserId(c);
    const body = await c.req.json();
    const { child_id } = body;
    const result = await deleteChild({ child_id, parent_id });
    return c.json({ message: "Child account deleted", result: null });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

CARouter.get(`${PRIVATE_API}/child/all_permissions`, async (c) => {
  try {
    const result = await getAllUserPermisions();
    return c.json({ message: "Permissions fetched", result });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
CARouter.post(`${PRIVATE_API}/child/update_permissions`, async (c) => {
  try {
    const parent_id = await getUserId(c);
    const body = await c.req.json();
    const { child_id, permissionsIds } = body;
    console.log(permissionsIds);
    const result = await updatePermissions({
      web_account_id: child_id,
      permissionsIds: permissionsIds,
      parent_id: parent_id,
    });
    return c.json({ message: "Permissions updated", result: null });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
export default CARouter;
