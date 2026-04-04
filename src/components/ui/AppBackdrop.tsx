import { cn } from "../../lib/cn";

type Props = {
  className?: string;
  /** Softer orbs for nested surfaces */
  intensity?: "default" | "subtle";
};

export default function AppBackdrop({ className, intensity = "default" }: Props) {
  const orb = intensity === "subtle" ? "opacity-50" : "";
  return (
    <div
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050508]", className)}
      aria-hidden>
      <div
        className={cn(
          "absolute -top-[40%] left-1/2 h-[min(100vw,720px)] w-[min(100vw,720px)] -translate-x-1/2 rounded-full bg-violet-600/25 blur-[100px]",
          orb,
        )}
      />
      <div
        className={cn(
          "absolute -bottom-[20%] -right-[10%] h-[min(80vw,480px)] w-[min(80vw,480px)] rounded-full bg-fuchsia-600/20 blur-[90px]",
          orb,
        )}
      />
      <div
        className={cn(
          "absolute top-1/4 -left-[15%] h-[min(60vw,360px)] w-[min(60vw,360px)] rounded-full bg-cyan-500/10 blur-[80px]",
          orb,
        )}
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 85% 55% at 50% 0%, black 20%, transparent 70%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050508]/90" />
    </div>
  );
}
