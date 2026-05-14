import { clsx } from "clsx";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";

const variants = {
  default:     { wrapper: "bg-card border-border text-foreground",               Icon: Info          },
  info:        { wrapper: "bg-indigo-50 border-indigo-200 text-indigo-700",      Icon: Info          },
  success:     { wrapper: "bg-indigo-50 border-indigo-200 text-indigo-700",      Icon: CheckCircle   },
  warning:     { wrapper: "bg-violet-50 border-violet-200 text-violet-700",      Icon: AlertTriangle },
  destructive: { wrapper: "bg-rose-50 border-rose-200 text-rose-700",            Icon: XCircle       },
};

export function Alert({ variant = "default", title, children, className }) {
  const { wrapper, Icon } = variants[variant] ?? variants.default;
  return (
    <div className={clsx("flex gap-3 rounded-lg border p-4 text-sm", wrapper, className)}>
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <div className="space-y-0.5">
        {title && <p className="font-semibold leading-none">{title}</p>}
        {children && <p className="text-[0.8125rem] leading-relaxed opacity-90">{children}</p>}
      </div>
    </div>
  );
}

export function AlertTitle({ children, className }) {
  return <p className={clsx("font-semibold leading-none", className)}>{children}</p>;
}

export function AlertDescription({ children, className }) {
  return <p className={clsx("text-[0.8125rem] leading-relaxed opacity-90", className)}>{children}</p>;
}
