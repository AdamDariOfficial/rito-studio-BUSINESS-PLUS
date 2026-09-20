export type ContactIntent = "booking" | "contact";

export type ContactChannelKind = "phone" | "whatsapp" | "email" | "external";

export type ContactChannel = {
  kind: ContactChannelKind;
  label: string;
  detail: string;
  href: string;
  external?: boolean;
};

type ReviewBase = {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  dateLabel?: string;
};

export type DemoReview = ReviewBase & {
  reviewUrl?: never;
};

export type AuthenticReview = ReviewBase & {
  reviewUrl?: string;
};

export type DemoReviewsConfig = {
  enabled: boolean;
  mode: "demo";
  platform?: never;
  profileUrl?: never;
  averageRating?: never;
  reviewCount?: never;
  reviews: readonly DemoReview[];
};

export type AuthenticReviewsConfig = {
  enabled: boolean;
  mode: "authentic";
  platform?: string;
  profileUrl?: string;
  averageRating?: number;
  reviewCount?: number;
  reviews: readonly AuthenticReview[];
};

export type ReviewsConfig = DemoReviewsConfig | AuthenticReviewsConfig;

const phone = "+39 049 000 0000";
const phoneHref = "tel:+390490000000";
const email = "info@ritostudio.example";
const emailHref = `mailto:${email}`;
const whatsappNumber = "390490000000";
const whatsappBookingMessage = "Ciao! Vorrei prenotare un appuntamento da RITO Studio.";
const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappBookingMessage)}`;

const mapQuery = "Prato della Valle, Padova";
const encodedMapQuery = encodeURIComponent(mapQuery);

export const site = {
  brand: {
    name: "RITO Studio",
    descriptor: "Beauty & Care Atelier",
    tagline: "La bellezza, nel suo ritmo.",
  },
  contact: {
    city: "Padova centro",
    area: "Zona Prato della Valle",
    locationLabel: "Padova centro · zona Prato della Valle",
    locationDetail:
      "Una zona centrale e facilmente raggiungibile. L'indirizzo esatto viene confermato al momento della prenotazione.",
    email,
    phone,
    phoneHref,
    emailHref,
    whatsappHref,
    mapQuery,
    mapEmbedUrl: `https://www.google.com/maps?q=${encodedMapQuery}&z=15&output=embed`,
    mapExternalUrl: `https://www.google.com/maps/search/?api=1&query=${encodedMapQuery}`,
    accessibility:
      "Per esigenze di accesso specifiche, contatta lo studio prima della visita: potremo condividere le indicazioni più utili.",
    directions:
      "La zona è servita dal trasporto pubblico. L'indirizzo esatto e le indicazioni di accesso vengono condivisi alla conferma.",
    appointmentPolicy:
      "Gli appuntamenti e le eventuali variazioni vengono concordati tramite WhatsApp o telefono con lo studio.",
  },
  contactActions: {
    booking: {
      dialogTitle: "Come preferisci prenotare?",
      dialogDescription: "Scegli WhatsApp o telefono.",
      channels: [
        {
          kind: "whatsapp",
          label: "WhatsApp",
          detail: "Scrivi ora",
          href: whatsappHref,
          external: true,
        },
        {
          kind: "phone",
          label: "Telefono",
          detail: "Chiama ora",
          href: phoneHref,
        },
      ] satisfies readonly ContactChannel[],
    },
    contact: {
      dialogTitle: "Come preferisci contattarci?",
      dialogDescription: "Scegli email o telefono.",
      channels: [
        {
          kind: "email",
          label: "Email",
          detail: "Scrivi ora",
          href: emailHref,
        },
        {
          kind: "phone",
          label: "Telefono",
          detail: "Chiama ora",
          href: phoneHref,
        },
      ] satisfies readonly ContactChannel[],
    },
  } satisfies Record<
    ContactIntent,
    {
      dialogTitle: string;
      dialogDescription: string;
      channels: readonly ContactChannel[];
    }
  >,
  hours: [
    { label: "Martedì–venerdì", value: "09:00–19:00" },
    { label: "Sabato", value: "09:00–17:00" },
    { label: "Domenica e lunedì", value: "chiuso" },
  ],
  reviews: {
    enabled: true,
    mode: "demo",
    reviews: [
      {
        author: "E.C.",
        rating: 5,
        text: "Un ambiente raccolto e preciso, con il tempo giusto per ascoltare e scegliere il trattamento con calma.",
        dateLabel: "Contenuto dimostrativo",
      },
      {
        author: "L.M.",
        rating: 5,
        text: "Gesti curati, spiegazioni chiare e un'atmosfera essenziale. Ogni passaggio sembra avere il suo ritmo.",
        dateLabel: "Contenuto dimostrativo",
      },
      {
        author: "S.R.",
        rating: 4,
        text: "Una proposta contemporanea e tranquilla, costruita intorno alle esigenze della persona senza fretta.",
        dateLabel: "Contenuto dimostrativo",
      },
    ],
  } satisfies ReviewsConfig,
  legal: {
    lastUpdated: "4 agosto 2026",
  },
  attribution: {
    text: "Progettato e sviluppato da",
    linkLabel: "Tretnix",
    href: "https://tretnix.com",
  },
  seo: {
    siteUrl: "https://rito-studio-business.tretnix.com",
    locale: "it_IT",
    defaultSocialImage: {
      src: "/images/rito/rito-studio-wide.webp",
      width: 1600,
      height: 1000,
      alt: "Interno luminoso e materico di RITO Studio",
    },
    sitemapEnabled: false,
    structuredDataMode: "disabled" as const,
  },
  consultation: {
    whatsappHref: import.meta.env.VITE_CONSULTATION_WHATSAPP_URL || null,
    externalUrl: import.meta.env.VITE_CONSULTATION_EXTERNAL_URL || null,
  },
  tracking: {
    enabled: false,
    consentRequired: true,
    provider: "none" as const,
  },
} as const;

export const nav = [
  { label: "Home", to: "/" },
  { label: "Trattamenti", to: "/trattamenti" },
  { label: "Studio", to: "/studio" },
  { label: "Galleria", to: "/galleria" },
  { label: "FAQ", to: "/faq" },
  { label: "Contatti", to: "/contatti" },
] as const;

export const ctaLabels = {
  navBook: "Prenota",
  navConsultation: "Consulenza",
  bookPrimary: "Prenota un appuntamento",
  requestAppointment: "Prenota un appuntamento",
  startConsultation: "Inizia la consulenza",
  contact: "Contattaci",
  callToBook: "Chiama per prenotare",
  callStudio: "Chiama lo studio",
  discoverTreatments: "Scopri i trattamenti",
} as const;

export function canonicalUrl(pathname: string) {
  return new URL(pathname, site.seo.siteUrl).toString();
}
