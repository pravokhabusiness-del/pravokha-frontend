import { Search, Filter, List, LayoutGrid } from "lucide-react";
import { Input } from "@/ui/Input";
import { Button } from "@/ui/Button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/ui/Select";
import { ProductStatusFilter, ProductViewMode } from "../domain/types";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    categoryFilter: string;
    onCategoryFilterChange: (value: string) => void;
    statusFilter: ProductStatusFilter;
    onStatusFilterChange: (value: ProductStatusFilter) => void;
    viewMode: ProductViewMode;
    onViewModeChange: (value: ProductViewMode) => void;
    categories?: { id: string, name: string, slug?: string }[];
}

export function ProductFilters({
    searchQuery,
    onSearchChange,
    categoryFilter,
    onCategoryFilterChange,
    statusFilter,
    onStatusFilterChange,
    viewMode,
    onViewModeChange,
    categories = [],
}: ProductFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
            <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 h-10 rounded-xl bg-card border-border/60 focus-visible:ring-primary/20 text-sm w-full"
                />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 flex-1 sm:flex-none">
                    <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                        <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-xl bg-card border-border/60 text-xs font-semibold whitespace-nowrap">
                            <Filter className="h-3.5 w-3.5 mr-1.5 shrink-0 text-muted-foreground" />
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.slug || cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as ProductStatusFilter)}>
                        <SelectTrigger className="w-full sm:w-[140px] h-10 rounded-xl bg-card border-border/60 text-xs font-semibold whitespace-nowrap">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="low_stock">Low Stock</SelectItem>
                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="hidden sm:flex border border-border/60 rounded-xl overflow-hidden bg-card shrink-0 h-10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewModeChange("list")}
                        className={cn(
                            "rounded-none px-3 h-full border-r border-border/60 font-semibold text-xs transition-all",
                            viewMode === "list"
                                ? "bg-primary text-white hover:bg-primary/95 hover:text-white"
                                : "hover:bg-muted/50 text-muted-foreground"
                        )}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewModeChange("grid")}
                        className={cn(
                            "rounded-none px-3 h-full font-semibold text-xs transition-all",
                            viewMode === "grid"
                                ? "bg-primary text-white hover:bg-primary/95 hover:text-white"
                                : "hover:bg-muted/50 text-muted-foreground"
                        )}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
