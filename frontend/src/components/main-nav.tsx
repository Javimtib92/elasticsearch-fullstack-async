"use client";

import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "./logo";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const { location } = useRouterState();

  const inactive = "text-muted-foreground";

  return (
    <nav
      className={cn(
        "flex w-full justify-between items-center space-x-4 lg:space-x-6",
        className,
      )}
      {...props}
    >
      <Logo className="w-24 text-stone-800" />
      <div className="flex lg:space-x-6">
        <Link
          to="/politicians"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            location.pathname !== "/politicians" && inactive,
          )}
        >
          Politicians
        </Link>
        <Link
          to="/statistics"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            location.pathname !== "/statistics" && inactive,
          )}
        >
          Statistics
        </Link>
      </div>
    </nav>
  );
}
