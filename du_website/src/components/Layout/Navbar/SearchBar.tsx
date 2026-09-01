import ProductItemList from "@/components/common/ProductItemList";
import { Product } from "@/types/productTypes";
import { getProducts } from "@/utils/apiCalls";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useRef, useState } from "react";

interface SearchBarProps {
  showSearch?: boolean;
  text?: string;
}

const SearchBar = ({ showSearch = true, text = "search" }: SearchBarProps) => {
  const router = useRouter();
  const t = useTranslations();

  const searchRef = useRef<HTMLFormElement>(null);

  const [search, setSearch] = useState("");
  const [searchProduct, setSearchProduct] = useState<Product[]>([]);
  const [hasFocus, setHasFocus] = useState(false);
  const [loading, setLoading] = useState(false);

  /*
   * Sync the search field with the URL.
   */
  useEffect(() => {
    const querySearch = router.query.s;

    if (typeof querySearch === "string") {
      setSearch(querySearch);
    } else {
      setSearch("");
    }
  }, [router.query.s]);

  /*
   * Close the suggestions when clicking outside
   * the search component.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setHasFocus(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*
   * Search products with a small debounce.
   */
  useEffect(() => {
    if (!showSearch) {
      return;
    }

    const value = search.trim();

    if (!value) {
      setSearchProduct([]);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await getProducts({
          take: 10,
          skip: 0,
          search: value,
        });

        setSearchProduct(res.data.result.products || []);
      } catch (error) {
        console.error("Error searching products:", error);
        setSearchProduct([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, showSearch]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) {
      router.push("/category");
      setHasFocus(false);
      return;
    }

    setHasFocus(false);

    router.push(`/category?s=${encodeURIComponent(value)}`);
  };

  const handleClear = () => {
    setSearch("");
    setSearchProduct([]);
  };

  return (
    <form
      ref={searchRef}
      className={`header-search ${hasFocus ? "is-focused" : ""}`}
      onSubmit={handleSubmit}
    >
      <div className="header-search-input-wrapper">
        <Search size={19} className="header-search-icon" />

        <input
          className="form-control custom-search"
          placeholder={t(text)}
          type="text"
          value={search}
          autoComplete="off"
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setHasFocus(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setHasFocus(false);
            }
          }}
        />

        {search.length > 0 && (
          <button
            type="button"
            className="header-search-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={17} />
          </button>
        )}

        <button
          type="submit"
          className="header-search-submit"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </div>

      {showSearch && hasFocus && (
        <div className="search-content">
          <div className="search-content-header">
            <span>{search.trim() ? "Search results" : "Search products"}</span>
          </div>

          <div className="search-product">
            {loading ? (
              <div className="search-state">
                <span className="search-spinner" />
                <span>Searching...</span>
              </div>
            ) : search.trim() && searchProduct.length > 0 ? (
              searchProduct.map((item) => (
                <div key={item.item_code} className="search-product-item">
                  <ProductItemList item={item} />
                </div>
              ))
            ) : search.trim() ? (
              <div className="search-state">No products found.</div>
            ) : (
              <div className="search-state">
                Start typing to search for products.
              </div>
            )}
          </div>

          {search.trim() && searchProduct.length > 0 && (
            <button type="submit" className="search-view-all">
              View all results
            </button>
          )}
        </div>
      )}
    </form>
  );
};

export default SearchBar;
