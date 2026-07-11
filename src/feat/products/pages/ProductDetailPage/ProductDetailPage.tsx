import { useState, useEffect } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import { useCart } from "@/core/context/CartContext";
import { Star, Truck, RefreshCw, Shield, Heart, Minus, Plus, ChevronLeft, ZoomIn, Share2, MapPin, CheckCircle2, Edit2, Loader2 } from "lucide-react";
import { Separator } from "@/ui/Separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/Tabs";
import { Label } from "@/ui/Label";
import { toast } from "@/shared/hook/use-toast";
import { ImageViewer } from "@/feat/products/components/ImageViewer";
// Removed direct imports for lazy loading
import { ComboOfferWidget } from "@/feat/products/components/ComboOfferWidget";
import { useGsapAnimations } from "@/shared/hook/useGsapAnimations";
import { InteractiveStarRating } from "@/shared/ui/InteractiveStarRating";
import { apiClient } from "@/infra/api/apiClient";
import { useRecentlyViewed } from "@/shared/hook/useRecentlyViewed";
import { useAuth } from "@/core/context/AuthContext";
import { getMediaUrl, cn, getProductFallbackImage } from "@/lib/utils";
import React, { Suspense, useMemo } from "react";

// Lazy-load heavy components for Performance Guardrails (Perfect 10)
const RelatedProductsLazy = React.lazy(() => import("@/feat/products/components/RelatedProducts").then(m => ({ default: m.RelatedProducts })));
const ProductReviewsLazy = React.lazy(() => import("@/feat/products/components/ProductReviews").then(m => ({ default: m.ProductReviews })));
const ReviewStatisticsLazy = React.lazy(() => import("@/feat/products/components/ProductReviews").then(m => ({ default: m.ReviewStatistics })));

