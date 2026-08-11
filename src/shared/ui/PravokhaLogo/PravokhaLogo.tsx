import React from "react";
import { cn } from "@/lib/utils";

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
        <div className={cn("inline-flex items-center gap-2 font-sans select-none group cursor-pointer", className)}>
            {/* Ultra Crisp SVG Logo Symbol Mark */}
            <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-auto aspect-square flex-shrink-0 drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
            >
                <defs>
                    <linearGradient id="pravokha_brand_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4AA3A0" />
                        <stop offset="100%" stopColor="#E17B5A" />
                    </linearGradient>
                    <linearGradient id="pravokha_brand_shine" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
                    </linearGradient>
                </defs>
                {/* Outer Diamond Shield */}
                <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#pravokha_brand_grad)" />
                {/* Glossy top overlay */}
                <path d="M4 14C4 8.47715 8.47715 4 14 4H26C31.5228 4 36 8.47715 36 14V16L4 20V14Z" fill="url(#pravokha_brand_shine)" opacity="0.25" />
                {/* Crisp Stylized 'P' Mark */}
                <path
                    d="M14 11H22C24.7614 11 27 13.2386 27 16C27 18.7614 24.7614 21 22 21H18V29H14V11ZM18 15V17H21.5C22.3284 17 23 16.3284 23 15.5C23 14.6716 22.3284 14 21.5 14H18Z"
                    fill="#FFFFFF"
                    fillRule="evenodd"
                    clipRule="evenodd"
                />
            </svg>

            {/* High Clarity Crisp Typography */}
            <div className="flex flex-col justify-center leading-none">
                <span
                    className={cn(
                        "font-extrabold tracking-tight text-base sm:text-lg md:text-xl font-mono",
                        variant === "light"
                            ? "text-white"
                            : variant === "dark"
                            ? "text-slate-900"
                            : "text-foreground group-hover:text-primary transition-colors"
                    )}
                >
                    PRAVOKHA
                </span>
                {showTagline && (
                    <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-muted-foreground mt-0.5">
                        PREMIUM WEAR
                    </span>
                )}
            </div>
        </div>
    );
};

export default PravokhaLogo;
