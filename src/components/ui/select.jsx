import { cn } from "@/utils/cn";

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "flex h-8 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-8 text-sm",
        "text-foreground",
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")] bg-[right_0.6rem_center] bg-no-repeat",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
