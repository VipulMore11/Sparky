"use client";

import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleRobustProps {
  className?: string;
}

export function ThemeToggleRobust({ className }: ThemeToggleRobustProps) {
  const { toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={cn(
        "relative h-9 w-9 p-0",
        // Custom hover states that ensure visibility
        "hover:bg-muted/50 hover:text-foreground",
        // Override any problematic accent colors
        "hover:!bg-muted/50 hover:!text-foreground",
        // Ensure icons are always visible
        "[&_svg]:text-foreground [&_svg]:hover:text-foreground",
        className
      )}
    >
      <Sun
        className={cn(
          "h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0",
          "text-foreground"
        )}
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100",
          "text-foreground"
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
