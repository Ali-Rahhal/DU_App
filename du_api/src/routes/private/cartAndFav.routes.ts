import { Hono } from "hono";
import {
  checkSingleStock,
  ensureAccountPermission,
  getExpiryItemStock,
  getItemStock,
  getUserId,
} from "../../lib/utils";
import {
  addItemToCart,
  addItemToFavorite,
  getCartItems,
  getFavoriteItems,
  removeItemFromCart,
  removeItemFromFavorite,
  updateItemInCart,
} from "../../crud/cartAndFavController";
import { ALL_PERMISSIONS } from "../../lib/constants";
const router = new Hono();

router.get(`/get_cart_items`, async (c) => {
  try {
    const userId = await getUserId(c);
    const result = await getCartItems(userId, {});
    return c.json({
      message: "Fetched Cart items",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
router.post(`/add_to_cart`, async (c) => {
  try {
    const userId = await getUserId(c);
    const body = await c.req.json();
    const itemCode = body["item_code"];
    const barcode = body["barcode"];
    const quantity = body["quantity"];
    const isExpiryDeal = Boolean(body["isExpiryDeal"]);
    if (!quantity) throw new Error("Quantity not provided");
    if (!barcode) throw new Error("Barcode not provided");
    if (!itemCode) throw new Error("Item code not provided");

    await checkSingleStock(userId, itemCode, parseInt(quantity), isExpiryDeal);

    const result = await addItemToCart(
      userId,
      itemCode,
      barcode,
      parseInt(quantity),
      isExpiryDeal,
    );
    return c.json({
      message: "Added item to cart",
      result: result,
    });
  } catch (e) {
    console.log(e.message);
    return c.json({ message: e.message, result: null }, 400);
  }
});
router.post(`/remove_from_cart`, async (c) => {
  try {
    const userId = await getUserId(c);
    const body = await c.req.json();
    const itemCode = body["item_code"];
    const isExpiryDeal = Boolean(body["isExpiryDeal"]);

    const result = await removeItemFromCart(userId, itemCode, isExpiryDeal);
    return c.json({
      message: "Removed item from cart",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
router.post(`/update_cart_item`, async (c) => {
  try {
    const userId = await getUserId(c);
    const body = await c.req.json();
    const itemCode = body["item_code"];
    const quantity = body["quantity"];
    const isExpiryDeal = Boolean(body["isExpiryDeal"]);
    if (quantity == null) throw new Error("Quantity not provided");
    if (!itemCode) throw new Error("Item code not provided");

    let stock: number;
    if (!isExpiryDeal) {
      stock = await getItemStock(itemCode);
    } else {
      stock = await getExpiryItemStock(itemCode);
    }
    if (stock < parseInt(quantity)) {
      await updateItemInCart(userId, itemCode, stock);
      throw new Error("Insufficient stock");
    }

    const result = await updateItemInCart(
      userId,
      itemCode,
      parseInt(quantity),
      isExpiryDeal,
    );
    return c.json({
      message: "Cart Updated",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

router.get(`/get_favorite_items`, async (c) => {
  try {
    const userId = await getUserId(c);
    const take = c.req.query("take");
    const skip = c.req.query("skip");
    const result = await getFavoriteItems(userId, {
      take: parseInt(take as string),
      skip: parseInt(skip as string),
    });
    return c.json({
      message: "Fetched account info",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
router.post(`/add_to_favorite`, async (c) => {
  try {
    const userId = await getUserId(c);
    if (!(await ensureAccountPermission(userId, ALL_PERMISSIONS.Wishlist))) {
      throw new Error("You don't have permission to use wishlist");
    }
    const body = await c.req.json();
    const itemCode = body["item_code"];
    const result = await addItemToFavorite(userId, itemCode);
    return c.json({
      message: "Added item to favorite",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
router.post(`/remove_from_favorite`, async (c) => {
  try {
    const userId = await getUserId(c);
    if (!(await ensureAccountPermission(userId, ALL_PERMISSIONS.Wishlist))) {
      throw new Error("You don't have permission to use wishlist");
    }
    const body = await c.req.json();
    const itemCode = body["item_code"];
    const result = await removeItemFromFavorite(userId, itemCode);
    return c.json({
      message: "Removed item to favorite",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

export default router;
