/**
 * Products Page - Product listing with filters and search
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '../../components/ui/sheet';
import ProductCard from '../../components/product/ProductCard';
import { productsApi } from '../../services/api';

const ProductsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Get filter values from URL
    const searchQuery = searchParams.get('search') || '';
    const categoryFilter = searchParams.get('category') || '';
    const sortBy = searchParams.get('sort') || '';

    // Fetch products with filters
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = {};
                if (searchQuery) params.search = searchQuery;
                if (categoryFilter) params.category = categoryFilter;
                if (sortBy) params.sort_by = sortBy;

                const response = await productsApi.getAll(params);
                setProducts(response.data);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchQuery, categoryFilter, sortBy]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await productsApi.getCategories();
                setCategories(response.data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        fetchCategories();
    }, []);

    // Update URL params
    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchParams({});
    };

    const hasActiveFilters = searchQuery || categoryFilter || sortBy;

    // Filter Sidebar Content
    const FilterContent = () => (
        <div className="space-y-6">
            {/* Search */}
            <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        data-testid="filter-search"
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Categories */}
            <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                <Select
                    value={categoryFilter}
                    onValueChange={(value) => updateFilter('category', value === 'all' ? '' : value)}
                >
                    <SelectTrigger data-testid="filter-category">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Sort By */}
            <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Sort By</label>
                <Select
                    value={sortBy}
                    onValueChange={(value) => updateFilter('sort', value === 'default' ? '' : value)}
                >
                    <SelectTrigger data-testid="filter-sort">
                        <SelectValue placeholder="Default" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="name">Name A-Z</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <Button
                    variant="outline"
                    onClick={clearFilters}
                    data-testid="clear-filters"
                    className="w-full"
                >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                </Button>
            )}
        </div>
    );

    return (
        <main data-testid="products-page" className="min-h-screen pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* Page Header */}
                <div className="mb-12">
                    <p className="overline mb-4">Our Collection</p>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
                                {categoryFilter || 'All Products'}
                            </h1>
                            {!loading && (
                                <p className="text-muted-foreground mt-2">
                                    {products.length} product{products.length !== 1 ? 's' : ''} found
                                </p>
                            )}
                        </div>

                        {/* Mobile Filter Button */}
                        <div className="flex gap-4 lg:hidden">
                            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                <SheetTrigger asChild>
                                    <Button 
                                        variant="outline"
                                        data-testid="mobile-filter-btn"
                                        className="border-primary/50"
                                    >
                                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                                        Filters
                                        {hasActiveFilters && (
                                            <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                                !
                                            </span>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left">
                                    <SheetHeader>
                                        <SheetTitle>Filters</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-6">
                                        <FilterContent />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>

                    {/* Active Filters Tags */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {searchQuery && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                                    Search: {searchQuery}
                                    <button 
                                        onClick={() => updateFilter('search', '')}
                                        className="ml-2 hover:text-primary/70"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {categoryFilter && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                                    {categoryFilter}
                                    <button 
                                        onClick={() => updateFilter('category', '')}
                                        className="ml-2 hover:text-primary/70"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex gap-12">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="sticky top-28">
                            <h3 className="font-serif text-lg text-foreground mb-6">Filters</h3>
                            <FilterContent />
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="space-y-4">
                                        <Skeleton className="aspect-square w-full rounded-sm" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-6 w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-muted-foreground text-lg">No products found</p>
                                <Button 
                                    variant="outline" 
                                    onClick={clearFilters}
                                    className="mt-4"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {products.map((product, index) => (
                                    <div 
                                        key={product.id}
                                        className="animate-fade-in"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProductsPage;
