import { Hono } from "hono";
import {
  getSurveys,
  getSurveyElements,
  saveSurveyAnswer,
} from "../../crud/surveyController";
import { getUserId } from "../../lib/utils";
const router = new Hono();

router.get(`/get_surveys`, async (c) => {
  try {
    const userId = await getUserId(c);
    const result = await getSurveys();
    return c.json({
      message: "Fetched surveys",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

router.get(`/get_survey_elements`, async (c) => {
  try {
    const userId = await getUserId(c);
    const surveyId = c.req.query("survey_id");
    const result = await getSurveyElements(parseInt(surveyId));
    return c.json({
      message: "Fetched surveys",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

// const saveSurveyAnswer = async (
//   surveyId: number,
//   answers: {
//     key: string;
//     value: string;
//     question_type_id: number;
//     type: string;
//   }[],
//   userId: number
// ) => {

router.post(`/save_survey_answer`, async (c) => {
  try {
    const userId = await getUserId(c);
    const body = await c.req.json();
    const surveyId = body["survey_id"];
    const answers = body["answers"];
    if (!surveyId) throw new Error("Survey id not provided");
    if (!answers) throw new Error("Answers not provided");
    const result: any = await saveSurveyAnswer(surveyId, answers, userId);

    return c.json({
      message: "Survey Answer saved",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

export default router;
