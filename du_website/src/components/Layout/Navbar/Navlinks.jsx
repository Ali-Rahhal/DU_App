import Link from "next/link";

const Navlinks = () => {
  return (
    <>
      <div className="header-links">
        <div className="container-fluid theme-container">
          <ul className="header-links-container">
            {/* <li className="header-links-item">
              <div className="header-childrenItem-parent">
                <Link href="#">
                  <span className="header-childrenItem-link-text">
                    Pharma
                  </span>
                </Link>
                <i className="fa fa-angle-down drop-icon"></i>
              </div>
              <div className="header-childrenItem-child-category-links">
                <ul className="header-childrenItem-child-list">
                  <li>
                    <Link href="category" className="childItem-level-2">
                      <span className="header-childrenItem-link-text">
                        Medicines One
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="category" className="childItem-level-2">
                      <span className="header-childrenItem-link-text">
                        Medicines Two
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="category" className="childItem-level-2">
                      <span className="header-childrenItem-link-text">
                        Medicines Three
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </li> */}
            <li
              className="header-links-item"
              style={{
                display: "flex",
                gap: "20px",
              }}
            >
              <div className="header-childrenItem-parent">
                <Link href="/category?cat=P">
                  <span className="header-childrenItem-link-text">Pharma</span>
                </Link>
              </div>
              <div className="header-childrenItem-parent">
                <Link href="/category?cat=PP">
                  <span className="header-childrenItem-link-text">
                    Para Pharma
                  </span>
                </Link>
              </div>
              <div className="header-childrenItem-parent">
                <Link href="/category?cat=NP">
                  <span className="header-childrenItem-link-text">
                    Non Pharma
                  </span>
                </Link>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navlinks;
