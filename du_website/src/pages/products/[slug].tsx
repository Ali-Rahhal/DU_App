import ProductDetails from "@/components/common/ProductDetails";
import RelatedProducts from "@/components/common/RelatedProducts";
import Layout from "@/components/Layout/Layout";
// import { findProductIndex, server } from "@/utils";
import { getCookieArray, getProduct, getProducts } from "@/utils/apiCalls";

const ProductId = ({ product, products }) => {
  if (!product) {
    return <Layout>Produt Not Found</Layout>;
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
export async function getServerSideProps(context: any) {
  const cookie = getCookieArray(context.req.headers.cookie).find((cookie) =>
    cookie.name.includes("auth")
  );
  const product = await getProduct(context.query.slug, cookie).then((res) => {
    return res.data.result;
  });

  const products = await getProducts({
    skip: 0,
    take: 20,
    cookie: cookie,
    category_code: [product.cat_code],
  })
    .then((res) => {
      return res.data.result.products;
    })
    .catch((err) => {
      console.log(err.response.data.message);
    });

  return {
    props: {
      product: product,
      products: products || [],
    },
  };
}
