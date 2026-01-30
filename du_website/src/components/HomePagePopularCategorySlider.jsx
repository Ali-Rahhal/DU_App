import React from "react";
import Slider from "react-slick";
import BrandItem from "./common/BrandItem";
import { useTranslations } from "next-intl";

const HomePagePopularCategorySlider = ({ categorys }) => {
  let setting = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 8,
    slidesToScroll: 1,
    className: "slider arrow-light slider-gap",
    responsive: [
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 3,
          arrows: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
          arrows: false,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: 6,
        },
      },
    ],
  };
  const t = useTranslations();
  return (
    <>
      <div className="pt-4 pt-md-5">
        <div className="py-5 bg-light">
          <div className="container-fluid theme-container">
            <div className="row mb-2">
              <div className="col">
                <h5 className="product-heading">{t("popular_categories")}</h5>
              </div>
              <div className="col-auto text-md-right">
                <a
                  href="category"
                  className="btn btn-primary btn-sm product-heading-btn"
                >
                  {t("see_all")}
                </a>
              </div>
            </div>
          </div>
          <Slider {...setting}>
            {categorys?.map((item, index) => (
              <BrandItem key={index + item.image} {...item} />
            ))}
          </Slider>
        </div>
      </div>
    </>
  );
};

export default HomePagePopularCategorySlider;
