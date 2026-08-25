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

export const sendRegistrationVerificationEmail = async ({
  email,
  code,
}: {
  email: string;
  code: string;
}) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to: email,
      subject: `Email Verification Code - ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Email Verification</h2>

          <p>
            Please use the following code to verify your email address:
          </p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            text-align: center;
            margin: 30px 0;
          ">
            ${code}
          </div>

          <p>This code will expire in 10 minutes.</p>

          <p>
            If you did not request this verification, you can safely ignore
            this email.
          </p>
        </div>
      `,
    });

    return info;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }
};
