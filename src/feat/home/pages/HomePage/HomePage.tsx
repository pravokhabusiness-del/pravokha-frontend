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
import wardrobeCta from "@/assets/wardrobe-cta-bg.png";
import trendsBg from "@/assets/trends-card-bg.png";
import deliveryBg from "@/assets/delivery-card-bg.png";
import qualityBg from "@/assets/quality-card-bg.png";

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
        "kids-collection": categoryKidsImg,
        electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        fashion: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80",
        beauty: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
        books: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
        "home-kitchen": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
        "home-and-kitchen": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
        "home-&-kitchen": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80"
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

                {/* 3. "Shop by Category" Section Skeleton - Coverflow Aspect & Stacked Layout Mirrored */}
                <section className={`w-full ${layout.sectionSpacing} px-4 sm:px-6 lg:px-8`}>
                    <div className={categoryStyles.containerCard}>
                        {/* Header section */}
                        <div className={categoryStyles.headerSection}>
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
                                                ? "bg-foreground text-background shadow-md"
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

            {/* Features Section */}
            <section className={`w-full ${layout.sectionSpacing} px-4 sm:px-6 lg:px-8 relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-[#4AA3A0]/5 via-background to-[#E17B5A]/5 border-y border-border/40`}>
                {/* Floating blur designs */}
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-[#4AA3A0]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#E17B5A]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="text-center space-y-3">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs tracking-wider uppercase">
                            Our Promises
                        </span>
                        <h2 className={`${typography.responsiveH2} font-bold tracking-tight`}>Why Shop With Pravokha?</h2>
                        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                            Experience the best in premium fabrics, lightning-fast logistics, and curated trends.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
                        <Card className="relative overflow-hidden text-center border-border/40 hover:-translate-y-2 hover:shadow-xl hover:border-primary/20 transition-all duration-500 group h-full flex flex-col justify-center items-center rounded-2xl">
                            {/* Background image */}
                            <img src={trendsBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative z-10 p-6 sm:p-8 flex flex-col items-center">
                                <div className="p-4 bg-[#4AA3A0]/10 text-primary rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-inner">
                                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2">Latest Trends</h3>
                                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Stay ahead with our curated collection of the season's hottest styles, updated weekly.</p>
                            </div>
                        </Card>
                        <Card className="relative overflow-hidden text-center border-border/40 hover:-translate-y-2 hover:shadow-xl hover:border-[#E17B5A]/20 transition-all duration-500 group h-full flex flex-col justify-center items-center rounded-2xl">
                            {/* Background image */}
                            <img src={deliveryBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative z-10 p-6 sm:p-8 flex flex-col items-center">
                                <div className="p-4 bg-[#E17B5A]/10 text-[#E17B5A] rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-inner">
                                    <Zap className="h-6 w-6 sm:h-8 sm:w-8" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2">Fastest Delivery</h3>
                                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Lightning-fast processing and shipping to get your favorite garments to you in record time.</p>
                            </div>
                        </Card>
                        <Card className="relative overflow-hidden text-center border-border/40 hover:-translate-y-2 hover:shadow-xl hover:border-primary/20 transition-all duration-500 group h-full flex flex-col justify-center items-center rounded-2xl">
                            {/* Background image */}
                            <img src={qualityBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative z-10 p-6 sm:p-8 flex flex-col items-center">
                                <div className="p-4 bg-[#4AA3A0]/10 text-primary rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-inner">
                                    <Shield className="h-6 w-6 sm:h-8 sm:w-8" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2">Quality Assured</h3>
                                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Premium quality guaranteed on every product, manufactured ethically in India's textile capital.</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={`w-full py-16 sm:py-24 text-center px-4 sm:px-6 lg:px-8`}>
                <div className="max-w-5xl mx-auto relative group overflow-hidden bg-gradient-to-br from-[#4AA3A0] to-[#E17B5A] text-white rounded-[32px] p-8 md:p-16 shadow-2xl transition-all duration-500 hover:shadow-primary/20 hover:scale-[1.01]">
                    {/* Background image overlay */}
                    <img 
                        src={wardrobeCta} 
                        alt="" 
                        className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay pointer-events-none" 
                    />
                    {/* Visual accent rings */}
                    <div className="absolute -top-10 -left-10 w-40 h-40 border-4 border-white/10 rounded-full pointer-events-none" />
                    <div className="absolute -bottom-10 -right-10 w-60 h-60 border-4 border-white/10 rounded-full pointer-events-none" />
                    
                    <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-white font-bold text-xs tracking-wider uppercase mb-2">
                            Elevate Your Style
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
                            Ready to Upgrade Your Wardrobe?
                        </h2>
                        <p className="text-white/90 text-sm sm:text-base md:text-lg leading-relaxed">
                            Join thousands of satisfied customers styling their everyday life with Pravokha. Discover pieces built for ultimate comfort and fit.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6 w-full max-w-md mx-auto">
                            <Link to="/products" className="flex-1">
                                <Button size="lg" className="w-full bg-white text-[#4AA3A0] hover:bg-white/90 font-bold px-8 shadow-xl transition duration-300 h-12 rounded-xl">
                                    Shop Collection
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/learn-more" className="flex-1">
                                {/* Fixed: solid white bg with dark text for light mode visibility */}
                                <Button size="lg" className="w-full bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-[#4AA3A0] font-bold px-8 transition-all duration-300 h-12 rounded-xl shadow-lg">
                                    Learn More
                                    <Info className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
}

export default HomePage;
