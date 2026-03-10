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
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
import { useState } from "react";
import ProductPromotionList from "./ProductPromotionList";
import { ALL_PERMISSIONS } from "@/utils/data";

const ProductItem = ({ item }: { item: Item }) => {
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

  const toggleFavorite = async () => {
    if (!isAuth) {
      toast.info("Please login first");
      return;
    }

    try {
      if (!checkPermission(ALL_PERMISSIONS.Wishlist)) {
        toast.error("You don't have permission to use wishlist");
        return;
      }
      if (fav) {
        await removeFromFavorite(item.item_code);
        setFav(false);
      } else {
        await addToFavorite(item.item_code);
        setFav(true);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || `Failed to update favorites`,
      );
    }
  };

  const addOneToCart = async () => {
    if (!isAuth) {
      toast.info("Please login first");
      return;
    }

    try {
      if (qty === 0) {
        await addToCart(item.item_code, item.barcode ?? item.item_code, 1);
      } else {
        await updateCartItem(item.item_code, qty + 1);
      }
      await refreshCart();
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const removeOneFromCart = async () => {
    if (!isAuth) {
      toast.info("Please login first");
      return;
    }

    try {
      const newQty = qty - 1;
      if (newQty <= 0) {
        await removeFromCart(item.item_code);
      } else {
        await updateCartItem(item.item_code, newQty);
      }
      await refreshCart();
    } catch {
      toast.error("Failed to update cart");
    }
  };

  return (
    <>
      {/* Promotion Modal */}
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

      <div className="product-card d-flex flex-column">
        {/* Promotion Badge */}
        {item.hasPromotion == true && (
          <span
            onClick={() => setOpenPromotionPopup(true)}
            className="badge promotion-badge"
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
            {t("on_promotion")}
          </span>
        )}

        {/* Product Image */}
        <Link href={`/products/${item.item_code}`}>
          <div className="product-img-wrapper">
            <Image
              src={
                item.image
                  ? item.image
                  : process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE
              }
              alt={item.name}
              width={400}
              height={400}
              style={{ objectFit: "cover" }}
              quality={80}
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        </Link>

        <div className="product-info flex-grow-1">
          <Link href={`/products/${item.item_code}`}>
            <h6 className="product-title mb-1">{item.name}</h6>
          </Link>

          {discountedPrice ? (
            <>
              <small className="text-muted d-block mb-1">
                <del>
                  {currenncyCodeToSymbol(item.currency_code)}{" "}
                  {price.toLocaleString()}
                </del>
              </small>
              <div className="price fw-bold mb-1">
                {currenncyCodeToSymbol(item.currency_code)}{" "}
                {discountedPrice.toLocaleString()}
              </div>
            </>
          ) : (
            <div className="price fw-bold mb-1">
              {currenncyCodeToSymbol(item.currency_code)}{" "}
              {price.toLocaleString()}
            </div>
          )}
        </div>

        <div className="product-actions">
          <Button
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
              disabled={qty === 0}
              onClick={removeOneFromCart}
            >
              -
            </Button>
            <span style={{ minWidth: 20, textAlign: "center" }}>{qty}</span>
            <Button size="sm" variant="primary" onClick={addOneToCart}>
              +
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductItem;
