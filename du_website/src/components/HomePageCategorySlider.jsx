import React from "react";
import Slider from "react-slick";
import CategoryItem from "./common/CategoryItem";
import { useTranslations } from "next-intl";

const HomePageCategorySlider = ({ categorys }) => {
  const t = useTranslations();

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    className: "slider arrow-light homepage-category-slider",
    responsive: [
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1.15,
          arrows: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          arrows: false,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  };

  return (
    <section className="homepage-category-section">
      <div className="container-fluid theme-container">
        <div className="homepage-section-header">
          <h4>{t("shop_by_category")}</h4>
        </div>

        <Slider {...settings}>
          {categorys?.map((item, index) => (
            <div key={index + item.image} className="homepage-category-slide">
              <CategoryItem {...item} />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default HomePageCategorySlider;
