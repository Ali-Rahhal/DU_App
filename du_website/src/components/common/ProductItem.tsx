import Item from "@/Models/item";
import { useAuthStore } from "@/store/zustand";
import { currenncyCodeToSymbol, discount } from "@/utils";
import { addToFavorite } from "@/utils/apiCalls";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
import ProductPromotionList from "./ProductPromotionList";

// export interface Product {
//   id: number;
//   item_code?: string;
//   name: string;
//   price: number;
//   image: StaticImageData | string;
//   description: string;
//   category: string;
//   tags: string[];
//   link: "/product-detail/";
//   variants?: ProductVariant[];
//   variantType?: "color" | "image";
//   sizes?: string[];
//   allOfSizes?: string[];
//   status?: "New in" | "limited edition" | "Sold Out" | "50% Discount" | string;
//   rating?: string;
//   numberOfReviews?: number;
//   discountedPrice?: number;
//   isFavorite?: boolean;
//   web_discount?: number;
//   creation_date?: string;
// }
const ProductItem = ({ item }: { item: Item }) => {
  const [openPopup, setOpenPopup] = useState(false);
  const t = useTranslations();
  if (!item) return;
  let url = "/products/" + item?.item_code;
  // let oldPrice = varient && varient.length > 0 ? varient[0].oldPrice : 0;
  // let price = varient && varient.length > 0 ? varient[0].price : 0;
  let price = parseFloat(item?.price);
  let discountedPrice = parseFloat(item?.discountedPrice);
  let title = item?.name;
  let image = item?.image;
  // let type = item?.status;
  let type = "";
  const { isAuth } = useAuthStore();
  return (
    <>
      <Modal
        show={openPopup}
        onHide={() => setOpenPopup(false)}
        style={{
          // font-family: "Poppins", serif !important;
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <div
          onClick={() => setOpenPopup(false)}
          style={{
            cursor: "pointer",
            textAlign: "right",
            fontSize: "32px",
            color: "#f59f00",
            zIndex: 1000,
            position: "absolute",
            top: "20px",
            right: "30px",
          }}
        >
          <i className="fa fa-times"></i>
        </div>
        <Modal.Body>
          <ProductPromotionList item_code={item.item_code} />
        </Modal.Body>
      </Modal>
      {/* <OverlayTrigger placement="left" overlay={tooltip}>
      <Button bsStyle="default">Holy guacamole!</Button>
    </OverlayTrigger> */}

      <div className={`product ${type}`}>
        <div className="product-labels">
          {item.hasPromotion ? (
            <OverlayTrigger
              placement="right"
              overlay={
                <div className="promotion-tooltip">
                  <ProductPromotionList item_code={item.item_code} />
                </div>
              }
            >
              <span
                onClick={() => {
                  setOpenPopup(true);
                }}
                className="badge badge-primary promotion-badge"
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    item.cat_code === "P" ? "transparent" : "#f59f00",
                  border: "1px solid transparent",
                  borderColor:
                    item.cat_code === "P" ? "transparent" : "#f59f00",
                  minWidth: "24px",
                  color: item.cat_code === "P" ? "#f59f00" : "#fff",
                  textTransform: "uppercase",
                }}
              >
                {item.cat_code === "P" ? (
                  <i className="fa fa-star"></i>
                ) : (
                  t("on_promotion")
                )}
              </span>
            </OverlayTrigger>
          ) : null}
        </div>
        <Link href={url} className="product-img">
          <Image
            src={
              image ? image : process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE
            }
            alt={title}
            height={1050}
            width={500}
          />
        </Link>
        <div className="product-info">
          {/* <div className="product-rating">
            <i className="fa fa-star"></i>
            <i className="fa fa-star"></i>
            <i className="fa fa-star"></i>
            <i className="fa fa-star-half-o"></i>
            <i className="fa fa-star-o"></i>
            <div className="review-count">4.5 (2,213)</div>
          </div> */}
          <h3>
            <Link href={url}> {title}</Link>
          </h3>
          <div className="product-value">
            {discountedPrice ? (
              <>
                <div className="d-flex">
                  <small className="regular-price">
                    MRP{" "}
                    <del>
                      {currenncyCodeToSymbol(item.currency_code)}{" "}
                      {price.toLocaleString()}
                    </del>
                  </small>

                  <div className="off-price">
                    {discount(discountedPrice, price)}% off
                  </div>
                </div>

                <div className="current-price">
                  {" "}
                  {currenncyCodeToSymbol(item.currency_code)}{" "}
                  {discountedPrice.toLocaleString()}
                </div>
              </>
            ) : (
              <>
                <div className="current-price">
                  {" "}
                  {currenncyCodeToSymbol(item.currency_code)} {price}
                </div>
              </>
            )}
          </div>
        </div>
        {/* <div className="product-actions">
          <button
            className="btn btn-soft-primary"
            onClick={() => {
              if (!isAuth) {
                toast.info("Please login to add to wishlist");
                return;
              }
              addToFavorite(item.id).then((res) => {
                if (res.data.success) {
                  toast.success("Added to wishlist");
                }
              });
            }}
          >
            <i className="ti-heart"></i>
            Add to Wishlist
          </button>
          <button className="btn btn-primary">
            <i className="ti-shopping-cart"></i>
            Add to cart
          </button>
        </div> */}
      </div>
    </>
  );
};

export default ProductItem;
