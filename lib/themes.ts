import type { StoreTheme } from "@/lib/types";

export type FontPair = {
  id: string;
  label: string;
  display: string;
  body: string;
  href: string; // Google Fonts stylesheet URL
};

export const FONT_PAIRS: FontPair[] = [
  {
    id: "fraunces-inter",
    label: "Fraunces + Inter",
    display: "'Fraunces', serif",
    body: "'Inter', sans-serif",
    href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Inter:wght@400;500;600&display=swap",
  },
  {
    id: "bricolage-manrope",
    label: "Bricolage + Manrope",
    display: "'Bricolage Grotesque', sans-serif",
    body: "'Manrope', sans-serif",
    href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700&family=Manrope:wght@400;500;600&display=swap",
  },
  {
    id: "dmserif-nunito",
    label: "DM Serif + Nunito",
    display: "'DM Serif Display', serif",
    body: "'Nunito Sans', sans-serif",
    href: "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Nunito+Sans:wght@400;600;700&display=swap",
  },
  {
    id: "space-inter",
    label: "Space Grotesk + Inter",
    display: "'Space Grotesk', sans-serif",
    body: "'Inter', sans-serif",
    href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap",
  },
  {
    id: "sora-karla",
    label: "Sora + Karla",
    display: "'Sora', sans-serif",
    body: "'Karla', sans-serif",
    href: "https://fonts.googleapis.com/css2?family=Sora:wght@500;700&family=Karla:wght@400;500;600&display=swap",
  },
];

export const THEME_PRESETS: StoreTheme[] = [
  {
    preset: "Editorial Cream",
    background: "solid",
    bg: "#FAF6F0",
    bgGradient: "linear-gradient(165deg, #FAF6F0 0%, #F3E9DC 100%)",
    card: "#FFFFFF",
    text: "#221C18",
    muted: "#8A7F75",
    accent: "#D95B2A",
    accentText: "#FFFFFF",
    fontPair: "fraunces-inter",
    buttonShape: "pill",
  },
  {
    preset: "Pastel Bloom",
    background: "gradient",
    bg: "#FDF2F6",
    bgGradient: "linear-gradient(170deg, #FDF2F6 0%, #EEE6FB 60%, #E3F0FD 100%)",
    card: "#FFFFFF",
    text: "#3A2E3F",
    muted: "#9C8AA5",
    accent: "#C2559D",
    accentText: "#FFFFFF",
    fontPair: "dmserif-nunito",
    buttonShape: "rounded",
  },
  {
    preset: "Dark Minimal",
    background: "solid",
    bg: "#101012",
    bgGradient: "linear-gradient(180deg, #101012 0%, #1B1B20 100%)",
    card: "#1B1B20",
    text: "#F4F4F5",
    muted: "#8E8E96",
    accent: "#C8F04C",
    accentText: "#121205",
    fontPair: "space-inter",
    buttonShape: "square",
  },
  {
    preset: "Vibrant Bazaar",
    background: "gradient",
    bg: "#FFF7EC",
    bgGradient: "linear-gradient(160deg, #FFB72C 0%, #FF5E62 55%, #C93FA0 100%)",
    card: "#FFFFFF",
    text: "#2B1A0E",
    muted: "#9B7B5E",
    accent: "#E0246C",
    accentText: "#FFFFFF",
    fontPair: "bricolage-manrope",
    buttonShape: "pill",
  },
  {
    preset: "Ocean Fresh",
    background: "gradient",
    bg: "#EDFAF8",
    bgGradient: "linear-gradient(170deg, #D2F4EE 0%, #C4E8F7 100%)",
    card: "#FFFFFF",
    text: "#143438",
    muted: "#5F8489",
    accent: "#0E8C7F",
    accentText: "#FFFFFF",
    fontPair: "sora-karla",
    buttonShape: "rounded",
  },
];

export const DEFAULT_THEME = THEME_PRESETS[0];

export const getFontPair = (id: string | undefined) =>
  FONT_PAIRS.find((f) => f.id === id) ?? FONT_PAIRS[0];

export const buttonRadius = (shape: StoreTheme["buttonShape"]) =>
  shape === "pill" ? "9999px" : shape === "square" ? "6px" : "14px";
