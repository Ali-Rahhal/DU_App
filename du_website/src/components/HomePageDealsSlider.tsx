import React from "react";
import Slider from "react-slick";
import ProductItem from "./common/ProductItem";
import { useTranslations } from "next-intl";
import { Product } from "@/types/productTypes";
import Link from "next/link";

const HomePageDealsSlider = ({ deals }: { deals: Product[] }) => {
  const t = useTranslations();

  const setting = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    className: "slider arrow-light slider-gap deals-slider",
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  };

  return (
    <section className="homepage-section">
      <div className="container-fluid theme-container">
        <div className="homepage-section-header">
          <h4 className="product-heading">{t("flash_deals")}</h4>

          <Link
            href="/category"
            className="btn btn-outline-primary product-heading-btn"
          >
            {t("see_all")}
          </Link>
        </div>

        {/* Desktop Slider */}
        <div className="desktop-product-slider">
          <Slider {...setting}>
            {deals?.map((item) => (
              <div key={item.item_code} className="deals-slider-item">
                <ProductItem item={item} />
              </div>
            ))}
          </Slider>
        </div>

        {/* Mobile Free Scroll */}
        <div className="mobile-product-scroll">
          {deals?.map((item) => (
            <div key={item.item_code} className="mobile-product-card">
              <ProductItem item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePageDealsSlider;
