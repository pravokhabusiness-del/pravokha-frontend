import React from "react";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/pravokha-brand-logo.png";

interface PravokhaLogoProps {
    className?: string;
    variant?: "default" | "light" | "dark";
    showTagline?: boolean;
}

export const PravokhaLogo: React.FC<PravokhaLogoProps> = ({
    className = "h-8 sm:h-9 w-auto",
    variant = "default",
    showTagline = false,
}) => {
    return (
        <div className={cn("inline-flex items-center gap-2 select-none group cursor-pointer", className)}>
            <img
                src={logoImg}
                alt="PRAVOKHA"
                className={cn(
                    "h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105",
                    variant === "light"
                        ? "filter drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] brightness-125"
                        : variant === "dark"
                        ? "filter drop-shadow-sm"
                        : "dark:filter dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                )}
                loading="eager"
            />
            {showTagline && (
                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-muted-foreground mt-0.5">
                    PREMIUM WEAR
                </span>
            )}
        </div>
    );
};

export default PravokhaLogo;
