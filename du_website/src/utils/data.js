// ============ SLIDER CONFIGURATIONS ============

export const homeSlider = {
  DU: [
    {
      image: "/assets/img/DU/slider/slider-1.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider/slider-2.jpeg",
      url: "category",
    },
  ],
  UPO: [
    {
      image: "/assets/img/DU/slider/slider-1.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider/slider-2.jpeg",
      url: "category",
    },
  ],
  FDC: [
    {
      image: "/assets/img/DU/slider/slider-1.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider/slider-2.jpeg",
      url: "category",
    },
  ],
  SADCO: [
    {
      image: "/assets/img/DU/slider/slider-1.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider/slider-2.jpeg",
      url: "category",
    },
  ],
  VI: [
    {
      image: "/assets/img/VITALAIT/slider/slider-1.jpg",
      url: "category",
    },
    {
      image: "/assets/img/VITALAIT/slider/slider-2.jpg",
      url: "category",
    },
    {
      image: "/assets/img/VITALAIT/slider/slider-3.jpg",
      url: "category",
    },
    {
      image: "/assets/img/VITALAIT/slider/slider-4.jpg",
      url: "category",
    },
  ],
};

export const getDefaultHomeSlider = () => {
  const defaultKey = process.env.NEXT_PUBLIC_DEFAULT_COMPANY || "DU";
  return homeSlider[defaultKey] || homeSlider.DU;
};

// ============ HOME SLIDER 2 ============

export const homeSlider2 = {
  DU: [
    {
      image: "/assets/img/DU/slider2/slider-1.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-2.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-3.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-4.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-5.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-6.jpg",
      url: "category",
    },
  ],
  UPO: [
    {
      image: "/assets/img/DU/slider2/slider-1.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-2.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-3.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-4.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-5.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-6.jpg",
      url: "category",
    },
  ],
  FDC: [
    {
      image: "/assets/img/DU/slider2/slider-1.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-2.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-3.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-4.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-5.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-6.jpg",
      url: "category",
    },
  ],
  SADCO: [
    {
      image: "/assets/img/DU/slider2/slider-1.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-2.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-3.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-4.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-5.jpg",
      url: "category",
    },
    {
      image: "/assets/img/DU/slider2/slider-6.jpg",
      url: "category",
    },
  ],
  VI: [
    {
      image: "/assets/img/VITALAIT/slider2/slider-1.jpg",
      url: "category",
    },
    {
      image: "/assets/img/VITALAIT/slider2/slider-2.jpg",
      url: "category",
    },
    {
      image: "/assets/img/VITALAIT/slider2/slider-3.jpg",
      url: "category",
    },
    {
      image: "/assets/img/VITALAIT/slider2/slider-4.jpg",
      url: "category",
    },
    {
      image: "/assets/img/VITALAIT/slider2/slider-5.jpg",
      url: "category",
    },
  ],
};

export const getDefaultHomeSlider2 = () => {
  const defaultKey = process.env.NEXT_PUBLIC_DEFAULT_COMPANY || "DU";
  return homeSlider2[defaultKey] || homeSlider2.DU;
};

// ============ CATEGORY SLIDER ============

export const categorySlider = {
  DU: [
    {
      image: "/assets/img/DU/category/category-1.png",
      url: "category?cat=P",
      name: "Pharma",
      cat_code: "P",
    },
    {
      image: "/assets/img/DU/category/category-2.png",
      url: "category?cat=PP",
      name: "ParaPharma",
      cat_code: "PP",
    },
    {
      image: "/assets/img/DU/category/category-3.png",
      url: "category?cat=NP",
      name: "Non Pharma",
      cat_code: "NP",
    },
  ],
  UPO: [
    {
      image: "/assets/img/DU/category/category-1.png",
      url: "category?cat=P",
      name: "Pharma",
      cat_code: "P",
    },
    {
      image: "/assets/img/DU/category/category-2.png",
      url: "category?cat=PP",
      name: "ParaPharma",
      cat_code: "PP",
    },
    {
      image: "/assets/img/DU/category/category-3.png",
      url: "category?cat=NP",
      name: "Non Pharma",
      cat_code: "NP",
    },
  ],
  FDC: [
    {
      image: "/assets/img/DU/category/category-1.png",
      url: "category?cat=P",
      name: "Pharma",
      cat_code: "P",
    },
    {
      image: "/assets/img/DU/category/category-2.png",
      url: "category?cat=PP",
      name: "ParaPharma",
      cat_code: "PP",
    },
    {
      image: "/assets/img/DU/category/category-3.png",
      url: "category?cat=NP",
      name: "Non Pharma",
      cat_code: "NP",
    },
  ],
  SADCO: [
    {
      image: "/assets/img/DU/category/category-1.png",
      url: "category?cat=P",
      name: "Pharma",
      cat_code: "P",
    },
    {
      image: "/assets/img/DU/category/category-2.png",
      url: "category?cat=PP",
      name: "ParaPharma",
      cat_code: "PP",
    },
    {
      image: "/assets/img/DU/category/category-3.png",
      url: "category?cat=NP",
      name: "Non Pharma",
      cat_code: "NP",
    },
  ],
  VI: [
    {
      image: "/assets/img/VITALAIT/category/category-1.png",
      url: "category?cat=N",
      name: "Dairy",
      cat_code: "N",
    },
    {
      image: "/assets/img/VITALAIT/category/category-2.png",
      url: "category?cat=D",
      name: "Desserts",
      cat_code: "D",
    },
  ],
};

