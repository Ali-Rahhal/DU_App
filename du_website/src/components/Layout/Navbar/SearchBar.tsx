import Item from "@/Models/item";
import ProductItem from "@/components/common/ProductItem";
import ProductItemList from "@/components/common/ProductItemList";
import { getProducts } from "@/utils/apiCalls";
// import { searchProduct } from "@/utils/data";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const SearchBar = ({
  showSearch = true,
  text = "Search for Medicines and Health Products",
}: {
  showSearch: boolean;
  text?: string;
}) => {
  const [hasFocus, setFocus] = useState(false);
  const [search, setSearch] = useState("");
  const [searchProduct, setSearchProduct] = useState<Item[]>([]);
  const rt = useRouter();

  useEffect(() => {
    setSearch((rt.query.s as string) || "");
  }, [rt.query]);

  useEffect(() => {
    if (!showSearch) return;
    if (search.length > 0) {
      getProducts({
        take: 10,
        skip: 0,
        search: search,
      })
        .then((res) => {
          setSearchProduct(res.data.result.products);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setSearchProduct([]);
    }
  }, [search]);

  return (
    <>
      <form
        className="header-search"
        onSubmit={(e) => {
          e.preventDefault();

          rt.push(`/category?s=${search}`);
        }}
      >
        <input
          className="form-control custom-search"
          placeholder={text}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setFocus(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setFocus(false);
            }
          }}
          // onBlur={() => setFocus(false)}
        />

        {hasFocus && showSearch ? (
          <div className="search-content">
            <div
              className="search-product "
              style={{
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {searchProduct?.map((item, index) => (
                <div style={{}}>
                  <ProductItemList key={item.item_code} item={item} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </form>
    </>
  );
};

export default SearchBar;
