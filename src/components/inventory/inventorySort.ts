import type { MarketplaceListing } from "@/types/api";

export const INVENTORY_SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
] as const;

export type InventorySort = (typeof INVENTORY_SORTS)[number]["value"];

export const DEFAULT_INVENTORY_SORT: InventorySort = "newest";

/** Returns a new array; the listings API pages oldest-first, so "newest" is the reversed page. */
export function sortListings(listings: MarketplaceListing[], sort: InventorySort): MarketplaceListing[] {
  const ordered = [...listings].reverse();
  switch (sort) {
    case "price-asc":
      return ordered.sort((a, b) => a.price - b.price);
    case "price-desc":
      return ordered.sort((a, b) => b.price - a.price);
    case "name-asc":
      return ordered.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return ordered;
  }
}
