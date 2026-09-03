import { useCompanyAssets } from "@/hooks/useCompanyAssets";

import { Product } from "@/types/productTypes";

import { currenncyCodeToSymbol, discount } from "@/utils";
import { useTranslations } from "next-intl";

import Image from "next/image";
import Link from "next/link";

import React from "react";

const ProductItemList = ({
  item,
  withRemove = false,
  removeItemHandler,
  size = "small",
}: {
  item: Product;
  withRemove?: boolean;
  removeItemHandler?: (item: string) => void;
  size?: "small" | "large";
}) => {
  const t = useTranslations();
  const { companyPlaceholder } = useCompanyAssets();

  return (
    <div
      className={`product-item-list ${
        size === "small" ? "product-item-list--small" : ""
      }`}
    >
      {/* Product Image */}
      <div className="product-item-list__image">
        <Link href={"/products/" + item.item_code}>
          <Image
            fill
            src={item?.image ? item.image : companyPlaceholder}
            alt={item.name}
            style={{
              objectFit: "contain",
            }}
          />
        </Link>
      </div>

      {/* Product Information */}
      <div className="product-item-list__content">
        <div className="product-item-list__title">
          <Link href={"/products/" + item.item_code}>
            <h4>{item.name}</h4>
          </Link>

          {/*
          {item?.weight && (
            <p className="product-item-list__description">
              {item?.weight}
            </p>
          )}
          */}
        </div>

        <div className="product-item-list__footer">
          {/* Price */}
          <div className="product-item-list__price">
            <span>
              <strong>
                {currenncyCodeToSymbol(item.currency_code) + " "}
                {item.discountedPrice
                  ? parseFloat(item.discountedPrice).toLocaleString()
                  : parseFloat(item.price).toLocaleString()}
              </strong>

              {item?.price && (
                <del>
                  {currenncyCodeToSymbol(item.currency_code) + " "}
                  {parseFloat(item.price).toLocaleString()}
                </del>
              )}

              {item.discountedPrice && (
                <small className="product-item-list__discount">
                  ({discount(item.discountedPrice, item.price)}% OFF)
                </small>
              )}
            </span>
          </div>

          {/* Remove */}
          {withRemove && (
            <div className="product-item-list__remove">
              <button
                type="button"
                onClick={() => removeItemHandler?.(item.item_code)}
              >
                <i className="ti-trash"></i>
                {t("cart.remove")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductItemList;
