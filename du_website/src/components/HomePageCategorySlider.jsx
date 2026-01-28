import React from "react";
import Slider from "react-slick";
import CategoryItem from "./common/CategoryItem";

const HomePageCategorySlider = ({ categorys }) => {
  let setting = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    className: "slider arrow-light slider-gap",
    responsive: [
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
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
        breakpoint: 1300,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  };

  return (
    <>
      <div className="pt-4 pt-md-5">
        <div className="container-fluid theme-container">
          <Slider {...setting}>
            {categorys?.map((item, index) => (
              <CategoryItem key={index + item.image} {...item} />
            ))}
          </Slider>
        </div>
      </div>
    </>
  );
};

export default HomePageCategorySlider;
