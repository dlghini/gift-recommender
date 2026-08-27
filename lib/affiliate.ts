// Affiliate link builders. Everything links to a store *search*, never a single
// listing, so a link keeps working after an individual product sells out or
// changes. Same IDs and shape as the builders in the wizard and landing page.
const RAKUTEN_ID = "wa9JRgUhXO8";
const ETSY_MID = "54027";
const VIATOR_PID = "P00304135";
const AMAZON_TAG = "giftwhisper0e-20";

export type Store = "amazon" | "etsy" | "viator";

export function buildAffiliateUrl(store: Store, searchQuery: string): string {
  const q = encodeURIComponent(searchQuery);
  if (store === "viator") {
    return `https://www.viator.com/searchResults/all?text=${q}&pid=${VIATOR_PID}`;
  }
  if (store === "etsy") {
    const etsyUrl = `https://www.etsy.com/search?q=${q}`;
    return `https://click.linksynergy.com/deeplink?id=${RAKUTEN_ID}&mid=${ETSY_MID}&murl=${encodeURIComponent(etsyUrl)}`;
  }
  return `https://www.amazon.com/s?k=${q}&tag=${AMAZON_TAG}`;
}
