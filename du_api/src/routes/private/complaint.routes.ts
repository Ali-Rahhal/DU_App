import { Hono } from "hono";
import {
  getComplaints,
  getComplaintsElements,
  getUserComplaints,
  saveComplaintAnswer,
} from "../../crud/complaintController";
const router = new Hono();

async function getUserId(c) {
  const userId = c.req.user_id;
  return userId;
}

router.get(`/get-complaint-types`, async (c) => {
  try {
    const userId = await getUserId(c);
    const result = await getComplaints();
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
    const userId = await getUserId(c);
    const complaintId = c.req.query("complaint_id");
    const result = await getComplaintsElements(parseInt(complaintId));
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
    const userId = await getUserId(c);
    const body = await c.req.json();
    const compId = body["complaint_id"];
    const answers = body["answers"];
    if (!compId) throw new Error("Complaint id not provided");
    if (!answers) throw new Error("Answers not provided");
    const result: any = await saveComplaintAnswer(compId, answers, userId);

    return c.json({
      message: "Complaint Answer saved",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

// getUserComplaints
router.get(`/get-user-complaints`, async (c) => {
  try {
    const userId = await getUserId(c);
    const result = await getUserComplaints(userId);
    return c.json({
      message: "Fetched Complaints",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

export default router;
