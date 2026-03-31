import { useEffect, useRef, useState } from "react";

interface Props {
  fetchFn: (params: {
    search: string;
    skip: number;
    take: number;
  }) => Promise<any>;

  multiple?: boolean;
  value: any | any[];
  onChange: (val: any | any[]) => void;

  labelKey?: string;
  valueKey?: string;
  placeholder?: string;
  exclude?: string[];
}

const Autocomplete = ({
  fetchFn,
  multiple = false,
  value,
  onChange,
  labelKey = "name",
  valueKey = "item_code",
  placeholder = "Search...",
  exclude = [],
}: Props) => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<any>(null);

  // =========================
  // Fetch
  // =========================
  const fetchItems = async (reset = false, customSearch = search) => {
    if (loading) return;

    setLoading(true);

    const res = await fetchFn({
      search: customSearch,
      skip: reset ? 0 : skip,
      take: 10,
    });

    const rawItems = res.data.result.products;

    const filteredItems = exclude?.length
      ? rawItems.filter((item) => !exclude.includes(item[valueKey]))
      : rawItems;

    setItems((prev) => (reset ? filteredItems : [...prev, ...filteredItems]));
    setSkip((prev) => (reset ? 10 : prev + 10));

    if (filteredItems.length < 10) setHasMore(false);

    setLoading(false);
  };

  // =========================
  // Debounce search
  // =========================
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setSkip(0);
      setHasMore(true);
      fetchItems(true, search);
    }, 300);
  }, [search]);

  // =========================
  // Outside click
  // =========================
  useEffect(() => {
    const handler = (e: any) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // =========================
  // Scroll (infinite)
  // =========================
  const handleScroll = () => {
    const el = listRef.current;
    if (!el || loading || !hasMore) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      fetchItems();
    }
  };

  // =========================
  // Select
  // =========================
  const handleSelect = (item) => {
    if (!multiple) {
      onChange(item);
      setSearch(""); // clear search so label shows
      setOpen(false);
      return;
    }

    const exists = value.find((v) => v[valueKey] === item[valueKey]);

    if (exists) {
      onChange(value.filter((v) => v[valueKey] !== item[valueKey]));
    } else {
      onChange([...value, item]);
    }
  };

  const isSelected = (item) => {
    if (!multiple) return value?.[valueKey] === item[valueKey];
    return value?.some((v) => v[valueKey] === item[valueKey]);
  };

  // =========================
  // Keyboard navigation
  // =========================
  const handleKeyDown = (e) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => Math.min(prev + 1, items.length - 1));
    }

    if (e.key === "ArrowUp") {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }

    if (e.key === "Enter" && items[activeIndex]) {
      handleSelect(items[activeIndex]);
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* INPUT */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "6px 10px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "6px",
          minHeight: "42px",
          boxShadow: open ? "0 0 0 2px #0d6efd33" : "none",
        }}
        onClick={() => setOpen(true)}
      >
        {/* MULTIPLE TAGS */}
        {multiple &&
          value?.map((v) => (
            <span
              key={v[valueKey]}
              style={{
                background: "#e7f1ff",
                color: "#0d6efd",
                padding: "4px 8px",
                borderRadius: "8px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {v[valueKey]}
              <span
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(value.filter((x) => x[valueKey] !== v[valueKey]));
                }}
              >
                ×
              </span>
            </span>
          ))}

        <input
          value={open ? search : !multiple && value ? value[labelKey] : search}
          placeholder={placeholder}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setSearch(""); // optional: clears to start new search like HeroUI
          }}
          onKeyDown={handleKeyDown}
          style={{
            border: "none",
            outline: "none",
            flex: 1,
            minWidth: 120,
          }}
        />
      </div>

      {/* DROPDOWN */}
      {open && (
        <div
          ref={listRef}
          onScroll={handleScroll}
          style={{
            position: "absolute",
            width: "100%",
            marginTop: 6,
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            maxHeight: 260,
            overflowY: "auto",
            zIndex: 999,
            animation: "fadeIn 0.15s ease",
          }}
        >
          {items.map((item, index) => {
            const selected = isSelected(item);
            const active = index === activeIndex;
            const isExcluded = exclude?.includes(item[valueKey]);
            return (
              <div
                key={item[valueKey]}
                onClick={() => !isExcluded && handleSelect(item)}
                style={{
                  padding: "10px 14px",
                  cursor: isExcluded ? "not-allowed" : "pointer",
                  background: active
                    ? "#f1f5ff"
                    : selected
                      ? "#e7f1ff"
                      : "transparent",
                  color: isExcluded ? "#aaa" : "#333",
                  opacity: isExcluded ? 0.6 : 1,
                }}
              >
                {item[labelKey]}
              </div>
            );
          })}

          {loading && (
            <div style={{ padding: 12, textAlign: "center" }}>Loading...</div>
          )}

          {!loading && items.length === 0 && (
            <div style={{ padding: 12, textAlign: "center", color: "#999" }}>
              No results found
            </div>
          )}
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default Autocomplete;
