import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // port 587 uses STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char]!,
  );

export const sendContactEmail = async ({
  companyEmail,
  fullName,
  phone,
  clientEmail,
  message,
}: {
  companyEmail: string;
  fullName: string;
  phone: string;
  clientEmail: string;
  message: string;
}) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!companyEmail || !emailRegex.test(companyEmail.trim())) {
    throw new Error("Invalid company email.");
  }

  if (
    typeof fullName !== "string" ||
    typeof clientEmail !== "string" ||
    typeof message !== "string" ||
    !fullName.trim() ||
    !clientEmail.trim() ||
    !message.trim()
  ) {
    throw new Error("Please complete all required fields.");
  }

  if (
    fullName.length > 120 ||
    clientEmail.length > 254 ||
    (typeof phone === "string" && phone.length > 30) ||
    message.length > 5000
  ) {
    throw new Error("One or more fields are too long.");
  }

  if (!emailRegex.test(clientEmail.trim())) {
    throw new Error("Please enter a valid email address.");
  }

  try {
    const info = await transporter.sendMail({
      from: `"Website Contact" <${process.env.SMTP_USER}>`,
      to: companyEmail,
      replyTo: clientEmail.trim(),
      subject: `Website Contact - ${fullName.trim()}`,
      text: [
        `Name: ${fullName.trim()}`,
        `Email: ${clientEmail.trim()}`,
        `Phone: ${typeof phone === "string" ? phone.trim() : "Not provided"}`,
        "",
        "Message:",
        message.trim(),
      ].join("\n"),
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${escapeHtml(fullName.trim())}</p>
        <p><strong>Email:</strong> ${escapeHtml(clientEmail.trim())}</p>
        <p><strong>Phone:</strong> ${escapeHtml(
          typeof phone === "string" ? phone.trim() : "Not provided",
        )}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message.trim()).replace(/\n/g, "<br />")}</p>
      `,
    });

    return info;
  } catch (error) {
    console.error("Failed to send contact email:", error);
    throw new Error("Failed to send contact email");
  }
};
