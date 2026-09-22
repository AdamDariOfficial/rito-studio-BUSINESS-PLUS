import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { EditorialArrow } from "@/components/EditorialArrow";
import { getHeroImageOption, type HeroCta, type HeroSlide } from "@/features/hero/model";

export function HeroSlideVisual({
  slide,
  interactive = true,
  preview = false,
  positionLabel,
}: {
  slide: HeroSlide;
  interactive?: boolean;
  preview?: boolean;
  positionLabel?: string;
}) {
  const image = getHeroImageOption(slide.imageRef);

  return (
    <section
      className={`relative isolate overflow-hidden bg-ink text-white ${
        preview
          ? "aspect-[16/9] min-h-[18rem]"
          : "min-h-[calc(100svh-var(--header-height))] md:min-h-[calc(100dvh-var(--header-height))]"
      }`}
    >
      {image ? (
        <img
          src={image.ref}
          alt={slide.imageAlt}
          draggable={false}
          className="absolute inset-0 -z-30 h-full w-full select-none object-cover"
          style={{ objectPosition: image.objectPosition }}
          loading={preview || !interactive ? "lazy" : "eager"}
          fetchPriority={!preview && interactive ? "high" : "auto"}
          decoding="async"
        />
      ) : null}

      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(17,15,14,0.92)_0%,rgba(17,15,14,0.78)_34%,rgba(17,15,14,0.36)_65%,rgba(17,15,14,0.18)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(17,15,14,0.10)_0%,rgba(17,15,14,0.04)_45%,rgba(17,15,14,0.48)_100%)]"
      />

      <div
        className={`container-editorial flex h-full min-h-[inherit] items-end ${
          preview ? "px-6 pb-6 pt-16" : "pb-20 pt-24 sm:pb-24 md:items-center md:pb-16 md:pt-20"
        }`}
      >
        <div className={preview ? "max-w-[34rem]" : "max-w-[48rem]"}>
          <p className="inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/72">
            <span aria-hidden className="h-px w-7 bg-accent" />
            {slide.eyebrow}
          </p>

          <h1
            className={`mt-5 max-w-[12ch] font-display font-normal leading-[0.9] tracking-[-0.035em] text-white ${
              preview ? "text-[clamp(2rem,4vw,3.4rem)]" : "text-[clamp(3.5rem,11vw,7.8rem)]"
            }`}
          >
            {slide.title}
            <br />
            <span className="italic text-[#d9a8b6]">{slide.accent}</span>
            {slide.trailing ? (
              <>
                <br />
                {slide.trailing}
              </>
            ) : null}
          </h1>

          <p
            className={`mt-5 max-w-[39rem] leading-relaxed text-white/78 ${
              preview ? "text-sm" : "text-[0.95rem] sm:text-lg"
            }`}
          >
            {slide.body}
          </p>

          {!preview ? (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <HeroCtaLink cta={slide.primaryCta} primary interactive={interactive} />
              {slide.secondaryCta ? (
                <HeroCtaLink cta={slide.secondaryCta} interactive={interactive} />
              ) : null}
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/20 pt-4 text-xs text-white/65">
            <span>RITO Studio · Padova</span>
            {positionLabel ? <span className="font-medium text-white">{positionLabel}</span> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCtaLink({
  cta,
  primary = false,
  interactive,
}: {
  cta: HeroCta;
  primary?: boolean;
  interactive: boolean;
}) {
  const className = primary
    ? "action-primary inline-flex min-h-12 items-center justify-center gap-2 border border-white bg-white px-6 text-sm font-semibold tracking-wide text-ink hover:border-[#d9a8b6] hover:bg-[#d9a8b6]"
    : "editorial-link group inline-flex min-h-12 items-center justify-center gap-2 border border-white/35 px-6 text-sm font-semibold tracking-wide text-white hover:border-white";

  const content = (
    <>
      {primary && cta.target === "consultation" ? (
        <MessageCircle aria-hidden size={16} strokeWidth={1.7} />
      ) : null}
      {cta.label}
      {!primary ? <EditorialArrow /> : null}
    </>
  );

  const props = interactive ? {} : { tabIndex: -1, "aria-hidden": true as const };

  if (cta.target === "consultation")
    return (
      <Link to="/consulenza" className={className} {...props}>
        {content}
      </Link>
    );
  if (cta.target === "treatments")
    return (
      <Link to="/trattamenti" className={className} {...props}>
        {content}
      </Link>
    );
  if (cta.target === "studio")
    return (
      <Link to="/studio" className={className} {...props}>
        {content}
      </Link>
    );
  if (cta.target === "gallery")
    return (
      <Link to="/galleria" className={className} {...props}>
        {content}
      </Link>
    );
  return (
    <Link to="/contatti" className={className} {...props}>
      {content}
    </Link>
  );
}
