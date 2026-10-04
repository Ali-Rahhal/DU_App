import React from "react";
import { getProducts } from "@/utils/apiCalls";
import { useCompanyAssets } from "@/hooks/useCompanyAssets";
import Dashboard from "./dashboard";

const getAllProducts = async (onSale, cookie) => {
  return await getProducts(
    {
      skip: 0,
      take: 20,
      onSale: onSale,
      containExpiryDealProducts: true,
    },
    cookie,
  ).then((res) => {
    return res.data.result;
  });
};
export async function getServerSideProps(context: any) {
  // const request = await fetch(`${server}/static/products.json`);
  // const dataa = await request.json();
  const cookie = context.req.headers.cookie || "";
  const data = await getAllProducts(false, cookie);
  return {
    props: {
      items_count: data.items_count,
      products: data.products,
    }, // will be passed to the page component as props
  };
}

const HomePage = ({ products }) => {
  const { companyHydrated, companyId } = useCompanyAssets();
  return (
    <>
      <Dashboard />
    </>
  );
};

export default HomePage;
