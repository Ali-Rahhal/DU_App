import ProductItem from "@/components/common/ProductItem";
import Layout from "@/components/Layout/Layout";
import SearchBar from "@/components/Layout/Navbar/SearchBar";
import { Product } from "@/types/productTypes";
import { categorySlider, getDefaultCategorySlider } from "@/utils/data";
import { getBrands, getProducts } from "@/utils/apiCalls";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button, Spinner, Form, Row, Col, Modal } from "react-bootstrap";
import { useCompanyAssets } from "@/hooks/useCompanyAssets";

const SADCO_CATEGORIES = [
  { code: "P", label: "Pharma", image: "/assets/img/SADCO/Pharma.png" },
  { code: "NP", label: "Non Pharma", image: "/assets/img/SADCO/NonPharma.png" },
];

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
      containExpiryDealProducts: true,
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
  mobile = false,
}: any) => {
  const router = useRouter();
  const t = useTranslations();
  const [brands, setBrands] = useState<
    { item_brand_code: string; description: string }[]
  >([]);

  useEffect(() => {
    getBrands()
      .then((res) => setBrands(res.data.result))
      .catch((e) => console.error(e));
  }, []);

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

  if (mobile) {
    return (
      <div className="mobile-filters">
        <div className="mobile-filters-search">
          <SearchBar showSearch />

          {s && (
            <button
              type="button"
              className="mobile-filters-clear"
              onClick={clearSearch}
            >
              Clear
            </button>
          )}
        </div>

        <div className="mobile-filters-chips">
          <Link
            href={{
              pathname: "/category",
              query: { promo: onPromotionOnly ? "true" : undefined },
            }}
            className={`mobile-filter-chip ${!activeCat ? "active" : ""}`}
          >
            All
          </Link>

          {brands.map((cat) => (
            <Link
              key={cat.item_brand_code}
              href={{
                pathname: "/category",
                query: {
                  cat: cat.item_brand_code,
                  promo: onPromotionOnly ? "true" : undefined,
                },
              }}
              className={`mobile-filter-chip ${
                activeCat === cat.item_brand_code ? "active" : ""
              }`}
            >
              {cat.description}
            </Link>
          ))}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={onPromotionOnly}
          className={`mobile-filters-promo ${onPromotionOnly ? "on" : ""}`}
          onClick={() => handlePromoChange(!onPromotionOnly)}
        >
          <span className="mobile-filters-promo-label">
            Show only promotions
          </span>

          <span className="mobile-switch" aria-hidden="true">
            <span className="mobile-switch-knob" />
          </span>
        </button>
      </div>
    );
  }
  return (
    <div className="p-2 border rounded bg-light mb-3">
      <div className="mb-3">
        <h6>{t("search")}</h6>

        <div className="d-flex flex-column gap-2">
          <div>
            <SearchBar showSearch={false} />
          </div>

          {s && (
            <div className="d-flex justify-content-end mt-1">
              <Button size="sm" variant="outline-primary" onClick={clearSearch}>
                Clear
              </Button>
            </div>
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
        {(brands ? brands : []).map((cat) => (
          <Link
            href={{
              pathname: "/category",
              query: {
                cat: cat.item_brand_code,
                promo: onPromotionOnly ? "true" : undefined,
              },
            }}
            className={`btn btn-sm ${activeCat === cat.item_brand_code ? "btn-primary" : "btn-outline-primary"}`}
            key={cat.item_brand_code}
          >
            {cat.description}
          </Link>
        ))}
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
  products: Product[];
  cat: string;
  s: string;
  min: string;
  max: string;
}) => {
  const router = useRouter();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [hydrated, setHydrated] = useState(false);

  const [productsPag, setProductsPag] = useState<Product[]>(products);
  const [loading, setLoading] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);

  const [minPrice, setMinPrice] = useState(min);
  const [maxPrice, setMaxPrice] = useState(max);

  const [onPromotionOnly, setOnPromotionOnly] = useState(
    router.query.promo ? true : false,
  );

  const activeCat = router.query.cat ?? null;

  const { companyHydrated, companyId } = useCompanyAssets();
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Ask SADCO clients to pick a category once per session
  useEffect(() => {
    if (!companyHydrated || companyId !== "SADCO") return;

    // They already have a category (or were asked before): never show it again
    if (cat || sessionStorage.getItem("sadcoCategoryChosen")) {
      sessionStorage.setItem("sadcoCategoryChosen", "true");
      return;
    }

    setShowCategoryModal(true);
  }, [companyHydrated, companyId]);

  const chooseCategory = (code: string) => {
    sessionStorage.setItem("sadcoCategoryChosen", "true");
    setShowCategoryModal(false);

    router.push({
      pathname: "/category",
      query: {
        cat: code,
        promo: onPromotionOnly ? "true" : undefined,
      },
    });
  };

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
      containExpiryDealProducts: true,
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
      containExpiryDealProducts: true,
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
      <Modal
        show={showCategoryModal}
        centered
        backdrop="static"
        keyboard={false}
        className="category-choice-modal"
      >
        <Modal.Header>
          <Modal.Title>Choose a category</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="category-choice-grid">
            {SADCO_CATEGORIES.map((c) => (
              <button
                key={c.code}
                type="button"
                className="category-choice-button"
                onClick={() => chooseCategory(c.code)}
              >
                <Image src={c.image} alt={c.label} width={120} height={120} />
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </Modal.Body>
      </Modal>
      <section className="pt-5 pb-5">
        <div className="container">
          {/* MOBILE FILTERS (always visible) */}

          <div className="d-md-none mb-3">
            <Filters
              mobile
              s={s}
              activeCat={activeCat}
              onPromotionOnly={onPromotionOnly}
              setOnPromotionOnly={setOnPromotionOnly}
            />
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
                    <Col
                      lg={4}
                      md={6}
                      xs={6}
                      key={item.item_code}
                      className="mt-1"
                    >
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
