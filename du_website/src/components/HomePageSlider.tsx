import Image from "next/image";
import Link from "next/link";
import React from "react";
import Slider from "react-slick";

const HomePageSlider = ({ banners }) => {
  let setting = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,

    autoplaySpeed: 2000,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
        },
      },
      // {
      //   breakpoint: 600,
      //   settings: {
      //     slidesToShow: 2,
      //     slidesToScroll: 2,
      //     initialSlide: 2,
      //   },
      // },
    ],
    className: "slider arrow-light slider-gap",
  };
  // 1614x1611
  return (
    <>
      <Slider {...setting}>
        {banners?.map((item, index) => (
          <Link href={item.url} key={index + item.image}>
            <Image
              style={{
                cursor: "pointer",
                objectFit: "cover",
                width: "100%",
                height: "100%",
              }}
              src={item.image}
              alt="slider"
              width={1614}
              height={1400}
              layout="responsive"
            />
          </Link>
        ))}
      </Slider>
    </>
  );
};

export default HomePageSlider;
