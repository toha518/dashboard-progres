"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4 text-muted-foreground" />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={toggleTheme}
        id="theme-mode"
      />
      <Moon className="h-4 w-4 text-muted-foreground" />
      <Label htmlFor="theme-mode" className="sr-only">
        Dark mode
      </Label>
    </div>
  );
}
