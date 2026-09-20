import { createFileRoute } from "@tanstack/react-router";
import { GalleryExplorer } from "@/components/GalleryExplorer";
import { PageIntro } from "@/components/PageIntro";
import { SiteShell } from "@/components/SiteShell";
import { buildHead, routeSeo } from "@/lib/seo";

export const Route = createFileRoute("/galleria")({
  head: () => buildHead(routeSeo.gallery),
  component: GalleryPage,
});

function GalleryPage() {
  return (
    <SiteShell>
      <PageIntro
        eyebrow="Galleria"
        title={
          <>
            Gesti, materia, <span className="italic text-accent">presenza.</span>
          </>
        }
        intro="Una sequenza editoriale di ambienti, gesti e dettagli che raccontano l’atmosfera dello studio."
      />
      <section className="py-8 md:py-12" aria-label="Esplora la galleria">
        <div className="container-editorial">
          <GalleryExplorer />
        </div>
      </section>
    </SiteShell>
  );
}
