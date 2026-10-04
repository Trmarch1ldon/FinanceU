"use client";

import { motion } from "motion/react";

/** The stamp that slams across the screen when the run ends, before the tear sheet. */
export function TradingHalted() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 grid place-items-center"
      aria-live="assertive"
    >
      <motion.div
        initial={{ opacity: 0, scale: 2.2, rotate: -12 }}
        animate={{ opacity: 1, scale: 1, rotate: -8 }}
        // A stamp lands hard and stops. No bounce.
        transition={{ type: "spring", bounce: 0, visualDuration: 0.25 }}
        className="border-4 border-down bg-bg/85 px-8 py-4 text-center font-mono text-down"
      >
        <p className="text-[40px] leading-none font-medium tracking-[0.18em] sm:text-[56px]">
          TRADING HALTED
        </p>
        <p className="mt-2 text-[13px] tracking-[0.3em]">MARGIN CALL</p>
      </motion.div>
    </div>
  );
}
