import ProductItemList from "@/components/common/ProductItemList";
import AccountLayout from "@/components/dashboard/AccountLayout";
import Layout from "@/components/Layout/Layout";
import Item from "@/Models/item";
import { useAuthStore } from "@/store/zustand";
// import { deleteFormWishlist } from "@/store/state/wishlistSlice";
import { currenncyCodeToSymbol, discount } from "@/utils";
import { getFavoriteItems, removeFromFavorite } from "@/utils/apiCalls";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

const Wishlist = () => {
  const { isAuth } = useAuthStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const removeItemHandler = (item) => {
    removeFromFavorite(item)
      .then((res) => {
        toast.success(res.data.message);
        // setItems((prev) => prev.filter((i) => i.item_code !== item));
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
    // dispatch(deleteFormWishlist(item));
  };
  useEffect(() => {
    if (!isAuth) return;
    setLoading(true);
    getFavoriteItems({
      skip: 0,
      take: 20,
    })
      .then((res) => {
        setLoading(false);
        setItems(res.data.result.products);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err.response.data.message);
      });
  }, [isAuth]);

  return (
    <Layout>
      <AccountLayout
        title="Wishlist"
        subTitle="You have full control to manage your own account setting."
      >
        {items && items.length > 0 ? (
          <div className="card">
            <div className="card-body">
              <div className="cart_product border-0">
                {items?.map((item: Item) => (
                  <ProductItemList
                    key={item.item_code}
                    item={item}
                    withRemove
                    removeItemHandler={removeItemHandler}
                    size="large"
                  />
                ))}
              </div>
            </div>
          </div>
        ) : !loading ? (
          <div className="cart_item py-5 border text-center rounded bg-white">
            <h4 className="text-muted mb-4">No Items in Whishlist</h4>
            <Link href="/" className="btn btn-primary btn-rounded">
              Continue shopping &nbsp; <i className="ti-arrow-right"></i>
            </Link>
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
      </AccountLayout>
    </Layout>
  );
};

export default Wishlist;
