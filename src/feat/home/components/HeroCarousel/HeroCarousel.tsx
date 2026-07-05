import { useState, useEffect, useCallback } from "react";
import { Button } from "@/ui/Button";
import { apiClient } from "@/infra/api/apiClient";
import hero1 from "@/assets/hero-premium-tees.png";
import hero2 from "@/assets/hero-2.png";
import hero3 from "@/assets/hero-3.png";
import { Link } from "react-router-dom";
import styles from "./HeroCarousel.module.css";
import { cn, getMediaUrl } from "@/lib/utils";
import { ArrowRight } from "lucide-react";


interface Slide {
    image: string;
    title: string;
    description: string;
    cta: string;
    link: string;
    id?: string;
    isCombo?: boolean;
    isWhatsApp?: boolean;
    isExternal?: boolean;
    badge?: string;
}

const whatsappSlide: Slide = {
    id: "whatsapp-catalogue",
    image: hero2,
    title: "Browse Our WhatsApp Catalogue",
    description: "View our full product catalogue on WhatsApp — easy browsing, instant ordering, direct support.",
    cta: "Open Catalogue",
    link: "https://wa.me/c/917339232817",
    isWhatsApp: true,
    isExternal: true,
    badge: "WhatsApp Catalogue",
};

const staticSlides: Slide[] = [
    { image: hero1, title: "Premium Quality Tees", description: "Discover comfort & style in every thread", cta: "Shop T-Shirts", link: "/products?search=T-Shirt" },
    { image: hero2, title: "Athletic Track Pants", description: "Performance meets fashion", cta: "Shop Track Pants", link: "/products?search=Track+Pants" },
    { image: hero3, title: "Summer Collection", description: "Fresh styles for the season", cta: "Shop Shorts", link: "/products?search=Shorts" },
    { image: hero1, title: "Bulk Orders? Contact Admin", description: "Special pricing for bulk purchases. Wholesale rates and custom quotes directly from our admin team.", cta: "WhatsApp Admin", link: "https://wa.me/917339232817?text=Hi%2C%20I%20am%20interested%20in%20a%20bulk%20order.", isExternal: true, badge: "Bulk Orders" },
];

export function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [slides, setSlides] = useState<Slide[]>([...staticSlides, whatsappSlide]);

    useEffect(() => { fetchAllBanners(); }, []);

    const fetchAllBanners = async () => {
        try {
            const [bannersRes, comboRes] = await Promise.allSettled([
                apiClient.get("/banners", { params: { active: true } }),
                apiClient.get("/home/combo-offers", { params: { activeOnly: "true" } }),
            ]);

            const dynamicSlides: Slide[] = [];

            if (bannersRes.status === "fulfilled" && bannersRes.value.data.success) {
                const adminBanners = (bannersRes.value.data.banners || []).map((b: any): Slide => ({
                    id: b.id, image: getMediaUrl(b.imageUrl) || hero1, title: b.title,
                    description: b.subtitle || "", cta: b.buttonText || "Shop Now",
                    link: b.buttonLink || "/products",
                    isExternal: (b.buttonLink || "").startsWith("http"),
                }));
                dynamicSlides.push(...adminBanners);
            }

            if (comboRes.status === "fulfilled" && comboRes.value.data.success) {
                const comboSlides: Slide[] = (comboRes.value.data.offers || []).map((offer: any): Slide => {
                    let productIdsStr = "";
                    try {
                        const ids = typeof offer.productIds === "string" ? JSON.parse(offer.productIds) : offer.productIds;
                        if (Array.isArray(ids) && ids.length > 0) productIdsStr = ids.join(",");
                    } catch { /* ignore */ }
                    return {
                        id: offer.id, image: offer.imageUrl || hero1, title: offer.title,
                        description: offer.description || `Bundle price: ₹${offer.comboPrice}`,
                        cta: "Shop Bundle",
                        link: productIdsStr ? `/products?ids=${productIdsStr}` : `/products?search=${encodeURIComponent(offer.title)}`,
                        isCombo: true, badge: "Limited Time Offer",
                    };
                });
                dynamicSlides.push(...comboSlides);
            }

            const baseSlides = dynamicSlides.length > 0 ? dynamicSlides : staticSlides;
            setSlides([...baseSlides, whatsappSlide]);
        } catch (e) {
            console.error("Error fetching banners:", e);
        }
    };

    const goToSlide = useCallback((index: number) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
    }, []);

    const prev = useCallback(() => setCurrentSlide(c => (c - 1 + slides.length) % slides.length), [slides.length]);
    const next = useCallback(() => setCurrentSlide(c => (c + 1) % slides.length), [slides.length]);

    useEffect(() => {
        if (!isAutoPlaying) return;
        const t = setInterval(next, 5000);
        return () => clearInterval(t);
    }, [isAutoPlaying, next]);

    const slide = slides[currentSlide];

    const renderCTA = () => {
        const btnClass = cn(styles.ctaButton, slide.isWhatsApp && styles.ctaButtonWhatsApp);
        if (slide.isExternal) {
            return (
                <a href={slide.link} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className={btnClass}>
                        {slide.isWhatsApp && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true">
                                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                            </svg>
                        )}
                        {slide.cta}
                    </Button>
                </a>
            );
        }
        return (
            <Link to={slide.link}>
                <Button size="lg" className={btnClass}>
                    {slide.cta}
                    {!slide.isWhatsApp && <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />}
                </Button>
            </Link>
        );
    };

    return (
        <section className={styles.section} onMouseEnter={() => setIsAutoPlaying(false)} onMouseLeave={() => setIsAutoPlaying(true)}>
            <div className={styles.grid}>
                {slides.map((s, i) => (
                    <div key={s.id || i} className={cn(styles.slide, i === currentSlide && styles.slideActive)} aria-hidden={i !== currentSlide}>
                        <div className={styles.imageContainer}>
                            {/* Single cover-fit image — fills the 16:9 container edge-to-edge, no blur sides */}
                            <img src={s.image} alt={s.title} className={styles.imageMain} loading={i === 0 ? "eager" : "lazy"} />
                            <div className={cn(styles.overlay, s.isCombo && styles.overlayCombo, s.isWhatsApp && styles.overlayWhatsApp)} />
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.contentWrapper}>
                <div className={styles.contentContainer}>
                    <div className={styles.content}>
                        {(slide.badge || slide.isWhatsApp || slide.isCombo) && (
                            <span className={cn(styles.badge, slide.isWhatsApp && styles.badgeWhatsApp)}>
                                {slide.badge || (slide.isWhatsApp ? "WhatsApp Catalogue" : "Limited Time Offer")}
                            </span>
                        )}
                        <h2 className={styles.title}>{slide.title}</h2>
                        <p className={styles.description}>{slide.description}</p>
                        <div className={styles.ctaWrapper}>{renderCTA()}</div>
                    </div>
                </div>
            </div>



            {slides.length >= 2 && (
                <div className={styles.dots}>
                    {slides.map((_, i) => (
                        <button key={i} onClick={() => goToSlide(i)}
                            className={cn(styles.dot, i === currentSlide && styles.dotActive)}
                            aria-label={`Go to slide ${i + 1}`} />
                    ))}
                </div>
            )}
        </section>
    );
}
