import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="hidden flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <MainNav className="mx-6" />
          </div>
        </div>
      </div>
      <div className="flex md:hidden flex-col items-end">
        <div className="border-b w-full">
          <div className="flex h-16 items-center px-4">
            <MobileNav />
          </div>
        </div>
      </div>
      <Outlet />
    </>
  ),
});
