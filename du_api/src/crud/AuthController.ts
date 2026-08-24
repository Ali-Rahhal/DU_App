import { getPrisma } from "../lib/prisma";
import { createHash } from "crypto";
import { Context } from "hono";
import * as jwt from "jsonwebtoken";
import { transporter } from "../lib/utils";
import * as crypto from "crypto";
import { serialize } from "hono/utils/cookie";
import { ROLES } from "../lib/constants";
// const register = async ({
//   email,
//   password,
//   first_name,
//   last_name,
//   phone_number,
// }: {
//   email: string;
//   password: string;
//   first_name: string;
//   last_name: string;
//   phone_number: string;
// }) => {
//   const userFound = await prisma.web_accounts.findFirst({
//     where: {
//       code: email,
//     },
//   });
//   if (userFound) throw new Error("Email already registered");

//   var sha256 = createHash("sha256");
//   sha256.update(password, "utf8"); //utf8 here
//   var encryptedPass = sha256.digest("base64");
//   if (password.length < 8)
//     throw new Error("Password must be at least 8 characters");
//   const w = await prisma.web_accounts.create({
//     data: {
//       code: email,
//       first_name,
//       password: encryptedPass,
//       last_name,
//       phone: phone_number,
//       is_verified: false,
//       is_blocked: false,
//       is_active: true,
//     },
//   });
//   if (!w) throw new Error("Error creating account");
//   let newCode = Math.floor(10000 + Math.random() * 90000).toString();
//   while (true) {
//     const check = await prisma.verification_codes.findFirst({
//       where: {
//         secret_code: newCode,
//       },
//     });
//     if (!check) {
//       break;
//     }
//     newCode = Math.floor(10000 + Math.random() * 90000).toString();
//   }

//   const result = await prisma.verification_codes.upsert({
//     where: {
//       account_id: w?.id,
//     },
//     update: {
//       secret_code: newCode,
//     },
//     create: {
//       secret_code: newCode,
//       account_id: w?.id,
//     },
//   });
//   if (!result) {
//     throw new Error("Error Creating Verification Code");
//   }
//   // send email
//   transporter
//     .sendMail({
//       from: process.env.EMAIL_FROM,
//       to: w.email as string,
//       subject: "Welcome to BGROUP Store",
//       text: `Hi ${w.first_name} ${w.last_name}!
//       Thanks for signing up with us. We are glad to have you on board.
//       Here is your verification code
//       ${result.secret_code}
//       Regards,
//      BGROUP Online Store
//       `,
//       html: `
//     <div style="color:#000;background:#fff;padding:1.8rem;">
//     <img src="https://bgroup.store/images/main_logo.png" style="width:64px;" />

//     <h1 style="color:#fff">Hi ${w.first_name} ${w.last_name}!</h1>
//     <p>Thanks for signing up with us. We are glad to have you on board.</p>
//     <p>Here is your verification code</p>
//     <h1 style="color:#f59119">${result.secret_code.split("").join(" ")}</h1>
//     <p>Regards,</p>
//     <p><b>BGROUP</b> Online Store</p>
//     </div>`,
//     })
//     .then((r) => {
//       console.log("Email Sent to " + w.email);
//     })
//     .catch((err) => {
//       console.log(err);
//     });

//   return w;
// };

