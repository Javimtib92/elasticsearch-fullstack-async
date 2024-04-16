"use client";

import { Logo } from "@/components/logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { BurgerMenu } from "./burger-menu";

const NAV_ITEMS = [
  {
    title: "Politicians",
    href: "/politicians",
  },
  {
    title: "Statistics",
    href: "/statistics",
  },
];
export function MobileNav({ className, ...props }: { className?: string }) {
  const [open, setOpen] = useState(false);
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
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <BurgerMenu />
        </SheetTrigger>
        <SheetContent side="right" className="pr-0">
          <Logo
            className="w-24 text-stone-800"
            onClick={() => setOpen(false)}
          />
          <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
            <div className="flex flex-col space-y-3">
              {NAV_ITEMS.map(
                (item) =>
                  item.href && (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        location.pathname !== item.href && inactive,
                      )}
                    >
                      {item.title}
                    </Link>
                  ),
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
