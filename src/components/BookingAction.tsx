import * as Dialog from "@radix-ui/react-dialog";
import { ExternalLink, Mail, MessageCircle, Phone, X } from "lucide-react";
import type { ReactNode } from "react";
import { site, type ContactChannel, type ContactIntent } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type BookingActionProps = {
  kind: ContactIntent;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

function ChannelIcon({ channel }: { channel: ContactChannel }) {
  if (channel.kind === "whatsapp") {
    return <MessageCircle aria-hidden size={18} strokeWidth={1.7} />;
  }
  if (channel.kind === "email") {
    return <Mail aria-hidden size={18} strokeWidth={1.7} />;
  }
  if (channel.kind === "external") {
    return <ExternalLink aria-hidden size={18} strokeWidth={1.7} />;
  }
  return <Phone aria-hidden size={18} strokeWidth={1.7} />;
}

function ChannelLink({ channel }: { channel: ContactChannel }) {
  return (
    <Dialog.Close asChild>
      <a
        href={channel.href}
        target={channel.external ? "_blank" : undefined}
        rel={channel.external ? "noopener noreferrer" : undefined}
        className="flex min-h-20 items-center gap-4 border border-line bg-canvas p-5 text-left transition-colors hover:border-accent focus-visible:outline-offset-4"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center text-accent-strong">
          <ChannelIcon channel={channel} />
        </span>
        <span className="min-w-0">
          <span className="block font-medium text-ink">{channel.label}</span>
          <span className="mt-1 block text-xs text-muted">{channel.detail}</span>
        </span>
      </a>
    </Dialog.Close>
  );
}

export function BookingAction({ kind, children, className, ariaLabel }: BookingActionProps) {
  const action = site.contactActions[kind];
  const channels: readonly ContactChannel[] = action.channels;
  const primary = channels[0];

  if (!primary) {
    return (
      <span aria-disabled="true" className={cn(className, "cursor-not-allowed opacity-50")}>
        {children}
      </span>
    );
  }

  if (channels.length === 1) {
    return (
      <a
        href={primary.href}
        target={primary.external ? "_blank" : undefined}
        rel={primary.external ? "noopener noreferrer" : undefined}
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button type="button" aria-label={ariaLabel} className={className}>
          {children}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          data-rito-contact-layer
          className="rito-contact-dialog-overlay fixed inset-0 z-[80] bg-ink/35 backdrop-blur-[2px]"
        />
        <Dialog.Content
          data-rito-contact-layer
          data-rito-contact-dialog
          className="rito-contact-dialog-content fixed left-1/2 top-1/2 z-[90] max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto overscroll-contain border border-line bg-canvas p-6 shadow-[0_24px_80px_rgba(27,26,24,0.18)] sm:p-8"
        >
          <Dialog.Title className="pr-12 font-display text-3xl leading-tight text-ink sm:text-4xl">
            {action.dialogTitle}
          </Dialog.Title>
          <Dialog.Description className="mt-3 max-w-md text-sm leading-relaxed text-muted">
            {action.dialogDescription}
          </Dialog.Description>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {channels.map((channel) => (
              <ChannelLink key={`${channel.kind}-${channel.href}`} channel={channel} />
            ))}
          </div>

          <Dialog.Close asChild>
            <button
              type="button"
              aria-label={
                kind === "booking"
                  ? "Chiudi finestra di prenotazione"
                  : "Chiudi finestra di contatto"
              }
              className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center border border-line text-ink transition-colors hover:border-accent hover:text-accent"
            >
              <X aria-hidden size={18} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
