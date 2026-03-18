import ProductItem from "@/components/common/ProductItem";
import Layout from "@/components/Layout/Layout";
import SearchBar from "@/components/Layout/Navbar/SearchBar";
import Item from "@/Models/item";
import { getProducts } from "@/utils/apiCalls";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Spinner, Form, Row, Col, Collapse } from "react-bootstrap";

/* ---------------- SERVER SIDE ---------------- */

export async function getServerSideProps(context: any) {
  let { cat, s, promo } = context.query;

  const cookie = context.req.headers.cookie || "";

  const products = await getProducts(
    {
      skip: 0,
      take: 20,
      category_code: cat ? [cat] : null,
      search: s ? s : null,
      onPromotionOnly: promo ? true : false,
    },
    cookie,
  ).then((res) => res.data.result.products);

  return {
    props: {
      products,
      cat: cat ?? null,
      s: s ?? null,
    },
  };
}

/* ---------------- FILTER COMPONENT ---------------- */

const Filters = ({
  s,
  activeCat,
  onPromotionOnly,
  setOnPromotionOnly,
}: any) => {
  const router = useRouter();
  const t = useTranslations();

  const clearSearch = () => {
    router.push({
      pathname: "/category",
      query: {
        promo: onPromotionOnly ? "true" : undefined,
      },
    });
  };

  const handlePromoChange = (val: boolean) => {
    setOnPromotionOnly(val);

    router.push({
      pathname: "/category",
      query: {
        ...router.query,
        promo: val ? "true" : undefined,
      },
    });
  };

  return (
    <div className="p-3 border rounded bg-light mb-3">
      <div className="mb-3">
        <h6>{t("search")}</h6>

        <div className="d-flex gap-2">
          <div style={{ flex: 1 }}>
            <SearchBar showSearch={false} />
          </div>

          {s && (
            <Button size="sm" variant="outline-secondary" onClick={clearSearch}>
              Clear
            </Button>
          )}
        </div>
      </div>

      <hr />

      <h6>Category</h6>

      <div className="d-grid gap-2 mb-3 d-md-flex flex-md-column">
        <Link
          href={{
            pathname: "/category",
            query: {
              promo: onPromotionOnly ? "true" : undefined,
            },
          }}
          className={`btn btn-sm ${!activeCat ? "btn-primary" : "btn-outline-primary"}`}
        >
          All
        </Link>
        <Link
          href={{
            pathname: "/category",
            query: {
              cat: "P",
              promo: onPromotionOnly ? "true" : undefined,
            },
          }}
          className={`btn btn-sm ${activeCat === "P" ? "btn-primary" : "btn-outline-primary"}`}
        >
          Pharma
        </Link>
        <Link
          href={{
            pathname: "/category",
            query: {
              cat: "PP",
              promo: onPromotionOnly ? "true" : undefined,
            },
          }}
          className={`btn btn-sm ${activeCat === "PP" ? "btn-primary" : "btn-outline-primary"}`}
        >
          ParaPharma
        </Link>
        <Link
          href={{
            pathname: "/category",
            query: {
              cat: "NP",
              promo: onPromotionOnly ? "true" : undefined,
            },
          }}
          className={`btn btn-sm ${activeCat === "NP" ? "btn-primary" : "btn-outline-primary"}`}
        >
          Non Pharma
        </Link>
      </div>
      <div className="mt-3">
        <h6>{t("promotions")}</h6>

        <Form.Check
          type="switch"
          id="promotion-switch"
          label="Show only promotions"
          checked={onPromotionOnly}
          onChange={(e) => handlePromoChange(e.target.checked)}
        />
      </div>
    </div>
  );
};

/* ---------------- PAGE ---------------- */

