import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { announcementBanner, BANNER_VARIANTS } from "@/lib/announcementBanner";

// One-time announcement banner. All copy, the icon, the color, and the on/off
// switch live in `@/lib/announcementBanner` — edit that file, not this one.
// Starts hidden and only reveals after mount if the user hasn't dismissed this
// version before, so returning visitors never see a flash.
export default function ShareFeatureBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!announcementBanner.enabled) return;
    if (!localStorage.getItem(announcementBanner.storageKey)) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(announcementBanner.storageKey, "true");
  };

  if (!announcementBanner.enabled || !visible) {
    return null;
  }

  const Icon = announcementBanner.icon;
  const variant =
    BANNER_VARIANTS[announcementBanner.variant] ?? BANNER_VARIANTS.primary;

  return (
    <div
      className={cn(
        "mx-2 mt-2 flex items-center gap-3 rounded-md border px-3 py-2 text-sm md:mx-1",
        variant.container,
      )}
    >
      {Icon && <Icon className={cn("h-4 w-4 shrink-0", variant.icon)} />}
      <p className="flex-1 text-foreground">
        {announcementBanner.title && (
          <span className="font-semibold">{announcementBanner.title} </span>
        )}
        {announcementBanner.message}
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className={cn(
          "shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground",
          variant.dismiss,
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
