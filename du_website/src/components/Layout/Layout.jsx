import { NextIntlClientProvider } from "next-intl";
import Announcement from "./Announcement";
import Footer from "./Footer";
import Navbar from "./Navbar/Navbar.tsx";

const Layout = ({ children }) => {
  return (
    <>
      <Announcement />
      <Navbar />

      <main className="main">{children}</main>

      <Footer />
    </>
  );
};

export default Layout;
