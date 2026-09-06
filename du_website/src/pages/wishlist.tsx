import ProductItemList from "@/components/common/ProductItemList";
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

import { Heart, ArrowRight } from "lucide-react";

import { Product } from "@/types/productTypes";

const Wishlist = () => {
  // Authorization Check
  const router = useRouter();
  const { role, checkPermission } = useAccountStore();
  const hasShownToast = useRef(false);

  const t = useTranslations();
  const { isAuth } = useAuthStore();

  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!checkPermission(ALL_PERMISSIONS.Wishlist) && !hasShownToast.current) {
      toast.error(t("wishlist.no_permission"));
      hasShownToast.current = true;
      router.push("/");
    }
  }, [role, t, router, checkPermission]);

  const fetchFavoriteItems = async () => {
    try {
      setLoading(true);

      const res = await getFavoriteItems({
        skip: 0,
        take: 20,
      });

      setItems(res.data.result.products || []);
    } catch (error) {
      toast.error(t("wishlist.fetch_error"));
    } finally {
      setLoading(false);
    }
  };

  const removeItemHandler = async (item) => {
    try {
      await removeFromFavorite(item);

      toast.success(t("wishlist.removed_success"));

      await fetchFavoriteItems();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("wishlist.remove_error"));
    }
  };

  useEffect(() => {
    if (!isAuth || !checkPermission(ALL_PERMISSIONS.Wishlist)) return;

    fetchFavoriteItems();
  }, [isAuth, role]);

  if (!checkPermission(ALL_PERMISSIONS.Wishlist)) {
    return null;
  }

  return (
    <Layout>
      <div className="wishlist-page">
        {/* Page Header */}
        <section className="wishlist-page-header">
          <div className="wishlist-page-header-content">
            <div className="wishlist-page-header-icon">
              <Heart size={24} />
            </div>

            <div className="wishlist-page-heading">
              <h1 className="wishlist-page-title">{t("wishlist.title")}</h1>

              <p className="wishlist-page-subtitle">{t("wishlist.subtitle")}</p>
            </div>
          </div>
        </section>

        {/* Wishlist Content */}
        <section className="wishlist-results-section">
          {loading ? (
            <div className="wishlist-loading">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : items.length > 0 ? (
            <div className="wishlist-container">
              {/* Wishlist Summary */}
              <div className="wishlist-summary">
                <div className="wishlist-summary-content">
                  <div className="wishlist-summary-icon">
                    <Heart size={18} />
                  </div>

                  <div className="wishlist-summary-text">
                    <h2>{t("wishlist.title")}</h2>

                    <span>
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wishlist Items */}
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
          ) : (
            <div className="wishlist-empty">
              <div className="wishlist-empty-icon">
                <Heart size={28} />
              </div>

              <h2>{t("wishlist.empty_message")}</h2>

              <p>{t("wishlist.subtitle")}</p>

              <Link href="/" className="btn btn-primary wishlist-shopping-btn">
                <span>{t("wishlist.continue_shopping")}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Wishlist;
