import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";

const HomePageBannerSlider = ({ banners }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    className: "slider arrow-light",
    responsive: [
      {
        breakpoint: 576,
        settings: {
          arrows: false,
          swipeToSlide: true,
        },
      },
    ],
  };

  return (
    <section className="home-banner-section">
      <div className="container-fluid theme-container">
        <div className="home-banner-wrapper">
          <Slider {...settings}>
            {banners?.map((item, index) => (
              <Link href={item.url} key={index}>
                <div className="home-banner-image">
                  <Image
                    src={item.image}
                    alt={item.title || "Banner"}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </Link>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default HomePageBannerSlider;
