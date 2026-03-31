import ProductItem from "./ProductItem";
import Item from "@/Models/item";

const RelatedProducts = ({ products }: { products: Item[] }) => {
  return (
    <div className="related-products-area py-5">
      <div className="container">
        {/* Section header */}
        <div className="text-center mb-4">
          <h2 className="h3 fw-semibold">Related Products</h2>
          <p className="text-muted mt-2">
            Browse the collection of our related products.
          </p>
        </div>

        {/* Bootstrap Grid */}
        <div className="row g-3">
          {products?.map((item) => (
            <div
              key={item.item_code}
              className="col-6 col-md-4 col-lg-3 d-flex justify-content-center"
            >
              <div style={{ maxWidth: "250px", width: "100%" }}>
                <ProductItem item={item} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;
