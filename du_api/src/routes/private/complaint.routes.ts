import { Hono } from "hono";
import {
  getComplaints,
  getComplaintsElements,
  getUserComplaints,
  saveComplaintAnswer,
} from "../../crud/complaintController";
import { getUserId } from "../../lib/utils";
import { sendContactEmail } from "../../lib/sendContactEmail";
import { getUserDetails } from "../../crud/AuthController";
const router = new Hono();

// getUserComplaints
router.get(`/get-user-complaints`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const userId = await getUserId(c);
    const result = await getUserComplaints(userId, companyId);
    return c.json({
      message: "Fetched Complaints",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

router.get(`/get-complaint-types`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const userId = await getUserId(c);
    const result = await getComplaints(companyId);
    return c.json({
      message: "Fetched Complaint Types",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
//const getComplaintsElements = async (complaintId: number) => {

router.get(`/get-complaint-elements`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const userId = await getUserId(c);
    const complaintId = c.req.query("complaint_id");
    const result = await getComplaintsElements(
      parseInt(complaintId),
      companyId,
    );
    return c.json({
      message: "Fetched Complaint Elements",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

router.post(`/save_complaint_answer`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const userId = await getUserId(c);
    const body = await c.req.json();
    const compId = body["complaint_id"];
    const answers = body["answers"];
    if (!compId) throw new Error("Complaint id not provided");
    if (!answers) throw new Error("Answers not provided");
    const result: any = await saveComplaintAnswer(
      compId,
      answers,
      userId,
      companyId,
    );

    return c.json({
      message: "Complaint Answer saved",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

router.post("/send_contact_email", async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const body = await c.req.json();

    const { companyEmail, message } = body;

    const userId = await getUserId(c);
    if (!userId) throw new Error("User id not found");

    const { first_name, last_name, phone, email, moh_number } =
      await getUserDetails(userId, companyId);

    const fullName = `${first_name} ${last_name}`;
    const clientEmail = email;

    const result = await sendContactEmail({
      companyEmail,
      fullName,
      phone,
      clientEmail,
      moh_number,
      message,
    });

    return c.json({
      message: "Contact email sent successfully.",
      result: {
        messageId: result.messageId,
      },
    });
  } catch (e: any) {
    console.error("Send contact email route error:", e);

    return c.json(
      {
        message: e?.message ?? "Failed to send contact email.",
        result: null,
      },
      400,
    );
  }
});

export default router;
