import ProductDetails from "@/components/common/ProductDetails";
import RelatedProducts from "@/components/common/RelatedProducts";
import Layout from "@/components/Layout/Layout";
// import { findProductIndex, server } from "@/utils";
import { getItemAlternatives, getProduct, getProducts } from "@/utils/apiCalls";

export async function getServerSideProps(context: any) {
  const cookie = context.req.headers.cookie || "";

  // 1. Get main product
  const product = await getProduct(context.query.slug, cookie).then(
    (res) => res.data.result,
  );

  let products: any[] = [];

  try {
    // 2. Check if product has alternatives
    const alternatives = await getItemAlternatives(product.item_code).then(
      (res) => res.data.result,
    );

    if (alternatives.length > 0) {
      // ✅ Fetch all alternatives in parallel (IMPORTANT)
      const altPromises = alternatives.map((alt) =>
        getProduct(alt.alternative_item_code, cookie),
      );

      const altResponses = await Promise.all(altPromises);

      products = altResponses.map((res) => res.data.result);
    } else {
      // ✅ Fallback to category products (existing logic)
      const res = await getProducts(
        {
          skip: 0,
          take: 20,
          category_code: [product?.cat_code],
        },
        cookie,
      );

      products = res.data.result.products;
    }
  } catch (err: any) {
    console.log(err?.response?.data?.message || err.message);
  }

  return {
    props: {
      product,
      products: products || [],
    },
  };
}

const ProductId = ({ product, products }) => {
  if (!product) {
    return <Layout>Product Not Found</Layout>;
  }

  return (
    <>
      <Layout>
        <ProductDetails product={product} />
        <RelatedProducts products={products} />
      </Layout>
    </>
  );
};

export default ProductId;
