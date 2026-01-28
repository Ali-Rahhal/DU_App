import React from "react";
import Slider from "react-slick";
import ProductItem from "./common/ProductItem";

const HomePageDealsSlider = ({ deals }) => {
  let setting = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    className: "slider arrow-light slider-2 slider-gap",
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
          slidesToShow: 3,
          arrows: false,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: 5,
        },
      },
    ],
  };

  return (
    <>
      <div className="pt-4 pt-md-5">
        <div className="container-fluid theme-container">
          <div className="row mb-4">
            <div className="col">
              <h5 className="product-heading">Flash deals</h5>
            </div>
            <div className="col-auto text-md-right">
              <a
                href="category"
                className="btn btn-primary btn-sm product-heading-btn"
              >
                See All
              </a>
            </div>
          </div>
          <Slider {...setting}>
            {deals?.map((item, index) => (
              <ProductItem key={index + item.image} item={item} />
            ))}
          </Slider>
        </div>
      </div>
    </>
  );
};

export default HomePageDealsSlider;
