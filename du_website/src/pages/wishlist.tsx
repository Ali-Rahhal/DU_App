import ProductItemList from "@/components/common/ProductItemList";
import AccountLayout from "@/components/dashboard/AccountLayout";
import Layout from "@/components/Layout/Layout";

import { useAuthStore, useAccountStore } from "@/store/zustand";
import { getFavoriteItems, removeFromFavorite } from "@/utils/apiCalls";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

import { ALL_PERMISSIONS } from "@/utils/data";
import { useRouter } from "next/router";
import { Product } from "@/types/productTypes";

const Wishlist = () => {
  // Authorization Check
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

  const [items, setItems] = useState<Product[]>([]);
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
        <div className="wishlist-page">
          {items && items.length > 0 ? (
            <div className="wishlist-container">
              <div className="wishlist-header">
                <div className="wishlist-header-content">
                  <div className="wishlist-header-icon">
                    <i className="ti-heart"></i>
                  </div>

                  <div>
                    <h4>{t("wishlist.title")}</h4>
                    <span>
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="wishlist-items">
                {items.map((item: Product) => (
                  <div className="wishlist-item-wrapper" key={item.item_code}>
                    <ProductItemList
                      item={item}
                      withRemove
                      removeItemHandler={removeItemHandler}
                      size="large"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : !loading ? (
            <div className="wishlist-empty">
              <div className="wishlist-empty-icon">
                <i className="ti-heart"></i>
              </div>

              <h4>{t("wishlist.empty_message")}</h4>

              <p>{t("wishlist.subtitle")}</p>

              <Link
                href="/"
                className="btn btn-primary btn-rounded wishlist-shopping-btn"
              >
                {t("wishlist.continue_shopping")}
                <i className="ti-arrow-right ml-2"></i>
              </Link>
            </div>
          ) : (
            <div className="wishlist-loading">
              <Spinner animation="grow" variant="primary" />
            </div>
          )}
        </div>
      </AccountLayout>
    </Layout>
  );
};

export default Wishlist;
