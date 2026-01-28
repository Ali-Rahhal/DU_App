import prisma from "../lib/prisma";
import { createHash } from "crypto";
import { Context } from "hono";
import * as jwt from "jsonwebtoken";
import { transporter } from "../lib/utils";
import * as crypto from "crypto";
import { serialize } from "hono/utils/cookie";
// import { serialize } from "cookie";
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

const login = async (
  {
    code,
    password,
  }: {
    code: string;
    password: string;
  },
  c: Context
) => {
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
  if (user.is_blocked) throw new Error("Account is blocked");
  const userInfo = {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.code,
    phone: user.phone,
    is_verified: user.is_verified,
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
      401
    );
  }
  const token = jwt.sign(
    {
      // email: user.email,
      userId: user.id,
      description: user.description,
      type: user.type,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d",
    }
  );

  const serialized = serialize("auth", token, {
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
    }
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
const forgotPassword = async (email: string, c: Context) => {
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
      (new Date().getTime() - reset?.created_at.getTime()) / 1000
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
    200
  );
};
const validateResetCode = async (key: string, c: Context) => {
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
      (new Date().getTime() - reset?.created_at.getTime()) / 1000
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
  c: Context
) => {
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
      (new Date().getTime() - reset?.created_at.getTime()) / 1000
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
const getUserDetails = async (id: number) => {
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
    },
  });
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
  return {
    ...userInfo,
    cart: cartCount,
    wishlist: wishlistCount,
    address: address ? address.address : "",
  };
};
const updateUserDetails = async ({
  userId,
  first_name,
  last_name,
  phone,
  address,
}: {
  userId: number;

  first_name: string;
  last_name: string;
  phone: string;
  address: string;
}) => {
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
const changePassword = async ({
  userId,
  oldPassword,
  newPassword,
  confirmedPassword,
}: {
  userId: number;
  oldPassword: string;
  newPassword: string;
  confirmedPassword: string;
}) => {
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
  // register,
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
