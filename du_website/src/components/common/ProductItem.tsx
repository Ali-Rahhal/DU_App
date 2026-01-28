import { useAuthStore } from "@/store/zustand";
import { currenncyCodeToSymbol, discount } from "@/utils";
import { addToFavorite } from "@/utils/apiCalls";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

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
const ProductItem = ({ item }) => {
  if (!item) return;
  let url = "/products/" + item?.item_code;
  // let oldPrice = varient && varient.length > 0 ? varient[0].oldPrice : 0;
  // let price = varient && varient.length > 0 ? varient[0].price : 0;
  let price = parseFloat(item?.price);
  let discountedPrice = parseFloat(item?.discountedPrice);
  let title = item?.name;
  let image = item?.image;
  let type = item?.status;
  const { isAuth } = useAuthStore();
  return (
    <>
      <div className={`product ${type}`}>
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
                <div className="current-price">${price}</div>
              </>
            )}
          </div>
        </div>
        <div className="product-actions">
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
        </div>
      </div>
    </>
  );
};

export default ProductItem;
