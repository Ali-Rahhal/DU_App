import ProductItem from "@/components/common/ProductItem";
import Layout from "@/components/Layout/Layout";
import SearchBar from "@/components/Layout/Navbar/SearchBar";
import Item from "@/Models/item";
import { currenncyCodeToSymbol } from "@/utils";
import { getProducts } from "@/utils/apiCalls";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Spinner, Table } from "react-bootstrap";

export async function getServerSideProps(context: any) {
  let { cat, s } = context.query;
  if (cat === undefined) {
    cat = null;
  }
  // if (!["P", "PP", "NP"].includes(cat)) {
  //   cat = null;
  // }

  const products = await getProducts({
    skip: 0,
    take: 20,
    category_code: cat ? [cat] : null,
    search: s ? s : null,
    cookie: context.req.headers.cookie,
  })
    .then((res) => {
      return res.data.result.products;
    })
    .catch((err) => {
      console.log(err.response.data.message);
    });
  return {
    props: {
      products: products,
      cat: cat,
      s: s ? s : null,
    }, // will be passed to the page component as props
  };
}

const CategoryPage = ({
  products,
  cat,
  s,
}: {
  products: Item[];
  cat: string;
  s: string;
}) => {
  const [layout, setLayout] = useState(
    "three-column" as
      | "three-column"
      | "four-column"
      | "five-column"
      | "list-view"
  );
  const [productsPag, setProductsPag] = useState<Item[]>(products);
  const [reachedEnd, setReachedEnd] = useState(false);
  const rt = useRouter();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (productsPag.length < 20) setReachedEnd(true);
  }, [productsPag]);
  useEffect(() => {
    setLoading(true);
    getProducts({
      skip: 0,
      take: 20,
      category_code: cat ? [cat] : null,
      search: s ? s : null,
      // cookie: context.req.headers.cookie,
    })
      .then((res) => {
        setLoading(false);

        if (res.data.result.products.length < 20) setReachedEnd(true);
        setProductsPag((p) => [...res.data.result.products]);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, [rt.query]);
  const t = useTranslations();
  return (
    <Layout>
      <section className="pt-5 pt-md-7">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-md-8 order-md-2">
              <div className="row shop-header align-items-center">
                <div className="col-lg-6">
                  <div className="grid-icons">
                    <button
                      className={
                        "three-column " +
                        (layout === "three-column" ? "active" : "")
                      }
                      onClick={() => {
                        setLayout("three-column");
                      }}
                    ></button>
                    {/* <button className="four-column d-none d-lg-block"></button>
                    <button className="five-column d-none d-lg-block"></button> */}
                    <button
                      className={
                        "list-view " + (layout === "list-view" ? "active" : "")
                      }
                      onClick={() => {
                        setLayout("list-view");
                      }}
                    ></button>
                  </div>
                </div>

                {/* <div className="col-lg-6 text-lg-right">
                  <div className="single-select-block d-inline-block">
                    <span className="select-title">Show:</span>
                    <select className="wide border-0">
                      <option value="1">10</option>
                      <option value="2">20</option>
                      <option value="3">30</option>
                      <option value="4">40</option>
                    </select>
                  </div>

                  <div className="single-select-block d-inline-block">
                    <span className="select-title">Sort By:</span>
                    <select className="wide border-0">
                      <option value="1">Default</option>
                      <option value="2">Name (A-Z)</option>
                      <option value="3">Price (min - max)</option>
                      <option value="4">Color</option>
                    </select>
                  </div>
                </div> */}
              </div>
              {layout === "three-column" ? (
                <div
                  className="row"
                  // style={{
                  //   maxHeight: "100vh",
                  //   overflowY: "auto",
                  // }}
                  // onScroll={(e) => {
                  //   //reached end of page console.log("end of page");
                  //   if (
                  //     e.currentTarget.scrollHeight -
                  //       e.currentTarget.scrollTop ===
                  //     e.currentTarget.clientHeight
                  //   ) {
                  //     getProducts({
                  //       skip: productsPag.length,
                  //       take: 20,
                  //       category_code: cat ? [cat] : null,
                  //       search: s ? s : null,
                  //       // cookie: context.req.headers.cookie,
                  //     })
                  //       .then((res) => {
                  //         setProductsPag((p) => [
                  //           ...p,
                  //           ...res.data.result.products,
                  //         ]);
                  //       })
                  //       .catch((err) => {
                  //         console.log(err.response.data.message);
                  //       });
                  //   }
                  // }}
                >
                  {productsPag?.map((item, index) => (
                    <div
                      key={item.item_code}
                      className="col-md-4 col-sm-6 col-12"
                    >
                      <ProductItem item={item} />
                    </div>
                  ))}
                </div>
              ) : (
                <Table bordered hover responsive>
                  <thead>
                    <tr>
                      <th>{t("image")}</th>
                      <th>{t("name")}</th>
                      <th>{t("price")}</th>
                      <th>{t("old_price")}</th>
                      <th>{t("category")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsPag?.map((item, index) => {
                      let oldPrice = parseFloat(item?.price);
                      let price = parseFloat(item?.discountedPrice);
                      return (
                        <tr
                          key={item.item_code}
                          onClick={() => {
                            rt.push(`/products/${item.item_code}`);
                          }}
                        >
                          <td>
                            <img
                              src={
                                item.image
                                  ? item.image
                                  : process.env
                                      .NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE
                              }
                              alt={item.name}
                              style={{
                                maxWidth: "100px",
                              }}
                              className="img-fluid"
                            />
                          </td>
                          <td>{item.name}</td>
                          <td
                            style={{
                              color: "#2b8a3e",
                            }}
                          >
                            {" "}
                            {price.toLocaleString()}{" "}
                            {currenncyCodeToSymbol(item.currency_code)}
                          </td>
                          <td
                            style={{
                              textDecoration: "line-through",
                            }}
                          >
                            {" "}
                            {oldPrice.toLocaleString()}{" "}
                            {currenncyCodeToSymbol(item.currency_code)}
                          </td>
                          <td>{item.category}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
              {productsPag.length === 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "50vh",
                  }}
                >
                  <h5>{t("no_products")}</h5>
                </div>
              )}
              {!reachedEnd && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingBottom: 20,
                  }}
                >
                  <Button
                    style={{
                      width: loading ? 50 : "100%",
                      height: 50,
                      borderRadius: loading ? "50%" : "6px",
                      transition: "all 0.2s",
                      textAlign: "center",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 0,
                    }}
                    onClick={() => {
                      setLoading(true);
                      getProducts({
                        skip: productsPag.length,
                        take: 20,
                        category_code: cat ? [cat] : null,
                        search: s ? s : null,
                        // cookie: context.req.headers.cookie,
                      })
                        .then((res) => {
                          setLoading(false);
                          if (res.data.result.products.length < 20)
                            setReachedEnd(true);
                          setProductsPag((p) => [
                            ...p,
                            ...res.data.result.products,
                          ]);
                        })
                        .catch((err) => {
                          setLoading(false);
                        });
                    }}
                  >
                    {!loading ? (
                      t("load_more")
                    ) : (
                      <Spinner animation="border" size="sm" />
                    )}
                  </Button>
                </div>
              )}
            </div>
            <div className="col-md-3 order-md-1">
              {/* <div className="sidebar-wrapper mt-5 mt-md-0">
                <div className="sidebar-widget widget_categories">
                  <h6 className="widget-title mb-2">Price</h6>
                  <div className="px-3">
                    <div
                      className="range-slider range-slider-ui"
                      id="nouislider"
                      data-start-min="250"
                      data-start-max="680"
                      data-min="0"
                      data-max="1000"
                      data-step="1"
                    ></div>
                  </div>
                </div>
              </div> */}
              <div className="sidebar-wrapper mt-5 mt-md-0">
                <div className="sidebar-widget widget_categories">
                  <h6 className="widget-title mb-2">{t("search")}</h6>
                  <div className="px-0">
                    <SearchBar showSearch={false} />
                  </div>
                </div>
                {/* <div className="sidebar-widget widget_categories">
                  <h6 className="widget-title mb-2">Filters</h6>
                  <ul>
                    <li>
                      <Link href="/category?cat=P">Pharma</Link>
                    </li>
                    <li>
                      <Link href="/category?cat=PP">ParaPharma</Link>
                    </li>
                    <li>
                      <Link href="/category?cat=NP">Non Pharma</Link>
                    </li>
                  </ul>
                </div> */}
              </div>

              {/* <div className="sidebar-wrapper mt-5 mt-md-0">
                <div className="sidebar-widget widget_categories">
                  <h6 className="widget-title">Category</h6>
                  <ul
                    className="widget-list widget-filter-list list-unstyled pt-1"
                    style={{ maxHeight: "11rem" }}
                    data-simplebar
                    data-simplebar-auto-hide="false"
                  >
                    <li className="widget-filter-item d-flex justify-content-between align-items-center mb-1">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="brand-13"
                        />
                        <label className="form-check-label widget-filter-item-text">
                          Pharma
                        </label>
                      </div>
                      <span className="fs-xs text-muted">425</span>
                    </li>
                    <li className="widget-filter-item d-flex justify-content-between align-items-center mb-1">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="brand-23"
                        />
                        <label className="form-check-label widget-filter-item-text">
                          ParaPharma
                        </label>
                      </div>
                      <span className="fs-xs text-muted">15</span>
                    </li>
                    <li className="widget-filter-item d-flex justify-content-between align-items-center mb-1">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="Brandina3"
                        />
                        <label className="form-check-label widget-filter-item-text">
                          Non Pharma
                        </label>
                      </div>
                      <span className="fs-xs text-muted">18</span>
                    </li>
                  </ul>
                </div> */}
              {/* </div> */}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CategoryPage;
