import { createHash } from "crypto";
import prisma from "../lib/prisma";

const getChildAccounts = async ({ parent_id }: { parent_id: number }) => {
  const w = await prisma.web_accounts.findMany({
    where: {
      parent_id,
      is_active: true,
    },
    select: {
      id: true,
      code: true,
      first_name: true,
      last_name: true,
      phone: true,
      is_active: true,
      type: true,
      date_added: true,
      is_blocked: true,
      user_permission_assignment: {
        select: {
          user_permission: {
            select: {
              id: true,
              code: true,
              description: true,
            },
          },
        },
      },
    },
  });
  if (!w) throw new Error("Error fetching child accounts");
  return w;
};

const createChild = async ({
  password,
  first_name,
  last_name,
  phone_number,
  parent_id,
}: {
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  parent_id: number;
}) => {
  const childCount = await prisma.web_accounts.count({
    where: { parent_id: parent_id, is_active: true },
  });
  if (childCount >= 5)
    throw new Error("You have reached the maximum limit of child accounts");

  if (password.length < 8)
    throw new Error("Password must be at least 8 characters");
  var sha256 = createHash("sha256");
  sha256.update(password, "utf8"); //utf8 here
  var encryptedPass = sha256.digest("base64");
  const lastInserted = await prisma.web_accounts.findFirst({
    orderBy: {
      id: "desc",
    },
  });
  //   let newCode = Math.floor(10000 + Math.random() * 90000).toString();
  let uniqueChildCode = "CH-" + lastInserted?.id + 1;
  while (true) {
    const userFound = await prisma.web_accounts.findFirst({
      where: {
        code: uniqueChildCode,
      },
    });
    if (!userFound) {
      break;
    }
    uniqueChildCode =
      "CH-" + Math.floor(10000 + Math.random() * 90000).toString();
  }

  const w = await prisma.web_accounts.create({
    data: {
      id: lastInserted?.id + 1,
      code: uniqueChildCode,
      first_name,
      password: encryptedPass,
      last_name,
      phone: phone_number,
      is_verified: true,
      is_blocked: false,
      is_active: true,
      type: 2,
      parent_id,
    },
  });
  if (!w) throw new Error("Error creating child account");

  return w;
};

const changeChildPassword = async ({
  child_id,
  password,
  parent_id,
}: {
  child_id: number;
  password: string;
  parent_id: number;
}) => {
  const child = await prisma.web_accounts.findFirst({
    where: {
      id: child_id,
      parent_id,
    },
  });
  if (!child) throw new Error("Child account not found");

  if (password.length < 8)
    throw new Error("Password must be at least 8 characters");
  var sha256 = createHash("sha256");
  sha256.update(password, "utf8"); //utf8 here
  var encryptedPass = sha256.digest("base64");
  const w = await prisma.web_accounts.update({
    where: {
      id: child_id,
    },
    data: {
      password: encryptedPass,
    },
  });
  if (!w) throw new Error("Error changing child password");

  return w;
};

