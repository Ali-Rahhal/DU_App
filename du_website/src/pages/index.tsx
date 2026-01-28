import HomePageBannerSlider from "@/components/HomePageBannerSlider";
import HomePageCategorySlider from "@/components/HomePageCategorySlider";
import HomePageBrandSlider from "@/components/HomePageBrandSlider";
import HomePageDealsOfTheDay from "@/components/HomePageDealsOfTheDay";
import HomePageDealsSlider from "@/components/HomePageDealsSlider";
import HomePageOffers from "@/components/HomePageOffers";
import HomePagePopularCategorySlider from "@/components/HomePagePopularCategorySlider";
import {
  brandSlider,
  popularCategorySlider,
  categorySlider,
  homeOffer,
  homeSlider,
} from "@/utils/data";
import React from "react";
import Layout from "@/components/Layout/Layout";
import { server } from "@/utils";
import { getProducts } from "@/utils/apiCalls";
const getAllProducts = async (onSale, cookie) => {
  return await getProducts({
    skip: 0,
    take: 20,
    onSale: onSale,
    cookie: cookie,
  }).then((res) => {
    return res.data.result;
  });
};
export async function getServerSideProps() {
  // const request = await fetch(`${server}/static/products.json`);
  // const dataa = await request.json();

  const data = await getAllProducts(false, null);
  return {
    props: {
      items_count: data.items_count,
      products: data.products,
    }, // will be passed to the page component as props
  };
}

const HomePage = ({ products }) => {
  return (
    <Layout>
      <HomePageBannerSlider banners={homeSlider} />
      <HomePageCategorySlider categorys={categorySlider} />{" "}
      <HomePageDealsSlider deals={products} />
      <HomePageOffers offers={homeOffer} />
      <HomePageDealsOfTheDay deals={products} />
      <HomePageBrandSlider brands={brandSlider} />
      <HomePageDealsSlider deals={products} />
      <HomePagePopularCategorySlider categorys={popularCategorySlider} />
      <HomePageDealsSlider deals={products} />
    </Layout>
  );
};

export default HomePage;
