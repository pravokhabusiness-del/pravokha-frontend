import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import { apiClient } from "@/infra/api/apiClient";
import { ShoppingBag, Package, ArrowRight, Zap } from "lucide-react";
import styles from "./ComboOfferBanner.module.css";
import { getMediaUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

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
        }, 6000);
        return () => clearInterval(timer);
    }, [offers.length]);

    if (loading || offers.length === 0) return null;

    const offer = offers[activeIndex];
    const hasProducts = offer.products && offer.products.length > 0;
    const hasBgImage = !!offer.imageUrl;

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
                    <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start">
                        <Badge className="bg-amber-500 text-white border-0 text-xs font-bold px-2.5 py-0.5 animate-pulse">
                            <Zap className="h-3 w-3 mr-1 inline" />
                            LIMITED OFFER
                        </Badge>
                        {offer.discountPercentage > 0 && (
                            <Badge className="bg-emerald-500 text-white border-0 text-xs font-bold px-2.5 py-0.5">
                                {offer.discountPercentage}% OFF
                            </Badge>
                        )}
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
                            offer.products.map((product) => (
                                <Link key={product.id} to={`/product/${product.slug}`} className="w-full sm:w-auto">
                                    <Button size="lg" variant={hasBgImage ? "default" : "secondary"} className="gap-2 w-full font-bold px-6">
                                        <ShoppingBag className="h-4 w-4" />
                                        <span className="truncate max-w-[150px]">{product.title}</span>
                                        <ArrowRight className="h-3 w-3 flex-shrink-0" />
                                    </Button>
                                </Link>
                            ))
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
                                        {/* Product number badge */}
                                        <span className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                                            {idx + 1}
                                        </span>
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
                            *Valid on all colors and sizes | Limited time offer
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ComboOfferBanner;
