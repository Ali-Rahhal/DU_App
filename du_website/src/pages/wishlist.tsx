import ProductItemList from "@/components/common/ProductItemList";
import AccountLayout from "@/components/dashboard/AccountLayout";
import Layout from "@/components/Layout/Layout";
import Item from "@/Models/item";
import { useAuthStore } from "@/store/zustand";
// import { deleteFormWishlist } from "@/store/state/wishlistSlice";

import { getFavoriteItems, removeFromFavorite } from "@/utils/apiCalls";
import { useTranslations } from "next-intl";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

import { ALL_PERMISSIONS } from "@/utils/data";
import { useRef } from "react";
import { useRouter } from "next/router";
import { useAccountStore } from "@/store/zustand";
import { Product } from "@/types/productTypes";

const Wishlist = () => {
  // Authorization Check:
  const rt = useRouter();
  const { role, checkPermission } = useAccountStore();
  const hasShownToast = useRef(false);
  const t = useTranslations();

  useEffect(() => {
    if (!checkPermission(ALL_PERMISSIONS.Wishlist) && !hasShownToast.current) {
      toast.error(t("wishlist.no_permission"));
      hasShownToast.current = true;
      rt.push("/");
    }
  }, [role, t]);

  if (!checkPermission(ALL_PERMISSIONS.Wishlist)) return null;

  const { isAuth } = useAuthStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFavoriteItems = () => {
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
        toast.error(t("wishlist.fetch_error"));
      });
  };

  const removeItemHandler = (item) => {
    removeFromFavorite(item)
      .then((res) => {
        toast.success(t("wishlist.removed_success"));
        fetchFavoriteItems();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || t("wishlist.remove_error"));
      });
  };

  useEffect(() => {
    if (!isAuth) return;
    fetchFavoriteItems();
  }, [isAuth]);

  return (
    <Layout>
      <AccountLayout
        title={t("wishlist.title")}
        subTitle={t("wishlist.subtitle")}
      >
        {items && items.length > 0 ? (
          <div className="card">
            <div className="card-body">
              <div className="cart_product border-0">
                {items?.map((item: Product) => (
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
            <h4 className="text-muted mb-4">{t("wishlist.empty_message")}</h4>
            <Link href="/" className="btn btn-primary btn-rounded">
              {t("wishlist.continue_shopping")} &nbsp;{" "}
              <i className="ti-arrow-right"></i>
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
            <Spinner color="#2b2a88" animation="grow" variant="primary" />
          </div>
        )}
      </AccountLayout>
    </Layout>
  );
};

export default Wishlist;
