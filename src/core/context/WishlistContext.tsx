import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiClient } from "@/infra/api/apiClient";
import { useAuth } from "@/core/context/AuthContext";
import { Product } from "@/data/products";
import { toast } from "@/shared/hook/use-toast";

interface WishlistContextType {
    wishlistIds: Set<string>;
    isInWishlist: (productId: string) => boolean;
    toggleWishlist: (product: Product) => Promise<boolean>;
    fetchWishlist: () => Promise<void>;
    isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const GUEST_WISHLIST_KEY = "pravokha_guest_wishlist_ids";

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const loadGuestWishlist = useCallback(() => {
        try {
            const saved = localStorage.getItem(GUEST_WISHLIST_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setWishlistIds(new Set(parsed));
                }
            }
        } catch {
            setWishlistIds(new Set());
        }
    }, []);

    const fetchWishlist = useCallback(async () => {
        if (!user) {
            loadGuestWishlist();
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const response = await apiClient.get('/wishlist');
            if (response.data.success && Array.isArray(response.data.wishlist)) {
                const ids = response.data.wishlist.map((item: any) => item.product?.id || item.productId).filter(Boolean);
                setWishlistIds(new Set(ids));
            }
        } catch (error) {
            console.error("Failed to fetch wishlist:", error);
            loadGuestWishlist();
        } finally {
            setIsLoading(false);
        }
    }, [user, loadGuestWishlist]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const isInWishlist = useCallback((productId: string): boolean => {
        return wishlistIds.has(productId);
    }, [wishlistIds]);

    const toggleWishlist = async (product: Product): Promise<boolean> => {
        const currentlyInWishlist = wishlistIds.has(product.id);
        const nextSet = new Set(wishlistIds);

        if (currentlyInWishlist) {
            nextSet.delete(product.id);
        } else {
            nextSet.add(product.id);
        }
        setWishlistIds(nextSet);

        if (!user) {
            // Guest mode: save to localStorage
            try {
                localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(Array.from(nextSet)));
                toast({
                    title: currentlyInWishlist ? "Removed from wishlist" : "Added to wishlist",
                    description: `${product.title} wishlist updated.`,
                });
            } catch (e) {
                console.error("Localstorage wishlist error:", e);
            }
            return !currentlyInWishlist;
        }

        // Authenticated mode: call backend API
        try {
            if (currentlyInWishlist) {
                await apiClient.delete(`/wishlist/${product.id}`);
                toast({
                    title: "Removed from wishlist",
                    description: `${product.title} has been removed from your wishlist`,
                });
            } else {
                await apiClient.post('/wishlist', { productId: product.id });
                toast({
                    title: "Added to wishlist",
                    description: `${product.title} has been added to your wishlist`,
                });
            }
            return !currentlyInWishlist;
        } catch (error: any) {
            // Revert state on failure
            setWishlistIds(wishlistIds);
            toast({
                title: "Error",
                description: error?.response?.data?.message || "Failed to update wishlist",
                variant: "destructive",
            });
            return currentlyInWishlist;
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlistIds, isInWishlist, toggleWishlist, fetchWishlist, isLoading }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
};
