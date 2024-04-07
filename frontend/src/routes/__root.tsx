import { MainNav } from "@/components/main-nav";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

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
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
