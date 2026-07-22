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
import { useCompanyAssets } from "@/hooks/useCompanyAssets";
const ProgressBar = dynamic(
  () => import("next-nprogress-bar").then((mod) => mod.PagesProgressBar),
  { ssr: false },
);
const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false },
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
  const { isAuth, logout } = useAuthStore();
  const { locale } = router;
  const { companyHydrated, companyDisabled, companyName, companyFavicon } =
    useCompanyAssets();

  useEffect(() => {
    if (!companyHydrated) return;

    if (companyDisabled) {
      logout();
      router.push("/login");
    }
  }, [companyHydrated, companyDisabled]);

  useEffect(() => {
    if (!isAuth) return;
    refreshUserInfo();
    refreshCart();
  }, [router.pathname, isAuth]);

  const messages = locale === "fr" ? fr : en;

  return (
    <>
      <Head>
        <title>{companyHydrated ? companyName : "Loading..."}</title>
        <meta name="description" content="" />
        <link rel="icon" href={companyHydrated ? companyFavicon : ""} />

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
