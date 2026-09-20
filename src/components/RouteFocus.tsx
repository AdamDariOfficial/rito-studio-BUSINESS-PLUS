import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

export function RouteFocus() {
  const router = useRouter();
  type HistoryAction = Parameters<
    Parameters<typeof router.history.subscribe>[0]
  >[0]["action"]["type"];

  useEffect(() => {
    let pendingAction: HistoryAction | null = null;
    let temporaryMain: HTMLElement | null = null;
    let focusOutHandler: ((event: FocusEvent) => void) | null = null;

    const clearTemporaryTabIndex = () => {
      if (temporaryMain && focusOutHandler) {
        temporaryMain.removeEventListener("focusout", focusOutHandler);
        temporaryMain.removeAttribute("tabindex");
      }
      temporaryMain = null;
      focusOutHandler = null;
    };

    const unsubscribeHistory = router.history.subscribe(({ action }) => {
      pendingAction = action.type;
    });

    const unsubscribeRendered = router.subscribe("onRendered", (event) => {
      const action = pendingAction;
      pendingAction = null;

      if (!event.fromLocation || action !== "PUSH") return;
      if (event.fromLocation.pathname === event.toLocation.pathname) return;
      if (event.toLocation.hash) return;
      if (document.querySelector('[aria-modal="true"]')) return;

      const main = document.querySelector<HTMLElement>("main");
      if (!main) return;

      clearTemporaryTabIndex();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });

      if (!main.hasAttribute("tabindex")) {
        main.setAttribute("tabindex", "-1");
        temporaryMain = main;
        focusOutHandler = (focusEvent) => {
          const nextTarget = focusEvent.relatedTarget;
          if (nextTarget instanceof Node && main.contains(nextTarget)) return;
          clearTemporaryTabIndex();
        };
        main.addEventListener("focusout", focusOutHandler);
      }

      main.focus({ preventScroll: true });
    });

    return () => {
      unsubscribeRendered();
      unsubscribeHistory();
      clearTemporaryTabIndex();
    };
  }, [router]);

  return null;
}
