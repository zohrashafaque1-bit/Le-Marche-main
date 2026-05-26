/**
 * ProductCard Component - Minimal luxury product card
 * Image-dominant design with subtle hover effects
 */

import { Link } from 'react-router-dom';
import { ShoppingBag, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { useCart } from '../../context/CartContext';
import { toast } from 'sonner';

const ProductCard = ({ product }) => {
    const { addToCart, loading } = useCart();

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            await addToCart(product.id);
            toast.success(`${product.name} added to cart`);
        } catch (error) {
            toast.error('Failed to add to cart');
        }
    };

    // Format price in INR
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <Link 
            to={`/products/${product.id}`}
            data-testid={`product-card-${product.id}`}
            className="group block"
        >
            <div className="relative overflow-hidden rounded-sm bg-card border border-border/50 card-hover">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-secondary/20">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                    />
                    
                    {/* Quick Add Button - Shows on hover */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <Button
                            onClick={handleAddToCart}
                            disabled={loading || product.stock === 0}
                            data-testid={`add-to-cart-${product.id}`}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                        >
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                    </div>

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                            {product.tags.slice(0, 2).map((tag) => (
                                <span 
                                    key={tag}
                                    className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-primary/90 text-primary-foreground rounded-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-2">
                    {/* Category */}
                    <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-primary">
                        {product.category}
                    </p>

                    {/* Name */}
                    <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                    </h3>

                    {/* Rating and Origin */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-muted-foreground">{product.rating}</span>
                        </div>
                        {product.origin && (
                            <span className="text-xs text-muted-foreground">
                                {product.origin}
                            </span>
                        )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-2">
                        <p className="font-serif text-xl text-foreground">
                            {formatPrice(product.price)}
                        </p>
                        {product.weight && (
                            <span className="text-xs text-muted-foreground">
                                {product.weight}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
