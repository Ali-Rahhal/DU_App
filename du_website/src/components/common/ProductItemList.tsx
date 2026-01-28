import Item from "@/Models/item";
import { currenncyCodeToSymbol, discount } from "@/utils";

import Image from "next/image";
import Link from "next/link";
import React from "react";

const ProductItemList = ({
  item,
  withRemove = false,
  removeItemHandler,
  size = "small",
}: {
  item: Item;
  withRemove?: boolean;
  removeItemHandler?: (item: string) => void;
  size?: "small" | "large";
}) => {
  return (
    <div
      key={item.item_code}
      className={`cart_item ${size === "small" && "small"} px-0`}
    >
      <div
        className="cart_item_image"
        style={{
          position: "relative",
        }}
      >
        <Link href={"/products/" + item.item_code}>
          <Image
            fill
            style={{
              objectFit: "cover",
            }}
            src={
              item?.image
                ? item?.image
                : process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE
            }
            alt={item.name}
          />
        </Link>
      </div>
      <div className="c-item-body">
        <div className="cart_item_title mb-2">
          <Link href={"/products/" + item.item_code}>
            <h4>{item.name}</h4>
          </Link>
          {/* {item?.weight && (
        <p className="small mb-0 text-muted">
          {item?.weight}
        </p>
      )} */}
        </div>
        <div className="cart_item_price">
          <div className="product-price">
            <span>
              <strong>
                {currenncyCodeToSymbol(item.currency_code) + " "}
                {item.discountedPrice
                  ? parseFloat(item.discountedPrice).toLocaleString()
                  : parseFloat(item.price).toLocaleString()}{" "}
              </strong>
              {item?.price && (
                <del>
                  {currenncyCodeToSymbol(item.currency_code) + " "}
                  {parseFloat(item.price).toLocaleString()}
                </del>
              )}
              {item.discountedPrice && (
                <small className="product-discountPercentage">
                  ({discount(item.discountedPrice, item.price)}% OFF)
                </small>
              )}
            </span>
          </div>
          {withRemove ? (
            <div className="cart_product_remove">
              <button
                type="button"
                onClick={() => removeItemHandler(item.item_code)}
              >
                <i className="ti-trash"></i> Remove
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProductItemList;
