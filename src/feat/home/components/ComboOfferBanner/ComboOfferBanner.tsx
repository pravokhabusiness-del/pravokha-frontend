import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import { apiClient } from "@/infra/api/apiClient";
import { ShoppingBag, Package, ArrowRight, Zap } from "lucide-react";
import styles from "./ComboOfferBanner.module.css";
import { getMediaUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useCart } from "@/core/context/CartContext";
import { toast } from "@/shared/hook/use-toast";

interface ComboProduct {
    id: string;
    title: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    imageUrl: string | null;
    stock: number;
    vendorId: string;
    variants: Array<{
        id: string;
        name: string;
        colorName: string | null;
        colorHex: string | null;
        images: string | string[] | null;
        sizes: Array<{
            id: string;
            size: string;
            stock: number;
        }>;
    }>;
}

interface ComboOffer {
    id: string;
    title: string;
    description: string;
    products: ComboProduct[];
    productIds: string[];
    comboPrice: number;
    originalPrice: number;
    discountPercentage: number;
    startDate?: string | null;
    endDate?: string | null;
    active: boolean;
    imageUrl: string | null;
}

import { Calendar, Clock } from "lucide-react";

// Interactive Live Countdown Timer component
function ComboTimer({ endDateStr }: { endDateStr?: string | null }) {
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 23, minutes: 59, seconds: 59 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            let target: number;
            if (endDateStr) {
                target = new Date(endDateStr).getTime();
            } else {
                // Default to end of current day (midnight)
                const now = new Date();
                const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
                target = midnight.getTime();
            }

            const diff = target - Date.now();
            if (diff <= 0) {
                return { hours: 0, minutes: 0, seconds: 0 };
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            return { hours, minutes, seconds };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endDateStr]);

    const formatNum = (num: number) => String(num).padStart(2, "0");

    return (
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-amber-500/40 text-amber-400 shadow-md">
            <Clock className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 mr-1">Ends In:</span>
            <div className="flex items-center gap-1 font-mono text-xs font-bold text-white">
                <span className="bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 border border-amber-500/30">{formatNum(timeLeft.hours)}h</span>
                <span className="text-amber-400">:</span>
                <span className="bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 border border-amber-500/30">{formatNum(timeLeft.minutes)}m</span>
                <span className="text-amber-400">:</span>
                <span className="bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 border border-amber-500/30">{formatNum(timeLeft.seconds)}s</span>
            </div>
        </div>
    );
}