const disableChild = async ({
  child_id,
  parent_id,
}: {
  child_id: number;
  parent_id: number;
}) => {
  const child = await prisma.web_accounts.findFirst({
    where: {
      id: child_id,
      parent_id,
    },
  });
  if (!child) throw new Error("Child account not found");
  const w = await prisma.web_accounts.update({
    where: {
      id: child_id,
    },
    data: {
      is_blocked: true,
    },
  });
  if (!w) throw new Error("Error disabling child account");

  return w;
};
const enableChild = async ({
  child_id,
  parent_id,
}: {
  child_id: number;
  parent_id: number;
}) => {
  const child = await prisma.web_accounts.findFirst({
    where: {
      id: child_id,
      parent_id,
    },
  });
  if (!child) throw new Error("Child account not found");
  const w = await prisma.web_accounts.update({
    where: {
      id: child_id,
    },
    data: {
      is_blocked: false,
    },
  });
  if (!w) throw new Error("Error enabling child account");

  return w;
};
const editChild = async ({
  child_id,
  first_name,
  last_name,
  phone_number,
  parent_id,
  password,
}: {
  child_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  parent_id: number;
  password: string;
}) => {
  const child = await prisma.web_accounts.findFirst({
    where: {
      id: child_id,
      parent_id,
    },
  });
  if (!child) throw new Error("Child account not found");

  if (password.length < 8)
    throw new Error("Password must be at least 8 characters");
  var sha256 = createHash("sha256");
  sha256.update(password, "utf8"); //utf8 here
  var encryptedPass = sha256.digest("base64");
  const w = await prisma.web_accounts.update({
    where: {
      id: child_id,
    },
    data: {
      first_name,
      last_name,
      phone: phone_number,
      password: encryptedPass,
    },
  });
  if (!w) throw new Error("Error editing child account");

  return w;
};
const deleteChild = async ({
  child_id,
  parent_id,
}: {
  child_id: number;
  parent_id: number;
}) => {
  const child = await prisma.web_accounts.findFirst({
    where: {
      id: child_id,
      parent_id,
    },
  });
  if (!child) throw new Error("Child account not found");
  const w = await prisma.web_accounts.update({
    where: {
      id: child_id,
    },
    data: {
      is_active: false,
    },
  });
  if (!w) throw new Error("Error deleting child account");

  return w;
};
// const getChildUsersAndTheirPermissions = async () => {
//   const result = await prisma.user.findMany({
//     select: {
//       user_code: true,
//       description: true,
//       level_id: true,
//       user_permission_assignment: {
//         select: {
//           id: true,
//           user_permission: {
//             select: {
//               id: true,
//               description: true,
//             },
//           },
//         },
//       },
//     },
//     where: {
//       is_active: true,
//       user_code: {
//         not: "admin",
//       },
//     },
//   });
//   return result;
// };

const updatePermissions = async ({
  web_account_id,
  permissionsIds,
  parent_id,
}: {
  web_account_id: number;
  permissionsIds: number[];
  parent_id: number;
}) => {
  const webAccount = await prisma.web_accounts.findUnique({
    where: {
      id: web_account_id,
      parent_id: parent_id,
      is_active: true,
    },
  });
  if (!webAccount) throw new Error("Child user not found");

  const oldPermissions = await prisma.user_permission_assignment.findMany({
    where: {
      web_account_id: web_account_id,
    },
    select: {
      id: true,
      user_code: true,
      user_permission_id: true,
    },
  });
  const newPermissions = await prisma.user_permission.findMany({
    where: {
      id: {
        in: permissionsIds,
      },
    },
  });
  if (newPermissions.length !== permissionsIds.length) {
    throw new Error("Some permissions not found");
  }
  const newPermissionsToAdd = newPermissions.filter(
    (x) => !oldPermissions.map((x) => x.user_permission_id).includes(x.id)
  );
  const newPermissionsToRemove = oldPermissions.filter(
    (x) => !permissionsIds.includes(x.user_permission_id || -1)
  );
  if (newPermissionsToAdd.length > 0) {
    await prisma.user_permission_assignment.createMany({
      data: newPermissionsToAdd.map((x) => ({
        user_code: webAccount.code,
        web_account_id: web_account_id,
        user_permission_id: x.id,
      })),
    });
  }
  if (newPermissionsToRemove.length > 0) {
    await prisma.user_permission_assignment.deleteMany({
      where: {
        id: {
          in: newPermissionsToRemove.map((x) => x.id),
        },
      },
    });
  }
  const result = await getChildAccounts({
    parent_id: web_account_id,
  });
  return result;
};
const getAllUserPermisions = async () => {
  const result = await prisma.user_permission.findMany({
    select: {
      id: true,
      description: true,
      code: true,
    },
    where: {
      is_active: true,
    },
  });
  return result;
};

export {
  createChild,
  changeChildPassword,
  disableChild,
  getChildAccounts,
  enableChild,
  editChild,
  updatePermissions,
  deleteChild,
  getAllUserPermisions,
};
