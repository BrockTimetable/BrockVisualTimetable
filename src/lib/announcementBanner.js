import { Share2 } from "lucide-react";

/*
Central config for the one-time announcement banner shown at the top of the
generator page ([`ShareFeatureBanner.jsx`](src/components/sitewide/ShareFeatureBanner.jsx)).

This is the ONLY file you need to edit for the banner:
  - DISABLE it entirely .......... set `enabled: false`
  - CHANGE THE TEXT .............. edit `title` / `message`
  - CHANGE THE ICON ............. set `icon` to any lucide-react icon (or null)
  - CHANGE THE COLOR ............ set `variant` to a key of BANNER_VARIANTS below
                                   (or add/tweak a variant there)
  - RE-SHOW it to everyone ....... bump `storageKey` (e.g. ".v1" -> ".v2");
                                   each key is remembered separately, so a new
                                   key makes the (updated) banner appear again
                                   even for users who dismissed the old one.
*/
export const announcementBanner = {
  enabled: true,

  // Dismissal is remembered in localStorage under this key. Bump the version
  // suffix whenever you want a changed message to re-appear for returning users.
  storageKey: "announcementBanner.shareFeature.v1",

  // Bold lead-in (e.g. "New:"). Leave as "" to omit.
  title: "New:",

  // Plain body text — apostrophes/ampersands are fine here (no HTML escaping).
  message:
    "You can now share & save your timetable. Once you've built your schedule, use the Share / Save Timetable button to copy a link you can revisit later or send to others.",

  // Any lucide-react icon component, or null for no icon.
  icon: Share2,

  // Color scheme — must be a key of BANNER_VARIANTS below.
  variant: "primary",
};

// Color schemes (Tailwind classes). Add your own or tweak these; they're scanned
// by Tailwind because this file is under `src/`. `container` styles the box,
// `icon` the leading icon, `dismiss` the close button's hover.
export const BANNER_VARIANTS = {
  primary: {
    container: "border-primary/30 bg-primary/10",
    icon: "text-primary",
    dismiss: "hover:bg-primary/20",
  },
  info: {
    container: "border-blue-500/30 bg-blue-500/10",
    icon: "text-blue-500",
    dismiss: "hover:bg-blue-500/20",
  },
  success: {
    container: "border-green-600/30 bg-green-600/10",
    icon: "text-green-600",
    dismiss: "hover:bg-green-600/20",
  },
  warning: {
    container: "border-amber-500/40 bg-amber-500/10",
    icon: "text-amber-600",
    dismiss: "hover:bg-amber-500/20",
  },
  neutral: {
    container: "border-border bg-muted",
    icon: "text-muted-foreground",
    dismiss: "hover:bg-accent",
  },
};
