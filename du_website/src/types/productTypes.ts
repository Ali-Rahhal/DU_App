export interface Product {
  item_code: string;
  parent_item_code?: string;
  name: string;
  description: string;
  creation_date: string;
  price: string;
  default_discount?: string;
  discountedPrice: string;
  isFavorite: boolean;
  images: string;
  image?: string;
  category: string;
  subCategory: string;
  cat_code: string;
  sub_cat_code?: string;
  barcode: string;
  stock: number;
  currency_code: string;
  hasPromotion?: boolean;
  tags?: string[];
  // =========================
  // EXPIRY DEAL
  // =========================
  isExpiryDeal?: boolean;
  expiryDiscountPercentage?: number;
  expiryMonthsLeft?: number;
}

export interface CartItem {
  item_code: string;
  parent_item_code?: string;
  name: string;
  description: string;
  price: string;
  discountedPrice: string;
  images: string;
  image?: string;
  category: string;
  subCategory: string;
  cat_code: string;
  barcode: string;
  quantity: number;
  stock: number;
  currency_code: string;
  tags?: string[];
  // =========================
  // EXPIRY DEAL
  // =========================
  isExpiryDeal?: boolean;
  expiryDiscountPercentage?: number;
}
