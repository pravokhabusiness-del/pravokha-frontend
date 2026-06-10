import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { HeroCarousel } from "../../components/HeroCarousel";
import { ProductGrid } from "@/feat/products/components/ProductGrid";
import { ProductCard } from "@/feat/products/components/ProductCard";
import { CategoryCard } from "@/feat/products/components/CategoryCard";
import { CategorySmallCard } from "@/feat/products/components/CategorySmallCard";
import { CategoryCarousel } from "../../components/CategoryCarousel";
import { ComboOfferBanner } from "../../components/ComboOfferBanner";
import styles from "./HomePage.module.css";
import categoryStyles from "../../components/CategoryCarousel/CategoryCarousel.module.css";
import typography from "@/styles/Typography.module.css";
import layout from "@/styles/Layout.module.css";

import { apiClient } from "@/infra/api/apiClient";
import { BottomBannerCarousel } from "@/shared/ui/BottomBannerCarousel";

import { useGsapAnimations } from "@/shared/hook/useGsapAnimations";
import { ArrowRight, TrendingUp, Zap, Shield, Mail, Info } from "lucide-react";
import categoryMenImg from "@/assets/category-men.jpg";
import categoryWomenImg from "@/assets/category-women.jpg";
import categoryKidsImg from "@/assets/category-kids.jpg";
import tshirtImg from "@/assets/category-tshirts.jpg";
import trackpantsImg from "@/assets/category-trackpants.jpg";
import shortsImg from "@/assets/category-shorts.jpg";
import { Product } from "@/data/products";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    status: string;
}

// Fallback image logic if DB image is missing
const getFallbackImage = (slug: string) => {
    const images: Record<string, string> = {
        men: categoryMenImg,
        women: categoryWomenImg,
        kids: categoryKidsImg,
        tshirts: tshirtImg,
        trackpants: trackpantsImg,
        shorts: shortsImg,
        "mens-collection": categoryMenImg,
        "womens-collection": categoryWomenImg,
        "kids-collection": categoryKidsImg
    };
    return images[slug] || categoryMenImg; // Default to Men's image if no match found
};

// Helper to determine if category is valid for link
const isCategoryActive = (status: string) => status === 'active';

