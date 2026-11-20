/**
 * Shared Framer Motion transitions aligned with responsive UI timings (< 250ms ease-out and snappy springs).
 */
export const EASE_OUT_EXPO = [0.23, 1, 0.32, 1] as const;

export const SPRING_PILL = {
  type: "spring",
  stiffness: 450,
  damping: 34,
} as const;

export const SPRING_PICKUP = {
  type: "spring",
  stiffness: 420,
  damping: 26,
} as const;

export const MODAL_TRANSITION = {
  duration: 0.2,
  ease: EASE_OUT_EXPO,
} as const;

export const TOAST_TRANSITION = {
  duration: 0.2,
  ease: EASE_OUT_EXPO,
} as const;

export const COLLAPSE_TRANSITION = {
  duration: 0.2,
  ease: EASE_OUT_EXPO,
} as const;

export const VIEW_SWITCH_TRANSITION = {
  duration: 0.18,
  ease: EASE_OUT_EXPO,
} as const;

export const CHEVRON_TRANSITION = {
  duration: 0.16,
  ease: EASE_OUT_EXPO,
} as const;

export const PROGRESS_TRANSITION = {
  duration: 0.45,
  ease: EASE_OUT_EXPO,
} as const;

export const PAGE_TRANSITION = {
  duration: 0.22,
  ease: EASE_OUT_EXPO,
} as const;
