import { useRouter } from "next/router";
import React, { useEffect } from "react";

const NotFound = () => {
  return <div>404</div>;
};

export default NotFound;

export async function getStaticProps() {
  //redirect to home page
  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
}
