import { Clock, GripVertical } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { useActiveEvaluation } from "@/hooks/useActiveEvaluation";
import { useCountdown } from "@/hooks/useCountdown";

type CornerPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const POSITION_CLASSES: Record<CornerPosition, string> = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
};

const STORAGE_KEY = "vta-timer-position";

function getStoredPosition(): CornerPosition {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in POSITION_CLASSES) {
      return stored as CornerPosition;
    }
  } catch {
    // localStorage unavailable
  }
  return "bottom-right";
}

export default function TestTimerBadge() {
  const { evaluation, isLoading } = useActiveEvaluation();
  const { formatted, totalSeconds, isExpired } = useCountdown(
    evaluation?.evaluate_after ?? null,
  );

  const [position, setPosition] = useState<CornerPosition>(getStoredPosition);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const badgeRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const savePosition = useCallback((pos: CornerPosition) => {
    setPosition(pos);
    try {
      localStorage.setItem(STORAGE_KEY, pos);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const snapToCorner = useCallback(
    (clientX: number, clientY: number) => {
      const isLeft = clientX < window.innerWidth / 2;
      const isTop = clientY < window.innerHeight / 2;
      const corner: CornerPosition = `${isTop ? "top" : "bottom"}-${isLeft ? "left" : "right"}`;
      savePosition(corner);
    },
    [savePosition],
  );

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    dragStartRef.current = { x: clientX, y: clientY };
    setIsPointerDown(true);
  }, []);

  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragStartRef.current) return;
      const dx = clientX - dragStartRef.current.x;
      const dy = clientY - dragStartRef.current.y;

      // Only start dragging after moving at least 5px (prevent accidental drags)
      if (!isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        setIsDragging(true);
      }

      if (isDragging || Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        setDragOffset({ x: dx, y: dy });
      }
    },
    [isDragging],
  );

  const handleDragEnd = useCallback(
    (clientX: number, clientY: number) => {
      if (isDragging) {
        snapToCorner(clientX, clientY);
      }
      setIsDragging(false);
      setIsPointerDown(false);
      setDragOffset({ x: 0, y: 0 });
      dragStartRef.current = null;
    },
    [isDragging, snapToCorner],
  );

  // Attach window-level mouse listeners while pointer is down
  useEffect(() => {
    if (!isPointerDown) return;

    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const onMouseUp = (e: MouseEvent) => handleDragEnd(e.clientX, e.clientY);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isPointerDown, handleDragMove, handleDragEnd]);

  // Don't render if no active evaluation or still loading
  if (isLoading || !evaluation) {
    return null;
  }

  // Determine urgency level for styling
  const urgency = isExpired
    ? "expired"
    : totalSeconds < 60
      ? "critical"
      : totalSeconds < 300
        ? "warning"
        : "normal";

  const urgencyStyles = {
    normal:
      "bg-white border-primary-500 text-primary-800 shadow-lg shadow-primary-100",
    warning:
      "bg-amber-50 border-amber-500 text-amber-900 shadow-lg shadow-amber-100 animate-pulse",
    critical:
      "bg-red-50 border-red-500 text-red-900 shadow-lg shadow-red-100 animate-pulse",
    expired: "bg-red-100 border-red-600 text-red-900 shadow-lg shadow-red-200",
  };

  const iconStyles = {
    normal: "text-primary-600",
    warning: "text-amber-600",
    critical: "text-red-600",
    expired: "text-red-700",
  };

  return (
    <div
      ref={badgeRef}
      className={cn(
        "fixed z-50 flex items-center gap-2 rounded-full border-2 px-3 py-2 select-none transition-shadow",
        POSITION_CLASSES[position],
        urgencyStyles[urgency],
        isDragging && "opacity-70 cursor-grabbing",
      )}
      style={
        isDragging
          ? { transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }
          : undefined
      }
      onMouseDown={(e) => {
        e.preventDefault();
        handleDragStart(e.clientX, e.clientY);
      }}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        handleDragStart(touch.clientX, touch.clientY);
      }}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        handleDragMove(touch.clientX, touch.clientY);
      }}
      onTouchEnd={(e) => {
        const touch = e.changedTouches[0];
        handleDragEnd(touch.clientX, touch.clientY);
      }}
    >
      <GripVertical className="h-3 w-3 cursor-grab text-gray-400" />
      <Clock className={cn("h-4 w-4", iconStyles[urgency])} />
      <span className="text-sm font-semibold tabular-nums tracking-tight">
        {isExpired ? "Time's up!" : formatted}
      </span>
    </div>
  );
}
