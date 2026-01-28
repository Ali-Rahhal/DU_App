import Link from "next/link";
import { useEffect, useState } from "react";

const CartSummary = ({ cart, currency }) => {
  const [shippingCost, setShippingCost] = useState(0);
  const [subtotal, setSubtotal] = useState(0);

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
  }, [cart]);
  return (
    <>
      <div className="cart-summary">
        <div className="cart-summary-wrap">
          <h4>Cart Summary</h4>
          <p>
            Sub Total <span>{currency + " " + subtotal.toLocaleString()}</span>
          </p>
          <p>
            Shipping Cost <span>{currency + " " + shippingCost}</span>
          </p>
          <h2>
            Grand Total{" "}
            <span>
              {currency + " " + (subtotal + shippingCost).toLocaleString()}
            </span>
          </h2>
        </div>
        <div className="cart-summary-button">
          <Link
            href="/checkout"
            className="btn btn-primary btn-rounded btn-full btn-large"
          >
            Proceed to Checkout <i className="ti-arrow-right"></i>{" "}
          </Link>
        </div>
      </div>
    </>
  );
};

export default CartSummary;
