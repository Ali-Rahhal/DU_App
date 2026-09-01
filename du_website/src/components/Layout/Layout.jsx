import Announcement from "./Announcement";
import Footer from "./Footer";
import Navbar from "./Navbar/Navbar.tsx";

const Layout = ({ children }) => {
  return (
    <>
      <div className="top-navigation">
        <Navbar />
      </div>

      <main className="main">{children}</main>

      <Footer />
    </>
  );
};

export default Layout;
