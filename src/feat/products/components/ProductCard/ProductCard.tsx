import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Shield, Eye, Share2 } from "lucide-react";
import { TbHeartPlus } from "react-icons/tb";
import { CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { useCart } from "@/core/context/CartContext";
import { Product } from "@/data/products";
import { apiClient } from "@/infra/api/apiClient";
import { toast } from "@/shared/hook/use-toast";
import { useWishlist } from "@/core/context/WishlistContext";
import styles from "./ProductCard.module.css";
import { cn, getMediaUrl, getProductFallbackImage } from "@/lib/utils";
import { useAuth } from "@/core/context/AuthContext";
import { useRecentlyViewed } from "@/shared/hook/useRecentlyViewed";
import { InteractiveStarRating } from "@/shared/ui/InteractiveStarRating";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const navigate = useNavigate();
    const isWishlisted = isInWishlist(product.id);
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
    const [showBlinkAnimation, setShowBlinkAnimation] = useState(false);
    const { recentlyViewed } = useRecentlyViewed();
    const isRecentlyViewed = recentlyViewed.some(p => p.id === product.id);

    const handleShareClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const productPath = product.slug ? `/product/${product.slug}` : `/product/${product.id}`;
        const url = `${window.location.origin}/#${productPath}`;

        // Try Web Share API on mobile devices first
        if (typeof navigator !== 'undefined' && navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
            try {
                await navigator.share({
                    title: product.title,
                    text: product.description || product.title,
                    url,
                });
                return;
            } catch (err: any) {
                if (err?.name === "AbortError") return;
                // Otherwise fall through to clipboard copy
            }
        }

        // Try Clipboard API
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(url);
                toast({ title: "Link copied", description: "Product link copied to clipboard." });
                return;
            }
        } catch (clipErr) {
            console.warn("Clipboard API failed, using fallback copy", clipErr);
        }

        // Fallback textarea copy for restricted browser contexts
        try {
            const textarea = document.createElement('textarea');
            textarea.value = url;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            textarea.style.top = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            textarea.setSelectionRange(0, 99999);
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            if (success) {
                toast({ title: "Link copied", description: "Product link copied to clipboard." });
                return;
            }
        } catch (fallbackErr) {
            console.error("Fallback copy failed:", fallbackErr);
        }

        toast({ title: "Link copied", description: `Product link: ${url}` });
    };

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setShowBlinkAnimation(true);
        setTimeout(() => setShowBlinkAnimation(false), 600);

        setIsTogglingWishlist(true);
        try {
            await toggleWishlist(product);
        } finally {
            setIsTogglingWishlist(false);
        }
    };

    const firstVariant = product.variants?.[0] || { id: 'none', colorName: 'None', colorHex: '#ccc', images: ['https://placehold.co/600x600/e2e8f0/64748b?text=No+Image'], sizes: [] };
    const [selectedVariant] = useState(firstVariant);
    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    const discountPercent = hasDiscount
        ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
        : 0;

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const firstAvailableSize = firstVariant?.sizes?.find((s: any) => s.stock > 0);
        if (firstAvailableSize && firstVariant.id !== 'none') {
            addToCart({
                productId: product.id,
                variantId: firstVariant.id,
                title: product.title,
                colorName: firstVariant.colorName,
                colorHex: firstVariant.colorHex,
                size: firstAvailableSize.size,
                price: product.discountPrice || product.price,
                image: (firstVariant.images && firstVariant.images.length > 0)
                    ? firstVariant.images[0]
                    : 'https://placehold.co/600x600/e2e8f0/64748b?text=No+Image',
                maxStock: firstAvailableSize.stock,
                sellerId: product.sellerId,
            });
            toast({
                title: "Added to cart",
                description: `${product.title} has been added to your cart`,
            });
        } else {
            toast({
                title: "Unavailable",
                description: "This product variant is currently unavailable.",
                variant: "destructive"
            });
        }
    };

    const p = product as any;
    const isVerified = p.isVerified || p.is_verified;

    const imageUrl = (selectedVariant?.images && selectedVariant.images.length > 0 && selectedVariant.images[0])
        ? getMediaUrl(selectedVariant.images[0])
        : '';
    
    const displayImage = (!imageUrl || imageUrl.includes("No+Image") || imageUrl.includes("placeholder"))
        ? getProductFallbackImage(product.title, product.category)
        : imageUrl;

    return (
        <div
            onClick={(e) => {
                if (product.slug) {
                    navigate(`/product/${product.slug}`);
                } else {
                    if (product.id) navigate(`/product/${product.id}`);
                }
            }}
            className={styles.card}
        >
            <div className={styles.imageContainer}>
                <img
                    src={displayImage}
                    alt={product.title}
                    className={styles.image}
                    loading="lazy"
                />

                {/* Top-Left Share Button */}
                <button
                    onClick={handleShareClick}
                    className={styles.topShareButton}
                    aria-label="Share product"
                    title="Share product"
                >
                    <Share2 className={styles.shareIcon} />
                </button>

                <div className={styles.badges}>
                    {isVerified && (
                        <Badge className={styles.badgeVerified}>
                            <Shield className="h-2 w-2" /> Verified
                        </Badge>
                    )}
                </div>

                {/* Top-Right Wishlist Button */}
                <button
                    onClick={handleToggleWishlist}
                    className={cn(
                        styles.wishlistButton,
                        showBlinkAnimation && "animate-ping-once",
                        isWishlisted && styles.wishlistActive
                    )}
                >
                    <TbHeartPlus
                        className={cn(
                            styles.wishlistIcon,
                            isWishlisted && styles.wishlistIconActive,
                            isTogglingWishlist && "animate-pulse"
                        )}
                    />
                </button>

                {isRecentlyViewed && (
                    <div className={styles.recentlyViewed} title="You viewed this product recently">
                        <Eye className={styles.recentlyViewedIcon} />
                        <span className={styles.recentlyViewedSpan}>Viewed</span>
                    </div>
                )}
            </div>

            <CardContent className={styles.content}>
                <div>
                    <h3 className={styles.title}>
                        {product.title}
                    </h3>
                    <p className={styles.description}>
                        {product.description}
                    </p>
                </div>

                <div className={styles.footer}>
                    <div className={styles.priceGroup}>
                        <div className={styles.ratingRow}>
                            {product.rating > 0 ? (
                                <div
                                    className={cn(styles.rating, "flex items-center gap-1 sm:gap-1.5 cursor-pointer hover:opacity-80 transition-opacity")}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (product.slug) {
                                            navigate(`/product/${product.slug}?tab=reviews`);
                                        }
                                    }}
                                >
                                    <InteractiveStarRating
                                        rating={product.rating}
                                        readOnly
                                        size="sm"
                                        showQuotes={false}
                                    />
                                    <span className={cn(styles.reviewCount, "text-[10px] sm:text-xs text-muted-foreground font-medium whitespace-nowrap overflow-hidden text-ellipsis")}>
                                        ({product.reviews})
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        <div className={styles.priceRow}>
                            <span className={styles.currentPrice}>
                                ₹{(product.discountPrice || product.price).toLocaleString('en-IN')}
                            </span>
                            {hasDiscount && (
                                <>
                                    <span className={styles.originalPrice}>
                                        ₹{product.price.toLocaleString('en-IN')}
                                    </span>
                                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 h-4 sm:h-5 font-bold uppercase rounded-md bg-emerald-600 dark:bg-emerald-500 text-white border-0 shadow-sm">
                                        {discountPercent}% off
                                    </Badge>
                                </>
                            )}
                        </div>

                        <div className={styles.stockRow}>
                            {(() => {
                                const totalStock = (product.variants || []).reduce((acc, variant) => acc + (variant.sizes || []).reduce((sAcc, size) => sAcc + (size.stock || 0), 0), 0);

                                if (totalStock === 0) {
                                    return (
                                        <p className={cn(styles.stock, styles.stockOut)}>
                                            Out of Stock
                                        </p>
                                    );
                                }

                                if (totalStock < 10) {
                                    return (
                                        <p className={cn(styles.stock, styles.stockLow, "animate-pulse")}>
                                            Only {totalStock} left
                                        </p>
                                    );
                                }

                                return null;
                            })()}
                        </div>
                    </div>

                    <div className={styles.actionGroup}>
                        <Button
                            size="icon"
                            className={styles.cartButton}
                            onClick={handleQuickAdd}
                            title="Add to Cart"
                            aria-label="Add to Cart"
                            disabled={!product.variants || product.variants.length === 0 || product.variants.every(v => !v.sizes || v.sizes.every(s => s.stock === 0))}
                        >
                            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </div>
    );
}

export default ProductCard;
