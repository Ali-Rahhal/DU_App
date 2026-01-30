import nodemailer from "nodemailer";
import * as fs from "fs";
import path = require("path");
import prisma from "./prisma";
export const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  service: "Gmail",
  auth: {
    user: "moudy881@gmail.com",
    pass: "zopq lomi sfbl bbqx ",
  },
  //for hostinger
  //   host: "smtp.titan.email",
  //   from: '"BeeTradeBot" <no-reply@beetradebot.com>',
  //   port: 465,
  //   secure: true,
  //   auth: {
  //     user: "no-reply@beetradebot.com",
  //     pass: "bee8812@",
  //   },
});
export const groupProducts = (
  res: {
    item_code: string;
    item_name: string;
    cat: string;
    sub_cat: string;
    cat_code: string;
    sub_cat_code: string;
    notes: string | null;
    creation_date: string;
    default_price: number;
    is_favorite: boolean;
    img: string;
    color: string;
    color_image_url: string;
    size: string;
    barcode: string;
    discounted_price: number | null;
  }[]
) => {
  const groupedResults = {};

  // Iterate through the query results
  res.forEach((row) => {
    const {
      item_code,
      item_name,
      notes,
      creation_date,
      default_price,
      is_favorite,
      img,
      color,
      color_image_url,
      size,
      barcode,
      discounted_price,
      cat,
      cat_code,
      sub_cat,
      sub_cat_code,
    } = row;

    // Check if the item_code is already in the grouped results
    if (!groupedResults[item_code]) {
      // If not, create an entry for the item_code
      groupedResults[item_code] = {
        item_code,
        item_name,
        notes,
        creation_date,
        default_price,
        discounted_price,
        is_favorite,
        cat,
        cat_code,
        sub_cat,
        sub_cat_code,

        images: [],
        colors: [],
      };
    }

    // Add the image details
    if (img) {
      groupedResults[item_code].images.push({
        item_image_url: img,
      });
    }

    // Check if the color is already in the item_code's colors
    const existingColor = groupedResults[item_code].colors.find(
      (c) => c.color === color
    );

    if (!existingColor) {
      // If not, create an entry for the color
      groupedResults[item_code].colors.push({
        color,
        color_image_url,
        sizes: [
          {
            size,
            barcode,
          },
        ],
      });
    } else {
      // If the color already exists, add the size details
      existingColor.sizes.push({
        size,
        barcode,
      });
    }
  });

  // Convert the groupedResults object into the desired output structure
  const finalResult = Object.values(groupedResults); // Assuming there's only one item_code in the response

  return finalResult;
};

// export const saveImageReturnUrl = async (base64Image: string) => {
//   console.log("base64Image", base64Image);
//   const type = base64Image.split(";")[0].split("/")[1];
//   const fileName = `${Date.now()}${type}`; // The file will be saved with the current timestamp as the name
//   const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

//   const path = `C:\\inetpub\\wwwroot\\delice_uploads\\images\\`;
//   if (!fs.existsSync(path)) {
//     fs.mkdirSync(path, {
//       recursive: true,
//     });
//   }
//   fs.writeFileSync(`${path}${fileName}`, base64Data, "base64");

//   return {
//     path: `${path}${fileName}`,
//     fileName,
//     url: `${process.env.IMAGES_URL}/${fileName}`,
//   };
// };

export const saveAudioReturnUrl = async (base64Audio: string) => {
  // Extract MIME type and file extension
  const mimeType = base64Audio.split(";")[0].split(":")[1];
  const fileExtension = mimeType.split("/")[1]; // e.g., "webm" or "ogg"

  // Remove the base64 data URL prefix to get pure base64 data
  const base64Data = base64Audio.split(";base64,").pop();

  // Generate a unique file name with extension
  const fileName = `${Date.now()}.${fileExtension}`;

  // Define the target path for saving
  const savePath = path.join(
    "C:",
    "inetpub",
    "wwwroot",
    "delice_uploads",
    "audio"
  );

  // Ensure the directory exists
  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  // Write the file
  const fullFilePath = path.join(savePath, fileName);
  fs.writeFileSync(fullFilePath, base64Data, "base64");

  // Construct the URL for accessing the file
  const fileUrl = `${process.env.IMAGES_URL}/${fileName}`;

  return {
    path: fullFilePath,
    fileName,
    url: fileUrl,
  };
};

export const saveImageReturnUrl = async (base64Image: string) => {
  // Extract MIME type and file extension
  const mimeType = base64Image.split(";")[0].split(":")[1];
  const fileExtension = mimeType.split("/")[1]; // e.g., "webm" or "ogg"
  console.log("fileExtension", fileExtension);
  console.log("mimeType", mimeType);
  // Remove the base64 data URL prefix to get pure base64 data
  const base64Data = base64Image.split(";base64,").pop();

  // Generate a unique file name with extension
  const fileName = `${Date.now()}.${fileExtension}`;

  // Define the target path for saving
  const savePath = path.join(
    "C:",
    "inetpub",
    "wwwroot",
    "delice_uploads",
    "images"
  );

  // Ensure the directory exists
  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  // Write the file
  const fullFilePath = path.join(savePath, fileName);
  fs.writeFileSync(fullFilePath, base64Data, "base64");

  // Construct the URL for accessing the file
  const fileUrl = `${process.env.IMAGES_URL}/${fileName}`;

  return {
    path: fullFilePath,
    fileName,
    url: fileUrl,
  };
};

export const ensureParentAccount = async (parent_id: number) => {
  const parent = await prisma.web_accounts.findFirst({
    where: {
      id: parent_id,
    },
  });

  if (!parent) {
    throw new Error("Parent account not found");
  }
  if (parent.type === 2) {
    console.log("parent", parent);
    throw new Error("Account is not a parent account");
  }
};
export const ensureChildAccountPermission = async (
  child_id: number,
  permission_code: string
) => {
  const found = await prisma.user_permission_assignment.findMany({
    where: {
      web_account_id: child_id,
      user_permission: {
        code: permission_code,
      },
    },
    select: {
      id: true,
      user_code: true,
      user_permission_id: true,
    },
  });
  if (!found) {
    throw new Error("Child account does not have permission");
  }
};
