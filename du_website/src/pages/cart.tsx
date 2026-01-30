import ProductPromotionList from "@/components/common/ProductPromotionList";
import Layout from "@/components/Layout/Layout";

import { useAccountStore, useAuthStore } from "@/store/zustand";
// import {
//   clearCart,
//   deleteFormCart,
//   increaseQuantity,
//   decreaseQuantity,
// } from "@/store/state/cartSlice";
import { currenncyCodeToSymbol, discount } from "@/utils";
import {
  getShoppingCartPromotions,
  placeOrder,
  removeFromCart,
  updateCartItem,
} from "@/utils/apiCalls";
import { ALL_PERMISSIONS } from "@/utils/data";
import { useTranslations } from "next-intl";
// import { findProductIndex, server } from '@/utils';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

// import { toast } from 'react-toastify';

const CartItem = ({ item, removeItemHandler, updateCartHandler }) => {
  const [quantity, setQuantity] = useState<number>(item.quantity);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);

    // Clear the existing timeout if the user clicks quickly
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set a new timeout to call updateCartHandler
    const timeout = setTimeout(() => {
      updateCartHandler(item.item_code, newQuantity);
    }, 200); // 1-second delay (adjust as needed)
    setDebounceTimeout(timeout);
  };
  return (
    <div key={item.item_code} className="cart_item">
      <div className="cart_item_image">
        <Link href={"/products/" + item.item_code}>
          <Image
            fill
            src={
              item?.image
                ? item?.image
                : process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE
            }
            alt={item.name}
          />
        </Link>
      </div>
      <div className="c-item-body mt-4 mt-md-0">
        <div className="cart_item_title mb-2">
          <Link href={"/products/" + item.item_code}>
            <h4>{item.name}</h4>
          </Link>
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
              {item?.discountedPrice && (
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
            {/* )} */}
          </div>
          <div className="cart_product_remove">
            <button
              type="button"
              onClick={() => removeItemHandler(item.item_code)}
            >
              <i className="ti-trash"></i> Remove
            </button>
          </div>
        </div>
      </div>

      <div
        className="qty-input btn mt-4 mt-md-0"
        style={{
          width: 120,
        }}
      >
        <button
          type="button"
          onClick={() => handleQuantityChange(quantity - 1)}
          className="less"
          disabled={quantity === 1}
        >
          -
        </button>
        {/* <span>{quantity}</span> */}
        <input
          type="number"
          value={quantity}
          // style={{
          //   width: 50,
          //   textAlign: "center",
          //   border: "none",

          // }}
          className="quantity-input"
          onChange={(e) => {
            if (parseInt(e.target.value) < 1 || e.target.value === "") {
              return;
            }
            handleQuantityChange(parseInt(e.target.value));
          }}
        />
        <button
          type="button"
          onClick={() => handleQuantityChange(quantity + 1)}
          className="more"
        >
          +
        </button>
      </div>
    </div>
  );
};

const Cart = () => {
  const { isAuth, logout } = useAuthStore();

  const [promotions, setPromotions] = useState<{
    promotionResults: {
      promotion_id: string;
      description: string;
      item_code: string;
      quantity: number;
      buy_item_condition: string;
      buy_quantity_condition: number;
      get_item_result: string;
      get_quantity_result: number;
      result_quantity: number;
    }[];
    promotionDetails: any[];
    addedItems: any[];
  }>();
  const [subtotal, setSubtotal] = useState<
    {
      currency_code: string;
      price: number;
      discountedPrice: number;
    }[]
  >();
  const { cart, cartItems, refreshCart, checkPermission } = useAccountStore();
  const [loading, setLoading] = useState(true);
  const rt = useRouter();
  const removeItemHandler = (item_code) => {
    removeFromCart(item_code).then((res) => {
      toast.info("Removed from Cart !");
      refreshCart();
    });
  };

  const updateCartHandler = async (item_code, quantity) => {
    return updateCartItem(item_code, quantity).then((res) => {
      // toast("Cart Updated !");
      refreshCart();
    });
  };

  useEffect(() => {
    if (!cart) return;
    const currency_codes = [
      ...new Set(cartItems.map((item) => item.currency_code)),
    ];
    const tempSubtotal: {
      currency_code: string;
      price: number;
      discountedPrice: number;
    }[] = [];
    //get total for each currency
    for (const currency_code of currency_codes) {
      const total = cartItems
        .filter((item) => item.currency_code === currency_code)
        .reduce((acc, item) => {
          return (
            acc +
            Number(item.quantity) *
              Number(item.discountedPrice ? item.discountedPrice : item.price)
          );
        }, 0);
      tempSubtotal.push({
        currency_code: currency_code as string,
        price: total,
        discountedPrice: 0,
      });
    }
    setSubtotal(tempSubtotal);
  }, [cartItems]);

  useEffect(() => {
    if (isAuth) {
      setLoading(false);
    }
  }, [cartItems]);

  useEffect(() => {
    refreshCart();
  }, []);

  useEffect(() => {
    if (!cartItems) {
      return;
    }
    const t = getShoppingCartPromotions().then((res) => {
      if (res.data.result.length === 0) {
        setPromotions(null);
      }

      setPromotions({
        promotionResults: res.data.result.promotionResults,
        promotionDetails: res.data.result.promotionDetails,
        addedItems: res.data.result.addedItems,
      });
    });
  }, [cartItems]);
  const t = useTranslations();

  return (
    <Layout>
      <section className="section-padding mt-5 mb-5">
        <div className="container">
          {cartItems.length > 0 ? (
            <div className="row justify-content-between">
              <div className="col-md-9">
                <div className="cart_product">
                  <div className="cart_product_heading">
                    <div className="row align-items-center">
                      <div className="col-sm-6 text-lg-left">
                        <h4>
                          {t("shopping_cart")}
                          <span>( {cart} Item )</span>
                        </h4>
                      </div>
                      <div className="col-sm-6 text-lg-right">
                        <button
                          onClick={() => {
                            removeFromCart(undefined).then((res) => {
                              toast.info("Emptied Cart !");
                              refreshCart();
                            });
                          }}
                          className="btn btn-light btn-medium button-sm d-none d-md-inline-block"
                        >
                          <i className="ti-trash"></i>
                          {t("empty_cart")}
                        </button>
                      </div>
                    </div>
                  </div>
                  {cartItems.map((item, index) => (
                    <CartItem
                      key={index}
                      item={item}
                      removeItemHandler={removeItemHandler}
                      updateCartHandler={updateCartHandler}
                    />
                  ))}
                  {promotions?.addedItems?.map((item) => (
                    <div key={item.item_code} className="cart_item">
                      <div className="cart_item_image">
                        <Link href={"/products/" + item.item_code}>
                          <Image
                            fill
                            src={
                              item?.image
                                ? item?.image
                                : process.env
                                    .NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE
                            }
                            alt={item.name}
                          />
                        </Link>
                      </div>
                      <div className="c-item-body mt-4 mt-md-0">
                        <div className="cart_item_title mb-2">
                          <Link href={"/products/" + item.item_code}>
                            <h4>{item.name}</h4>

                            <span className="badge badge-success text-uppercase">
                              {t("promotion")}
                            </span>
                          </Link>
                        </div>
                        <div className="cart_item_price">
                          <div className="product-price">
                            <span
                              style={{
                                color: "green",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                              }}
                            >
                              <strong>{t("free")}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className=" btn mt-4 mt-md-0"
                        style={{
                          width: 120,
                        }}
                      >
                        <span>{item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-3 mt-lg-0 mt-6">
                <>
                  <div className="heading_s1 mb-3">
                    <h5
                      className="font-weight-bold"
                      style={{
                        fontSize: "1.5rem",
                        textAlign: "center",
                      }}
                    >
                      {t("cart_totals")}
                    </h5>
                  </div>
                  <div className="cart_total_box">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <div className="cart_total_title">
                        <h6>{t("count")}</h6>
                      </div>
                      <div className="cart_total_amount">
                        <span
                          style={{
                            fontWeight: "bold",
                          }}
                        >
                          {cartItems.reduce(
                            (acc, item) => acc + item.quantity,
                            0
                          )}{" "}
                          {t("items")}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <div className="cart_total_title">
                        <h6>{t("total")}</h6>
                      </div>
                      <div className="cart_total_amount">
                        {subtotal
                          ?.sort((a, b) =>
                            a.currency_code === "USD"
                              ? -1
                              : b.currency_code === "USD"
                              ? 1
                              : 0
                          )
                          .map((sub, index) => (
                            <>
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
                            </>
                          ))}
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-rounded btn-full btn-large"
                      onClick={() => {
                        if (!isAuth) {
                          toast.info("Please login to continue");
                          return;
                        }
                        if (!checkPermission(ALL_PERMISSIONS.ORDER)) {
                          toast.error(
                            "You don't have permission to place order"
                          );
                          return;
                        }
                        placeOrder().then((res) => {
                          toast.success("Order Placed !");
                          rt.push("/orders");
                          refreshCart();
                        });
                      }}
                    >
                      {t("checkout")} <i className="ti-arrow-right"></i>
                    </button>
                    {/* <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <div className="cart_total_title">
                        <h6>Total</h6>
                      </div>
                      <div className="cart_total_amount">
                        <span>
                          {currenncyCodeToSymbol(cartItems[0]?.currency_code) +
                            " "}
                          {subtotal.toLocaleString()}
                        </span>
                      </div>
                    </div> */}
                  </div>
                </>
                {/* <CartSummary
                  cart={finalCartItems}
                  currency={currenncyCodeToSymbol(finalCartItems[0]?.currency_code)}
                /> */}
              </div>
            </div>
          ) : !loading ? (
            <div className="py-5">
              <div className="cart_item py-5 border text-center rounded">
                <h4 className="text-muted mb-4">{t("cart_empty_msg")}</h4>
                <Link href="/" className="btn btn-primary btn-rounded">
                  {t("continue_shopping")} &nbsp;{" "}
                  <i className="ti-arrow-right"></i>
                </Link>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "40vh",
              }}
            >
              <Spinner color="#2b2a88" animation="grow" variant="primary" />
            </div>
          )}

          {promotions?.addedItems?.length > 0 && (
            <>
              <hr />
              <ProductPromotionList
                promotionsArray={promotions?.promotionDetails}
              />
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Cart;
