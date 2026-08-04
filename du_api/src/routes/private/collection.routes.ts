import { Hono } from "hono";
import {
  getPendingOpenInvoices,
  getCreditNotes,
  fifoPreviewController,
  manualPreviewController,
  getCurrenciesController,
} from "../../crud/collectionController";
import { getUserId } from "../../lib/utils";
const router = new Hono();

router.get(`/get_pending_open_invoices`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );

    const userId = await getUserId(c);

    const take = Number(c.req.query("take")) || undefined;
    const skip = Number(c.req.query("skip")) || undefined;

    const search = c.req.query("search") ?? "";

    const result = await getPendingOpenInvoices(
      userId,
      companyId,
      take,
      skip,
      search,
    );

    return c.json({
      message: "Fetched Pending Open Invoices",
      result,
    });
  } catch (e: any) {
    return c.json(
      {
        message: e.message,
        result: null,
      },
      400,
    );
  }
});

router.get(`/get_credit_notes`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );

    const userId = await getUserId(c);

    const result = await getCreditNotes(userId, companyId);

    return c.json({
      message: "Fetched Credit Notes",
      result,
    });
  } catch (e: any) {
    return c.json(
      {
        message: e.message,
        result: null,
      },
      400,
    );
  }
});

router.post("/fifo_preview", async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );

    const userId = await getUserId(c);

    const body = await c.req.json();

    const result = await fifoPreviewController(
      userId,
      companyId,
      body.payments ?? [],
      body.creditNotes ?? [],
    );

    return c.json({
      message: "FIFO preview generated",
      result,
    });
  } catch (e: any) {
    return c.json(
      {
        message: e.message,
        result: null,
      },
      400,
    );
  }
});

router.post("/manual_preview", async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );

    const userId = await getUserId(c);

    const body = await c.req.json();

    const result = await manualPreviewController(
      userId,
      companyId,
      body.invoices,
      body.creditNotes ?? [],
    );

    return c.json({
      message: "Manual preview generated.",
      result,
    });
  } catch (e: any) {
    return c.json(
      {
        message: e.message,
        result: null,
      },
      400,
    );
  }
});

router.get("/currencies", async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );

    const result = await getCurrenciesController(companyId);

    return c.json({
      message: "Currencies fetched successfully.",
      result,
    });
  } catch (e: any) {
    return c.json(
      {
        message: e.message,
        result: null,
      },
      400,
    );
  }
});

export default router;
