import Slider from "react-slick";
import ProductItem from "./ProductItem";
import Item from "@/Models/item";

const RelatedProducts = ({ products }: { products: Item[] }) => {
  return (
    <>
      <div className="single-row-slider-area pt-7 pb-7">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12 text-center mb-4">
              <h2>Related Products</h2>
              <p>
                Browse the collection of our related products. <br />
              </p>
            </div>
          </div>

          <Slider
            dots={false}
            infinite={true}
            speed={500}
            slidesToShow={6}
            slidesToScroll={1}
            className="slider arrow-light slider-gap"
            responsive={[
              {
                breakpoint: 480,
                settings: {
                  slidesToShow: 1,
                },
              },
            ]}
          >
            {products?.map((item, index) => (
              <ProductItem key={item.item_code} item={item} />
            ))}
          </Slider>
        </div>
      </div>
    </>
  );
};

export default RelatedProducts;
