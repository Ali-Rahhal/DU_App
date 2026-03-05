// controllers/userController.ts
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { createHash } from "crypto";

// Helper function to hash password using SHA256 (matching login controller)
const hashPassword = (password: string): string => {
  const sha256 = createHash("sha256");
  sha256.update(password, "utf8");
  return sha256.digest("base64");
};

// Get all users with pagination and search
export const getUsers = async (
  page: number = 1,
  pageSize: number = 10,
  search: string = "",
) => {
  const skip = (page - 1) * pageSize;

  const whereCondition = search
    ? {
        OR: [
          { code: { contains: search } },
          { first_name: { contains: search } },
          { last_name: { contains: search } },
          { description: { contains: search } },
          { phone: { contains: search } },
        ],
      }
    : {};

  const [users, totalCount] = await Promise.all([
    prisma.web_accounts.findMany({
      where: whereCondition,
      select: {
        id: true,
        code: true,
        first_name: true,
        last_name: true,
        description: true,
        phone: true,
        type: true,
        balance: true,
        country: true,
        is_verified: true,
        is_blocked: true,
        is_active: true,
        date_added: true,
        last_login: true,
        parent_id: true,
        role: true,
      },
      skip,
      take: pageSize,
      orderBy: {
        date_added: "desc",
      },
    }),
    prisma.web_accounts.count({
      where: whereCondition,
    }),
  ]);

  return {
    users,
    pagination: {
      currentPage: page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
};

// Get single user with details
export const getUserById = async (id: number) => {
  const user = await prisma.web_accounts.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      code: true,
      first_name: true,
      last_name: true,
      description: true,
      phone: true,
      type: true,
      balance: true,
      country: true,
      ip: true,
      is_verified: true,
      is_blocked: true,
      is_active: true,
      date_added: true,
      last_login: true,
      parent_id: true,
      sequence: true,
      role: true,
      // Include permissions for type 2 users
      user_permission_assignment: {
        select: {
          user_permission: {
            select: {
              code: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Create new user
export const createUser = async (userData: Prisma.web_accountsCreateInput) => {
  return await prisma.$transaction(async (tx) => {
    // Get highest current ID safely inside transaction
    const lastUser = await tx.web_accounts.findFirst({
      orderBy: { id: "desc" },
      select: { id: true },
    });

    const nextId = (lastUser?.id || 0) + 1;

    // Generate code if not provided
    const code = userData.code || `DU${nextId.toString().padStart(6, "0")}`;

    // Check if code already exists
    const existingUser = await tx.web_accounts.findFirst({
      where: { code },
      select: { id: true },
    });

    if (existingUser) {
      throw new Error("User code already exists");
    }

    // Hash password if provided
    let hashedPassword = userData.password;
    if (hashedPassword) {
      hashedPassword = hashPassword(hashedPassword);
    }

    // Create user with manually generated ID
    const user = await tx.web_accounts.create({
      data: {
        id: nextId, // ✅ manually set ID
        code,
        first_name: userData.first_name,
        last_name: userData.last_name,
        description: userData.description,
        password: hashedPassword,
        type: userData.type || 0,
        phone: userData.phone,
        balance: userData.balance || 0,
        country: userData.country,
        ip: userData.ip,
        is_verified: userData.is_verified || true,
        is_blocked: userData.is_blocked || false,
        is_active: userData.is_active !== undefined ? userData.is_active : true,
        parent_id: userData.parent_id,
        sequence: userData.sequence || 1,
        role: userData.role || "USER",
      },
      select: {
        id: true,
        code: true,
        first_name: true,
        last_name: true,
        description: true,
        phone: true,
        type: true,
        role: true,
        is_active: true,
        date_added: true,
      },
    });

    return user;
  });
};

// Update user
export const updateUser = async (id: number, userData: any) => {
  // Check if user exists
  const existingUser = await prisma.web_accounts.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  // If code is being updated, check if it's unique
  if (userData.code && userData.code !== existingUser.code) {
    const codeExists = await prisma.web_accounts.findFirst({
      where: { code: userData.code },
    });
    if (codeExists) {
      throw new Error("User code already exists");
    }
  }

  // Prepare update data (remove undefined fields)
  const updateData: any = {};

  const fields = [
    "code",
    "first_name",
    "last_name",
    "description",
    "type",
    "phone",
    "balance",
    "country",
    "ip",
    "is_verified",
    "is_blocked",
    "is_active",
    "parent_id",
    "sequence",
    "role",
  ];

  fields.forEach((field) => {
    if (userData[field] !== undefined) {
      updateData[field] = userData[field];
    }
  });

  // Handle password separately (only update if provided)
  if (userData.password) {
    updateData.password = hashPassword(userData.password);
  }

  const user = await prisma.web_accounts.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      code: true,
      first_name: true,
      last_name: true,
      description: true,
      phone: true,
      type: true,
      balance: true,
      country: true,
      is_verified: true,
      is_blocked: true,
      is_active: true,
      date_added: true,
      last_login: true,
      parent_id: true,
      role: true,
    },
  });

  return user;
};

// Toggle user status
export const toggleUserStatus = async (id: number) => {
  const user = await prisma.web_accounts.findUnique({
    where: { id },
    select: { is_active: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updatedUser = await prisma.web_accounts.update({
    where: { id },
    data: {
      is_active: !user.is_active,
    },
    select: {
      id: true,
      code: true,
      is_active: true,
      is_blocked: true,
    },
  });

  return updatedUser;
};

// Get user permissions (for type 2 users)
export const getUserPermissions = async (id: number) => {
  const user = await prisma.web_accounts.findUnique({
    where: { id },
    select: { type: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const permissions = await prisma.user_permission_assignment.findMany({
    where: {
      web_account_id: id,
    },
    select: {
      user_permission: {
        select: {
          code: true,
          description: true,
        },
      },
    },
  });

  return {
    permissions: permissions.map((p) => ({
      code: p.user_permission.code,
      description: p.user_permission.description,
    })),
  };
};

// Get all permissions
export const getAllPermissions = async () => {
  const permissions = await prisma.user_permission.findMany({
    where: {
      is_active: true,
    },
    select: {
      id: true,
      code: true,
      description: true,
    },
    orderBy: {
      code: "asc",
    },
  });

  return permissions;
};

// Update user permissions
export const updateUserPermissions = async (
  userId: number,
  permissionIds: number[],
) => {
  // Check if user exists
  const user = await prisma.web_accounts.findUnique({
    where: { id: userId },
    select: { type: true, code: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Delete existing permissions
  await prisma.user_permission_assignment.deleteMany({
    where: {
      web_account_id: userId,
    },
  });

  // Create new permissions if any
  if (permissionIds.length > 0) {
    const permissions = permissionIds.map((permissionId) => ({
      user_permission_id: permissionId,
      user_code: user.code,
      web_account_id: userId,
      is_active: true,
    }));

    await prisma.user_permission_assignment.createMany({
      data: permissions,
    });
  }

  return { message: "Permissions updated successfully" };
};