const register = async (
  companyId: string,
  data: {
    moh_number: string;
    phone_number: string;
    email: string;
    description: string;
  },
) => {
  const prisma = getPrisma(companyId);

  const { moh_number, phone_number, email, description } = data;

  if (!moh_number) {
    throw new Error("MOH number is required");
  }

  // Check the client from the view
  const client = await prisma.$queryRaw<
    {
      Code: string;
      status_id: number | null;
      Status: string;
      MOH: string;
    }[]
  >`
    SELECT
      Code,
      status_id,
      Status,
      MOH
    FROM dbo.v_clients
    WHERE MOH = ${moh_number}
  `;

  if (!client.length) {
    throw new Error("Account not found");
  }

  const clientData = client[0];

  /*
    Statuses from v_clients:

    1  Active
    2  Blocked
    3  Stopped
    4  Reported
    5  Accepted
    6  Rejeted
    7  Waiting Approval
    ...
  */

  // Rejected or N/A
  if (clientData.status_id === 6 || clientData.Status === "N/A") {
    await prisma.$transaction(async (tx) => {
      // Check if a pending registration already exists
      const existingPending = await tx.client_pending.findUnique({
        where: {
          moh_number,
        },
      });

      if (existingPending) {
        await tx.client_pending.update({
          where: {
            moh_number,
          },
          data: {
            moh_number: moh_number || null,
            phone_number: phone_number || null,
            email: email || null,
            description: description || null,
            last_edited: new Date(),
            is_active: true,
          },
        });
      } else {
        await tx.client_pending.create({
          data: {
            client_code: clientData.Code,
            moh_number: moh_number || null,
            phone_number: phone_number || null,
            email: email || null,
            description: description || null,
            is_active: true,
          },
        });
      }

      // Move client to Waiting Approval
      await tx.client.update({
        where: {
          client_code: clientData.Code,
        },
        data: {
          status_id: 7,
        },
      });
    });

    return {
      message: "Registration request sent successfully",
      client_code: clientData.Code,
    };
  }

  // Already waiting for approval
  if (clientData.status_id === 7) {
    throw new Error("Can't send more than 1 registry requests at a time");
  }

  // Any other status
  throw new Error("This account is already registered");
};

