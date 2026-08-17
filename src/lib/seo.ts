const SEO_SITE_URL = "https://rito-studio-business.tretnix.com";
const SEO_LOCALE = "it_IT";
const DEFAULT_SOCIAL_IMAGE = {
  src: "/images/rito/rito-studio-wide.webp",
  width: 1600,
  height: 1000,
  alt: "Interno luminoso e materico di RITO Studio",
} as const;

export interface RouteSeo {
  title: string;
  description: string;
  path: string;
  indexability: "noindex, follow";
  socialImage: typeof DEFAULT_SOCIAL_IMAGE;
  structuredDataMode: "disabled";
}

function canonicalUrl(pathname: string) {
  return new URL(pathname, SEO_SITE_URL).toString();
}

function defineSeo(path: string, title: string, description: string): RouteSeo {
  return {
    path,
    title,
    description,
    indexability: "noindex, follow",
    socialImage: DEFAULT_SOCIAL_IMAGE,
    structuredDataMode: "disabled",
  };
}

export const routeSeo = {
  home: defineSeo(
    "/",
    "RITO Studio — Beauty & Care Atelier · Padova",
    "Un atelier contemporaneo dedicato a capelli, pelle e benessere. Trattamenti su misura, gesti precisi e il tempo necessario per ascoltarti.",
  ),
  treatments: defineSeo(
    "/trattamenti",
    "Trattamenti — RITO Studio",
    "Esplora i rituali RITO Studio per area, prezzo indicativo ed esigenza.",
  ),
  studio: defineSeo(
    "/studio",
    "Studio — RITO Studio",
    "Filosofia, metodo, ambiente e informazioni sullo spazio RITO Studio.",
  ),
  gallery: defineSeo(
    "/galleria",
    "Galleria — RITO Studio",
    "Una selezione editoriale di gesti, dettagli e spazi RITO Studio.",
  ),
  faq: defineSeo(
    "/faq",
    "FAQ — RITO Studio",
    "Risposte essenziali su trattamenti, preparazione, prezzi e appuntamenti.",
  ),
  contacts: defineSeo(
    "/contatti",
    "Contatti — RITO Studio",
    "Informazioni pratiche, orari, accessibilità e indicazioni per gli appuntamenti.",
  ),
  consultation: defineSeo(
    "/consulenza",
    "Consulenza — RITO Studio",
    "Una consulenza breve e guidata per partire da un trattamento e valutare servizi complementari.",
  ),
  admin: defineSeo(
    "/admin",
    "Consultation Inbox — RITO Studio",
    "Area riservata alla gestione delle richieste di consulenza.",
  ),
  adminLogin: defineSeo(
    "/admin/login",
    "Accesso admin — RITO Studio",
    "Accesso riservato alla Consultation Inbox RITO Studio.",
  ),
  demoTools: defineSeo(
    "/_demo/tools",
    "Demo tools — RITO Studio",
    "Strumenti locali per ripristinare e controllare lo stato dimostrativo BUSINESS PLUS.",
  ),
  privacy: defineSeo(
    "/privacy",
    "Privacy — RITO Studio",
    "Informativa privacy dimostrativa da completare e revisionare per il cliente reale.",
  ),
  cookie: defineSeo(
    "/cookie",
    "Cookie — RITO Studio",
    "Informativa cookie dimostrativa e configurazione privacy del concept RITO Studio.",
  ),
  notFound: defineSeo(
    "/404",
    "Pagina non trovata — RITO Studio",
    "La pagina richiesta non è disponibile.",
  ),
} as const;

export function buildHead(seo: RouteSeo) {
  const canonical = canonicalUrl(seo.path);
  const imageUrl = canonicalUrl(seo.socialImage.src);

  return {
    meta: [
      { title: seo.title },
      { name: "description", content: seo.description },
      { name: "robots", content: seo.indexability },
      { property: "og:title", content: seo.title },
      { property: "og:description", content: seo.description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: SEO_LOCALE },
      { property: "og:url", content: canonical },
      { property: "og:image", content: imageUrl },
      { property: "og:image:width", content: String(seo.socialImage.width) },
      { property: "og:image:height", content: String(seo.socialImage.height) },
      { property: "og:image:alt", content: seo.socialImage.alt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: seo.title },
      { name: "twitter:description", content: seo.description },
      { name: "twitter:image", content: imageUrl },
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
}
