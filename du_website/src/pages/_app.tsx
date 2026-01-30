import "../styles/theme.scss";
import "react-toastify/dist/ReactToastify.css";
import fr from "../../locales/fr.json";
import en from "../../locales/en.json";
import Head from "next/head";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAccountStore, useAuthStore } from "@/store/zustand";
import { Poppins, Nunito } from "next/font/google";
import dynamic from "next/dynamic";
import { NextIntlClientProvider } from "next-intl";
const ProgressBar = dynamic(
  () => import("next-nprogress-bar").then((mod) => mod.PagesProgressBar),
  { ssr: false }
);
const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false }
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
  const router = useRouter();
  const { refreshUserInfo, refreshCart } = useAccountStore();
  const { isAuth } = useAuthStore();
  const { locale } = router;

  useEffect(() => {
    if (!isAuth) return;
    refreshUserInfo();
    refreshCart();
  }, [router.pathname, isAuth]);

  const messages = locale === "fr" ? fr : en;

  return (
    <>
      <Head>
        <title>Droguerie de L'Union</title>
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

        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className={headingFont.variable + " " + bodyFont.variable}>
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          timeZone="UTC"
        >
          <Component {...pageProps} />
          <ToastContainer />
          <ProgressBar
            height="4px"
            color="#0f4dbc"
            options={{ showSpinner: false }}
            shallowRouting
          />
        </NextIntlClientProvider>
      </div>
    </>
  );
}

export default App;
