import Image from "next/image";
import { useRef } from "react";
import Slider from "react-slick";

const ThumbSlider = ({ images }) => {
  const nav2 = useRef(null);
  const nav1 = useRef(null);
  return (
    <>
      <div className="big-image-wrapper">
        <Slider
          dots={false}
          infinite={true}
          speed={500}
          slidesToShow={1}
          slidesToScroll={1}
          asNavFor={nav2?.current}
          ref={nav1}
          className="product-details-big-image-slider-wrapper slider-for"
          arrows={false}
          autoplay={false}
        >
          {images?.map((item, index) => (
            <div className="single-image" key={index}>
              <Image src={item} alt="slider" height={1050} width={500} />
            </div>
          ))}
        </Slider>
        <Slider
          asNavFor={nav1?.current}
          ref={nav2}
          dots={false}
          infinite={true}
          speed={500}
          slidesToShow={1}
          slidesToScroll={1}
          swipeToSlide={true}
          focusOnSelect={true}
          centerMode={true}
          arrows={false}
          autoplay={false}
          className="slider-nav product-details-small-image-slider-wrapper"
        >
          {images?.map((item, index) => (
            <div className="single-image" key={index}>
              <Image src={item} alt="slider" height={150} width={50} />
            </div>
          ))}
        </Slider>
      </div>
    </>
  );
};

export default ThumbSlider;
