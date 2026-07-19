import React from "react";
import Slider from "react-slick";
import BrandItem from "./common/BrandItem";
import { useTranslations } from "next-intl";
import Link from "next/link";

const HomePagePopularCategorySlider = ({ categorys }) => {
  const t = useTranslations();

  const setting = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 8,
    slidesToScroll: 1,
    className: "slider arrow-light popular-category-slider",

    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 7,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 6,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 5,
        },
      },
    ],
  };

  return (
    <section className="popular-category-section">
      <div className="container-fluid theme-container">
        <div className="homepage-section-header">
          <h4 className="product-heading">{t("popular_categories")}</h4>

          <Link
            href="/category"
            className="btn btn-outline-primary product-heading-btn"
          >
            {t("see_all")}
          </Link>
        </div>

        {/* Desktop */}
        <div className="desktop-category-slider">
          <Slider {...setting}>
            {categorys?.map((item, index) => (
              <div key={index + item.image} className="popular-category-item">
                <BrandItem {...item} />
              </div>
            ))}
          </Slider>
        </div>

        {/* Mobile */}
        <div className="mobile-category-scroll">
          {categorys?.map((item, index) => (
            <div key={index + item.image} className="mobile-category-card">
              <BrandItem {...item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePagePopularCategorySlider;
