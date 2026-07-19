import Link from "next/link";
import ProductItem from "./common/ProductItem";
import { useTranslations } from "next-intl";
import { Product } from "@/types/productTypes";

const HomePageDealsOfTheDay = ({ deals }: { deals: Product[] }) => {
  const t = useTranslations("");

  return (
    <section className="homepage-section deals-day-section">
      <div className="container-fluid theme-container">
        <div className="homepage-section-header">
          <h4 className="product-heading">{t("deals_of_the_day")}</h4>

          <Link
            href="/category"
            className="btn btn-outline-primary product-heading-btn"
          >
            {t("see_all")}
          </Link>
        </div>

        <div className="deals-day-grid">
          {deals?.map((item) => (
            <div key={item.item_code} className="deals-day-item">
              <ProductItem item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePageDealsOfTheDay;
