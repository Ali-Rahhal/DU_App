import Image from "next/image";
import Link from "next/link";
import React from "react";
import Slider from "react-slick";

const HomePageSlider = ({ banners }) => {
  const setting = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    swipeToSlide: true,
    touchThreshold: 15,
    arrows: true,

    autoplay: true,
    autoplaySpeed: 3000,

    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          arrows: true,
          swipeToSlide: true,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          arrows: false,
          swipeToSlide: true,
        },
      },
    ],

    className: "slider arrow-light slider-gap homepage-banner-slider",
  };

  return (
    <section className="homepage-section">
      <Slider {...setting}>
        {banners?.map((item, index) => (
          <div key={index + item.image} className="homepage-banner-item">
            <Link href={item.url || "#"}>
              <div className="homepage-banner-image">
                <Image
                  src={item.image}
                  alt="banner"
                  fill
                  sizes="(max-width:576px) 90vw, 50vw"
                />
              </div>
            </Link>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default HomePageSlider;
