import { clsx } from "clsx";

const variants = {
  default:  "bg-primary/10 text-primary border-primary/20",
  indigo:   "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  violet:   "bg-violet-500/10 text-violet-500 border-violet-500/20",
  amber:    "bg-amber-500/10 text-amber-600 border-amber-500/20",
  green:    "bg-green-500/10 text-green-600 border-green-500/20",
  red:      "bg-red-500/10 text-red-500 border-red-500/20",
};

export function Badge({ children, variant = "default", className }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
