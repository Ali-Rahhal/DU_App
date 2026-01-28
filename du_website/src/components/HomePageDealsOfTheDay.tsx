import Link from "next/link";
import ProductItem from "./common/ProductItem";
import Item from "@/Models/item";

const HomePageDealsOfTheDay = ({ deals }: { deals: Item[] }) => {
  return (
    <>
      <div className="pt-4 pt-md-5">
        <div className="container-fluid theme-container">
          <div className="row mb-4">
            <div className="col">
              <h5 className="product-heading">Deals of the day</h5>
            </div>
            <div className="col-auto text-md-right">
              <Link
                href="/category"
                className="btn btn-primary btn-sm product-heading-btn"
              >
                See All
              </Link>
            </div>
          </div>
          <div className="row">
            {deals?.map((item, index) => (
              <div
                key={index + item.item_code}
                className="col-md-3 col-lg-2 col-sm-4 col-6"
              >
                <ProductItem item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePageDealsOfTheDay;
