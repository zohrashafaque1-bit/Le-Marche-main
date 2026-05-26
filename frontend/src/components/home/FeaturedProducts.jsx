/**
 * FeaturedProducts Component - Showcase featured products
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import ProductCard from '../product/ProductCard';
import { productsApi } from '../../services/api';
import { Skeleton } from '../ui/skeleton';

const FeaturedProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productsApi.getAll({ sort_by: 'rating' });
                // Get top 8 rated products
                setProducts(response.data.slice(0, 8));
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <section data-testid="featured-products" className="py-24 px-6 md:px-12 bg-secondary/30">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                    <div>
                        <p className="overline mb-4">Curated Selection</p>
                        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
                            Featured Products
                        </h2>
                    </div>
                    <Link to="/products" className="mt-6 md:mt-0">
                        <Button 
                            variant="outline" 
                            className="border-primary/50 text-foreground hover:bg-primary hover:text-primary-foreground"
                        >
                            View All Products
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="aspect-square w-full rounded-sm" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-6 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product, index) => (
                            <div 
                                key={product.id}
                                className="animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedProducts;