// Simple In-Memory Cache for Related Products (Perfect 10)
const relatedProductsCache = new Map<string, { related: any[], seller: any[], timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

interface Product {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    discountPrice?: number;
    category: string;
    rating: number;
    reviews: number;
    sku: string;
    sellerId: string; variants: Array<{
        id: string;
        colorName: string;
        colorHex: string;
        images: string[];
        sizes: Array<{
            size: string;
            stock: number;
        }>;
    }>;
}

export function ProductDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { addToRecentlyViewed } = useRecentlyViewed();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [sellerProducts, setSellerProducts] = useState<Product[]>([]);

    useGsapAnimations();

    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [selectedSize, setSelectedSize] = useState("");
    const allUniqueSizes = useMemo(() => {
        if (!product?.variants) return [];
        const sizesSet = new Set<string>();
        product.variants.forEach((v: any) => {
            v.sizes?.forEach((s: any) => {
                if (s.size) sizesSet.add(s.size);
            });
        });
        return Array.from(sizesSet);
    }, [product?.variants]);
    const [quantity, setQuantity] = useState(0);
    const [mainImage, setMainImage] = useState(0);
    const [imageViewerOpen, setImageViewerOpen] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [comboOffers, setComboOffers] = useState<any[]>([]);

    // Delivery location state
    const [deliveryPincode, setDeliveryPincode] = useState("");
    const [inputPincode, setInputPincode] = useState("");
    const [deliveryCity, setDeliveryCity] = useState("");
    const [deliveryEstimate, setDeliveryEstimate] = useState("");
    const [pincodeError, setPincodeError] = useState("");
    const [editingPincode, setEditingPincode] = useState(false);
    const [checkingPincode, setCheckingPincode] = useState(false);

    const fetchReviews = async () => {
        if (!product?.id) return;
        setReviewsLoading(true);
        try {
            const response = await apiClient.get(`/reviews/product/${product.id}`);
            if (response.data.success) {
                setReviews(response.data.reviews || []);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setReviewsLoading(false);
        }
    };

    const fetchComboOffers = async () => {
        if (!product?.id) return;
        try {
            const response = await apiClient.get(`/combo-offers/product/${product.id}`);
            if (response.data.success) {
                const enrichedOffers = (response.data.comboOffers || []).map((offer: any) => ({
                    ...offer,
                    products: mapToProducts(offer.products || [])
                }));
                setComboOffers(enrichedOffers);
            }
        } catch (error) {
            console.error("Error fetching combo offers:", error);
        }
    };

    useEffect(() => {
        if (product?.id) {
            fetchReviews();
            fetchComboOffers();
        }
    }, [product?.id]);

    const calculateDistribution = () => {
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        if (reviews.length === 0) return dist;

        reviews.forEach(r => {
            const star = Math.round(r.rating) as keyof typeof dist;
            if (dist[star] !== undefined) dist[star]++;
        });

        // Convert to percentages
        Object.keys(dist).forEach(key => {
            const k = parseInt(key) as keyof typeof dist;
            dist[k] = Math.round((dist[k] / reviews.length) * 100);
        });

        return dist;
    };

    const mapToProducts = (items: any[]): Product[] => {
        return items.map((p: any) => ({
            id: p.id,
            title: p.title || 'Untitled Product',
            slug: p.slug,
            description: p.description || 'No description available',
            price: parseFloat(String(p.price)) || 0,
            discountPrice: p.discountPrice ? (parseFloat(String(p.discountPrice)) || undefined) : undefined,
            category: p.category?.name || p.category,
            rating: Math.min(5, Math.max(0, parseFloat(String(p.rating || 4.5)))),
            reviews: Math.max(0, parseInt(String(p.reviewCount || p.reviews || 12))),
            sku: p.sku || "",
            sellerId: p.vendorId || p.sellerId || "",
            variants: (p.variants || []).map((v: any) => {
                let parsedImages = [];
                try {
                    parsedImages = typeof v.images === 'string' ? JSON.parse(v.images) : (v.images || []);
                } catch (e) {
                    parsedImages = v.images ? [v.images] : [];
                }

                return {
                    id: v.id,
                    colorName: v.colorName,
                    colorHex: v.colorHex,
                    images: Array.isArray(parsedImages) && parsedImages.length > 0
                        ? parsedImages
                        : ['https://placehold.co/600x600/e2e8f0/64748b?text=No+Image'],
                    sizes: (v.sizes || []).map((s: any) => ({
                        size: s.size,
                        stock: s.stock,
                    })),
                };
            }),
        }));
    };

    // Check wishlist status
    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (!product || !user) {
                setIsInWishlist(false);
                return;
            }

            try {
                const response = await apiClient.get("/wishlist/status", { params: { productId: product.id } });
                if (response.data.success) {
                    setIsInWishlist(response.data.isInWishlist);
                }
            } catch (err) {
                console.error("Wishlist status check failed:", err);
                setIsInWishlist(false);
            }
        };

        checkWishlistStatus();
    }, [product, user]);

    const [pdpAddress, setPdpAddress] = useState({
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
    });
    const [mapInstance, setMapInstance] = useState<any>(null);
    const [mapMarker, setMapMarker] = useState<any>(null);
    const [locating, setLocating] = useState(false);
    const [showMapForm, setShowMapForm] = useState(false);

    // Auto-fill delivery pincode and address from profile/storage on mount
    useEffect(() => {
        const loadSavedAddress = async () => {
            try {
                // Check if we have one in localStorage first
                const savedPin = localStorage.getItem('deliveryPincode');
                const savedCity = localStorage.getItem('deliveryCity');
                const savedAddr = localStorage.getItem('deliveryAddress');
                if (savedPin) {
                    setDeliveryPincode(savedPin);
                    setInputPincode(savedPin);
                    setDeliveryCity(savedCity || "Your Location");
                    setDeliveryEstimate("Delivery available to this area");
                    setPdpAddress({
                        addressLine1: savedAddr || "",
                        addressLine2: "",
                        city: savedCity || "",
                        state: localStorage.getItem('deliveryState') || "",
                        pincode: savedPin,
                    });
                    return;
                }

                // Otherwise fetch from database if logged in
                if (user) {
                    const res = await apiClient.get('/users/addresses');
                    if (res.data && res.data.length > 0) {
                        const defaultAddr = res.data.find((addr: any) => addr.isDefault) || res.data[0];
                        setDeliveryPincode(defaultAddr.pincode);
                        setInputPincode(defaultAddr.pincode);
                        setDeliveryCity(defaultAddr.city);
                        setDeliveryEstimate("Delivery available to your saved address");
                        setPdpAddress({
                            addressLine1: defaultAddr.addressLine1 || "",
                            addressLine2: defaultAddr.addressLine2 || "",
                            city: defaultAddr.city || "",
                            state: defaultAddr.state || "",
                            pincode: defaultAddr.pincode || "",
                        });

                        localStorage.setItem('deliveryPincode', defaultAddr.pincode);
                        localStorage.setItem('deliveryCity', defaultAddr.city);
                        localStorage.setItem('deliveryAddress', defaultAddr.addressLine1);
                        localStorage.setItem('deliveryState', defaultAddr.state || "");
                    }
                }
            } catch (e) {
                console.error("Failed to load saved address in PDP:", e);
            }
        };

        loadSavedAddress();
    }, [user]);

    // Mock pincode lookup — returns city name & delivery estimate
    const PIN_CITY_MAP: Record<string, { city: string; days: string }> = {
        '110001': { city: 'New Delhi', days: '2-3 business days' },
        '400001': { city: 'Mumbai', days: '2-3 business days' },
        '560001': { city: 'Bangalore', days: '3-4 business days' },
        '600001': { city: 'Chennai', days: '3-4 business days' },
        '700001': { city: 'Kolkata', days: '3-5 business days' },
        '500001': { city: 'Hyderabad', days: '3-4 business days' },
        '411001': { city: 'Pune', days: '3-4 business days' },
        '380001': { city: 'Ahmedabad', days: '3-5 business days' },
        '302001': { city: 'Jaipur', days: '4-5 business days' },
        '248001': { city: 'Dehradun', days: '4-6 business days' },
    };

    const applyPincode = (pin: string, saveToStorage = true) => {
        if (!/^[1-9][0-9]{5}$/.test(pin)) {
            setPincodeError('Please enter a valid 6-digit Indian pincode.');
            return;
        }
        setPincodeError('');
        setCheckingPincode(true);

        setTimeout(() => {
            const match = PIN_CITY_MAP[pin];
            const city = match?.city || 'Your Location';
            const days = match?.days || '3-5 business days';

            setDeliveryPincode(pin);
            setDeliveryCity(city);
            setDeliveryEstimate(`Estimated delivery: ${days}`);
            setEditingPincode(false);
            setCheckingPincode(false);

            if (saveToStorage) {
                localStorage.setItem('deliveryPincode', pin);
                localStorage.setItem('deliveryCity', city);
            }
        }, 600);
    };

    const initPdpMap = (lat: number, lng: number) => {
        const L = (window as any).L;
        if (!L) return;

        const mapEl = document.getElementById('pdp-map');
        if (!mapEl) return;

        if ((window as any)._pdpMap) {
            (window as any)._pdpMap.remove();
        }

        const map = L.map('pdp-map').setView([lat, lng], 13);
        (window as any)._pdpMap = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        setMapMarker(marker);
        setMapInstance(map);

        const handleGeocode = async (coords: { lat: number; lng: number }) => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
                const data = await response.json();
                if (data && data.address) {
                    const addr = data.address;
                    const road = addr.road || addr.suburb || addr.neighbourhood || addr.amenity || '';
                    const city = addr.city || addr.town || addr.village || '';
                    const state = addr.state || '';
                    const pincode = addr.postcode || '';

                    setPdpAddress(prev => ({
                        ...prev,
                        addressLine1: road || prev.addressLine1 || "Located Address",
                        city: city || prev.city,
                        state: state || prev.state,
                        pincode: pincode.replace(/\s/g, '') || prev.pincode
                    }));
                }
            } catch (e) {
                console.error("Geocoding failed:", e);
            }
        };

        marker.on('dragend', () => {
            handleGeocode(marker.getLatLng());
        });

        map.on('click', (e: any) => {
            marker.setLatLng(e.latlng);
            handleGeocode(e.latlng);
        });
    };

    // Load Leaflet dynamically when showMapForm is opened
    useEffect(() => {
        if (!showMapForm) return;

        const cssId = 'leaflet-css';
        if (!document.getElementById(cssId)) {
            const link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        const jsId = 'leaflet-js';
        if (!document.getElementById(jsId)) {
            const script = document.createElement('script');
            script.id = jsId;
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => {
                initPdpMap(13.0827, 80.2707);
            };
            document.head.appendChild(script);
        } else if ((window as any).L) {
            setTimeout(() => initPdpMap(13.0827, 80.2707), 100);
        }

        return () => {
            if ((window as any)._pdpMap) {
                (window as any)._pdpMap.remove();
                (window as any)._pdpMap = null;
            }
        };
    }, [showMapForm]);

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            toast({ title: "Not Supported", description: "Geolocation is not supported by your browser.", variant: "destructive" });
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            if (mapInstance && mapMarker) {
                mapInstance.setView([latitude, longitude], 15);
                mapMarker.setLatLng([latitude, longitude]);
            } else {
                initPdpMap(latitude, longitude);
            }

            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                if (data && data.address) {
                    const addr = data.address;
                    const road = addr.road || addr.suburb || addr.neighbourhood || addr.amenity || '';
                    const city = addr.city || addr.town || addr.village || '';
                    const state = addr.state || '';
                    const pincode = addr.postcode || '';

                    setPdpAddress(prev => ({
                        ...prev,
                        addressLine1: road || "Located Address",
                        city: city,
                        state: state,
                        pincode: pincode.replace(/\s/g, '')
                    }));
                }
            } catch (e) {
                console.error("Geocoding failed:", e);
            } finally {
                setLocating(false);
            }
        }, (err) => {
            console.error(err);
            toast({ title: "Location Denied", description: "Enable location permissions or enter address manually.", variant: "destructive" });
            setLocating(false);
        });
    };

    const handleSavePdpAddress = async () => {
        if (!pdpAddress.addressLine1 || !pdpAddress.city || !pdpAddress.state || !pdpAddress.pincode) {
            toast({ title: "Validation Error", description: "All required fields must be filled.", variant: "destructive" });
            return;
        }

        if (!/^[1-9][0-9]{5}$/.test(pdpAddress.pincode)) {
            toast({ title: "Validation Error", description: "Pincode must be 6 digits.", variant: "destructive" });
            return;
        }

        setDeliveryPincode(pdpAddress.pincode);
        setInputPincode(pdpAddress.pincode);
        setDeliveryCity(pdpAddress.city);
        setDeliveryEstimate("Delivery available to this address");
        setShowMapForm(false);

        localStorage.setItem('deliveryPincode', pdpAddress.pincode);
        localStorage.setItem('deliveryCity', pdpAddress.city);
        localStorage.setItem('deliveryAddress', pdpAddress.addressLine1);
        localStorage.setItem('deliveryState', pdpAddress.state);

        if (user) {
            try {
                const res = await apiClient.get('/users/addresses');
                const defaultAddr = res.data && res.data.length > 0
                    ? res.data.find((addr: any) => addr.isDefault) || res.data[0]
                    : null;

                const payload = {
                    label: "Default Shipping",
                    fullName: user.name || "Default Recipient",
                    phone: user.phone || "0000000000",
                    addressLine1: pdpAddress.addressLine1,
                    addressLine2: pdpAddress.addressLine2 || "",
                    city: pdpAddress.city,
                    state: pdpAddress.state,
                    pincode: pdpAddress.pincode,
                    isDefault: true
                };

                if (defaultAddr) {
                    await apiClient.patch(`/users/addresses/${defaultAddr.id}`, payload);
                } else {
                    await apiClient.post('/users/addresses', payload);
                }
                toast({ title: "Address Saved", description: "Your address has been saved to your profile." });
            } catch (err) {
                console.error("Failed to save PDP address to database:", err);
            }
        }
    };

    // Fetch product from database
    useEffect(() => {
        const fetchProduct = async () => {
            if (!slug) return;

            try {
                setLoading(true);

                setLoading(true);

                // Check Cache first
                const productCacheKey = `related_${slug}`;
                const cached = relatedProductsCache.get(productCacheKey);
                if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
                    console.log(`[Performance] Serving related products for ${slug} from cache`);
                    // We still need the main product, but we can skip the related ones if we had them cached
                    // Actually let's fetch product always but keep related cached
                }

                const response = await apiClient.get(`/products/${slug}`);
                if (!response.data.success) {
                    navigate("/products", { replace: true });
                    return;
                }

                const productData = response.data.data;

                const transformedProduct: Product = {
                    id: productData.id,
                    title: productData.title || 'Untitled Product',
                    slug: productData.slug,
                    description: productData.description || 'No description available',
                    price: parseFloat(String(productData.price)) || 0,
                    discountPrice: productData.discountPrice ? (parseFloat(String(productData.discountPrice)) || undefined) : undefined,
                    category: productData.category?.name || productData.category,
                    rating: Math.min(5, Math.max(0, parseFloat(String(productData.rating || 0)))),
                    reviews: Math.max(0, parseInt(String(productData.reviews || 0))),
                    sku: productData.sku,
                    sellerId: productData.dealerId,
                    variants: (productData.variants || []).map((v: any) => ({
                        id: v.id,
                        colorName: v.colorName,
                        colorHex: v.colorHex,
                        images: Array.isArray(v.images) && v.images.length > 0
                            ? v.images
                            : ['https://placehold.co/600x600/e2e8f0/64748b?text=No+Image'],
                        sizes: (v.sizes || []).map((s: any) => ({
                            size: s.size,
                            stock: s.stock,
                        })),
                    })),
                };

                setProduct(transformedProduct);
                setSelectedVariant(transformedProduct.variants[0]);
                addToRecentlyViewed(transformedProduct);

                // Improved Related products logic
                const categorySlug = productData.category?.slug || (typeof productData.category === 'string' ? productData.category : undefined);
                const basePrice = parseFloat(String(productData.price)) || 0;
                const vendorId = productData.vendorId || productData.dealerId;

                const relatedParams: any = {
                    limit: 24, // High density for real marketplace feel
                    sort: 'rating'
                };

                if (categorySlug) relatedParams.category = categorySlug;
                if (basePrice > 0) {
                    relatedParams.minPrice = basePrice * 0.6;
                    relatedParams.maxPrice = basePrice * 1.4;
                }

                // Check Cache for related products
                const relatedCacheKey = `related_${productData.id}`;
                const cachedData = relatedProductsCache.get(relatedCacheKey);

                let relatedResponse: any;
                let sellerResponse: any;

                if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
                    setRelatedProducts(cachedData.related);
                    setSellerProducts(cachedData.seller);
                } else {
                    // Concurrent fetching for better performance
                    [relatedResponse, sellerResponse] = await Promise.all([
                        apiClient.get('/products', { params: relatedParams }),
                        vendorId ? apiClient.get('/products', { params: { vendorId: vendorId, limit: 12 } }) : Promise.resolve({ data: { success: false } })
                    ]);
                }

                let finalSeller: Product[] = [];
                if (sellerResponse?.data?.success) {
                    const sellerData = (sellerResponse.data.products || []).filter((p: any) => p.id !== productData.id);
                    finalSeller = mapToProducts(sellerData);
                }
                setSellerProducts(finalSeller);

                if (relatedResponse?.data?.success) {
                    const sellerIds = new Set(finalSeller.map(p => p.id));
                    const rawRelated = relatedResponse.data.products || [];

                    // Try to deduplicate first
                    let filteredRelated = rawRelated.filter((p: any) =>
                        p.id !== productData.id && !sellerIds.has(p.id)
                    );

                    // Resilience Fallback: If deduplication leaves us empty, fallback to non-deduplicated list
                    // This ensures the "You May Also Like" section always shows content for a "full" marketplace feel.
                    if (filteredRelated.length === 0 && rawRelated.length > 0) {
                        filteredRelated = rawRelated.filter((p: any) => p.id !== productData.id);
                    }

                    const transformedRelated = mapToProducts(filteredRelated);
                    setRelatedProducts(transformedRelated);

                    // Update Cache
                    relatedProductsCache.set(relatedCacheKey, {
                        related: transformedRelated,
                        seller: finalSeller,
                        timestamp: Date.now()
                    });
                }
            } catch (err: any) {
                console.error("Error fetching product:", err);

                const status = err?.response?.status;
                if (status === 404) {
                    toast({ title: "Product not found", description: "The product does not exist.", variant: "destructive" });
                    navigate('/products', { replace: true });
                    return;
                }

                if (status === 403) {
                    toast({ title: "Access denied", description: "You are not allowed to view this product.", variant: "destructive" });
                    navigate('/products', { replace: true });
                    return;
                }

                toast({
                    title: "Error",
                    description: err?.message || "Failed to load product",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Loading product...</p>
            </div>
        );
    }

    if (!product || !selectedVariant) {
        return <Navigate to="/products" replace />;
    }

    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    const discountPercent = hasDiscount
        ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
        : 0;

    const handleShare = async () => {
        const url = `${window.location.origin}/product/${product.slug || product.id}`;
        const shareData = { title: product.title, text: product.description || product.title, url };
        try {
            if ((navigator as any).share) {
                await (navigator as any).share(shareData);
            } else if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
                toast({ title: "Link copied!", description: "Product link copied to clipboard." });
            }
        } catch (e: any) {
            if (e?.name !== "AbortError") {
                toast({ title: "Could not share", description: "Please copy the URL manually.", variant: "destructive" });
            }
        }
    };

        const handleAddToCart = () => {
        if (!selectedSize) {
            toast({
                title: "Please select a size",
                description: "You need to select a size before adding to cart",
                variant: "destructive",
            });
            return;
        }

        if (quantity === 0) {
            toast({
                title: "Please select quantity",
                description: "Quantity must be at least 1",
                variant: "destructive",
            });
            return;
        }

        const selectedSizeObj = selectedVariant.sizes.find((s: any) => s.size === selectedSize);
        if (selectedSizeObj && quantity > selectedSizeObj.stock) {
            toast({
                title: "Insufficient stock",
                description: `Only ${selectedSizeObj.stock} ${selectedSizeObj.stock === 1 ? 'item' : 'items'} available in stock for size ${selectedSize}. Please reduce quantity.`,
                variant: "destructive",
            });
            return;
        }

        addToCart({
            productId: product.id,
            variantId: selectedVariant.id,
            title: product.title,
            colorName: selectedVariant.colorName,
            colorHex: selectedVariant.colorHex,
            size: selectedSize,
            price: product.discountPrice || product.price,
            image: selectedVariant.images[mainImage],
            maxStock: selectedSizeObj?.stock || 0,
            sellerId: product.sellerId || "",
        }, quantity);
    };

    const handleBuyNow = () => {
        if (!selectedSize) {
            toast({
                title: "Please select a size",
                description: "You need to select a size before proceeding",
                variant: "destructive",
            });
            return;
        }

        handleAddToCart();
        navigate("/checkout");
    };

    const getDisplayImage = (img: string) => {
        const url = getMediaUrl(img);
        return (!url || url.includes("No+Image") || url.includes("placeholder"))
            ? getProductFallbackImage(product?.title || "", product?.category)
            : url;
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <Link to="/">
                    <Button variant="ghost" className="mb-4">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Images */}
                    <div className="space-y-4">
                        <div className="aspect-square overflow-hidden rounded-lg border bg-muted animate-fade-in relative group gsap-fade-in cursor-zoom-in">
                            <div
                                onClick={() => setImageViewerOpen(true)}
                                className="cursor-pointer w-full h-full overflow-hidden"
                            >
                                <img
                                    src={getDisplayImage(selectedVariant.images[mainImage])}
                                    alt={product.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="eager"
                                />
                            </div>
                            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="hover:scale-105 transition-transform"
                                    onClick={() => setImageViewerOpen(true)}
                                >
                                    <ZoomIn className="h-4 w-4 mr-2 hover:rotate-90 transition-transform duration-300" />
                                    Zoom
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {selectedVariant.images.map((image: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setMainImage(idx)}
                                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-all gsap-scale-in ${mainImage === idx ? "border-primary" : "border-border hover:border-primary/50"
                                        }`}
                                >
                                    <img src={getDisplayImage(image)} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-6 animate-fade-up gsap-fade-in">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{product.title}</h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">SKU: {product.sku}</p>
                        </div>

                        {product.rating > 0 && (
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                    const reviewsTab = document.querySelector('[value="reviews"]') as HTMLElement;
                                    reviewsTab?.click();
                                    setTimeout(() => {
                                        const reviewsSection = document.getElementById('reviews-section');
                                        reviewsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }, 100);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        const reviewsTab = document.querySelector('[value="reviews"]') as HTMLElement;
                                        reviewsTab?.click();
                                        setTimeout(() => {
                                            const reviewsSection = document.getElementById('reviews-section');
                                            reviewsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }, 100);
                                    }
                                }}
                                className="flex items-center gap-4 hover:opacity-80 transition-opacity group cursor-pointer w-fit"
                            >
                                <div className="flex items-center gap-1">
                                    <InteractiveStarRating
                                        rating={product.rating}
                                        readOnly
                                        size="sm"
                                        showQuotes={false}
                                    />
                                    <span className="ml-2 font-bold text-lg">{product.rating}★</span>
                                </div>
                                <span className="text-muted-foreground underline decoration-dotted underline-offset-4 group-hover:text-primary transition-colors">
                                    ({product.reviews} reviews)
                                </span>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">₹{product.discountPrice || product.price}</span>
                            {hasDiscount && (
                                <>
                                    <span className="text-xl sm:text-2xl text-muted-foreground line-through">₹{product.price}</span>
                                    <Badge className="bg-accent text-accent-foreground text-xs sm:text-sm">{discountPercent}% OFF</Badge>
                                </>
                            )}
                        </div>

                        <Separator />

                        {/* Color Selection */}
                        <div>
                            <Label className="text-sm sm:text-base font-semibold mb-3 block">
                                Color: {selectedVariant.colorName}
                            </Label>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                {product.variants.map((variant) => (
                                    <button
                                        key={variant.id}
                                        onClick={() => {
                                            setSelectedVariant(variant);
                                            setMainImage(0);
                                            setSelectedSize("");
                                        }}
                                        className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 transition-all duration-300 hover:scale-125 gsap-scale-in ${selectedVariant.id === variant.id
                                            ? "border-primary scale-110 shadow-lg"
                                            : "border-border hover:scale-105"
                                            }`}
                                        style={{ backgroundColor: variant.colorHex }}
                                        title={variant.colorName}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <Label className="text-sm sm:text-base font-semibold">Size</Label>
                                <Link to="/size-guide">
                                    <Button variant="link" size="sm" className="h-auto p-0 hover:scale-105 transition-transform">
                                        Size Guide
                                    </Button>
                                </Link>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {allUniqueSizes.map((size: string) => {
                                    const sizeOption = selectedVariant.sizes.find((s: any) => s.size === size);
                                    const currentStock = sizeOption?.stock || 0;
                                    const isLowStock = currentStock > 0 && currentStock < 10;
                                    const isSelected = selectedSize === size;
                                    const isAvailableInAny = product.variants.some((v: any) => v.sizes.some((s: any) => s.size === size && s.stock > 0));

                                    return (
                                        <div key={size} className="relative">
                                            <Button
                                                variant={isSelected ? "default" : "outline"}
                                                disabled={!isAvailableInAny}
                                                onClick={() => {
                                                    if (currentStock > 0) {
                                                        setSelectedSize(size);
                                                    } else {
                                                        const variantWithStock = product.variants.find((v: any) => 
                                                            v.sizes.some((s: any) => s.size === size && s.stock > 0)
                                                        );
                                                        if (variantWithStock) {
                                                            setSelectedVariant(variantWithStock);
                                                            setSelectedSize(size);
                                                            setMainImage(0);
                                                            toast({
                                                                title: `Switched to ${variantWithStock.colorName}`,
                                                                description: `Size ${size} is available in this color.`,
                                                            });
                                                        }
                                                    }
                                                }}
                                                className={cn(
                                                    `w-full text-xs sm:text-sm hover:scale-110 transition-transform gsap-scale-in`,
                                                    isSelected ? "bg-primary" : "",
                                                    currentStock === 0 && isAvailableInAny && "border-dashed border-amber-500 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                                                )}
                                            >
                                                {size}
                                            </Button>
                                            {isLowStock && (
                                                <Badge
                                                    variant="destructive"
                                                    className="absolute -top-2 -right-2 text-[10px] px-1 py-0 h-4 animate-pulse"
                                                >
                                                    {currentStock}
                                                </Badge>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedSize && (() => {
                                const selectedSizeObj = selectedVariant.sizes.find((s: any) => s.size === selectedSize);
                                if (selectedSizeObj && selectedSizeObj.stock > 0 && selectedSizeObj.stock < 10) {
                                    return (
                                        <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                                            <p className="text-sm text-orange-700 dark:text-orange-300 font-medium flex items-center gap-2">
                                                <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                                Only {selectedSizeObj.stock} left in stock - Order soon!
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>

                        {/* Quantity */}
                        <div>
                            <Label className="text-sm sm:text-base font-semibold mb-3 block">Quantity</Label>
                            <div className="flex items-center border rounded-md w-fit">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:scale-110 transition-transform"
                                    onClick={() => setQuantity(Math.max(0, quantity - 1))}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:scale-110 transition-transform"
                                    onClick={() => {
                                        const selectedSizeObj = selectedSize ? selectedVariant.sizes.find((s: any) => s.size === selectedSize) : null;
                                        const maxStock = selectedSizeObj?.stock || 99;
                                        if (quantity < maxStock) {
                                            setQuantity(quantity + 1);
                                        } else {
                                            toast({
                                                title: "Stock limit reached",
                                                description: `Only ${maxStock} ${maxStock === 1 ? 'item is' : 'items are'} available for size ${selectedSize}`,
                                                variant: "destructive",
                                            });
                                        }
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-4 lg:flex lg:flex-row">
                            <Button
                                size="lg"
                                className="col-span-2 sm:col-span-1 lg:flex-1 gap-2 hover:scale-105 transition-transform gsap-slide-left"
                                onClick={handleAddToCart}
                            >
                                Add to Cart
                            </Button>
                            <Button
                                size="lg"
                                variant="secondary"
                                className="col-span-2 sm:col-span-1 lg:flex-1 hover:scale-105 transition-transform gsap-slide-right"
                                onClick={handleBuyNow}
                            >
                                Buy Now
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="col-span-1 lg:flex-1 gap-2 hover:scale-105 transition-transform justify-center border-2 border-primary/40 text-primary hover:bg-primary/5 hover:border-primary font-bold"
                                onClick={handleShare}
                                aria-label="Share product"
                            >
                                <Share2 className="h-5 w-5" />
                                <span>Share</span>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className={cn(
                                    "col-span-1 lg:flex-1 gap-2 hover:scale-105 transition-transform group justify-center gsap-scale-in border-2 font-bold",
                                    isInWishlist 
                                        ? "border-red-500 text-red-500 bg-red-500/10 hover:bg-red-500/20" 
                                        : "border-primary/40 text-primary hover:bg-primary/5 hover:border-primary"
                                )}
                                onClick={async () => {
                                    if (!product) return;

                                    try {
                                        if (isInWishlist) {
                                            const response = await apiClient.delete(`/wishlist`, {
                                                params: { productId: product.id }
                                            });

                                            if (response.data.success) {
                                                setIsInWishlist(false);
                                                toast({
                                                    title: "Removed from wishlist",
                                                    description: `${product.title} removed from your wishlist`,
                                                });
                                            }
                                        } else {
                                            const response = await apiClient.post(`/wishlist`, {
                                                productId: product.id,
                                            });

                                            if (response.data.success) {
                                                setIsInWishlist(true);
                                                toast({
                                                    title: "Added to wishlist",
                                                    description: `${product.title} has been added to your wishlist`,
                                                });
                                            }
                                        }
                                    } catch (err: any) {
                                        if (err.response?.status === 401) {
                                            toast({
                                                title: "Please login",
                                                description: "You need to be logged in to manage your wishlist",
                                                variant: "destructive",
                                            });
                                            navigate("/auth");
                                        } else {
                                            toast({
                                                title: "Error",
                                                description: "Failed to update wishlist",
                                                variant: "destructive",
                                            });
                                        }
                                    }
                                }}
                            >
                                <Heart
                                    className={cn(
                                        "h-5 w-5 transition-colors",
                                        isInWishlist ? "fill-red-500 text-red-500" : "group-hover:fill-red-500 group-hover:text-red-500"
                                    )}
                                />
                                {isInWishlist ? "In Wishlist" : "Wishlist"}
                            </Button>
                        </div>

                        {/* ─── Delivery Location Picker ────────────────────────── */}
                        <div className="border border-border/60 rounded-xl p-4 space-y-3 bg-muted/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-semibold">Delivery Location</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowMapForm(!showMapForm);
                                        setEditingPincode(!showMapForm);
                                    }}
                                    className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                                >
                                    <Edit2 size={11} />
                                    {showMapForm ? "Cancel" : "Change / Enter Address"}
                                </button>
                            </div>

                            {/* Current delivery info */}
                            {deliveryPincode && !showMapForm && (
                                <div className="space-y-1 bg-background/40 p-3 rounded-lg border border-border/30">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                        <span className="text-sm font-medium">
                                            Deliver to: <span className="font-bold">{deliveryCity}</span>
                                            <span className="text-muted-foreground ml-1">- {deliveryPincode}</span>
                                        </span>
                                    </div>
                                    {pdpAddress.addressLine1 && (
                                        <p className="text-xs text-muted-foreground pl-6 truncate">
                                            {pdpAddress.addressLine1}
                                        </p>
                                    )}
                                    {deliveryEstimate && (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium pl-6 mt-0.5">
                                            {deliveryEstimate}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Interactive Address Map & Manual form */}
                            {showMapForm && (
                                <div className="space-y-4 pt-2 border-t border-border/40 animate-in fade-in-50 duration-250">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">Pin your address on the map or enter details below:</p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleLocateMe}
                                            disabled={locating}
                                            className="h-7 gap-1 text-[10px] px-2"
                                        >
                                            {locating ? "Locating..." : "Locate Me"}
                                        </Button>
                                    </div>

                                    {/* Map container */}
                                    <div className="relative overflow-hidden rounded-lg border border-border bg-muted/10">
                                        <div id="pdp-map" className="h-[150px] w-full z-10" />
                                    </div>

                                    <div className="space-y-2">
                                        <div>
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Address Line 1 *</Label>
                                            <Input
                                                value={pdpAddress.addressLine1}
                                                onChange={(e) => setPdpAddress({ ...pdpAddress, addressLine1: e.target.value })}
                                                placeholder="Street Address, Area"
                                                className="h-8 text-xs"
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">City *</Label>
                                                <Input
                                                    value={pdpAddress.city}
                                                    onChange={(e) => setPdpAddress({ ...pdpAddress, city: e.target.value })}
                                                    placeholder="City"
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">State *</Label>
                                                <Input
                                                    value={pdpAddress.state}
                                                    onChange={(e) => setPdpAddress({ ...pdpAddress, state: e.target.value })}
                                                    placeholder="State"
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Pincode *</Label>
                                                <Input
                                                    maxLength={6}
                                                    value={pdpAddress.pincode}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                                        setPdpAddress({ ...pdpAddress, pincode: val });
                                                    }}
                                                    placeholder="Pincode"
                                                    className="h-8 text-xs font-mono"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleSavePdpAddress}
                                            className="w-full h-8 text-xs mt-2 font-bold"
                                        >
                                            Confirm Delivery Location
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {!deliveryPincode && !showMapForm && (
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">
                                        No delivery location selected. Click "Change / Enter Address" to check availability.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Features */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3">
                                <Truck className="h-4 w-4 text-primary shrink-0" />
                                <span className="text-sm">Free shipping on orders above ₹999</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <RefreshCw className="h-4 w-4 text-primary shrink-0" />
                                <span className="text-sm">30-day easy returns</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Shield className="h-4 w-4 text-primary shrink-0" />
                                <span className="text-sm">100% secure payments</span>
                            </div>
                        </div>

                        {/* Combo Offers Widget */}
                        <ComboOfferWidget productId={product.id} offers={comboOffers} />
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="description" className="mt-12">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="description">Description</TabsTrigger>
                        <TabsTrigger value="reviews">
                            Reviews {product.reviews > 0 && `(${product.reviews})`}
                        </TabsTrigger>
                        <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
                    </TabsList>

                    <TabsContent value="description" className="mt-6 space-y-4">
                        <p className="text-muted-foreground leading-relaxed">{product.description}</p>

                        <div className="grid md:grid-cols-2 gap-4 mt-6">
                            <div className="p-4 rounded-lg bg-muted/50">
                                <h4 className="font-semibold mb-2">Material</h4>
                                <p className="text-sm text-muted-foreground">
                                    Premium Cotton Blend (60% Cotton, 40% Polyester) - Breathable, durable, and comfortable for all-day wear
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50">
                                <h4 className="font-semibold mb-2">Best For</h4>
                                <p className="text-sm text-muted-foreground">
                                    Casual wear, sports activities, gym workouts, and everyday comfort
                                </p>
                            </div>
                        </div>

                        <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                            <li>Premium quality fabric for maximum comfort</li>
                            <li>Breathable and moisture-wicking properties</li>
                            <li>Perfect fit with excellent durability</li>
                            <li>Easy care - machine washable</li>
                            <li>Available in multiple colors and sizes</li>
                        </ul>

                        <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 mt-6">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <RefreshCw className="h-5 w-5 text-accent" />
                                Bulk Order Pricing
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Special discounts available for bulk orders! Perfect for teams, events, or businesses. Bulk orders must be requested directly through the Administration.
                            </p>
                            <ul className="text-sm space-y-1">
                                <li>• 50-99 pieces: 10% discount</li>
                                <li>• 100-199 pieces: 15% discount</li>
                                <li>• 200+ pieces: 20% discount</li>
                            </ul>
                            <div className="mt-4">
                                <a href="https://wa.me/917339232817?text=Hi%2C%20I%20am%20interested%20in%20a%20bulk%20order%20inquiry%20for%20your%20products." target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="default" className="w-full sm:w-auto gap-2" style={{backgroundColor:"#25D366",borderColor:"#25D366"}}>
                                        💬 WhatsApp Admin for Bulk Orders
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </TabsContent>

                    <Suspense fallback={<div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg animate-pulse">Loading reviews...</div>}>
                        <TabsContent value="reviews" className="mt-6" id="reviews-section">
                            <div className="grid md:grid-cols-3 gap-8 mb-8">
                                <div className="md:col-span-1">
                                    <ReviewStatisticsLazy
                                        rating={product.rating}
                                        totalRatings={reviews.length}
                                        totalReviews={reviews.length}
                                        distribution={calculateDistribution()}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <ProductReviewsLazy
                                        productId={product.id}
                                        reviews={reviews}
                                        isLoading={reviewsLoading}
                                        onReviewAction={fetchReviews}
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </Suspense>

                    <TabsContent value="shipping" className="mt-6 space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Shipping Information</h3>
                            <p className="text-muted-foreground">
                                Free standard shipping on orders above ₹999. Express shipping available at checkout.
                                Delivery time: 3-5 business days.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Return Policy</h3>
                            <p className="text-muted-foreground">
                                30-day return policy. Items must be unworn and in original packaging with tags attached.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>

                <Suspense fallback={<div className="h-64 bg-muted/20 rounded-lg mt-12 animate-pulse" />}>
                    <RelatedProductsLazy
                        products={relatedProducts}
                        title="Similar Products"
                    />

                    {sellerProducts.length > 0 && (
                        <RelatedProductsLazy products={sellerProducts} title="More from this Seller" layout="grid" />
                    )}
                </Suspense>
            </div>

            <ImageViewer
                images={selectedVariant.images.map((img: string) => getDisplayImage(img))}
                currentIndex={mainImage}
                open={imageViewerOpen}
                onClose={() => setImageViewerOpen(false)}
            />
        </div>
    );
}

export default ProductDetailPage;
