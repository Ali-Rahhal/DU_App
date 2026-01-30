import Image from "next/image";
import Link from "next/link";
import React from "react";
import Slider from "react-slick";

const HomePageBannerSlider = ({ banners }) => {
  let setting = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    className: "slider arrow-light slider-gap",
  };

  return (
    <>
      <Slider {...setting}>
        {banners?.map((item, index) => (
          <Link href={item.url} key={index + item.image}>
            <Image
              className="object-fit"
              style={{ cursor: "pointer", objectFit: "cover" }}
              src={item.image}
              alt="slider"
              height={365}
              width={1500}
            />
          </Link>
        ))}
      </Slider>
    </>
  );
};

export default HomePageBannerSlider;
