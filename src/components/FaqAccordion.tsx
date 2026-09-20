import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { RevealDivider } from "@/components/RevealDivider";
import { faqItems } from "@/data/content";

export function FaqAccordion() {
  return (
    <Accordion.Root type="single" collapsible className="relative border-t border-transparent">
      <RevealDivider className="inset-x-0 -top-px h-px bg-line" />
      {faqItems.map((item, index) => (
        <Accordion.Item
          key={item.id}
          value={item.id}
          className="relative border-b border-transparent"
          style={{ ["--reveal-delay" as string]: `${Math.min(index * 60, 240)}ms` }}
        >
          <Accordion.Header data-reveal>
            <Accordion.Trigger className="group flex min-h-16 w-full items-center justify-between gap-6 py-4 text-left font-display text-xl leading-tight text-ink hover:text-accent md:text-2xl">
              {item.question}
              <Plus
                aria-hidden
                size={20}
                className="shrink-0 transition-transform duration-[280ms] group-data-[state=open]:rotate-45 motion-reduce:transition-none"
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="faq-accordion-content overflow-hidden text-sm leading-relaxed text-muted">
            <p className="max-w-2xl pb-5 pr-10">{item.answer}</p>
          </Accordion.Content>
          <RevealDivider className="inset-x-0 -bottom-px h-px bg-line" />
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
