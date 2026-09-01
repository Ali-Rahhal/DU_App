import Footer from "./Footer";
import Navbar from "./Navbar/Navbar";

interface LayoutProps {
  children: React.ReactNode;
  showMobileNavbar?: boolean;
  showBottomNavbar?: boolean;
}

const Layout = ({
  children,
  showMobileNavbar = false,
  showBottomNavbar = true,
}: LayoutProps) => {
  return (
    <>
      <Navbar
        showMobileNavbar={showMobileNavbar}
        showBottomNavbar={showBottomNavbar}
      />

      <main className="main">{children}</main>

      <Footer />
    </>
  );
};

export default Layout;
