import Item from "@/Models/item";
import { currenncyCodeToSymbol } from "@/utils";
import Image from "next/image";
import Link from "next/link";
const MiniCart = ({
  cartItems,
  subtotal,
}: {
  cartItems: any;
  subtotal: number;
}) => {
  return (
    <>
      {cartItems && cartItems.length > 0 ? (
        <ul className="shopping-cart-items">
          {cartItems.map((item) => (
            <li key={item.item_code} className="mini_cart_item">
              <div className="left-section">
                <Link href={"/products/" + item.item_code}>
                  <Image
                    height={300}
                    width={300}
                    src={item.image}
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
                    <span className="px-1">x</span> <span>{item.quantity}</span>
                  </div>
                  {/* {item?.weight && (
                    <div className="item-desc col-auto">{item?.weight}</div>
                  )} */}
                </div>
              </div>
            </li>
          ))}
          <li className="w-100 d-block mb-3 text-center">
            <h6>
              Subtotal:{" "}
              {currenncyCodeToSymbol(cartItems[0].currency_code) +
                " " +
                subtotal.toLocaleString()}
            </h6>
          </li>
          <li className="w-100 d-block">
            <Link href="/cart" className="btn btn-primary w-100 d-block">
              Proceed to Cart
            </Link>
          </li>
        </ul>
      ) : (
        <ul className="shopping-cart-items">
          <li>You have no items in your shopping cart.</li>
        </ul>
      )}
    </>
  );
};

export default MiniCart;
