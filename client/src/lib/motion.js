// Shared Framer Motion variants — import once, reuse everywhere

export const fadeIn = {
  initial:  { opacity: 0 },
  animate:  { opacity: 1 },
  exit:     { opacity: 0 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
};

export const slideUp = {
  initial:  { opacity: 0, y: 16 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: 8 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
};

export const slideDown = {
  initial:  { opacity: 0, y: -10 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
};

export const scaleIn = {
  initial:  { opacity: 0, scale: 0.96 },
  animate:  { opacity: 1, scale: 1 },
  exit:     { opacity: 0, scale: 0.96 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
};

export const staggerContainer = (stagger = 0.08, delay = 0) => ({
  animate: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export const staggerItem = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export const hoverScale = {
  whileHover: { scale: 1.015, transition: { duration: 0.2 } },
  whileTap:   { scale: 0.985 },
};

export const hoverLift = {
  whileHover: { y: -2, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  whileTap:   { y: 0 },
};