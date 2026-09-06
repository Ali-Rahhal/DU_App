import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import ThumbSlider from "./ThumbSlider";
import ProductPromotionList from "./ProductPromotionList";

import { currenncyCodeToSymbol } from "@/utils";
import { addToCart, addToFavorite, removeFromFavorite } from "@/utils/apiCalls";
import { useAccountStore, useAuthStore } from "@/store/zustand";
import { useTranslations } from "use-intl";
import { ALL_PERMISSIONS } from "@/utils/data";
import { Product } from "@/types/productTypes";
import { useCompanyAssets } from "@/hooks/useCompanyAssets";

const ProductDetails = ({ product }: { product: Product }) => {
  const router = useRouter();

  const { refreshCart, checkPermission, cartItems } = useAccountStore();
  const { isAuth } = useAuthStore();

  const [quantity, setQuantity] = useState(1);
  const [price, setprice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [isFavorite, setIsFavorite] = useState(product.isFavorite);

  const stock = product.stock;

  const itemCode = product.isExpiryDeal
    ? product.parent_item_code
    : product.item_code;

  const t = useTranslations();
  const { companyPlaceholder } = useCompanyAssets();

  useEffect(() => {
    const price = parseFloat(product?.price);
    const discountedPrice = parseFloat(product?.discountedPrice);

    setprice(price);
    setDiscountedPrice(discountedPrice);
  }, [product]);

  const handleCart = async (product: Product, quantity: number) => {
    if (!isAuth) {
      toast.info(t("toast.please_login"));
      return;
    }

    const cartItem = cartItems?.find((c) => c.item_code === product.item_code);

    if (stock < quantity + (cartItem?.quantity || 0)) {
      toast.info(
        "This Product only has a limited quantity in stock. Please reduce the quantity.",
      );
      return;
    }

    addToCart(
      itemCode,
      product.barcode ?? itemCode,
      quantity,
      product.isExpiryDeal,
    )
      .then(() => {
        refreshCart();

        toast.success(t("toast.added_to_cart"), {
          position: "bottom-right",
        });
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || t("toast.error"));
      });
  };

  const handleBuyNow = (product, quantity, varient) => {
    router.push("/cart");
  };

  const handleWishlist = () => {
    if (!isAuth) {
      toast.info(t("toast.please_login"));
      return;
    }

    if (!checkPermission(ALL_PERMISSIONS.Wishlist)) {
      toast.error("You don't have permission to use wishlist");
      return;
    }

    if (!isFavorite) {
      addToFavorite(itemCode)
        .then(() => {
          toast.success(t("toast.added_to_wishlist"));
          setIsFavorite(true);
        })
        .catch((error: any) => {
          toast.error(
            error.response?.data?.message || "Failed to add to wishlist",
          );
        });
    } else {
      removeFromFavorite(itemCode)
        .then(() => {
          toast.info(t("toast.removed_from_wishlist"));
          setIsFavorite(false);
        })
        .catch((error: any) => {
          toast.error(
            error.response?.data?.message || "Failed to remove from wishlist",
          );
        });
    }
  };

  const qtyChange = (product, type) => {
    if (type === "less") {
      setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
    } else {
      setQuantity((prev) => prev + 1);
    }
  };

  return (
    <section className="product-details-page">
      <div className="container-fluid">
        <div className="row product-details-main-row">
          {/* Gallery */}
          <div className="col-lg-5">
            <div className="product-gallery">
              <div className="product-details-slider-area">
                <ThumbSlider
                  images={
                    product.image
                      ? Array.isArray(product.images)
                        ? product.images
                        : [product.images]
                      : [companyPlaceholder]
                  }
                />

                {product.hasPromotion && (
                  <div className="product-labels">
                    <span className="promotion-badge">
                      {product.cat_code === "PP"
                        ? "*"
                        : t("products.on_promotion")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="col-lg-7 mt-4 mt-lg-0">
            <div className="row product-details-content-row">
              {/* Main Information */}
              <div className="col-lg-7">
                <div className="single-product-content-description">
                  <div className="product-details-category">
                    {product?.category}
                  </div>

                  <h1 className="product-title">{product?.name}</h1>

                  {/* Price */}
                  <div className="single-grid-product__price">
                    {discountedPrice ? (
                      <>
                        <span className="discounted-price">
                          {currenncyCodeToSymbol(product.currency_code)}{" "}
                          {discountedPrice.toLocaleString()}
                        </span>

                        <span className="main-price discounted">
                          {currenncyCodeToSymbol(product.currency_code)}{" "}
                          {price.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="discounted-price">
                        {currenncyCodeToSymbol(product.currency_code)}{" "}
                        {price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Product Meta */}
                  <div className="single-info">
                    <div>
                      <strong>SKU</strong>
                      <span>{itemCode}</span>
                    </div>

                    <div>
                      <strong>{t("products.category")}</strong>
                      <span>{product?.category}</span>
                    </div>

                    <div>
                      <strong>{t("products.availability")}</strong>

                      <span
                        className={
                          stock > 10
                            ? "stock-available"
                            : stock === 0
                              ? "stock-unavailable"
                              : "stock-limited"
                        }
                      >
                        {stock > 10
                          ? t("products.in_stock")
                          : stock === 0
                            ? t("products.item_unavailable")
                            : t("products.limited_stock")}
                      </span>
                    </div>

                    {stock === 0 && (
                      <strong className="stock-message">
                        {t("products.you_can_find_alternative_products_below")}
                      </strong>
                    )}
                  </div>

                  {/* Purchase */}
                  <div className="product-purchase-area">
                    <div className="qty-input">
                      <button
                        type="button"
                        onClick={() => qtyChange(product, "less")}
                        disabled={quantity <= 1}
                      >
                        −
                      </button>

                      <span>{quantity}</span>

                      <button
                        type="button"
                        onClick={() => qtyChange(product, "more")}
                        disabled={stock === 0 || quantity >= stock}
                      >
                        +
                      </button>
                    </div>

                    <div className="product-buttons">
                      <button
                        onClick={handleWishlist}
                        type="button"
                        className="wishlist-button"
                        disabled={product.isExpiryDeal}
                      >
                        <i className="fa fa-heart" />

                        {isFavorite
                          ? t("products.remove_from_wishlist")
                          : t("products.add_to_wishlist")}
                      </button>

                      <button
                        onClick={() => handleCart(product, quantity)}
                        className="cart-button"
                        type="button"
                        disabled={stock === 0}
                      >
                        <i className="fa fa-shopping-cart" />

                        {t("products.add_to_cart")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Information */}
              <div className="col-lg-5 mt-4 mt-lg-0">
                {product.hasPromotion && (
                  <div className="promotion-side-card">
                    <h6>Special Offers</h6>

                    <ProductPromotionList item_code={itemCode} />
                  </div>
                )}

                <div className="delivery-card">
                  <h6>Delivery Options</h6>

                  <div className="delivery-item">
                    <i className="ti-check" />
                    <span>Free Shipping</span>
                  </div>

                  <div className="delivery-item">
                    <i className="ti-check" />
                    <span>Cash on Delivery Available</span>
                  </div>

                  <div className="delivery-item">
                    <i className="ti-check" />
                    <span>14 days Return</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="product-full-description">
          <div className="container">
            <h3 className="entry-product-section-heading">Description</h3>

            <p>{product?.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
