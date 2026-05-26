/**
 * Product Detail Page - Full product view with add to cart
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Minus, Plus, ShoppingBag, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import { productsApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { toast } from 'sonner';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const { addToCart, loading: cartLoading } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await productsApi.getOne(id);
                setProduct(response.data);
            } catch (error) {
                console.error('Failed to fetch product:', error);
                toast.error('Product not found');
                navigate('/products');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, navigate]);

    const handleAddToCart = async () => {
        try {
            await addToCart(product.id, quantity);
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

    if (loading) {
        return (
            <main className="min-h-screen pt-24 pb-16 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <Skeleton className="h-6 w-32 mb-8" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <Skeleton className="aspect-square w-full rounded-sm" />
                        <div className="space-y-6">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-8 w-32" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!product) return null;

    return (
        <main data-testid="product-detail-page" className="min-h-screen pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* Back Button */}
                <Link 
                    to="/products"
                    className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Products
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* Product Image */}
                    <div className="relative aspect-square rounded-sm overflow-hidden bg-secondary/20">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                {product.tags.map((tag) => (
                                    <Badge 
                                        key={tag}
                                        variant="secondary"
                                        className="bg-primary/90 text-primary-foreground uppercase text-[10px] tracking-wider"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        {/* Category */}
                        <p className="overline mb-4">{product.category}</p>

                        {/* Name */}
                        <h1 
                            data-testid="product-name"
                            className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4"
                        >
                            {product.name}
                        </h1>

                        {/* Rating & Origin */}
                        <div className="flex items-center gap-6 mb-6">
                            <div className="flex items-center gap-1">
                                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                                <span className="text-foreground font-medium">{product.rating}</span>
                                <span className="text-muted-foreground">/ 5</span>
                            </div>
                            {product.origin && (
                                <span className="text-muted-foreground">
                                    Origin: <span className="text-foreground">{product.origin}</span>
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <p 
                            data-testid="product-description"
                            className="text-muted-foreground leading-relaxed mb-8"
                        >
                            {product.description}
                        </p>

                        {/* Price */}
                        <div className="flex items-baseline gap-4 mb-8">
                            <span 
                                data-testid="product-price"
                                className="font-serif text-4xl text-foreground"
                            >
                                {formatPrice(product.price)}
                            </span>
                            {product.weight && (
                                <span className="text-muted-foreground">/ {product.weight}</span>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className="mb-8">
                            {product.stock > 0 ? (
                                <span className="text-primary text-sm">
                                    ✓ In Stock ({product.stock} available)
                                </span>
                            ) : (
                                <span className="text-destructive text-sm">
                                    ✗ Out of Stock
                                </span>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-6 mb-8">
                            <span className="text-sm text-muted-foreground">Quantity</span>
                            <div className="flex items-center border border-border rounded-sm">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    data-testid="quantity-decrease"
                                    className="h-10 w-10 rounded-none"
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span 
                                    data-testid="quantity-value"
                                    className="w-12 text-center font-medium"
                                >
                                    {quantity}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    data-testid="quantity-increase"
                                    className="h-10 w-10 rounded-none"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                            size="lg"
                            onClick={handleAddToCart}
                            disabled={cartLoading || product.stock === 0}
                            data-testid="add-to-cart-btn"
                            className="w-full md:w-auto px-12 bg-primary text-primary-foreground hover:bg-primary/90 mb-8"
                        >
                            <ShoppingBag className="h-5 w-5 mr-2" />
                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>

                        {/* Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-border">
                            <div className="flex items-center gap-3">
                                <Truck className="h-5 w-5 text-primary" />
                                <span className="text-sm text-muted-foreground">Free Delivery</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-primary" />
                                <span className="text-sm text-muted-foreground">Quality Assured</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <RotateCcw className="h-5 w-5 text-primary" />
                                <span className="text-sm text-muted-foreground">Easy Returns</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProductDetailPage;
