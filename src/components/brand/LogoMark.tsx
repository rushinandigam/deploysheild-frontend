import { cn } from "../../lib/cn";

type Size = "sm" | "md" | "lg" | "xl";

const sizes: Record<Size, string> = {
  sm: "h-9 w-9 rounded-lg text-sm",
  md: "h-11 w-11 rounded-xl text-base",
  lg: "h-14 w-14 rounded-2xl text-xl",
  xl: "h-16 w-16 rounded-2xl text-2xl",
};

type Props = {
  size?: Size;
  className?: string;
};

export default function LogoMark({ size = "md", className }: Props) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-gradient-to-br from-violet-500 via-violet-600 to-fuchsia-600 font-display font-semibold text-white shadow-lg shadow-violet-950/50 ring-1 ring-white/20",
        sizes[size],
        className,
      )}>
      DS
    </div>
  );
}
