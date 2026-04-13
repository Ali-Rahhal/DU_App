import Item from "@/Models/item";
import { useAuthStore, useAccountStore } from "@/store/zustand";
import { currenncyCodeToSymbol } from "@/utils";
import {
  addToFavorite,
  removeFromFavorite,
  addToCart,
  removeFromCart,
  updateCartItem,
} from "@/utils/apiCalls";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import ProductPromotionList from "./ProductPromotionList";
import { ALL_PERMISSIONS } from "@/utils/data";

interface Props {
  item: Item;
  layout?: "grid" | "list";
}

const ProductItem = ({ item, layout = "grid" }: Props) => {
  const t = useTranslations();
  const { isAuth } = useAuthStore();
  const { cartItems, refreshCart, checkPermission } = useAccountStore();
  const [fav, setFav] = useState(item.isFavorite ?? false);
  const [openPromotionPopup, setOpenPromotionPopup] = useState(false);

  const price = parseFloat(item.price);
  const discountedPrice = item.discountedPrice
    ? parseFloat(item.discountedPrice)
    : null;
  const cartItem = cartItems?.find((c) => c.item_code === item.item_code);
  const qty = cartItem?.quantity || 0;
  const [localQty, setLocalQty] = useState(qty);

  const stock = item.stock ?? Infinity; // null = unlimited(remove later when all items have stock)
  const isOutOfStock = stock === 0;

  useEffect(() => {
    setLocalQty(qty);
  }, [qty]);

  const toggleFavorite = async () => {
    if (!isAuth) return toast.info("Please login first");
    if (!checkPermission(ALL_PERMISSIONS.Wishlist))
      return toast.error("You don't have permission to use wishlist");
    try {
      fav
        ? await removeFromFavorite(item.item_code)
        : await addToFavorite(item.item_code);
      setFav(!fav);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update favorites",
      );
    }
  };

  const addOneToCart = async () => {
    if (!isAuth) return toast.info("Please login first");

    if (qty >= stock) {
      toast.warning("No more stock available");
      return;
    }

    try {
      qty === 0
        ? await addToCart(item.item_code, item.barcode ?? item.item_code, 1)
        : await updateCartItem(item.item_code, qty + 1);
      await refreshCart();
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const removeOneFromCart = async () => {
    if (!isAuth) return toast.info("Please login first");
    try {
      const newQty = qty - 1;
      newQty <= 0
        ? await removeFromCart(item.item_code)
        : await updateCartItem(item.item_code, newQty);
      await refreshCart();
    } catch {
      toast.error("Failed to update cart");
    }
  };

  const handleQtyChange = async (value: number) => {
    if (!isAuth) return toast.info("Please login first");
    if (isNaN(value) || value < 0) return;

    if (value > stock) {
      toast.warning(`Only ${stock} items available`);
      value = stock;
    }

    try {
      value === 0
        ? await removeFromCart(item.item_code)
        : await updateCartItem(item.item_code, value);
      await refreshCart();
    } catch {
      toast.error("Failed to update cart");
    }
  };

  const isGrid = layout === "grid";

  const qtyInput = (size = "default") => (
    <input
      type="number"
      className="qty-cart-input mx-1"
      disabled={!isAuth || isOutOfStock}
      min={0}
      max={stock}
      value={localQty}
      onChange={(e) => {
        const val = parseInt(e.target.value);
        !isNaN(val)
          ? setLocalQty(val)
          : e.target.value === "" && setLocalQty(0);
      }}
      onBlur={() => handleQtyChange(localQty)}
      onKeyDown={(e) => e.key === "Enter" && handleQtyChange(localQty)}
      onWheel={(e) => (e.target as HTMLInputElement).blur()}
      style={
        size === "mobile"
          ? { width: 60, height: 36, fontSize: 16, textAlign: "center" }
          : {
              width: 45,
              minWidth: 40,
              maxWidth: 60,
              textAlign: "center",
              border: "1px solid #ccc",
              borderRadius: 6,
              padding: "2px 4px",
            }
      }
    />
  );

  const priceDisplay = () => {
    return stock > 0 ? (
      discountedPrice ? (
        <>
          <small className="text-muted d-block">
            <del>
              {currenncyCodeToSymbol(item.currency_code)}{" "}
              {price.toLocaleString()}
            </del>
          </small>
          <div className="fw-bold">
            {currenncyCodeToSymbol(item.currency_code)}{" "}
            {discountedPrice.toLocaleString()}
          </div>
          {!isOutOfStock && stock <= 10 && (
            <small className="text-danger">{stock - qty} left</small>
          )}
        </>
      ) : (
        <>
          <div className="fw-bold">
            {currenncyCodeToSymbol(item.currency_code)} {price.toLocaleString()}
          </div>
          {!isOutOfStock && stock <= 10 && (
            <small className="text-danger">{stock - qty} left</small>
          )}
        </>
      )
    ) : (
      <span className="text-danger">{t("item_unavailable")}</span>
    );
  };

  const image = (w = 400, h = 400) => (
    <Image
      src={item.image || process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE}
      alt={item.name}
      width={w}
      height={h}
      style={{ objectFit: "cover", width: "100%", height: "100%" }}
    />
  );

  return (
    <>
      <Modal
        show={openPromotionPopup}
        onHide={() => setOpenPromotionPopup(false)}
        centered
        size="lg"
      >
        <Modal.Body className="p-3">
          <div
            onClick={() => setOpenPromotionPopup(false)}
            style={{
              cursor: "pointer",
              textAlign: "right",
              fontSize: "28px",
              color: "#f59f00",
              position: "absolute",
              top: "10px",
              right: "15px",
              zIndex: 1000,
            }}
          >
            &times;
          </div>
          <ProductPromotionList item_code={item.item_code} />
        </Modal.Body>
      </Modal>

      <div
        className={
          isGrid
            ? "product-card d-flex flex-column position-relative"
            : "product-list-item p-3 border rounded mb-3 position-relative"
        }
      >
        {item.hasPromotion == true && (
          <span
            onClick={() => setOpenPromotionPopup(true)}
            className={`badge promotion-badge ${!isGrid ? "d-none d-md-inline" : ""}`}
            style={{
              cursor: "pointer",
              position: "absolute",
              top: "10px",
              left: "10px",
              backgroundColor: "#f59f00",
              color: "#fff",
              fontWeight: 600,
              padding: "0.25rem 0.5rem",
              fontSize: "0.75rem",
              borderRadius: "4px",
              zIndex: 10,
            }}
            title={t("on_promotion")}
          >
            <i className="fa fa-star"></i>
          </span>
        )}

        {isGrid ? (
          <>
            {/* Grid view */}
            <Link href={`/products/${item.item_code}`}>
              <div className="product-img-wrapper">{image()}</div>
            </Link>
            <div className="product-info flex-grow-1 d-flex flex-column">
              <Link href={`/products/${item.item_code}`}>
                <h6
                  className="product-title mb-1"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: "1.5rem",
                    height: "3rem",
                  }}
                >
                  {item.name}
                </h6>
              </Link>
              <div
                style={{
                  minHeight: "2.5rem",
                  maxHeight: "2.5rem",
                }}
              >
                {priceDisplay()}
              </div>
            </div>
            <div
              className="product-actions d-flex align-items-center gap-2 mt-2 flex-wrap"
              style={{ minWidth: 0 }}
            >
              <Button
                variant={fav ? "danger" : "outline-danger"}
                size="sm"
                onClick={toggleFavorite}
              >
                ♥
              </Button>

              <div
                className="d-flex align-items-center gap-2 flex-wrap"
                style={{ minWidth: 0 }}
              >
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={qty === 0 || isOutOfStock}
                  onClick={removeOneFromCart}
                >
                  -
                </Button>

                {qtyInput()}

                <Button
                  size="sm"
                  variant="primary"
                  onClick={addOneToCart}
                  disabled={isOutOfStock || qty >= stock}
                >
                  +
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* List desktop view */}
            <div className="d-none d-md-flex gap-3 align-items-center">
              <Link href={`/products/${item.item_code}`}>
                <div style={{ width: 120, height: 120 }}>{image(120, 120)}</div>
              </Link>
              <div className="flex-grow-1 ml-2">
                <Link href={`/products/${item.item_code}`}>
                  <h6 className="mb-1">{item.name}</h6>
                </Link>
                {priceDisplay()}
              </div>
              <div className="d-flex flex-column align-items-end gap-2">
                <Button
                  className="mb-1"
                  variant={fav ? "danger" : "outline-danger"}
                  size="sm"
                  onClick={toggleFavorite}
                >
                  ♥
                </Button>
                <div className="d-flex align-items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    disabled={qty === 0 || isOutOfStock}
                    onClick={removeOneFromCart}
                  >
                    -
                  </Button>
                  {qtyInput()}
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={addOneToCart}
                    disabled={isOutOfStock || qty >= stock}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {/* List mobile view */}
            <div className="d-flex d-md-none flex-column">
              <Link href={`/products/${item.item_code}`}>
                <h6 className="mb-2">{item.name}</h6>
              </Link>
              <div className="d-flex gap-3 mb-3 align-items-center">
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 10,
                    overflow: "hidden",
                    flexShrink: 0,
                    position: "relative",
                  }}
                >
                  <Link href={`/products/${item.item_code}`}>
                    {image(120, 120)}
                  </Link>
                  {item.hasPromotion == true && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenPromotionPopup(true);
                      }}
                      className="badge promotion-badge"
                      style={{
                        position: "absolute",
                        top: 6,
                        left: 6,
                        backgroundColor: "#f59f00",
                        color: "#fff",
                        fontWeight: 600,
                        padding: "2px 6px",
                        fontSize: "0.65rem",
                        borderRadius: "4px",
                        zIndex: 10,
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa fa-star"></i>
                    </span>
                  )}
                </div>
                <div
                  className="ml-2 d-flex flex-column justify-content-center"
                  style={{ fontSize: 16 }}
                >
                  {stock > 0 ? (
                    discountedPrice ? (
                      <>
                        <small className="text-muted" style={{ fontSize: 13 }}>
                          <del>
                            {currenncyCodeToSymbol(item.currency_code)}{" "}
                            {price.toLocaleString()}
                          </del>
                        </small>
                        <div className="fw-bold" style={{ fontSize: 18 }}>
                          {currenncyCodeToSymbol(item.currency_code)}{" "}
                          {discountedPrice.toLocaleString()}
                        </div>
                        {!isOutOfStock && stock <= 10 && (
                          <small className="text-danger">
                            {stock - qty} left
                          </small>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="fw-bold" style={{ fontSize: 18 }}>
                          {currenncyCodeToSymbol(item.currency_code)}{" "}
                          {price.toLocaleString()}
                        </div>
                        {!isOutOfStock && stock <= 10 && (
                          <small className="text-danger">
                            {stock - qty} left
                          </small>
                        )}{" "}
                      </>
                    )
                  ) : (
                    <span className="text-danger">{t("item_unavailable")}</span>
                  )}
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <Button
                  variant={fav ? "danger" : "outline-danger"}
                  onClick={toggleFavorite}
                >
                  ♥
                </Button>
                <div className="d-flex align-items-center gap-2">
                  <Button
                    variant="outline-secondary"
                    disabled={qty === 0 || isOutOfStock}
                    onClick={removeOneFromCart}
                  >
                    -
                  </Button>
                  {qtyInput("mobile")}
                  <Button
                    variant="primary"
                    onClick={addOneToCart}
                    disabled={isOutOfStock || qty >= stock}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ProductItem;
