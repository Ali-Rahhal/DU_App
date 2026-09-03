import { useCompanyAssets } from "@/hooks/useCompanyAssets";
import { CartItem } from "@/types/productTypes";
import { currenncyCodeToSymbol } from "@/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import React from "react";
const MiniCart = ({
  cartItems,
  subtotal,
}: {
  cartItems: CartItem[];
  subtotal: {
    currency_code: string;
    price: number;
    discountedPrice: number;
  }[];
}) => {
  const t = useTranslations();
  const { companyPlaceholder } = useCompanyAssets();
  return (
    <>
      {cartItems && cartItems.length > 0 ? (
        <ul className="shopping-cart-items">
          <div
            className="cart_items"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            {cartItems.map((item) => (
              <li key={item.item_code} className="mini_cart_item">
                <div className="left-section">
                  <Link href={"/products/" + item.item_code}>
                    <Image
                      height={300}
                      width={300}
                      src={item.image || companyPlaceholder}
                      alt={item.name}
                    />
                  </Link>
                </div>
                <div className="right-section">
                  <Link href={"/products/" + item.item_code}>{item.name}</Link>
                  <div className="row no-gutters">
                    <div className="item-desc col">
                      <strong>
                        {currenncyCodeToSymbol(item.currency_code) +
                          " " +
                          (item?.discountedPrice
                            ? parseFloat(item.discountedPrice).toLocaleString()
                            : parseFloat(item?.price).toLocaleString())}
                      </strong>{" "}
                      <span className="px-1">x</span>{" "}
                      <span>{item.quantity}</span>
                    </div>
                    {/* {item?.weight && (
                    <div className="item-desc col-auto">{item?.weight}</div>
                  )} */}
                  </div>
                </div>
              </li>
            ))}
          </div>
          <li className="mini-cart-total">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div className="cart_total_title">
                <h6>{t("cart.total")}</h6>
              </div>

              <div className="cart_total_amount">
                {subtotal
                  ?.sort((a, b) =>
                    a.currency_code === "USD"
                      ? -1
                      : b.currency_code === "USD"
                        ? 1
                        : 0,
                  )
                  .map((sub, index) => (
                    <React.Fragment key={sub.currency_code}>
                      <span
                        style={{
                          display: "block",
                          textAlign: "right",
                          fontWeight: "bold",
                        }}
                      >
                        {currenncyCodeToSymbol(sub.currency_code) + " "}
                        {sub.price.toLocaleString()}
                      </span>

                      {index >= 0 && index < subtotal.length - 1 && (
                        <span
                          style={{
                            display: "block",
                            textAlign: "right",
                            fontWeight: "bold",
                          }}
                        >
                          +
                        </span>
                      )}
                    </React.Fragment>
                  ))}
              </div>
            </div>
          </li>

          <li className="mini-cart-checkout">
            <Link href="/cart" className="btn btn-primary w-100 d-block">
              {t("cart.minicart.proceed_to_cart")}
            </Link>
          </li>
        </ul>
      ) : (
        <ul className="shopping-cart-items">
          <li>{t("cart.minicart.you_have_no_items_in_your_shopping_cart")}</li>
        </ul>
      )}
    </>
  );
};

export default MiniCart;
