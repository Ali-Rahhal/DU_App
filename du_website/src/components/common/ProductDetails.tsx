// import { addToCart } from "@/store/state/cartSlice";
// import { addToWishlist } from "@/store/state/wishlistSlice";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
// import ReviewItem from "./ReviewItem";
// import StarRating from "./StarRating";
import ThumbSlider from "./ThumbSlider";
import Item from "@/Models/item";
import { currenncyCodeToSymbol } from "@/utils";
import { addToCart, addToFavorite, removeFromFavorite } from "@/utils/apiCalls";
import { useAccountStore, useAuthStore } from "@/store/zustand";

const ProductDetails = ({ product }: { product: Item }) => {
  // const dispatch = useDispatch(1);
  const router = useRouter();
  const { refreshCart } = useAccountStore();
  const { isAuth } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [price, setprice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [isFavorite, setIsFavorite] = useState(product.isFavorite);
  useEffect(() => {
    let price = parseFloat(product?.price);
    let discountedPrice = parseFloat(product?.discountedPrice);
    setprice(price);
    setDiscountedPrice(discountedPrice);
  }, [product]);

  const handleCart = async (product: Item, quantity: number) => {
    if (!isAuth) {
      toast.info("Please login to continue !");
      return;
    }
    addToCart(product.item_code, product.barcode, quantity)
      .then((res) => {
        refreshCart();
        toast.success("Product added to Cart !");
      })
      .catch((err) => {
        toast.error(err.response.data.message || "Something went wrong !");
      });
  };

  const handleBuyNow = (product, quantity, varient) => {
    // dispatch(addToCart({ product, quantity, varient }));
    router.push("/cart");
  };

  const handleWishlist = () => {
    // dispatch(addToWishlist(product));
    if (!isAuth) {
      toast.info("Please login to continue !");
      return;
    }
    if (!isFavorite) {
      addToFavorite(product.item_code).then((res) => {
        toast.success("Added to Wishlist !");
        setIsFavorite(true);
      });
    } else {
      removeFromFavorite(product.item_code).then((res) => {
        toast.info("Removed from Wishlist !");
        setIsFavorite(false);
      });
    }
  };

  const qtyChange = (product, type) => {
    if (type === "less") {
      setQuantity((prev) => {
        if (prev > 1) {
          return prev - 1;
        } else {
          return prev;
        }
      });
    } else {
      setQuantity((prev) => {
        let stk = product?.stock ? Number(product?.stock) : 0;
        if (stk > prev) {
          return prev + 1;
        } else {
          toast.info("this Product only has" + product.stock + " stock");
          return prev;
        }
      });
    }
  };

  return (
    <>
      <section className="section-padding mt-4">
        <div className="container-fluid">
          <div className="row justify-content-between">
            <div className="col-lg-4">
              {/* <!--=======  product details slider area  =======--> */}
              <div className="product-details-slider-area">
                <ThumbSlider
                  images={
                    product.image
                      ? product.images
                      : [process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE]
                  }
                />
              </div>
            </div>
            <div className="col-lg-8 mt-4">
              <div className="row pl-lg-3">
                <div className="col-lg-7">
                  <div className="single-product-content-description">
                    <h4 className="product-title">{product?.name}</h4>
                    {/* <div className="rating">
                      <StarRating value={product?.rating?.average_rating} />
                      <span className="review-count ml-3">
                        {product?.rating?.average_rating} (
                        {product?.rating?.total_rating})
                      </span>
                    </div> */}

                    {discountedPrice ? (
                      <p className="single-grid-product__price">
                        <span className="discounted-price">
                          {" "}
                          {currenncyCodeToSymbol(product.currency_code)}{" "}
                          {discountedPrice?.toLocaleString()}
                        </span>
                        <span className="main-price discounted">
                          {currenncyCodeToSymbol(product.currency_code)}{" "}
                          {price?.toLocaleString()}
                        </span>
                      </p>
                    ) : (
                      <p className="single-grid-product__price">
                        {" "}
                        <span className="discounted-price">
                          {" "}
                          {currenncyCodeToSymbol(product.currency_code)}{" "}
                          {price?.toLocaleString()}
                        </span>
                      </p>
                    )}

                    <div className="single-info">
                      <span className="d-block text-muted mb-2">
                        <strong>SKU :</strong> {product?.item_code}
                      </span>
                      <span className="d-block text-muted mb-2">
                        <strong>Category :</strong> {product?.category}
                      </span>

                      <span className="d-block text-muted mb-2">
                        <strong>Availability :</strong> In Stock
                      </span>
                    </div>

                    {/* <div className="varient mt-4">
                      <h6 className="font-weight-bold text-dark mb-3">
                        product Varient
                      </h6>
                      <div className="row box-checkbox">
                        {product?.varient && product?.varient.length > 0
                          ? product?.varient.map((item, index) => (
                              <label key={index} tabIndex={index}>
                                <input
                                  tabIndex={-1}
                                  onChange={() => setSelectedVarient(index)}
                                  type="radio"
                                  checked={
                                    index === selectedvarient ? true : false
                                  }
                                  name=""
                                />
                                <div className="icon-box">
                                  <div className="label">{item.weight}</div>
                                  <span className="value">${item.price}</span>
                                </div>
                              </label>
                            ))
                          : null}
                      </div>
                    </div> */}

                    <div className="product-actions my-4 justify-content-between">
                      <div className="qty-input btn mt-4 mt-md-0">
                        <button
                          type="button"
                          onClick={() => qtyChange(product, "less")}
                          className="less"
                        >
                          -
                        </button>
                        <span>{quantity}</span>
                        <button
                          type="button"
                          onClick={() => qtyChange(product, "more")}
                          className="more"
                        >
                          +
                        </button>
                      </div>

                      {/* <!-- End Quantity --> */}
                      <div className="product-buttons ml-0 ml-md-3 mt-4 mt-md-0 text-md-left text-center">
                        {!isFavorite ? (
                          <button
                            onClick={handleWishlist}
                            type="button"
                            className="btn btn-rounded btn-soft-primary mr-2"
                          >
                            <i className="fa fa-heart"></i> Add To Wishlist
                          </button>
                        ) : (
                          <button
                            onClick={handleWishlist}
                            type="button"
                            className="btn btn-rounded btn-soft-primary mr-2"
                          >
                            <i className="fa fa-heart"></i> Remove From Wishlist
                          </button>
                        )}

                        <button
                          onClick={() => {
                            handleCart(product, quantity);
                          }}
                          className="btn btn-rounded btn-primary"
                          type="button"
                        >
                          <i className="fa fa-shopping-cart"></i> Add To Cart
                        </button>
                      </div>
                    </div>
                    {/* <div className="mb-4">
                      <button
                        onClick={
                          () => {}
                          // handleBuyNow(product, quantity, selectedvarient)
                        }
                        type="button"
                        className="btn btn-block btn-primary btn-pill transition-3d-hover"
                      >
                        Buy Now
                      </button>
                    </div> */}
                  </div>
                </div>
                <div className="col-lg-5 mt-4 mt-lg-0">
                  <div className="bg-light p-3">
                    <h6>Delivery Options</h6>
                    <div className="media align-items-center">
                      <span className="mr-2">
                        <i className="ti-check text-primary small"></i>
                      </span>
                      <div className="media-body text-body small">
                        <span className="font-weight-bold mr-1">
                          Free Shipping
                        </span>
                      </div>
                    </div>
                    <div className="media align-items-center">
                      <span className="mr-2">
                        <i className="ti-check text-primary small"></i>
                      </span>
                      <div className="media-body text-body small">
                        <span className="font-weight-bold mr-1">
                          {" "}
                          Cash on Delivery Available
                        </span>
                      </div>
                    </div>
                    <div className="media align-items-center">
                      <span className="mr-2">
                        <i className="ti-check text-primary small"></i>
                      </span>
                      <div className="media-body text-body small">
                        <span className="font-weight-bold mr-1">
                          {" "}
                          14 days Return
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* <div className="mt-4">
                    <h6 className="font-weight-bold text-dark">
                      products highlights
                    </h6>
                    <ul className="pl-3">
                      {product?.highlights.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <h6 className="font-weight-bold text-dark">Share on</h6>
                    <div className="social-links social-links-dark">
                      {product?.social_links?.map((item, index) => (
                        <a key={index} href={Object.values(item)}>
                          <i className={"fa fa-" + Object.keys(item)}></i>
                        </a>
                      ))}
                    </div>
                  </div> */}
                  {/* <div className="form-group mt-5">
                    <h6 className="font-weight-bold text-dark">
                      Delivery availability
                    </h6>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control custom-location"
                        placeholder="Delivery Pincode"
                      />
                      <div className="input-group-prepend">
                        <span className="input-group-text bg-primary text-white cursor-pointer">
                          Check
                        </span>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <!--=======  product description review   =======--> */}
        <div className="product-full-description">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <h3 className="entry-product-section-heading">Description</h3>
                <p>{product?.description}</p>
                {/* <h3 className="entry-product-section-heading">
                  Additional information
                </h3> */}
                {/* <div className="product-info-sec">
                  <table className="table table-bordered table-striped">
                    <tbody>
                      {product?.additional_information.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div> */}
                {/* <h2 className="entry-product-section-heading"> Reviews </h2>
                <div className="row justify-content-between">
                  {product?.reviews.map((item, index) => (
                    <div className="col-lg-5" key={index}>
                      <ReviewItem {...item} />
                    </div>
                  ))}
                </div> */}

                {/* <p className="text-right">
                  <a href="leave-review" className="btn btn-primary">
                    Leave a review
                  </a>
                </p> */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default ProductDetails;
