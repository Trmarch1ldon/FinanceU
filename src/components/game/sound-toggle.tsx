"use client";

import { useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { isSoundOn, setSoundOn, subscribeSound } from "@/lib/sound";

/** Sound on/off. The `M` shortcut lives in the view, once, so two mounted toggles can't
 *  both flip it and cancel out. */
export function SoundToggle() {
  const isOn = useSyncExternalStore(subscribeSound, isSoundOn, () => true);

  const Icon = isOn ? Volume2 : VolumeX;

  return (
    <button
      type="button"
      onClick={() => setSoundOn(!isOn)}
      aria-pressed={!isOn}
      aria-label={isOn ? "Mute sound (M)" : "Unmute sound (M)"}
      title={isOn ? "Mute (M)" : "Unmute (M)"}
      className="grid size-8 place-items-center rounded-md border border-border text-muted transition-colors hover:border-border-strong hover:text-fg"
    >
      <Icon size={15} strokeWidth={1.75} aria-hidden />
    </button>
  );
}
