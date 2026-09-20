import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { Hero } from "@/components/sections/Hero";
import { TreatmentCategoryTeaser } from "@/components/sections/TreatmentCategoryTeaser";
import { RitualFeature } from "@/components/sections/RitualFeature";
import { StudioEditorial } from "@/components/sections/StudioEditorial";
import { GalleryRail } from "@/components/sections/GalleryRail";
import { FaqTeaser } from "@/components/sections/FaqTeaser";
import { BookingCTA } from "@/components/sections/BookingCTA";
import { PracticalInfo } from "@/components/sections/PracticalInfo";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { buildHead, routeSeo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => buildHead(routeSeo.home),
  component: Index,
});

function Index() {
  return (
    <SiteShell skipHref="#trattamenti" skipLabel="Vai ai trattamenti">
      <Hero />
      <TreatmentCategoryTeaser />
      <RitualFeature />
      <StudioEditorial />
      <GalleryRail />
      <FaqTeaser />
      <ReviewsSection />
      <BookingCTA />
      <PracticalInfo />
    </SiteShell>
  );
}
