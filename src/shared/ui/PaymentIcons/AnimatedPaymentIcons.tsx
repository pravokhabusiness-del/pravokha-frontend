import styles from "./PaymentIcons.module.css";
import { cn } from "@/lib/utils";

function UpiLogo({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 16" className={className} xmlns="http://www.w3.org/2000/svg" fill="none">
            <path d="M3 2h3.5l-2.2 9H1.8L3.6 3.8H1.5L1.8 2H3z" fill="#09893E"/>
            <path d="M9.8 4.2H6.6l-.8 3.5c-.1.5-.2 1-.2 1.4 0 .7.3 1.1.9 1.1.7 0 1.3-.4 1.7-1.1l-.8-3.4c-.1-.5-.2-1-.2-1.5z" fill="#09893E"/>
            <path d="M13.2 8.5l.8-3.5c.1-.4.2-.8.2-1.2H11c0 .4-.1.8-.1 1.2l-.9 3.5h3.2zm.9-4.3H16L14 11.5c-.4 1.5-1.2 2.2-2.5 2.2-.6 0-1.1-.2-1.4-.4l.4-1.2c.2.1.5.2.8.2.5 0 .9-.3 1.1-1l.2-.5H11.5l1.6-5.1h1z" fill="#0F72B9"/>
            <path d="M1.5 13.5h15.5" stroke="#0F72B9" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    );
}

function GPayLogo({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 38 16" className={className} xmlns="http://www.w3.org/2000/svg" fill="none">
            <path d="M7.5 8.1c0-.5-.05-.9-.13-1.3H4v2.5h2c-.1.5-.4.9-.8 1.2v1h1.3c.7-.7 1.1-1.7 1.1-3.4z" fill="#4285F4" />
            <path d="M4 11.7c1 0 1.8-.3 2.5-.9l-1.3-1c-.3.2-.7.3-1.2.3-.9 0-1.7-.6-2-1.4H.7V9.7c.6 1.2 1.9 2 3.3 2z" fill="#34A853" />
            <path d="M2 8.7c-.1-.3-.1-.6-.1-.9s.05-.6.1-.9V6H.7c-.3.6-.4 1.2-.4 1.8s.1 1.2.4 1.8l1.3-1z" fill="#FBBC05" />
            <path d="M4 4.3c.5 0 1 .2 1.4.5l1-1C5.8 3.3 5 3 4 3c-1.4 0-2.7.8-3.3 2l1.3 1c.3-.8 1.1-1.7 2-1.7z" fill="#EA4335" />
            <path d="M10.8 4.5h2.5c.7 0 1.2.2 1.5.5s.5.7.5 1.3-.2.9-.5 1.2-1 .5-1.7.5h-1v2.5h-1.3V4.5zm2.5 2.2c.3 0 .5-.07.7-.2s.2-.3.2-.5c0-.2-.07-.4-.2-.5s-.4-.2-.7-.2h-1.2V8h1.2v-1.3z" fill="currentColor" />
            <path d="M19.2 6.5c-.3-.4-.7-.6-1.2-.6s-.9.2-1.2.6-.4.9-.4 1.6.1 1.1.4 1.5.7.6 1.2.6.9-.2 1.2-.6.4-.9.4-1.6c0-.8-.1-1.2-.4-1.6zm-1.2 3.1c-.3 0-.5-.1-.7-.4s-.2-.7-.2-1.2.1-1 .2-1.2.4-.4.7-.4.5.1.7.4.2.7.2 1.2c0 .6-.1 1-.2 1.2s-.4.4-.7.4z" fill="currentColor" />
            <path d="M24.2 6h-1.4l-1 2.8L20.8 6h-1.4l1.7 4.1L20 12.8h1.3l2.9-6.8z" fill="currentColor" />
        </svg>
    );
}

function PhonePeLogo({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 16 16" className={className} xmlns="http://www.w3.org/2000/svg" fill="none">
            <rect width="16" height="16" rx="3.5" fill="#5f259f" />
            <path d="M10.5 3h-5c-.8 0-1.5.7-1.5 1.5v7c0 .8.7 1.5 1.5 1.5h5c.8 0 1.5-.7 1.5-1.5v-7c0-.8-.7-1.5-1.5-1.5zm-2.5 9.2c-.4 0-.8-.4-.8-.8s.4-.8.8-.8.8.4.8.8-.4.8-.8.8zm2.2-2.7H6c-.3 0-.5-.2-.5-.5v-4c0-.3.2-.5.5-.5h4.2c.3 0 .5.2.5.5v4c0 .3-.2.5-.5.5z" fill="white" />
            <path d="M7.2 5.5h1.6c.4 0 .7.1.7.4 0 .3-.3.4-.7.4H7.2V7.1h.8c.4 0 .7.1.7.4s-.3.4-.7.4H7.2V9h-.7V7.9h-.5V7.1h.5V6.7h-.5V5.5h.5V5.5zm.9 0c.2 0 .3 0 .4.1V5.5h-.4z" fill="#5f259f" />
        </svg>
    );
}

function PaytmLogo({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 36 12" className={className} xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="10.5" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11" fill="#00baf2" letterSpacing="-0.5px">pay</text>
            <text x="19.5" y="10.5" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11" fill="#002e6e" letterSpacing="-0.5px">tm</text>
        </svg>
    );
}

const paymentMethods = [
    { name: "UPI", renderLogo: (className: string) => <UpiLogo className={className} /> },
    { name: "GPay", renderLogo: (className: string) => <GPayLogo className={className} /> },
    { name: "PhonePe", renderLogo: (className: string) => <PhonePeLogo className={className} /> },
    { name: "Paytm", renderLogo: (className: string) => <PaytmLogo className={className} /> },
];

export function AnimatedPaymentIcons() {
    return (
        <div className={cn(styles.animatedFlex, "flex flex-wrap items-center gap-x-6 gap-y-3 justify-center md:justify-start")}>
            <p className={cn(styles.label, "mr-2")}>We Accept:</p>
            {paymentMethods.map((method) => (
                <div
                    key={method.name}
                    className={cn(styles.animatedItem, "flex items-center gap-2 bg-white/5 dark:bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/10 hover:border-white/20 transition-all shadow-sm duration-300 hover:scale-105")}
                >
                    {method.renderLogo("h-3.5 w-auto flex-shrink-0")}
                    <span className={styles.methodName}>{method.name}</span>
                </div>
            ))}
        </div>
    );
}
