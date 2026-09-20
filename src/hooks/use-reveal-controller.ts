import { useEffect } from "react";

const pendingRevealSelector =
  "[data-reveal]:not([data-revealed]), [data-divider-reveal]:not([data-divider-revealed])";

function revealElement(element: HTMLElement) {
  if (element.hasAttribute("data-reveal")) {
    element.dataset.revealed = "true";
  }

  if (element.hasAttribute("data-divider-reveal")) {
    element.dataset.dividerRevealed = "true";
  }
}

export function revealVisibleElements(root: ParentNode = document) {
  if (typeof window === "undefined") return;
  const revealBoundary = window.innerHeight * 0.94;
  root.querySelectorAll<HTMLElement>(pendingRevealSelector).forEach((element) => {
    const rect = element.getBoundingClientRect();
    const visibleHeight = Math.min(rect.bottom, revealBoundary) - Math.max(rect.top, 0);
    if (visibleHeight > 0 && visibleHeight / Math.max(rect.height, 1) >= 0.1) {
      revealElement(element);
    }
  });
}

/**
 * Global reveal controller. Adds `.js` to <html> and observes content and divider
 * reveal elements, promoting each one to its own revealed state when it enters
 * the viewport. Elements already revealed are skipped. When IntersectionObserver
 * is unavailable, the `.js` class is removed so all content stays visible.
 */
export function useRevealController() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("js");

    if (typeof IntersectionObserver === "undefined") {
      html.classList.remove("js");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            revealElement(entry.target as HTMLElement);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );

    function observeAll() {
      document.querySelectorAll<HTMLElement>(pendingRevealSelector).forEach((el) => io.observe(el));
    }

    function observeNode(node: Node) {
      if (!(node instanceof HTMLElement)) return;
      if (node.matches(pendingRevealSelector)) io.observe(node);
      node.querySelectorAll<HTMLElement>(pendingRevealSelector).forEach((el) => io.observe(el));
    }

    function refreshPendingReveals() {
      revealVisibleElements();
      document.querySelectorAll<HTMLElement>(pendingRevealSelector).forEach((element) => {
        io.unobserve(element);
        io.observe(element);
      });
    }

    observeAll();

    // Catch late mounts and every subsequent route/filter update.
    const raf = requestAnimationFrame(observeAll);
    let mutationFrame = 0;
    const mutationObserver = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach(observeNode);
      }
      window.cancelAnimationFrame(mutationFrame);
      mutationFrame = window.requestAnimationFrame(refreshPendingReveals);
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("rito:refresh-reveals", refreshPendingReveals);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(mutationFrame);
      mutationObserver.disconnect();
      window.removeEventListener("rito:refresh-reveals", refreshPendingReveals);
      io.disconnect();
    };
  }, []);
}
