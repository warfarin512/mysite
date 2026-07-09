"use client";
import { useEffect, useRef, useCallback } from "react";
import { motion, useSpring, useTransform, MotionValue } from "framer-motion";
import { useChronos } from "@/lib/store";
import YearView from "./YearView";
import QuarterView from "./QuarterView";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";

const LEVELS = [YearView, QuarterView, MonthView, WeekView, DayView];

export default function ZoomCanvas() {
  const targetZoom = useChronos((s) => s.targetZoom);
  const setTargetZoom = useChronos((s) => s.setTargetZoom);

  const zoomSpring = useSpring(1, { stiffness: 170, damping: 26, mass: 0.6 });

  useEffect(() => {
    zoomSpring.set(targetZoom);
  }, [targetZoom, zoomSpring]);

  const wheelAccum = useRef(0);
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      const factor = e.ctrlKey ? 0.012 : 0.0035;
      wheelAccum.current += e.deltaY * factor;
      if (Math.abs(wheelAccum.current) > 0.12) {
        setTargetZoom(useChronos.getState().targetZoom + wheelAccum.current);
        wheelAccum.current = 0;
      }
    },
    [setTargetZoom]
  );

  const pinchDist = useRef<number | null>(null);
  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (pinchDist.current !== null) {
          const delta = (dist - pinchDist.current) * 0.008;
          setTargetZoom(useChronos.getState().targetZoom + delta);
        }
        pinchDist.current = dist;
      }
    },
    [setTargetZoom]
  );
  const onTouchEnd = useCallback(() => (pinchDist.current = null), []);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onWheel={onWheel}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {LEVELS.map((View, i) => (
        <Layer key={i} level={i + 1} zoom={zoomSpring}>
          <View />
        </Layer>
      ))}
    </div>
  );
}

function Layer({
  level,
  zoom,
  children,
}: {
  level: number;
  zoom: MotionValue<number>;
  children: React.ReactNode;
}) {
  const opacity = useTransform(zoom, [level - 1, level - 0.45, level, level + 0.45, level + 1], [0, 0.1, 1, 0.1, 0]);
  const scale = useTransform(zoom, [level - 1, level, level + 1], [0.62, 1, 1.85]);
  const blur = useTransform(zoom, (z) => {
    const d = Math.abs(z - level);
    return `blur(${Math.min(d * 14, 14)}px)`;
  });
  const display = useTransform(zoom, (z) => (Math.abs(z - level) >= 0.98 ? "none" : "block"));
  const pointerEvents = useTransform(zoom, (z): "auto" | "none" =>
    Math.abs(z - level) < 0.3 ? "auto" : "none"
  );

  return (
    <motion.div
      style={{ opacity, scale, filter: blur, display, pointerEvents }}
      className="absolute inset-0 will-change-transform"
    >
      {children}
    </motion.div>
  );
}
