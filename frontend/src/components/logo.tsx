import { cn } from "@/lib/utils";
import { Link, type LinkComponent } from "@tanstack/react-router";

export function Logo({
  onClick,
  className,
  ...props
}: Partial<LinkComponent<"a">> & { onClick?: () => void; className?: string }) {
  return (
    <Link to="/politicians" onClick={onClick} {...props}>
      Logo
    </Link>
  );
}
