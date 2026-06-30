export interface ProductVariant {
  size: "S" | "M" | "L" | "XL" | "XXL";
  color: string;
  colorHex: string;
  stock: number;
}

export interface ProductReview {
  _id: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number; // BDT
  discountPrice?: number;
  images: string[]; // Cloudinary URLs
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  reviews?: ProductReview[];
  tags: ("new-arrival" | "best-seller" | "trending")[];
  isFeatured: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}
