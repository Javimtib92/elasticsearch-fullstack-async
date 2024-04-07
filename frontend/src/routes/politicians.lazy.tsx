import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/politicians")({
  component: () => <div>Hello /politicians!</div>,
});