export function HomePage() {
    useGsapAnimations();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [collectionTab, setCollectionTab] = useState<'all' | 'top' | 'new'>('all');

    useEffect(() => {
        fetchCategories();
        fetchHomeProducts();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get('/categories');
            if (response.data.success) {
                const sortedCategories = (response.data.categories || []).sort((a: Category, b: Category) => {
                    if (a.status === 'active' && b.status !== 'active') return -1;
                    if (a.status !== 'active' && b.status === 'active') return 1;
                    return 0;
                });
                setCategories(sortedCategories);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchHomeProducts = async () => {
        try {
            setLoadingProducts(true);

            const response = await apiClient.get('/products', { params: { limit: 12, sort: 'rating' } });

            if (response.data.success) {
                const data = response.data.products;
                const transformed: Product[] = data.map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    slug: p.slug,
                    description: p.description,
                    price: parseFloat(String(p.price)),
                    compareAtPrice: p.compareAtPrice ? parseFloat(String(p.compareAtPrice)) : undefined,
                    category: p.category?.name || p.category,
                    rating: parseFloat(String(p.rating || 4.5)),
                    reviews: p.reviews || 12,
                    sku: p.sku,
                    variants: (p.variants || []).map((v: any) => ({
                        id: v.id,
                        colorName: v.colorName,
                        colorHex: v.colorHex,
                        images: (v.images && Array.isArray(v.images) && v.images.length > 0)
                            ? v.images
                            : ['https://placehold.co/600x600/e2e8f0/64748b?text=No+Image'],
                        sizes: (v.sizes || []).map((s: any) => ({
                            size: s.size,
                            stock: s.stock,
                        })),
                    })),
                }));

                setProducts(transformed);
            }
        } catch (error) {
            console.error("Error fetching home products:", error);
        } finally {
            setLoadingProducts(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (loadingCategories || loadingProducts) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                {/* 1. Header Navigation Skeleton (Shadow simulation for visual anchor) */}
                <div className="w-full h-16 sm:h-20 border-b border-border/40 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
                    <div className="flex items-center gap-4 sm:gap-8">
                        {/* Logo Placeholder */}
                        <div className="h-6 w-24 sm:h-8 sm:w-32 bg-muted/60 rounded-lg animate-pulse" />

                        {/* Nav Links Placeholder (Desktop) */}
                        <div className="hidden lg:flex items-center gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-3 w-12 bg-muted/50 rounded animate-pulse" />
                            ))}
                        </div>
                    </div>

                    {/* Action Icons Placeholder */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-muted/50 animate-pulse" />
                        ))}
                    </div>
                </div>

                {/* 2. Hero Banner Skeleton - Precise Height Matching */}
                <div className="w-full bg-muted/50 relative animate-pulse mb-8 overflow-hidden" style={{aspectRatio:"16/7",minHeight:"220px",maxHeight:"640px"}}>
                    <div className="absolute inset-x-0 bottom-8 flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-1 w-3 sm:h-1.5 sm:w-6 rounded-full bg-white/20" />
                        ))}
                    </div>
                    {/* Dark gradient overlay simulation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                </div>

                {/* 3. "Shop by Category" Section Skeleton - Aspect Ratio Mirrored */}
                {/* 3. "Shop by Category" Section Skeleton - Coverflow Aspect & Stacked Layout Mirrored */}
                <section className={`w-full ${layout.sectionSpacing} px-4 sm:px-6 lg:px-8`}>
                    <div className={categoryStyles.containerCard}>
                        {/* Top corner arrows simulation */}
                        <div className={`${categoryStyles.topArrowLeft} opacity-30 pointer-events-none`} />
                        <div className={`${categoryStyles.topArrowRight} opacity-30 pointer-events-none`} />

                        {/* Header section */}
                        <div className={categoryStyles.headerSection}>
                            <span className={categoryStyles.galleryLabel}>GALLERY</span>
                            <h3 className={categoryStyles.mainTitle}>Shop by Category</h3>
                            <p className={categoryStyles.subTitle}>
                                See the world through our curated collections: premium clothing tailored for everyday comfort and bold self-expression.
                            </p>
                        </div>

                        {/* Pills navigation row simulation */}
                        <div className={categoryStyles.pillsWrapper}>
                            <div className="flex gap-2 max-w-full overflow-hidden justify-center px-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-9 w-24 bg-muted/20 border border-border/10 rounded-full animate-pulse flex-shrink-0" />
                                ))}
                            </div>
                        </div>

                        {/* Stacked Coverflow Showcase Area simulation */}
                        <div className={categoryStyles.showcaseArea}>
                            {/* Far Left Card */}
                            <div 
                                className={`${categoryStyles.coverflowSlot} bg-muted/10 animate-pulse border border-border/10 hidden md:block`}
                                style={{
                                    zIndex: 10,
                                    opacity: 0.25,
                                    transform: 'translate(-195%, -50%) scale(0.72)',
                                    pointerEvents: 'none'
                                }}
                            />
                            {/* Immediate Left Card */}
                            <div 
                                className={`${categoryStyles.coverflowSlot} bg-muted/20 animate-pulse border border-border/25`}
                                style={{
                                    zIndex: 20,
                                    opacity: 0.55,
                                    transform: 'translate(-128%, -50%) scale(0.88)',
                                    pointerEvents: 'none'
                                }}
                            />
                            {/* Active Center Card */}
                            <div 
                                className={`${categoryStyles.coverflowSlot} bg-muted/40 animate-pulse border border-border/40 shadow-xl`}
                                style={{
                                    zIndex: 30,
                                    opacity: 1,
                                    transform: 'translate(-50%, -50%) scale(1.08)',
                                    pointerEvents: 'none'
                                }}
                            />
                            {/* Immediate Right Card */}
                            <div 
                                className={`${categoryStyles.coverflowSlot} bg-muted/20 animate-pulse border border-border/25`}
                                style={{
                                    zIndex: 20,
                                    opacity: 0.55,
                                    transform: 'translate(28%, -50%) scale(0.88)',
                                    pointerEvents: 'none'
                                }}
                            />
                            {/* Far Right Card */}
                            <div 
                                className={`${categoryStyles.coverflowSlot} bg-muted/10 animate-pulse border border-border/10 hidden md:block`}
                                style={{
                                    zIndex: 10,
                                    opacity: 0.25,
                                    transform: 'translate(95%, -50%) scale(0.72)',
                                    pointerEvents: 'none'
                                }}
                            />
                        </div>
                    </div>
                </section>

                {/* 4. "Explore Our Collection" Product Grid Skeleton */}
                <section className={`w-full ${layout.sectionSpacing} px-4 sm:px-6 lg:px-8 mb-20`}>
                    <div className="space-y-4 text-center mb-12">
                        <div className="h-8 w-56 sm:h-10 sm:w-72 bg-muted/40 rounded-xl mx-auto animate-pulse" />
                        <div className="h-4 w-2/3 sm:w-1/3 bg-muted/60 rounded-lg mx-auto animate-pulse max-w-xl" />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="flex flex-col gap-4 border border-border/20 rounded-2xl p-2 sm:p-3 h-full">
                                {/* Image Placeholder */}
                                <div className="aspect-square rounded-xl bg-muted/60 animate-pulse" />

                                {/* Content Placeholder */}
                                <div className="space-y-3 px-1 pb-2 flex-1 flex flex-col">
                                    <div className="space-y-2">
                                        <div className="h-3 sm:h-4 w-full bg-muted/70 rounded animate-pulse" />
                                        <div className="h-3 w-2/3 bg-muted/50 rounded animate-pulse" />
                                    </div>

                                    <div className="flex items-center gap-1 mt-2">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <div key={s} className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-muted/50" />
                                        ))}
                                    </div>

                                    <div className="mt-auto flex justify-between items-end pt-4">
                                        <div className="space-y-1.5">
                                            <div className="h-5 w-16 sm:w-24 bg-muted/70 rounded animate-pulse" />
                                            <div className="h-3 w-10 sm:w-12 bg-muted/50 rounded animate-pulse" />
                                        </div>
                                        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-muted/60 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        );
    }


    const filteredProducts = products.slice().sort((a, b) => {
        if (collectionTab === 'top') return (b.rating || 0) - (a.rating || 0);
        if (collectionTab === 'new') return b.id.localeCompare(a.id);
        return 0;
    });

    return (
        <div className="min-h-screen flex flex-col">
            <HeroCarousel />

            {/* Shop by Category - Universal Carousel */}
            <section className={`w-full ${layout.sectionSpacing} px-4 sm:px-6 lg:px-8`}>

                {/* Category Carousel with Arrows */}
                <CategoryCarousel
                    categories={categories}
                    getFallbackImage={getFallbackImage}
                    isCategoryActive={isCategoryActive}
                />
            </section>

            {/* Explore Our Collection - Dynamic Premium Showcase */}
            <section className={`w-full ${layout.sectionSpacing} px-4 sm:px-6 lg:px-8`}>
                <div className="bg-background border border-border/40 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
                    {/* Subtle aesthetic gradient orb background */}
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12 relative z-10 border-b border-border/40 pb-6">
                        <div className="space-y-2 text-left">
                            <span className="text-xs font-bold uppercase tracking-widest text-primary block">
                                ✦ OUR SIGNATURE PIECES
                            </span>
                            <h2 className={`${typography.responsiveH2} tracking-tight`}>Explore Our Collection</h2>
                            <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                                Exceptionally crafted everyday wear built for absolute comfort, superior durability, and versatile modern styling.
                            </p>
                        </div>

                        {/* Interactive dynamic collection filter tabs */}
                        <div className="flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-full border border-border/50 self-start md:self-auto">
                            {(['all', 'top', 'new'] as const).map((tab) => {
                                const labels: Record<string, string> = {
                                    all: "All Styles",
                                    top: "Top Rated",
                                    new: "New Arrivals",
                                };
                                return (
                                    <button
                                        key={tab}
                                        type="button"
                                        className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 capitalize ${
                                            collectionTab === tab
                                                ? "bg-foreground text-background shadow-md scale-105"
                                                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                        }`}
                                        onClick={() => setCollectionTab(tab)}
                                    >
                                        {labels[tab]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="relative z-10">
                        <ProductGrid products={filteredProducts} />
                    </div>

                    <div className="flex justify-center mt-12 relative z-10">
                        <Link to="/products">
                            <Button size="lg" className="group px-8 py-6 text-base sm:text-lg rounded-full shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-300 border border-primary/20">
                                View All Products
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Combo Offers Banner */}
            <section className={`w-full ${layout.sectionSpacing} px-4 sm:px-6 lg:px-8`}>
                <ComboOfferBanner />
            </section>

            {/* Features */}
            <section className={`w-full ${layout.sectionSpacing} bg-muted/70 px-4 sm:px-6 lg:px-8`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full mx-auto">
                    <Card className="p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-300 group h-full flex flex-col justify-center items-center">
                        <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-3 sm:mb-4 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                        <h3 className="text-lg sm:text-xl font-semibold mb-2">Latest Trends</h3>
                        <p className="text-sm sm:text-base text-muted-foreground">Stay ahead with our curated collection of the season's hottest styles</p>
                    </Card>
                    <Card className="p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-300 group h-full flex flex-col justify-center items-center">
                        <Zap className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-3 sm:mb-4 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                        <h3 className="text-lg sm:text-xl font-semibold mb-2">Fast Delivery</h3>
                        <p className="text-sm sm:text-base text-muted-foreground">Lightning-fast shipping to get your order to you in record time</p>
                    </Card>
                    <Card className="p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-300 group h-full flex flex-col justify-center items-center">
                        <Shield className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-3 sm:mb-4 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                        <h3 className="text-lg sm:text-xl font-semibold mb-2">Quality Assured</h3>
                        <p className="text-sm sm:text-base text-muted-foreground">Premium quality guaranteed on every product with our satisfaction promise</p>
                    </Card>
                </div>
            </section>

            {/* CTA Section */}
            <section className={`w-full py-12 sm:py-16 text-center px-4 sm:px-6 lg:px-8`}>
                <div className="w-full mx-auto space-y-4 sm:space-y-6">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                        Ready to Upgrade Your Wardrobe?
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto px-4">
                        Join thousands of satisfied customers worldwide and discover your perfect style today
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-6 w-full max-w-xs sm:max-w-none mx-auto">
                        <Link to="/products" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-[200px] h-11 sm:h-12 text-sm sm:text-base group hover:scale-105 transition-transform">
                                Shop Now
                                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link to="/learn-more" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full sm:w-[200px] h-11 sm:h-12 text-sm sm:text-base group hover:scale-105 transition-transform">
                                Learn More
                                <Info className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>


        </div>
    );
}

export default HomePage;