export const getDefaultCategorySlider = () => {
  const defaultKey = process.env.NEXT_PUBLIC_DEFAULT_COMPANY || "DU";
  return categorySlider[defaultKey] || categorySlider.DU;
};

// ============ HOME OFFER ============

export const homeOffer = {
  DU: [
    {
      image: "/assets/img/DU/product/product-1.png",
      url: "category",
      title: "Advil 200mg 20 Tablets",
      subTitle: "Up to 50% off",
    },
    {
      image: "/assets/img/DU/product/product-2.png",
      url: "category",
      title: "CENTRUN Multivitamin 30 Tablets",
      subTitle: "Up to 50% off",
    },
  ],
  UPO: [
    {
      image: "/assets/img/DU/product/product-1.png",
      url: "category",
      title: "Advil 200mg 20 Tablets",
      subTitle: "Up to 50% off",
    },
    {
      image: "/assets/img/DU/product/product-2.png",
      url: "category",
      title: "CENTRUN Multivitamin 30 Tablets",
      subTitle: "Up to 50% off",
    },
  ],
  FDC: [
    {
      image: "/assets/img/DU/product/product-1.png",
      url: "category",
      title: "Advil 200mg 20 Tablets",
      subTitle: "Up to 50% off",
    },
    {
      image: "/assets/img/DU/product/product-2.png",
      url: "category",
      title: "CENTRUN Multivitamin 30 Tablets",
      subTitle: "Up to 50% off",
    },
  ],
  SADCO: [
    {
      image: "/assets/img/DU/product/product-1.png",
      url: "category",
      title: "Advil 200mg 20 Tablets",
      subTitle: "Up to 50% off",
    },
    {
      image: "/assets/img/DU/product/product-2.png",
      url: "category",
      title: "CENTRUN Multivitamin 30 Tablets",
      subTitle: "Up to 50% off",
    },
  ],
  VI: [
    {
      image: "/assets/img/VITALAIT/product/product-1.png",
      url: "category",
      title: "LAIT ENTIER UHT 1L",
      subTitle: "Healthy!",
    },
    {
      image: "/assets/img/VITALAIT/product/product-2.png",
      url: "category",
      title: "GRANDI FRUITS DE BOIS 330 G",
      subTitle: "Yummy!!",
    },
  ],
};

export const getDefaultHomeOffer = () => {
  const defaultKey = process.env.NEXT_PUBLIC_DEFAULT_COMPANY || "DU";
  return homeOffer[defaultKey] || homeOffer.DU;
};

// ============ BRAND SLIDER ============

export const brandSlider = {
  DU: [
    {
      image: "/assets/img/DU/brand/brand-1.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-2.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-3.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-4.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-5.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-6.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-7.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-8.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-9.png",
      url: "category",
      name: "BrandName",
    },
  ],
  UPO: [
    {
      image: "/assets/img/DU/brand/brand-1.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-2.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-3.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-4.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-5.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-6.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-7.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-8.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-9.png",
      url: "category",
      name: "BrandName",
    },
  ],
  FDC: [
    {
      image: "/assets/img/DU/brand/brand-1.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-2.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-3.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-4.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-5.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-6.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-7.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-8.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-9.png",
      url: "category",
      name: "BrandName",
    },
  ],
  SADCO: [
    {
      image: "/assets/img/DU/brand/brand-1.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-2.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-3.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-4.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-5.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-6.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-7.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-8.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/DU/brand/brand-9.png",
      url: "category",
      name: "BrandName",
    },
  ],
  VI: [
    {
      image: "/assets/img/VITALAIT/brand/brand-1.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/VITALAIT/brand/brand-2.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/VITALAIT/brand/brand-3.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/VITALAIT/brand/brand-4.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/VITALAIT/brand/brand-5.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/VITALAIT/brand/brand-6.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/VITALAIT/brand/brand-7.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/VITALAIT/brand/brand-8.png",
      url: "category",
      name: "BrandName",
    },
    {
      image: "/assets/img/VITALAIT/brand/brand-9.png",
      url: "category",
      name: "BrandName",
    },
  ],
};

export const getDefaultBrandSlider = () => {
  const defaultKey = process.env.NEXT_PUBLIC_DEFAULT_COMPANY || "DU";
  return brandSlider[defaultKey] || brandSlider.DU;
};

// ============ POPULAR CATEGORY SLIDER (alias of brandSlider) ============

export const popularCategorySlider = brandSlider;

export const getDefaultPopularCategorySlider = () => {
  const defaultKey = process.env.NEXT_PUBLIC_DEFAULT_COMPANY || "DU";
  return popularCategorySlider[defaultKey] || popularCategorySlider.DU;
};

// ============ PERMISSIONS ============

export const ALL_PERMISSIONS = {
  Complaint: "COMPLAINT",
  Wishlist: "WISHLIST",
  Order: "ORDER",
  OpenInvoice: "OPEN_INVOICE",
  SalesInvoice: "SALES_INVOICE",
  Survey: "SURVEY",
  ChangePassword: "CHANGE_PASSWORD",
};

// ============ ROLES ============

export const ROLES = {
  User: "USER",
  SysUser: "SYS_USER",
  Admin: "ADMIN",
};
