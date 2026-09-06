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
import { Product } from "@/types/productTypes";
import { useCompanyAssets } from "@/hooks/useCompanyAssets";

const ProductItem = ({
  item,
  layout = "grid",
}: {
  item: Product;
  layout?: "grid" | "list";
}) => {
  const t = useTranslations();

  const { companyPlaceholder } = useCompanyAssets();

  const { isAuth } = useAuthStore();

  const { cartItems, refreshCart, checkPermission } = useAccountStore();

  const [fav, setFav] = useState(item.isFavorite ?? false);
  const [openPromotionPopup, setOpenPromotionPopup] = useState(false);

  const itemCode = item.isExpiryDeal ? item.parent_item_code : item.item_code;

  const price = parseFloat(item.price);

  const discountedPrice = item.discountedPrice
    ? parseFloat(item.discountedPrice)
    : null;

  const cartItem = cartItems?.find((c) => c.item_code === item.item_code);

  const qty = cartItem?.quantity || 0;

  const [localQty, setLocalQty] = useState(qty);

  const stock = item.stock;

  const isOutOfStock = stock === 0;

  useEffect(() => {
    setLocalQty(qty);
  }, [qty]);

  const toggleFavorite = async () => {
    if (!isAuth) return toast.info("Please login first");

    if (!checkPermission(ALL_PERMISSIONS.Wishlist)) {
      return toast.error("You don't have permission to use wishlist");
    }

    try {
      fav ? await removeFromFavorite(itemCode) : await addToFavorite(itemCode);

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
        ? await addToCart(
            itemCode,
            item.barcode ?? itemCode,
            1,
            item.isExpiryDeal,
          )
        : await updateCartItem(itemCode, qty + 1, item.isExpiryDeal);

      await refreshCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  const removeOneFromCart = async () => {
    if (!isAuth) return toast.info("Please login first");

    try {
      const newQty = qty - 1;

      newQty <= 0
        ? await removeFromCart(itemCode, item.isExpiryDeal)
        : await updateCartItem(itemCode, newQty, item.isExpiryDeal);

      await refreshCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update cart");
    }
  };

  const handleQtyChange = async (value: number) => {
    if (!isAuth) return toast.info("Please login first");

    if (isNaN(value) || value < 0) return;

    if (value > stock) {
      toast.warning("Insufficient stock");
      value = stock;
    }

    try {
      value === 0
        ? await removeFromCart(itemCode, item.isExpiryDeal)
        : await updateCartItem(itemCode, value, item.isExpiryDeal);

      await refreshCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update cart");
    }
  };

  const isGrid = layout === "grid";

  const qtyInput = (size = "default") => (
    <input
      type="number"
      className={`qty-cart-input ${
        size === "mobile" ? "qty-cart-input-mobile" : ""
      }`}
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
    />
  );

  const priceDisplay = () => {
    return stock > 0 ? (
      discountedPrice ? (
        <>
          <div className="product-item-price-original">
            <del>
              {currenncyCodeToSymbol(item.currency_code)}{" "}
              {price.toLocaleString()}
            </del>
          </div>

          <div className="product-item-price-current">
            {currenncyCodeToSymbol(item.currency_code)}{" "}
            {discountedPrice.toLocaleString()}
          </div>

          {!isOutOfStock && stock <= 10 && (
            <small className="product-item-limited-stock">
              {t("products.limited_stock")}
            </small>
          )}
        </>
      ) : (
        <>
          <div className="product-item-price-current">
            {currenncyCodeToSymbol(item.currency_code)} {price.toLocaleString()}
          </div>

          {!isOutOfStock && stock <= 10 && (
            <small className="product-item-limited-stock">
              {t("products.limited_stock")}
            </small>
          )}
        </>
      )
    ) : (
      <span className="product-item-unavailable">
        {t("products.item_unavailable")}
      </span>
    );
  };

  const image = (w = 400, h = 400) => (
    <Image
      src={item.image || companyPlaceholder}
      alt={item.name}
      width={w}
      height={h}
      className="product-item-image"
    />
  );

  const productBadges = () => (
    <div className="product-item-badges">
      {item.hasPromotion == true && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpenPromotionPopup(true);
          }}
          className="product-item-badge product-item-badge-promotion"
          title={t("products.on_promotion")}
          aria-label={t("products.on_promotion")}
        >
          <i className="fa fa-star" />
        </button>
      )}

      {item.isExpiryDeal == true && (
        <span className="product-item-badge product-item-badge-expiry">
          <i className="fa fa-calendar" />
        </span>
      )}
    </div>
  );

  return (
    <>
      <Modal
        show={openPromotionPopup}
        onHide={() => setOpenPromotionPopup(false)}
        centered
        size="lg"
      >
        <Modal.Body className="product-item-promotion-modal">
          <button
            type="button"
            className="product-item-promotion-close"
            onClick={() => setOpenPromotionPopup(false)}
            aria-label="Close"
          >
            ×
          </button>

          <ProductPromotionList item_code={item.item_code} />
        </Modal.Body>
      </Modal>

      <div className={isGrid ? "product-item-card" : "product-item-list-item"}>
        {isGrid ? (
          <>
            {/* Grid view */}
            <Link
              href={`/products/${item.item_code}`}
              className="product-item-image-link"
            >
              <div
                className={`product-item-img-wrapper ${
                  isOutOfStock ? "product-item-img-out-of-stock" : ""
                }`}
              >
                {image()}
                {productBadges()}
              </div>
            </Link>

            <div className="product-item-info">
              <Link
                href={`/products/${item.item_code}`}
                className="product-item-title-link"
              >
                <h6 className="product-item-title">{item.name}</h6>
              </Link>

              <div className="product-item-price">{priceDisplay()}</div>
            </div>

            <div className="product-item-actions">
              <Button
                variant={fav ? "danger" : "outline-danger"}
                size="sm"
                className="product-item-favorite-button"
                onClick={toggleFavorite}
                disabled={item.isExpiryDeal}
                aria-label="Favorite"
              >
                ♥
              </Button>

              <div className="product-item-quantity-controls">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  className="product-item-quantity-button"
                  disabled={qty === 0 || isOutOfStock}
                  onClick={removeOneFromCart}
                >
                  −
                </Button>

                {qtyInput()}

                <Button
                  size="sm"
                  variant="primary"
                  className="product-item-quantity-button"
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
            {/* Desktop list view */}
            <div className="product-item-list-desktop">
              <div className="product-item-list-image">
                <Link
                  href={`/products/${item.item_code}`}
                  className="product-item-list-image-link"
                >
                  {image(120, 120)}
                </Link>

                {productBadges()}
              </div>

              <div className="product-item-list-details">
                <Link
                  href={`/products/${item.item_code}`}
                  className="product-item-title-link"
                >
                  <h6 className="product-item-list-title">{item.name}</h6>
                </Link>

                <div className="product-item-list-price">{priceDisplay()}</div>
              </div>

              <div className="product-item-list-actions">
                <Button
                  variant={fav ? "danger" : "outline-danger"}
                  size="sm"
                  className="product-item-favorite-button"
                  onClick={toggleFavorite}
                  disabled={item.isExpiryDeal}
                  aria-label="Favorite"
                >
                  ♥
                </Button>

                <div className="product-item-quantity-controls">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    className="product-item-quantity-button"
                    disabled={qty === 0 || isOutOfStock}
                    onClick={removeOneFromCart}
                  >
                    −
                  </Button>

                  {qtyInput()}

                  <Button
                    size="sm"
                    variant="primary"
                    className="product-item-quantity-button"
                    onClick={addOneToCart}
                    disabled={isOutOfStock || qty >= stock}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile list view */}
            <div className="product-item-list-mobile">
              <Link
                href={`/products/${item.item_code}`}
                className="product-item-list-mobile-title-link"
              >
                <h6 className="product-item-list-mobile-title">{item.name}</h6>
              </Link>

              <div className="product-item-list-mobile-main">
                <div
                  className={`product-item-list-mobile-image ${
                    isOutOfStock ? "product-item-img-out-of-stock" : ""
                  }`}
                >
                  <Link
                    href={`/products/${item.item_code}`}
                    className="product-item-list-image-link"
                  >
                    {image(120, 120)}
                  </Link>

                  {productBadges()}
                </div>

                <div className="product-item-list-mobile-price">
                  {priceDisplay()}
                </div>
              </div>

              <div className="product-item-list-mobile-actions">
                <Button
                  variant={fav ? "danger" : "outline-danger"}
                  className="product-item-favorite-button product-item-favorite-button-mobile"
                  onClick={toggleFavorite}
                  disabled={item.isExpiryDeal}
                  aria-label="Favorite"
                >
                  ♥
                </Button>

                <div className="product-item-quantity-controls">
                  <Button
                    variant="outline-secondary"
                    className="product-item-quantity-button product-item-quantity-button-mobile"
                    disabled={qty === 0 || isOutOfStock}
                    onClick={removeOneFromCart}
                  >
                    −
                  </Button>

                  {qtyInput("mobile")}

                  <Button
                    variant="primary"
                    className="product-item-quantity-button product-item-quantity-button-mobile"
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
