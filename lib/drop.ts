import { brand } from "@/lib/brand";
import type { BrandProduct } from "@/lib/brand";

/** Product helpers. Edit the products themselves in lib/brand.ts. */

export type DropProduct = BrandProduct;

export const DROP_IMAGE_WIDTH = 1200;
export const DROP_IMAGE_HEIGHT = 1500;

export const dropProducts: readonly DropProduct[] = brand.products;

const PRICE_FORMAT = new Intl.NumberFormat(brand.locale, {
  style: "currency",
  currency: brand.currency,
  maximumFractionDigits: 0,
});

/** Formats a whole-unit price, e.g. 1450 → "₱1,450". */
export function formatPrice(amount: number): string {
  return PRICE_FORMAT.format(amount);
}

/** Lowest price in the drop (0 for an empty list). */
export function fromPrice(products: readonly DropProduct[] = dropProducts): number {
  return products.length === 0 ? 0 : Math.min(...products.map((product) => product.price));
}
