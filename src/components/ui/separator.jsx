import { clsx } from "clsx";

export function Separator({ orientation = "horizontal", className }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={clsx(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
    />
  );
}
