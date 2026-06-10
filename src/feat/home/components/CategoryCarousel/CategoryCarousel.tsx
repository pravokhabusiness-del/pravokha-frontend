import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CategorySmallCard } from "@/feat/products/components/CategorySmallCard";
import styles from "./CategoryCarousel.module.css";

interface Category {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    image?: string;
    slug: string;
    status?: string;
}

interface CategoryCarouselProps {
    categories: Category[];
    getFallbackImage: (slug: string) => string;
    isCategoryActive: (status?: string) => boolean;
}

export function CategoryCarousel({
    categories,
    getFallbackImage,
    isCategoryActive,
}: CategoryCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isContainerHovered, setIsContainerHovered] = useState(false);
    const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pillsRef = useRef<HTMLDivElement>(null);

    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const dragStartX = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStartX.current === null || touchEndX.current === null) return;
        const diff = touchStartX.current - touchEndX.current;
        const threshold = 50;

        if (diff > threshold) {
            goNext();
        } else if (diff < -threshold) {
            goPrev();
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        dragStartX.current = e.clientX;
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (dragStartX.current === null) return;
        const diff = dragStartX.current - e.clientX;
        const threshold = 50;

        if (diff > threshold) {
            goNext();
        } else if (diff < -threshold) {
            goPrev();
        }

        dragStartX.current = null;
    };

    const total = categories.length;
    const canGoPrev = total > 1;
    const canGoNext = total > 1;

    /* ── Navigation Handlers ───────────────────────────────── */
    const goNext = useCallback(() => {
        setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
    }, [total]);

    const goPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
    }, [total]);

    /* ── Autoplay — Pause on hover ─────────────────────────── */
    useEffect(() => {
        if (total <= 1 || isContainerHovered) {
            if (autoplayRef.current) clearInterval(autoplayRef.current);
            return;
        }

        autoplayRef.current = setInterval(goNext, 3500);
        return () => {
            if (autoplayRef.current) clearInterval(autoplayRef.current);
        };
    }, [total, isContainerHovered, goNext]);

    /* ── Scroll Pill into view when index changes ──────────── */
    useEffect(() => {
        if (!pillsRef.current) return;
        const activePill = pillsRef.current.querySelector(`[data-index="${currentIndex}"]`) as HTMLElement;
        if (activePill) {
            const container = pillsRef.current;
            const containerWidth = container.clientWidth;
            const pillWidth = activePill.clientWidth;

            const pillRect = activePill.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            const pillLeft = pillRect.left - containerRect.left + container.scrollLeft;
            const targetScrollLeft = pillLeft - (containerWidth / 2) + (pillWidth / 2);

            container.scrollTo({
                left: targetScrollLeft,
                behavior: "smooth",
            });
        }
    }, [currentIndex]);

    /* ── Coverflow Styles Calculation ──────────────────────── */
    const getCoverflowStyles = (index: number) => {
        // Calculate shortest distance in a circular/infinite carousel logic
        let offset = index - currentIndex;
        if (Math.abs(offset) > total / 2) {
            offset = offset > 0 ? offset - total : offset + total;
        }

        // Hidden / Out-of-bounds cards
        if (Math.abs(offset) > 2) {
            return {
                zIndex: 0,
                opacity: 0,
                transform: `translate(${offset > 0 ? '240%' : '-340%'}, -50%) scale(0.5)`,
                pointerEvents: 'none' as const,
            };
        }

        if (offset === 0) {
            // Active Center Focus Card
            return {
                zIndex: 30,
                opacity: 1,
                transform: 'translate(-50%, -50%) scale(1.08)',
                filter: 'none',
            };
        }

        if (offset === -1) {
            // Immediate Left Layer
            return {
                zIndex: 20,
                opacity: 0.85,
                transform: 'translate(-128%, -50%) scale(0.88)',
            };
        }

        if (offset === 1) {
            // Immediate Right Layer
            return {
                zIndex: 20,
                opacity: 0.85,
                transform: 'translate(28%, -50%) scale(0.88)',
            };
        }

        if (offset === -2) {
            // Far Left Layer
            return {
                zIndex: 10,
                opacity: 0.45,
                transform: 'translate(-195%, -50%) scale(0.72)',
            };
        }

        if (offset === 2) {
            // Far Right Layer
            return {
                zIndex: 10,
                opacity: 0.45,
                transform: 'translate(95%, -50%) scale(0.72)',
            };
        }

        return { zIndex: 0, opacity: 0 };
    };

    /* ── Empty Loading State ───────────────────────────────── */
    if (total === 0) {
        return (
            <div className={styles.containerCard}>
                <div className={styles.skeletonArea}>
                    <div className={styles.skeletonCard} />
                </div>
            </div>
        );
    }

    return (
        <div
            className={styles.containerCard}
            onMouseEnter={() => setIsContainerHovered(true)}
            onMouseLeave={() => setIsContainerHovered(false)}
        >
            {/* 1. Explicit Top-Left / Top-Right Corner Navigation Arrows */}
            <button
                className={styles.topArrowLeft}
                onClick={goPrev}
                disabled={!canGoPrev}
                aria-label="Previous category"
            >
                <ChevronLeft size={22} strokeWidth={2.5} />
            </button>

            <button
                className={styles.topArrowRight}
                onClick={goNext}
                disabled={!canGoNext}
                aria-label="Next category"
            >
                <ChevronRight size={22} strokeWidth={2.5} />
            </button>

            {/* 2. Premium Header Section (Dribbble Layout Alignment) */}
            <div className={styles.headerSection}>
                <span className={styles.galleryLabel}>GALLERY</span>
                <h3 className={styles.mainTitle}>Shop by Category</h3>
                <p className={styles.subTitle}>
                    See the world through our curated collections: premium clothing tailored for everyday comfort and bold self-expression.
                </p>
            </div>

            {/* 3. Horizontal Pills Controls Row with Inline Arrow Triggers */}
            <div className={styles.pillsWrapper}>
                <button
                    type="button"
                    className={styles.inlineArrowLeft}
                    onClick={goPrev}
                    aria-label="Previous"
                >
                    &lt;--
                </button>

                <div className={styles.pillsTrack} ref={pillsRef}>
                    {categories.map((cat, idx) => (
                        <button
                            key={cat.id}
                            type="button"
                            data-index={idx}
                            className={`${styles.pillButton} ${idx === currentIndex ? styles.pillActive : ""}`}
                            onClick={() => setCurrentIndex(idx)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    className={styles.inlineArrowRight}
                    onClick={goNext}
                    aria-label="Next"
                >
                    --&gt;
                </button>
            </div>

            {/* 4. Beautiful Coverflow Stacked Display Showcase Area */}
            <div
                className={styles.showcaseArea}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            >
                {categories.map((category, index) => {
                    const coverStyle = getCoverflowStyles(index);
                    const isActive = index === currentIndex;
                    // Any visible side card is rendered as blurred to match the Dribbble design visual depth
                    const isBlurred = !isActive;

                    return (
                        <div
                            key={category.id}
                            className={styles.coverflowSlot}
                            style={coverStyle}
                            onClickCapture={(e) => {
                                // Clicking any side card brings it smoothly into the prominent active focus
                                if (!isActive) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setCurrentIndex(index);
                                }
                            }}
                        >
                            <CategorySmallCard
                                title={category.name}
                                description={category.description || "Explore our premium selection"}
                                image={
                                    category.image ||
                                    category.image_url ||
                                    getFallbackImage(category.slug)
                                }
                                link={`/products?category=${category.slug}`}
                                disabled={!isCategoryActive(category.status)}
                                isActive={isActive}
                                isBlurred={isBlurred}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CategoryCarousel;
