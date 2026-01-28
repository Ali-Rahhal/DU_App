import "../styles/theme.scss";
import "react-toastify/dist/ReactToastify.css";
// import { wrapper } from "@/store";
import Head from "next/head";
import { SSRProvider } from "react-bootstrap";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAccountStore, useAuthStore } from "@/store/zustand";
import { Poppins, Nunito } from "next/font/google";
import dynamic from "next/dynamic";
// import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
const ProgressBar = dynamic(
  () => import("next-nprogress-bar").then((mod) => mod.PagesProgressBar),
  {
    ssr: false,
  }
);
const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  {
    ssr: false,
  }
);
const headingFont = Poppins({
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  subsets: ["latin"],
  variable: "--heading-font",
});
const bodyFont = Nunito({
  weight: ["200", "300", "400", "600", "700", "800", "900"],
  display: "swap",
  subsets: ["latin"],
  variable: "--body-font",
});
function App({ Component, pageProps }) {
  //   const { store, props } = wrapper.useWrappedStore(rest);
  const { pathname } = useRouter();
  const { refreshUserInfo, refreshCart } = useAccountStore();
  const { isAuth } = useAuthStore();
  useEffect(() => {
    if (!isAuth) return;
    refreshUserInfo();
    refreshCart();
  }, [pathname, isAuth]);

  //   --heading-font: "Poppins", serif;
  // var(--body-font): "Nunito", serif;

  return (
    <>
      <SSRProvider>
        <Head>
          <title>Droguerie de L&apos;Union</title>
          <meta
            name="description"
            content="
             Droguerie de L'Union Pharmaceutical Company is a leading pharmaceutical company in Lebanon. 
             We are committed to providing high-quality, affordable, and innovative solutions to our customers.
             Our products are manufactured in state-of-the-art facilities and are subject to rigorous quality control standards. 
             We offer a wide range of products, including prescription and over-the-counter medications, vitamins, supplements, and personal care items. 
             Our team of experts is dedicated to providing exceptional customer service and support. 
             We are proud to be a trusted partner in the health and well-being of our customers.
          "
          />
          <link rel="icon" href="/assets/img/favicon.png" />
        </Head>

        <div className={headingFont.variable + " " + bodyFont.variable}>
          <Component {...pageProps} />
          <ToastContainer />
          <ProgressBar
            height="4px"
            color="#0f4dbc"
            options={{ showSpinner: false }}
            shallowRouting
          />
        </div>
      </SSRProvider>
    </>
  );
}

export default App;
