import CartSummary from "@/components/common/CartSummary";
import Shipping from "@/components/common/Shipping";
import Layout from "@/components/Layout/Layout";
import Item from "@/Models/item";
import { useAccountStore, useAuthStore } from "@/store/zustand";
// import {
//   clearCart,
//   deleteFormCart,
//   increaseQuantity,
//   decreaseQuantity,
// } from "@/store/state/cartSlice";
import { currenncyCodeToSymbol, discount } from "@/utils";
import {
  placeOrder,
  removeFromCart,
  removeFromFavorite,
  updateCartItem,
} from "@/utils/apiCalls";
// import { findProductIndex, server } from '@/utils';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
// import { toast } from 'react-toastify';

const Cart = () => {
  const { isAuth, logout } = useAuthStore();
  const [subtotal, setSubtotal] = useState(0);
  const { cart, cartItems, refreshCart } = useAccountStore();
  const [loading, setLoading] = useState(true);
  const rt = useRouter();
  const removeItemHandler = (item_code) => {
    removeFromCart(item_code).then((res) => {
      toast.info("Removed from Cart !");
      refreshCart();
    });
    // dispatch(deleteFormCart(item));
  };

  const updateCartHandler = (item_code, quantity) => {
    updateCartItem(item_code, quantity).then((res) => {
      // toast("Cart Updated !");
      refreshCart();
    });
  };
  useEffect(() => {
    if (!cart) return;
    let total = 0;
    for (const c of cartItems) {
      total =
        total +
        Number(c.quantity) *
          Number(c.discountedPrice ? c.discountedPrice : c.price);
    }
    setSubtotal(total);
  }, [cartItems]);

  useEffect(() => {
    if (isAuth) {
      setLoading(false);
    }
  }, [cartItems]);

  useEffect(() => {
    refreshCart();
  }, []);

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
                          Shopping Cart
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
                          <i className="ti-trash"></i> Empty Cart
                        </button>
                      </div>
                    </div>
                  </div>
                  {cartItems.map((item) => (
                    <div key={item.item_code} className="cart_item">
                      <div className="cart_item_image">
                        <Link href={"/products/" + item.item_code}>
                          <Image
                            height={300}
                            width={300}
                            src={item.image}
                            alt={item.name}
                          />
                        </Link>
                      </div>
                      <div className="c-item-body mt-4 mt-md-0">
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
                                {currenncyCodeToSymbol(item.currency_code) +
                                  " "}
                                {item.discountedPrice
                                  ? parseFloat(
                                      item.discountedPrice
                                    ).toLocaleString()
                                  : parseFloat(
                                      item.price
                                    ).toLocaleString()}{" "}
                              </strong>
                              {item?.price && (
                                <del>
                                  {currenncyCodeToSymbol(item.currency_code) +
                                    " "}
                                  {parseFloat(item.price).toLocaleString()}
                                </del>
                              )}
                              {item.discountedPrice && (
                                <small className="product-discountPercentage">
                                  ({discount(item.discountedPrice, item.price)}%
                                  OFF)
                                </small>
                              )}
                            </span>
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
                      <div className="qty-input btn mt-4 mt-md-0">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartHandler(item.item_code, item.quantity - 1)
                          }
                          className="less"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartHandler(item.item_code, item.quantity + 1)
                          }
                          className="more"
                        >
                          +
                        </button>
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
                      Cart Totals
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
                        <h6>Count</h6>
                      </div>
                      <div className="cart_total_amount">
                        <span>
                          {cartItems.reduce(
                            (acc, item) => acc + item.quantity,
                            0
                          )}{" "}
                          Items
                        </span>
                      </div>
                    </div>
                    <div
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
                    </div>
                    <button
                      className="btn btn-primary btn-rounded btn-full btn-large"
                      onClick={() => {
                        if (!isAuth) {
                          toast.info("Please login to continue");
                          return;
                        }
                        placeOrder().then((res) => {
                          toast.success("Order Placed !");
                          rt.push("/orders");
                          refreshCart();
                        });
                      }}
                    >
                      Checkout <i className="ti-arrow-right"></i>
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
                  cart={cartItems}
                  currency={currenncyCodeToSymbol(cartItems[0]?.currency_code)}
                /> */}
              </div>
            </div>
          ) : !loading ? (
            <div className="py-5">
              <div className="cart_item py-5 border text-center rounded">
                <h4 className="text-muted mb-4">Your Cart is empty</h4>
                <Link href="/" className="btn btn-primary btn-rounded">
                  Continue shopping &nbsp; <i className="ti-arrow-right"></i>
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
              <Spinner color="#4e97fd" animation="grow" variant="primary" />
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Cart;
