import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import type { GiftGuide } from "@/lib/gift-guides/types";

// Shared structured-data nodes. The Organization and founder carry @ids so the
// per-page Article can reference them instead of repeating the details.
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const FOUNDER_ID = `${SITE_URL}/#founder`;

export const FOUNDER_NAME = "Daniel Maghini";
export const LINKEDIN_URL = "https://www.linkedin.com/in/daniel-maghini-6443ab85/";
export const PINTEREST_URL = "https://www.pinterest.com/thegiftwhisperergifts/";

const LOGO_URL = `${SITE_URL}/logo.png`;
const FOUNDER_IMAGE_URL = `${SITE_URL}/daniel-maghini.jpg`;

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  logo: { "@type": "ImageObject", url: LOGO_URL, width: 512, height: 512 },
  image: LOGO_URL,
  email: "dan.maghini@gmail.com",
  sameAs: [PINTEREST_URL],
  founder: {
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: FOUNDER_NAME,
    url: `${SITE_URL}/about`,
    image: FOUNDER_IMAGE_URL,
    jobTitle: "Founder",
    sameAs: [LINKEDIN_URL],
  },
};

export function articleSchema(guide: GiftGuide) {
  const url = `${SITE_URL}/gifts-for/${guide.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: guide.h1,
    description: guide.description,
    image: [`${url}/pin.png`],
    datePublished: guide.published,
    dateModified: guide.updated,
    inLanguage: "en-US",
    // Names are repeated rather than left as bare @id references so validators
    // that don't join separate JSON-LD blocks still see an author and publisher.
    author: {
      "@type": "Person",
      "@id": FOUNDER_ID,
      name: FOUNDER_NAME,
      url: `${SITE_URL}/about`,
    },
    publisher: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
  };
}