const CategoryPage = ({
  products,
  cat,
  s,
  min,
  max,
}: {
  products: Item[];
  cat: string;
  s: string;
  min: string;
  max: string;
}) => {
  const router = useRouter();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [hydrated, setHydrated] = useState(false);

  const [productsPag, setProductsPag] = useState<Item[]>(products);
  const [loading, setLoading] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);

  const [minPrice, setMinPrice] = useState(min);
  const [maxPrice, setMaxPrice] = useState(max);

  const [showFilters, setShowFilters] = useState(false);

  const [onPromotionOnly, setOnPromotionOnly] = useState(
    router.query.promo ? true : false,
  );

  const activeCat = router.query.cat ?? null;

  useEffect(() => {
    setProductsPag(products);
    setReachedEnd(products.length < 20);
  }, [products]);

  useEffect(() => {
    setLoading(true);

    getProducts({
      skip: 0,
      take: 20,
      category_code: cat ? [cat] : null,
      search: s ?? null,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      onPromotionOnly: onPromotionOnly,
    })
      .then((res) => {
        const newProducts = res.data.result.products;
        setProductsPag(newProducts);
        setReachedEnd(newProducts.length < 20);
      })
      .finally(() => setLoading(false));
  }, [onPromotionOnly]);

  useEffect(() => {
    const stored = sessionStorage.getItem("viewMode") as "grid" | "list";
    if (stored) setViewMode(stored);
    setHydrated(true);
  }, []);
  if (!hydrated) return <div style={{ minHeight: "200px" }} />; // placeholder

  const fetchMoreProducts = () => {
    setLoading(true);

    getProducts({
      skip: productsPag.length,
      take: 20,
      category_code: cat ? [cat] : null,
      search: s ?? null,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      onPromotionOnly: onPromotionOnly,
    })
      .then((res) => {
        const newProducts = res.data.result.products;

        setProductsPag((p) => [...p, ...newProducts]);

        if (newProducts.length < 20) setReachedEnd(true);
      })
      .finally(() => setLoading(false));
  };

  const changeViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    sessionStorage.setItem("viewMode", mode);
  };

  return (
    <Layout>
      <section className="pt-5 pb-5">
        <div className="container">
          {/* MOBILE FILTER BUTTON */}

          <div className="d-md-none mb-3">
            <Button
              className="w-100"
              variant="outline-primary"
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>

            <Collapse in={showFilters}>
              <div>
                <Filters
                  s={s}
                  activeCat={activeCat}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  setMinPrice={setMinPrice}
                  setMaxPrice={setMaxPrice}
                  onPromotionOnly={onPromotionOnly}
                  setOnPromotionOnly={setOnPromotionOnly}
                />
              </div>
            </Collapse>
          </div>

          <Row>
            {/* DESKTOP FILTERS */}

            <Col md={3} className="d-none d-md-block">
              <Filters
                s={s}
                activeCat={activeCat}
                minPrice={minPrice}
                maxPrice={maxPrice}
                setMinPrice={setMinPrice}
                setMaxPrice={setMaxPrice}
                onPromotionOnly={onPromotionOnly}
                setOnPromotionOnly={setOnPromotionOnly}
              />
            </Col>

            {/* PRODUCTS */}

            <Col md={9}>
              <div className="d-flex justify-content-end mb-3 gap-2">
                <Button
                  variant={viewMode === "grid" ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => changeViewMode("grid")}
                >
                  Grid
                </Button>

                <Button
                  variant={viewMode === "list" ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => changeViewMode("list")}
                >
                  List
                </Button>
              </div>
              {productsPag.length === 0 && !loading ? (
                <div className="text-center py-5">
                  <h5>No products found</h5>

                  {s && (
                    <p className="text-muted">
                      No results for "<strong>{s}</strong>"
                    </p>
                  )}

                  <Button
                    variant="outline-primary"
                    onClick={() => router.push("/category")}
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : viewMode === "grid" ? (
                <Row>
                  {productsPag.map((item) => (
                    <Col lg={4} md={6} xs={6} key={item.item_code}>
                      <ProductItem item={item} layout="grid" />
                    </Col>
                  ))}
                </Row>
              ) : (
                <div>
                  {productsPag.map((item) => (
                    <ProductItem
                      key={item.item_code}
                      item={item}
                      layout="list"
                    />
                  ))}
                </div>
              )}

              {!reachedEnd && (
                <div className="text-center mt-4">
                  <Button onClick={fetchMoreProducts}>
                    {loading ? <Spinner size="sm" /> : "Load More"}
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        </div>
      </section>
    </Layout>
  );
};

export default CategoryPage;