const createPassword = async (
  companyId: string,
  data: {
    token: string;
    password: string;
  },
) => {
  const prisma = getPrisma(companyId);

  const { token, password } = data;

  if (!token) {
    throw new Error("Password setup token is required");
  }

  if (!password) {
    throw new Error("Password is required");
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  return await prisma.$transaction(async (tx) => {
    // Check password setup token
    const passwordSetupToken = await tx.passwordSetupToken.findFirst({
      where: {
        tokenHash,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        code: true,
        expiresAt: true,
        used: true,
      },
    });

    if (!passwordSetupToken) {
      throw new Error("Invalid or expired password setup link");
    }

    const clientCode = passwordSetupToken.code;

    // Check client status
    const client = await tx.client.findUnique({
      where: {
        client_code: clientCode,
      },
      select: {
        client_code: true,
        status_id: true,
      },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    if (client.status_id !== 5) {
      throw new Error(
        "Password cannot be created because the client is not accepted",
      );
    }

    // Check pending client
    const pendingClient = await tx.client_pending.findFirst({
      where: {
        client_code: clientCode,
      },
      select: {
        client_code: true,
        password_created: true,
      },
    });

    if (!pendingClient) {
      throw new Error("Pending client information not found");
    }

    if (pendingClient.password_created) {
      throw new Error("Password has already been created");
    }

    // Encrypt password
    const sha256 = createHash("sha256");

    sha256.update(password, "utf8");

    const encryptedPass = sha256.digest("base64");

    // Update web account password
    const webAccount = await tx.web_accounts.findFirst({
      where: {
        code: clientCode,
      },
      select: {
        id: true,
      },
    });

    if (!webAccount) {
      throw new Error("Web account not found");
    }

    await tx.web_accounts.update({
      where: {
        id: webAccount.id,
      },
      data: {
        password: encryptedPass,
      },
    });

    // Activate client
    await tx.client.update({
      where: {
        client_code: clientCode,
      },
      data: {
        status_id: 1,
      },
    });

    // Mark password as created
    await tx.client_pending.updateMany({
      where: {
        client_code: clientCode,
      },
      data: {
        password_created: true,
      },
    });

    // Invalidate token
    await tx.passwordSetupToken.update({
      where: {
        id: passwordSetupToken.id,
      },
      data: {
        used: true,
      },
    });

    return {
      message: "Password created successfully",
      client_code: clientCode,
    };
  });
};

const login = async (
  {
    code,
    password,
  }: {
    code: string;
    password: string;
  },
  c: Context,
  companyId: string,
) => {
  const prisma = getPrisma(companyId);
  const user = await prisma.web_accounts.findFirst({
    where: {
      code: code,
    },
  });
  if (!user) {
    //throw new Error("User not found");
    return c.json({ message: "User not found", result: null }, 401);
  }
  var sha256 = createHash("sha256");
  sha256.update(password, "utf8"); //utf8 here
  var encryptedPass = sha256.digest("base64");
  if (user.password !== encryptedPass) {
    //  throw new Error("Password is incorrect");
    return c.json({ message: "Password is incorrect", result: null }, 401);
  }
  if (user.is_blocked) throw new Error("Account is Disabled");
  let permissions = [];
  if (user.role === ROLES.SysUser) {
    permissions = await prisma.user_permission_assignment.findMany({
      where: {
        web_account_id: user.id,
      },
      select: {
        user_permission: {
          select: {
            description: true,
            code: true,
          },
        },
      },
    });
  }
  const userInfo = {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.code,
    phone: user.phone,
    is_verified: user.is_verified,
    type: user.type,
    role: user.role,
    permissions: permissions.map((p) => p.user_permission.code),
  };
  if (!user.is_verified) {
    // throw new Error("User is not verified");
    return c.json(
      {
        message: "Email is not verified",
        result: {
          ...userInfo,
        },
      },
      401,
    );
  }
  const token = jwt.sign(
    {
      // email: user.email,
      userId: user.id,
      description: user.description,
      type: user.type,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d",
    },
  );

  const serialized = serialize("authCustomerPortalApp", token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    secure: process.env.NODE_ENV === "production" ? true : false,
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return c.json(
    {
      message: "Login success",
      result: { token, ...userInfo, expiration: -1 },
    },
    200,
    {
      "Set-Cookie": serialized,
    },
  );
};
// const sendVerify = async (email: string, c: Context) => {
//   //get user
//   const user = await prisma.web_accounts.findFirst({
//     where: {
//       code: email,
//     },
//     select: {
//       id: true,
//       is_verified: true,
//       first_name: true,
//       last_name: true,
//       code: true,
//     },
//   });
//   if (!user) {
//     throw new Error("User Not Found");
//   }
//   if (user.is_verified) {
//     throw new Error("User Already Verified");
//   }
//   //get verification code created_at
//   const verification = await prisma.verification_codes.findFirst({
//     where: {
//       account_id: user?.id,
//     },
//     select: {
//       created_at: true,
//     },
//   });
//   if (verification?.created_at) {
//     const secDiff = Math.floor(
//       (new Date().getTime() - verification?.created_at.getTime()) / 1000
//     );

//     if (secDiff < 60) {
//       throw new Error(`Please Wait ${60 - secDiff} seconds `);
//     }
//   }
//   // let newCode = crypto.randomBytes(8).toString("hex");
//   //generate 5 digits code
//   let newCode = Math.floor(10000 + Math.random() * 90000).toString();
//   while (true) {
//     const check = await prisma.verification_codes.findFirst({
//       where: {
//         secret_code: newCode,
//       },
//     });
//     if (!check) {
//       break;
//     }
//     newCode = Math.floor(10000 + Math.random() * 90000).toString();
//   }

//   const result = await prisma.verification_codes.upsert({
//     where: {
//       account_id: user?.id,
//     },
//     update: {
//       secret_code: newCode,
//       created_at: new Date(),
//     },
//     create: {
//       secret_code: newCode,
//       account_id: user?.id,
//       created_at: new Date(),
//     },
//   });
//   if (!result) {
//     throw new Error("Error Creating Verification Code");
//   }
//   // send email
//   transporter
//     .sendMail({
//       from: process.env.EMAIL_FROM,
//       to: user.code as string,
//       subject: "Welcome to BGROUP Store",
//       text: `Hi ${user.first_name} ${user.last_name}!
//       Thanks for signing up with us. We are glad to have you on board.
//       Here is your verification code
//       ${result.secret_code}
//       Regards,
//      BGROUP Online Store
//       `,
//       html: `
//     <div style="color:#000;background:#fff;padding:1.8rem;">
//     <img src="https://bgroup.store/images/main_logo.png" style="width:64px;" />

//     <h1 style="color:#fff">Hi there!</h1>
//     <p>Thanks for signing up with us. We are glad to have you on board.</p>
//     <p>Here is your verification code</p>
//     <h1 style="color:#f59119">${result.secret_code.split("").join(" ")}</h1>
//     <p>Regards,</p>
//     <p><b>BGROUP</b> Online Store</p>
//     </div>`,
//     })
//     .then((r) => {
//       console.log("Email Sent to " + user.email);
//     })
//     .catch((err) => {
//       console.log(err);
//     });

//   // res
//   //   .status(200)
//   //   .send({ message: "Verification Email Resent", result: user.is_verified });
//   return c.json(
//     {
//       message: "Verification Email Resent",
//       result: user.is_verified,
//     },
//     200
//   );
// };

// const verifyEmail = async (email: string, key: string, c: Context) => {
//   //get user
//   const user = await prisma.web_accounts.findFirst({
//     where: {
//       email: email,
//     },
//     select: {
//       id: true,
//       is_verified: true,
//       email: true,
//     },
//   });
//   if (!user) {
//     throw new Error("User Not Found");
//   }
//   if (user.is_verified) {
//     throw new Error("User Already Verified");
//   }
//   //get verification code created_at
//   const verification = await prisma.verification_codes.findFirst({
//     where: {
//       account_id: user?.id,
//     },
//     select: {
//       created_at: true,
//       secret_code: true,
//     },
//   });
//   if (!verification) {
//     throw new Error("Verification Code Not Found");
//   }
//   if (verification.secret_code !== key) {
//     throw new Error("Verification Code is Incorrect");
//   }
//   if (verification?.created_at) {
//     const secDiff = Math.floor(
//       (new Date().getTime() - verification?.created_at.getTime()) / 1000
//     );

//     if (secDiff > 60 * 60 * 24) {
//       throw new Error(`Verification Code Expired`);
//     }
//   }
//   //update user
//   const result = await prisma.web_accounts.update({
//     where: {
//       id: user.id,
//     },
//     data: {
//       is_verified: true,
//     },
//   });
//   if (!result) {
//     throw new Error("Error Updating User");
//   }
//   const deleteCode = await prisma.verification_codes.delete({
//     where: {
//       account_id: user.id,
//     },
//   });
//   // res.status(200).send({ message: "Email Verified", result: result });
//   return c.json({ message: "Email Verified", result: result }, 200);
// };
const forgotPassword = async (email: string, c: Context, companyId: string) => {
  const prisma = getPrisma(companyId);
  //get user
  const user = await prisma.web_accounts.findFirst({
    where: {
      code: email,
    },
    select: {
      id: true,
      code: true,
    },
  });
  if (!user) {
    throw new Error("User Not Found");
  }
  //get verification code created_at
  const reset = await prisma.reset_codes.findFirst({
    where: {
      account_id: user?.id,
    },
    select: {
      created_at: true,
    },
  });
  if (reset?.created_at) {
    const secDiff = Math.floor(
      (new Date().getTime() - reset?.created_at.getTime()) / 1000,
    );

    if (secDiff < 60) {
      throw new Error(`Please Wait ${60 - secDiff} seconds `);
    }
  }
  let newCode = crypto.randomBytes(8).toString("hex");
  //generate 5 digits code
  // let newCode = Math.floor(10000 + Math.random() * 90000).toString();
  while (true) {
    const check = await prisma.reset_codes.findFirst({
      where: {
        secret_code: newCode,
      },
    });
    if (!check) {
      break;
    }
    newCode = Math.floor(10000 + Math.random() * 90000).toString();
  }

  const result = await prisma.reset_codes.upsert({
    where: {
      account_id: user?.id,
    },
    update: {
      secret_code: newCode,
      created_at: new Date(),
    },
    create: {
      secret_code: newCode,
      account_id: user?.id,
      created_at: new Date(),
    },
  });
  if (!result) {
    throw new Error("Error Creating Reset Code");
  }
  // send email
  // transporter
  //   .sendMail({
  //     from: process.env.EMAIL_FROM,
  //     to: user.email as string,
  //     subject: "Password Reset",
  //     text: `Hi there!
  //     You have requested a password reset. Please use the code below to reset your password
  //     ${result.secret_code}
  //     Regards,
  //     BGROUP Online Store
  //     `,
  //     html: `
  //   <div style="color:#000;background:#fff;padding:1.8rem;">
  //   <img src="https://bgroup.store/images/main_logo.png" style="width:64px;" />

  //   <h1 style="color:#fff">Hi there!</h1>
  //   <p>You have requested a password reset. Please use this Link to Reset Your Password</p>
  //   <a href="${process.env.BASE_URL}/forgot_password?key=${result.secret_code}">Reset Password</a>
  //   <p>Regards,</p>
  //   <p><b>BGROUP</b> Online Store</p>
  //   </div>`,
  //   })
  //   .then((r) => {
  //     console.log("Email Sent to " + user.email);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  return c.json(
    {
      message: "Reset Code Sent",
      result: [],
    },
    200,
  );
};
const validateResetCode = async (
  key: string,
  c: Context,
  companyId: string,
) => {
  const prisma = getPrisma(companyId);
  //get user

  //get verification code created_at
  const reset = await prisma.reset_codes.findFirst({
    where: {
      secret_code: key,
    },
    select: {
      created_at: true,
      secret_code: true,
      account_id: true,
    },
  });
  if (!reset) {
    throw new Error("Reset Code Not Found");
  }
  if (reset?.created_at) {
    const secDiff = Math.floor(
      (new Date().getTime() - reset?.created_at.getTime()) / 1000,
    );

    if (secDiff > 60 * 60 * 24) {
      throw new Error(`Reset Code Expired`);
    }
  }
  return c.json({ message: "Reset Code Valid", result: [] }, 200);
};
const changePasswordReset = async (
  newPassword: string,
  confitrmedPassword: string,
  key: string,
  c: Context,
  companyId: string,
) => {
  const prisma = getPrisma(companyId);
  if (newPassword !== confitrmedPassword) {
    throw new Error("Password Not Matched");
  }
  //get user

  //get verification code created_at
  const reset = await prisma.reset_codes.findFirst({
    where: {
      secret_code: key,
    },
    select: {
      created_at: true,
      secret_code: true,
      account_id: true,
    },
  });
  if (!reset) {
    throw new Error("Reset Code Not Found");
  }
  if (reset?.created_at) {
    const secDiff = Math.floor(
      (new Date().getTime() - reset?.created_at.getTime()) / 1000,
    );

    if (secDiff > 60 * 60 * 24) {
      throw new Error(`Reset Code Expired`);
    }
  }
  if (newPassword !== confitrmedPassword) {
    throw new Error("Password Not Matched");
  }
  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  const sha256 = createHash("sha256");
  sha256.update(newPassword, "utf8"); //utf8 here
  const encryptedPass = sha256.digest("base64");

  //update user
  const result = await prisma.web_accounts.update({
    where: {
      id: reset.account_id,
    },
    data: {
      password: encryptedPass,
    },
  });
  if (!result) {
    throw new Error("Error Updating User");
  }
  const deleteCode = await prisma.reset_codes.delete({
    where: {
      secret_code: key,
    },
  });

  // res.status(200).send({ message: "Email Verified", result: result });
  return c.json({ message: "Password Changed", result: result }, 200);
};
const getUserDetails = async (id: number, companyId: string) => {
  const prisma = getPrisma(companyId);
  const userInfo = await prisma.web_accounts.findFirst({
    where: {
      id: id,
    },
    select: {
      id: true,
      code: true,
      first_name: true,
      last_name: true,
      phone: true,
      is_verified: true,
      is_active: true,
      is_blocked: true,
      date_added: true,
      type: true,
      role: true,
    },
  });
  if (userInfo?.is_blocked) throw new Error("Account is Disabled");
  const cartCount = await prisma.shopping_cart.count({
    where: {
      account_id: id,
    },
  });
  const wishlistCount = await prisma.favorite_items.count({
    where: {
      account_id: id,
    },
  });
  const address = await prisma.web_account_address.findFirst({
    where: {
      account_id: id,
    },
  });
  let permissions = [];
  if (userInfo.role === ROLES.SysUser) {
    permissions = await prisma.user_permission_assignment.findMany({
      where: {
        web_account_id: id,
      },
      select: {
        user_permission: {
          select: {
            description: true,
            code: true,
          },
        },
      },
    });
  }
  return {
    ...userInfo,
    cart: cartCount,
    wishlist: wishlistCount,
    address: address ? address.address : "",
    permissions: permissions.map((p) => p.user_permission.code),
  };
};
const updateUserDetails = async ({
  userId,
  first_name,
  last_name,
  phone,
  address,
  companyId,
}: {
  userId: number;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  companyId: string;
}) => {
  const prisma = getPrisma(companyId);
  if (!userId) throw new Error("User not found");
  if (!address) throw new Error("Address is required");
  if (!first_name) throw new Error("First Name is required");
  if (!last_name) throw new Error("Last Name is required");

  const userdetail = await prisma.web_accounts.update({
    where: {
      id: userId,
    },
    data: {
      first_name,
      last_name,
      phone,
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      phone: true,
    },
  });
  let newAddress = await prisma.web_account_address.findFirst({
    where: {
      account_id: userId,
    },
  });
  if (newAddress) {
    newAddress = await prisma.web_account_address.update({
      where: {
        id: newAddress.id,
      },
      data: {
        address,
      },
    });
  } else {
    newAddress = await prisma.web_account_address.create({
      data: {
        address,
        account_id: userId,
      },
    });
  }
  return {
    ...userdetail,
    address: newAddress ? newAddress.address : "",
  };
};
const changePassword = async (
  {
    userId,
    oldPassword,
    newPassword,
    confirmedPassword,
  }: {
    userId: number;
    oldPassword: string;
    newPassword: string;
    confirmedPassword: string;
  },
  companyId: string,
) => {
  const prisma = getPrisma(companyId);
  const user = await prisma.web_accounts.findFirst({
    where: {
      id: userId,
    },
  });
  if (!user) throw new Error("User not found");
  var sha256 = createHash("sha256");
  sha256.update(oldPassword, "utf8"); //utf8 here
  var encryptedPass = sha256.digest("base64");
  if (user.password !== encryptedPass)
    throw new Error("Old Password is incorrect");
  if (newPassword !== confirmedPassword)
    throw new Error("Password Not Matched");
  if (newPassword.length < 8)
    throw new Error("Password must be at least 8 characters");
  var sha256 = createHash("sha256");
  sha256.update(newPassword, "utf8"); //utf8 here
  var encryptedPass = sha256.digest("base64");
  const result = await prisma.web_accounts.update({
    where: {
      id: userId,
    },
    data: {
      password: encryptedPass,
    },
  });
  if (!result) throw new Error("Error Updating User");

  return result;
};
export {
  register,
  createPassword,
  login,
  // sendVerify,
  // verifyEmail,
  forgotPassword,
  changePasswordReset,
  validateResetCode,
  getUserDetails,
  updateUserDetails,
  changePassword,
};
