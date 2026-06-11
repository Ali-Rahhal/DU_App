import { Hono } from "hono";
import { getUserId } from "../../lib/utils";
import {
  createReturnRequest,
  getReturnableInvoices,
  getPurchasedItems,
} from "../../crud/returnsController";
const router = new Hono();

router.get("/get_returnable_invoices", async (c) => {
  try {
    const userId = await getUserId(c);

    const result = await getReturnableInvoices(userId);

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
    const userId = await getUserId(c);

    const transactionHeaderId = Number(c.req.query("transaction_header_id"));

    const result = await getPurchasedItems(userId, transactionHeaderId);

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
    const userId = await getUserId(c);

    const { invoice_transaction_header_id, reason, items } = await c.req.json();

    const result = await createReturnRequest(
      userId,
      invoice_transaction_header_id,
      reason,
      items,
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

export default router;
