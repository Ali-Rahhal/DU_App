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
  let { cat, s } = context.query;

  const cookie = context.req.headers.cookie || "";

  const products = await getProducts(
    {
      skip: 0,
      take: 20,
      category_code: cat ? [cat] : null,
      search: s ? s : null,
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

const Filters = ({ s, activeCat }: any) => {
  const router = useRouter();
  const t = useTranslations();

  const clearSearch = () => {
    router.push("/category");
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
          href="/category"
          className={`btn btn-sm ${!activeCat ? "btn-primary" : "btn-outline-primary"}`}
        >
          All
        </Link>
        <Link
          href="/category?cat=P"
          className={`btn btn-sm ${activeCat === "P" ? "btn-primary" : "btn-outline-primary"}`}
        >
          Pharma
        </Link>
        <Link
          href="/category?cat=PP"
          className={`btn btn-sm ${activeCat === "PP" ? "btn-primary" : "btn-outline-primary"}`}
        >
          ParaPharma
        </Link>
        <Link
          href="/category?cat=NP"
          className={`btn btn-sm ${activeCat === "NP" ? "btn-primary" : "btn-outline-primary"}`}
        >
          Non Pharma
        </Link>
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

  const [productsPag, setProductsPag] = useState<Item[]>(products);
  const [loading, setLoading] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);

  const [minPrice, setMinPrice] = useState(min);
  const [maxPrice, setMaxPrice] = useState(max);

  const [showFilters, setShowFilters] = useState(false);

  const activeCat = router.query.cat ?? null;

  useEffect(() => {
    setProductsPag(products);
    setReachedEnd(products.length < 20);
  }, [products]);

  const fetchMoreProducts = () => {
    setLoading(true);

    getProducts({
      skip: productsPag.length,
      take: 20,
      category_code: cat ? [cat] : null,
      search: s ?? null,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
    })
      .then((res) => {
        const newProducts = res.data.result.products;

        setProductsPag((p) => [...p, ...newProducts]);

        if (newProducts.length < 20) setReachedEnd(true);
      })
      .finally(() => setLoading(false));
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
              />
            </Col>

            {/* PRODUCTS */}

            <Col md={9}>
              <Row>
                {productsPag.map((item) => (
                  <Col lg={4} md={6} xs={6} key={item.item_code}>
                    <ProductItem item={item} />
                  </Col>
                ))}
              </Row>

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
