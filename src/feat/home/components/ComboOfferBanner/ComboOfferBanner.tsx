import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import { apiClient } from "@/infra/api/apiClient";
import { ShoppingBag, Tag, Package, ArrowRight, Zap } from "lucide-react";
import styles from "./ComboOfferBanner.module.css";

interface ComboProduct {
    id: string;
    title: string;
    slug: string;
    imageUrl: string | null;
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
    active: boolean;
    imageUrl: string | null;
}

export function ComboOfferBanner() {
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

    // Rotate through offers if multiple
    useEffect(() => {
        if (offers.length <= 1) return;
        const timer = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % offers.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [offers.length]);

    if (loading || offers.length === 0) return null;

    const offer = offers[activeIndex];
    const hasProducts = offer.products && offer.products.length > 0;

    return (
        <div className={styles.card}>
            <div className={styles.content}>
                {/* Header */}
                <div className={styles.titleGroup}>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-amber-500 text-white border-0 text-xs font-bold px-2 py-0.5 animate-pulse">
                            <Zap className="h-3 w-3 mr-1 inline" />
                            LIMITED OFFER
                        </Badge>
                        {offer.discountPercentage > 0 && (
                            <Badge className="bg-emerald-500 text-white border-0 text-xs font-bold px-2 py-0.5">
                                {offer.discountPercentage}% OFF
                            </Badge>
                        )}
                    </div>
                    <h2 className={styles.title}>{offer.title}</h2>
                    <div className={styles.subtitle}>
                        {offer.originalPrice > 0 && (
                            <span className="line-through text-muted-foreground text-sm mr-2">
                                ₹{offer.originalPrice.toLocaleString()}
                            </span>
                        )}
                        Bundle Price
                        <span className={styles.priceHighlight}>₹{offer.comboPrice.toLocaleString()}</span>
                    </div>
                    {offer.description && (
                        <p className={styles.description}>{offer.description}</p>
                    )}
                </div>

                {/* Product Image Thumbnails */}
                {hasProducts && (
                    <div className="flex items-center gap-3 py-4 overflow-x-auto">
                        {offer.products.map((product, idx) => (
                            <Link
                                key={product.id}
                                to={`/products/${product.slug}`}
                                className="flex-shrink-0 group/prod relative"
                                title={product.title}
                            >
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg group-hover/prod:border-primary/60 transition-all duration-200 group-hover/prod:scale-105 bg-muted/50">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-muted/30">
                                            <Package className="h-6 w-6 text-muted-foreground/50" />
                                        </div>
                                    )}
                                    {/* Product number badge */}
                                    <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center shadow">
                                        {idx + 1}
                                    </span>
                                </div>
                                <p className="text-[10px] font-semibold text-center mt-1.5 max-w-[80px] sm:max-w-[96px] leading-tight line-clamp-2">
                                    {product.title}
                                </p>
                            </Link>
                        ))}

                        {/* Separator + "Add all" hint */}
                        {offer.products.length > 1 && (
                            <div className="flex flex-col items-center justify-center flex-shrink-0 ml-2 gap-1">
                                <div className="w-8 h-0.5 bg-gradient-to-r from-primary/40 to-transparent" />
                                <Tag className="h-4 w-4 text-primary/60" />
                                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-primary/40" />
                            </div>
                        )}
                    </div>
                )}

                {/* CTA Buttons */}
                <div className={styles.buttonGrid}>
                    {hasProducts ? (
                        // Dynamic product links
                        <>
                            {offer.products.map((product) => (
                                <Link key={product.id} to={`/products/${product.slug}`}>
                                    <Button size="lg" variant="secondary" className="gap-2 w-full">
                                        <ShoppingBag className="h-4 w-4" />
                                        <span className="truncate max-w-[120px]">{product.title}</span>
                                        <ArrowRight className="h-3 w-3 flex-shrink-0" />
                                    </Button>
                                </Link>
                            ))}
                        </>
                    ) : (
                        // Fallback — link to all products
                        <Link to="/products">
                            <Button size="lg" className="gap-2">
                                <ShoppingBag className="h-5 w-5" />
                                Shop Now
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Offer dot indicators (if multiple offers) */}
                {offers.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-3">
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
                    *Valid on all colors and sizes | Limited time offer
                </p>
            </div>
        </div>
    );
}

export default ComboOfferBanner;
