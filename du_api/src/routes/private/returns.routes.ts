import { Hono } from "hono";
import { ensureAccountRole, getUserId } from "../../lib/utils";
import {
  createReturnRequest,
  getReturnableInvoices,
  getPurchasedItems,
  getReturnRequests,
  approveOrRejectReturnRequest,
} from "../../crud/returnsController";
import { ROLES } from "../../lib/constants";
const router = new Hono();

router.get("/get_returnable_invoices", async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const userId = await getUserId(c);

    const result = await getReturnableInvoices(userId, companyId);

    return c.json({
      message: "Fetched returnable invoices",
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

router.get("/get_purchased_items", async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const userId = await getUserId(c);

    const transactionHeaderId = Number(c.req.query("transaction_header_id"));

    const result = await getPurchasedItems(
      userId,
      transactionHeaderId,
      companyId,
    );

    return c.json({
      message: "Fetched purchased items",
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

router.post("/create_return_request", async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const userId = await getUserId(c);

    const { invoice_transaction_header_id, reason, items } = await c.req.json();

    const result = await createReturnRequest(
      userId,
      invoice_transaction_header_id,
      reason,
      items,
      companyId,
    );

    return c.json(
      {
        message: "Return request created successfully",
        result,
      },
      200,
    );
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

router.get("/get_return_requests", async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const userId = await getUserId(c);
    await ensureAccountRole(userId, ROLES.Admin, companyId);

    const page = Number(c.req.query("page") || 1);
    const pageSize = Number(c.req.query("page_size") || 20);

    const result = await getReturnRequests(page, pageSize, companyId);

    return c.json({
      message: "Fetched return requests",
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

router.post("/approve_or_reject", async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const { transaction_header_id, approved } = await c.req.json();

    const userId = await getUserId(c);
    await ensureAccountRole(userId, ROLES.Admin, companyId);

    const result = await approveOrRejectReturnRequest(
      transaction_header_id,
      approved,
      companyId,
    );

    return c.json({
      message: approved ? "Return request approved" : "Return request rejected",
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
