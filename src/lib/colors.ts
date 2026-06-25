const LIGHT: Record<string, string> = {
  Provinsi: "#231f20",
  Bangka: "#f79039",
  Belitung: "#e63946",
  "Bangka Barat": "#06d6a0",
  "Bangka Tengah": "#3a86ff",
  "Bangka Selatan": "#ff006e",
  "Belitung Timur": "#8338ec",
  Pangkalpinang: "#ffbe0b",
};

const DARK: Record<string, string> = {
  Provinsi: "#ffffff",
  Bangka: "#f79039",
  Belitung: "#ff6b6b",
  "Bangka Barat": "#06d6a0",
  "Bangka Tengah": "#5dade2",
  "Bangka Selatan": "#ff4d94",
  "Belitung Timur": "#af7ac5",
  Pangkalpinang: "#ffd166",
};

export const REGION_COLORS = { light: LIGHT, dark: DARK };

export function getRegionColor(name: string, isDark: boolean): string {
  return (isDark ? DARK : LIGHT)[name] || "#666";
}
