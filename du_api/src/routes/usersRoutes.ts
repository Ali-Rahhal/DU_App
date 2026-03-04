import { Hono } from "hono";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  getUserPermissions,
  getAllPermissions,
  updateUserPermissions,
} from "../crud/usersController";
const router = new Hono();

async function getUserId(c) {
  const userId = c.req.user_id;
  return userId;
}

// ==================== USER MANAGEMENT ROUTES ====================

// Get all users with pagination and search
router.get(`/`, async (c) => {
  try {
    const userId = await getUserId(c);
    const page = c.req.query("page") || "1";
    const pageSize = c.req.query("pageSize") || "10";
    const search = c.req.query("search") || "";

    const result = await getUsers(
      parseInt(page as string),
      parseInt(pageSize as string),
      search as string,
    );

    return c.json(
      { message: "Users fetched successfully", result: result },
      200,
    );
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

// Get single user by ID
router.get(`/:id`, async (c) => {
  try {
    const userId = await getUserId(c);
    const id = c.req.param("id");

    const result = await getUserById(parseInt(id));

    return c.json(
      { message: "User fetched successfully", result: result },
      200,
    );
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

// Create new user
router.post(`/`, async (c) => {
  try {
    const userId = await getUserId(c);
    const body = await c.req.json();

    const result = await createUser(body);

    return c.json(
      { message: "User created successfully", result: result },
      201,
    );
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

// Update user
router.put(`/:id`, async (c) => {
  try {
    const userId = await getUserId(c);
    const id = c.req.param("id");
    const body = await c.req.json();

    const result = await updateUser(parseInt(id), body);

    return c.json(
      { message: "User updated successfully", result: result },
      200,
    );
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

// Toggle user status (activate/deactivate)
router.patch(`/:id/toggle-status`, async (c) => {
  try {
    const userId = await getUserId(c);
    const id = c.req.param("id");

    const result = await toggleUserStatus(parseInt(id));

    return c.json(
      {
        message: `User ${result.is_active ? "activated" : "deactivated"} successfully`,
        result: result,
      },
      200,
    );
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

// Get user permissions (for type 2 users)
router.get(`/:id/permissions`, async (c) => {
  try {
    const userId = await getUserId(c);
    const id = c.req.param("id");

    const result = await getUserPermissions(parseInt(id));

    return c.json(
      { message: "User permissions fetched successfully", result: result },
      200,
    );
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

// Get all permissions
router.get(`/permissions/all`, async (c) => {
  try {
    const result = await getAllPermissions();
    return c.json({ message: "Permissions fetched successfully", result }, 200);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

// Update user permissions
router.put(`/:id/permissions`, async (c) => {
  try {
    const userId = await getUserId(c);
    const id = c.req.param("id");
    const body = await c.req.json();

    const result = await updateUserPermissions(
      parseInt(id),
      body.permissionIds,
    );

    return c.json({ message: "Permissions updated successfully", result }, 200);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

export default router;
