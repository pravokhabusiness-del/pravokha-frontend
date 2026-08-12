import React, { useState } from 'react';
import { ShoppingBag, TrendingUp, Sparkles, IndianRupee, Check, ArrowRight, X } from 'lucide-react';
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";
import { Label } from "@/ui/Label";
import { useCart } from "@/core/context/CartContext";
import { getMediaUrl, cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/ui/AlertDialog";

interface Product {
    id: string;
    title: string;
    price: number;
    discountPrice?: number;
    variants: any[];
}

interface ComboOffer {
    id: string;
    title: string;
    description: string;
    comboPrice: number;
    originalPrice: number;
    products: Product[];
}

interface ComboOfferWidgetProps {
    productId: string;
    offers: ComboOffer[];
}

export const ComboOfferWidget: React.FC<ComboOfferWidgetProps> = ({ productId, offers }) => {
    const { addMultipleToCart } = useCart();
    const navigate = useNavigate();

    const [activeCombo, setActiveCombo] = useState<ComboOffer | null>(null);
    const [selections, setSelections] = useState<Record<string, { variantId: string; colorName: string; colorHex: string; size: string; maxStock: number }>>({});

    if (!offers || offers.length === 0) return null;

    const handleOpenComboModal = (offer: ComboOffer) => {
        setActiveCombo(offer);
        const initialSelections: Record<string, { variantId: string; colorName: string; colorHex: string; size: string; maxStock: number }> = {};

        offer.products.forEach(p => {
            const firstVariant = p.variants[0] || {};
            const availableSize = firstVariant.sizes?.find((s: any) => s.stock > 0)?.size || firstVariant.sizes?.[0]?.size || "";
            const maxStock = firstVariant.sizes?.find((s: any) => s.size === availableSize)?.stock || 0;

            initialSelections[p.id] = {
                variantId: firstVariant.id || "",
                colorName: firstVariant.colorName || "Standard",
                colorHex: firstVariant.colorHex || "#000000",
                size: availableSize,
                maxStock: maxStock
            };
        });

        setSelections(initialSelections);
    };

    const isAllSelected = () => {
        if (!activeCombo) return false;
        return activeCombo.products.every(p => {
            const sel = selections[p.id];
            return sel && sel.variantId && sel.size;
        });
    };

    const handleConfirmCombo = (checkoutDirectly: boolean = false) => {
        if (!activeCombo || !isAllSelected()) return;

        const itemsToAdd = activeCombo.products.map(product => {
            const sel = selections[product.id];
            const variant = product.variants.find((v: any) => v.id === sel.variantId) || product.variants[0];

            return {
                item: {
                    productId: product.id,
                    variantId: sel.variantId,
                    title: product.title,
                    colorName: sel.colorName,
                    colorHex: sel.colorHex,
                    size: sel.size,
                    price: product.price,
                    image: variant.images?.[0] || 'https://placehold.co/600x600/e2e8f0/64748b?text=No+Image',
                    maxStock: sel.maxStock,
                    sellerId: (product as any).dealerId || (product as any).vendorId || "",
                },
                quantity: 1
            };
        });

        addMultipleToCart(itemsToAdd);
        setActiveCombo(null);

        if (checkoutDirectly) {
            navigate('/checkout');
        }
    };

    return (
        <div className="mt-8 p-4 sm:p-6 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <h3 className="text-lg font-bold">Bundle & Save Offers</h3>
            </div>

            <div className="space-y-6">
                {offers.map((offer) => (
                    <div key={offer.id} className="p-4 rounded-xl bg-background border shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-1 w-full overflow-hidden">
                                <h4 className="font-bold text-lg text-primary">{offer.title}</h4>
                                <p className="text-sm text-muted-foreground mb-3">{offer.description}</p>

                                {/* Responsive Horizontal Scroll Container to prevent Cutoff on Mobile */}
                                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                                    {offer.products.map((p, idx) => (
                                        <React.Fragment key={p.id}>
                                            <div className="relative group shrink-0">
                                                <div className={`h-14 w-14 rounded-xl border-2 border-background overflow-hidden bg-muted shadow-sm ${p.id === productId ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                                                    <img
                                                        src={getMediaUrl(p.variants?.[0]?.images?.[0])}
                                                        alt={p.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                {p.id === productId && (
                                                    <Badge className="absolute -top-1 -right-1 p-0 h-4 px-1 flex items-center justify-center rounded-full text-[9px] bg-primary text-white">This Item</Badge>
                                                )}
                                            </div>
                                            {idx < offer.products.length - 1 && (
                                                <span className="text-muted-foreground font-bold text-sm shrink-0">+</span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 w-full md:w-auto shrink-0">
                                <div className="text-right w-full md:w-auto">
                                    {(() => {
                                        const origPrice = offer.originalPrice || offer.products.reduce((s, p) => s + p.price, 0);
                                        const savings = origPrice - offer.comboPrice;
                                        const calculatedPct = origPrice > 0 ? Math.round((savings / origPrice) * 100) : 25;
                                        return (
                                            <>
                                                <div className="flex items-center justify-end gap-2 text-muted-foreground line-through text-sm">
                                                    <IndianRupee className="h-3 w-3" />
                                                    {origPrice}
                                                </div>
                                                <div className="flex items-center justify-end gap-1 text-2xl font-black text-foreground">
                                                    <IndianRupee className="h-5 w-5" />
                                                    {offer.comboPrice}
                                                </div>
                                                <div className="flex items-center gap-1 mt-1 justify-end">
                                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 text-xs font-bold">
                                                        {calculatedPct}% OFF
                                                    </Badge>
                                                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 text-xs">
                                                        Save ₹{savings}
                                                    </Badge>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                                <Button
                                    onClick={() => handleOpenComboModal(offer)}
                                    className="w-full md:w-auto gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform font-bold bg-primary text-primary-foreground"
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                    Configure & Buy Combo
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Selection Modal for Combo Offer */}
            <AlertDialog open={!!activeCombo} onOpenChange={(open) => !open && setActiveCombo(null)}>
                <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <AlertDialogHeader className="flex flex-row items-center justify-between border-b pb-3">
                        <AlertDialogTitle className="flex items-center gap-2 text-lg">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Select Options for Combo Bundle
                        </AlertDialogTitle>
                        <AlertDialogCancel className="h-8 w-8 p-0 rounded-full border-none">
                            <X className="h-4 w-4" />
                        </AlertDialogCancel>
                    </AlertDialogHeader>

                    {activeCombo && (
                        <div className="space-y-6 py-4">
                            <p className="text-xs text-muted-foreground">
                                Please select your preferred color and size for each item in this bundle to proceed:
                            </p>

                            {activeCombo.products.map((product) => {
                                const currentSel = selections[product.id] || {};
                                const activeVariant = product.variants.find((v: any) => v.id === currentSel.variantId) || product.variants[0];

                                return (
                                    <div key={product.id} className="p-4 rounded-xl border bg-muted/20 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={getMediaUrl(activeVariant?.images?.[0])}
                                                alt={product.title}
                                                className="w-14 h-14 object-cover rounded-lg border bg-background shrink-0"
                                            />
                                            <div>
                                                <h5 className="font-bold text-sm text-foreground line-clamp-1">{product.title}</h5>
                                                <p className="text-xs text-muted-foreground font-medium">₹{product.discountPrice || product.price}</p>
                                            </div>
                                        </div>

                                        {/* Color Selection */}
                                        <div>
                                            <Label className="text-xs font-semibold text-muted-foreground block mb-2">
                                                Color: <span className="text-foreground font-bold">{currentSel.colorName}</span>
                                            </Label>
                                            <div className="flex flex-wrap gap-2">
                                                {product.variants.map((v: any) => (
                                                    <button
                                                        key={v.id}
                                                        type="button"
                                                        onClick={() => {
                                                            const firstSize = v.sizes?.find((s: any) => s.stock > 0)?.size || v.sizes?.[0]?.size || "";
                                                            const stock = v.sizes?.find((s: any) => s.size === firstSize)?.stock || 0;
                                                            setSelections(prev => ({
                                                                ...prev,
                                                                [product.id]: {
                                                                    variantId: v.id,
                                                                    colorName: v.colorName,
                                                                    colorHex: v.colorHex,
                                                                    size: firstSize,
                                                                    maxStock: stock
                                                                }
                                                            }));
                                                        }}
                                                        className={cn(
                                                            "h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center",
                                                            currentSel.variantId === v.id ? "border-primary scale-110 shadow-md ring-2 ring-primary/30" : "border-border hover:scale-105"
                                                        )}
                                                        style={{ backgroundColor: v.colorHex }}
                                                        title={v.colorName}
                                                    >
                                                        {currentSel.variantId === v.id && (
                                                            <Check className="h-3 w-3 text-white drop-shadow-md" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Size Selection */}
                                        <div>
                                            <Label className="text-xs font-semibold text-muted-foreground block mb-2">Size *</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {activeVariant?.sizes?.map((sizeObj: any) => (
                                                    <Button
                                                        key={sizeObj.size}
                                                        type="button"
                                                        size="sm"
                                                        variant={currentSel.size === sizeObj.size ? "default" : "outline"}
                                                        disabled={sizeObj.stock === 0}
                                                        onClick={() => {
                                                            setSelections(prev => ({
                                                                ...prev,
                                                                [product.id]: {
                                                                    ...prev[product.id],
                                                                    size: sizeObj.size,
                                                                    maxStock: sizeObj.stock
                                                                }
                                                            }));
                                                        }}
                                                        className={cn(
                                                            "h-8 text-xs font-bold px-3",
                                                            currentSel.size === sizeObj.size ? "bg-primary text-white" : ""
                                                        )}
                                                    >
                                                        {sizeObj.size}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleConfirmCombo(false)}
                                    disabled={!isAllSelected()}
                                    className="flex-1 gap-2 font-bold h-11"
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                    Add Bundle to Cart
                                </Button>
                                <Button
                                    onClick={() => handleConfirmCombo(true)}
                                    disabled={!isAllSelected()}
                                    className="flex-1 gap-2 font-bold h-11 bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 shadow-md"
                                >
                                    <span>Proceed to Checkout</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </AlertDialogContent>
            </AlertDialog>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                <TrendingUp className="h-3 w-3" />
                <span>Frequently bought together by other savvy shoppers!</span>
            </div>
        </div>
    );
};