export function ComboOfferBanner() {
    const { addMultipleToCart } = useCart();
    const [offers, setOffers] = useState<ComboOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const { data } = await apiClient.get('/combo-offers');
                const raw = data.comboOffers || data.data || [];
                const active = raw.filter((o: any) => o.active).map((o: any) => ({
                    ...o,
                    products: Array.isArray(o.products) ? o.products : [],
                    productIds: Array.isArray(o.productIds) ? o.productIds : [],
                }));
                setOffers(active);
            } catch {
                // silently fail — banner is optional
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    // Offer rotation timer removed

    if (loading || offers.length === 0) return null;

    const offer = offers[activeIndex];
    const hasProducts = offer.products && offer.products.length > 0;
    const hasBgImage = !!offer.imageUrl;

    const computedDiscountPercent = offer.originalPrice > 0
        ? Math.round(((offer.originalPrice - offer.comboPrice) / offer.originalPrice) * 100)
        : (offer.discountPercentage || 25);

    const formatDateOnly = (dateStr?: string | null) => {
        if (!dateStr) return null;
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return null;
        }
    };

    const startDateText = formatDateOnly(offer.startDate);
    const endDateText = formatDateOnly(offer.endDate);

    const handleAddComboToCart = () => {
        if (!hasProducts) return;

        const itemsToAdd = offer.products.map(product => {
            const firstVariant = product.variants?.[0] || {
                id: 'none',
                colorName: 'None',
                colorHex: '#ccc',
                images: [],
                sizes: []
            };

            let parsedImages: string[] = [];
            if (firstVariant.images) {
                try {
                    parsedImages = typeof firstVariant.images === 'string'
                        ? JSON.parse(firstVariant.images)
                        : (Array.isArray(firstVariant.images) ? firstVariant.images : [firstVariant.images]);
                } catch {
                    parsedImages = [];
                }
            }

            const sizesList = firstVariant.sizes || [];
            const firstAvailableSize = sizesList.find((s: any) => s.stock > 0) || {
                size: 'Free Size',
                stock: 0
            };

            return {
                item: {
                    productId: product.id,
                    variantId: firstVariant.id,
                    title: product.title,
                    colorName: firstVariant.colorName || 'None',
                    colorHex: firstVariant.colorHex || '#ccc',
                    size: firstAvailableSize.size,
                    price: product.price,
                    image: (parsedImages && parsedImages.length > 0)
                        ? parsedImages[0]
                        : (product.imageUrl || 'https://placehold.co/600x600/e2e8f0/64748b?text=No+Image'),
                    maxStock: firstAvailableSize.stock || product.stock || 0,
                    sellerId: product.vendorId || '',
                },
                quantity: 1
            };
        });

        // Verify that all items in the combo are valid and have stock
        const anyUnavailable = itemsToAdd.some(i => i.item.variantId === 'none' || i.item.maxStock < 1);
        if (anyUnavailable) {
            toast({
                title: "Combo unavailable",
                description: "One or more items in this combo are currently out of stock.",
                variant: "destructive"
            });
            return;
        }

        addMultipleToCart(itemsToAdd);
    };

    return (
        <div 
            className={cn(styles.card, hasBgImage && styles.hasBgImage)}
            style={offer.imageUrl ? {
                backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.8) 100%), url(${getMediaUrl(offer.imageUrl)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            } : undefined}
        >
            <div className={styles.content}>
                {/* Left Column: Details & CTA */}
                <div className={styles.leftColumn}>
                    <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start mb-2">
                        <Badge className="bg-amber-500 text-white border-0 text-xs font-bold px-2.5 py-1 animate-pulse shadow-md">
                            <Zap className="h-3 w-3 mr-1 inline" />
                            LIMITED OFFER
                        </Badge>
                        {computedDiscountPercent > 0 && (
                            <Badge className="bg-emerald-500 text-white border-0 text-xs font-bold px-2.5 py-1 shadow-md">
                                {computedDiscountPercent}% OFF
                            </Badge>
                        )}
                        {/* Attractive Combo Date & Time Badge */}
                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white text-xs font-semibold">
                            <Calendar className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                            <span>
                                {endDateText ? `Valid till ${endDateText}` : startDateText ? `Offer from ${startDateText}` : "Limited Time Deal"}
                            </span>
                        </div>
                        {/* Live Timer Badge */}
                        <ComboTimer endDateStr={offer.endDate} />
                    </div>

                    <div className={styles.titleGroup}>
                        <h2 className={styles.title}>{offer.title}</h2>
                        
                        <div className={styles.priceWrapper}>
                            {offer.originalPrice > 0 && (
                                <span className={styles.originalPrice}>
                                    ₹{offer.originalPrice.toLocaleString()}
                                </span>
                            )}
                            <span className={styles.subtitle}>Bundle Price</span>
                            <span className={styles.priceHighlight}>₹{offer.comboPrice.toLocaleString()}</span>
                        </div>

                        {offer.description && (
                            <p className={styles.description}>{offer.description}</p>
                        )}
                    </div>

                    {/* CTA Buttons */}
                    <div className={styles.buttonGrid}>
                        {hasProducts ? (
                            <Button 
                                size="lg" 
                                onClick={handleAddComboToCart}
                                className="gap-2 w-full font-bold px-8 bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg shadow-amber-500/25 transition-all hover:scale-105"
                            >
                                <ShoppingBag className="h-5 w-5" />
                                Apply Offer & Add to Cart
                                <ArrowRight className="h-4 w-4 flex-shrink-0 animate-bounce" />
                            </Button>
                        ) : (
                            <Link to="/products" className="w-full sm:w-auto">
                                <Button size="lg" className="gap-2 w-full font-bold">
                                    <ShoppingBag className="h-5 w-5" />
                                    Shop Now
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Right Column: Product Showcase */}
                {hasProducts && (
                    <div className={styles.rightColumn}>
                        <div className="flex items-center gap-2 mb-1 justify-center lg:justify-start">
                            <Package className="h-4 w-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">What's Included:</span>
                        </div>
                        
                        <div className={styles.productsContainer}>
                            {offer.products.map((product, idx) => (
                                <Link
                                    key={product.id}
                                    to={`/product/${product.slug}`}
                                    className={styles.productCard}
                                    title={product.title}
                                >
                                    <div className={styles.productImageWrapper}>
                                        {product.imageUrl ? (
                                            <img
                                                src={getMediaUrl(product.imageUrl)}
                                                alt={product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-muted/30">
                                                <Package className="h-8 w-8 text-muted-foreground/30" />
                                            </div>
                                        )}

                                    </div>
                                    <p className={styles.productTitle}>
                                        {product.title}
                                    </p>
                                </Link>
                            ))}
                        </div>

                        {/* Offer dot indicators (if multiple offers) */}
                        {offers.length > 1 && (
                            <div className="flex justify-center lg:justify-start gap-1.5 mt-2">
                                {offers.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveIndex(i)}
                                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeIndex ? 'bg-primary w-4' : 'bg-muted-foreground/30'}`}
                                    />
                                ))}
                            </div>
                        )}

                        <p className={styles.footer}>
                            {endDateText ? `*Valid until ${endDateText} | Limited time offer` : startDateText ? `*Offer started ${startDateText} | Limited time offer` : "*Valid on all colors and sizes | Limited time offer"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ComboOfferBanner;
