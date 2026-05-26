/**
 * Cart Page - Shopping cart with items and checkout link
 */

import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const CartPage = () => {
    const { cart, updateQuantity, removeFromCart, loading } = useCart();
    const { isAuthenticated } = useAuth();

    // Format price in INR
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    const handleUpdateQuantity = async (productId, newQuantity) => {
        try {
            await updateQuantity(productId, newQuantity);
        } catch (error) {
            toast.error('Failed to update quantity');
        }
    };

    const handleRemove = async (productId, productName) => {
        try {
            await removeFromCart(productId);
            toast.success(`${productName} removed from cart`);
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    // Empty cart state
    if (cart.items.length === 0) {
        return (
            <main data-testid="cart-page" className="min-h-screen pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-6 md:px-12">
                    <div className="text-center py-16">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                        <h1 className="font-serif text-3xl text-foreground mb-4">Your Cart is Empty</h1>
                        <p className="text-muted-foreground mb-8">
                            Looks like you haven't added any products yet.
                        </p>
                        <Link to="/products">
                            <Button 
                                data-testid="continue-shopping-btn"
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Continue Shopping
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main data-testid="cart-page" className="min-h-screen pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-6 md:px-12">
                {/* Page Header */}
                <div className="mb-12">
                    <Link 
                        to="/products"
                        className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Continue Shopping
                    </Link>
                    <h1 className="font-serif text-3xl md:text-4xl text-foreground">Shopping Cart</h1>
                    <p className="text-muted-foreground mt-2">
                        {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {cart.items.map((item) => (
                            <div 
                                key={item.product_id}
                                data-testid={`cart-item-${item.product_id}`}
                                className="flex gap-6 p-4 bg-card border border-border/50 rounded-sm"
                            >
                                {/* Product Image */}
                                <Link to={`/products/${item.product_id}`} className="shrink-0">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-sm overflow-hidden bg-secondary/20">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </Link>

                                {/* Product Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <Link 
                                            to={`/products/${item.product_id}`}
                                            className="font-serif text-lg text-foreground hover:text-primary transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                        <p className="text-muted-foreground mt-1">
                                            {formatPrice(item.price)} each
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center border border-border rounded-sm">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                                                disabled={loading}
                                                data-testid={`decrease-${item.product_id}`}
                                                className="h-8 w-8 rounded-none"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-10 text-center text-sm font-medium">
                                                {item.quantity}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                                                disabled={loading}
                                                data-testid={`increase-${item.product_id}`}
                                                className="h-8 w-8 rounded-none"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        {/* Remove Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemove(item.product_id, item.name)}
                                            disabled={loading}
                                            data-testid={`remove-${item.product_id}`}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Remove
                                        </Button>
                                    </div>
                                </div>

                                {/* Item Total */}
                                <div className="text-right">
                                    <p className="font-serif text-lg text-foreground">
                                        {formatPrice(item.price * item.quantity)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-card border border-border/50 rounded-sm p-6">
                            <h2 className="font-serif text-xl text-foreground mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="text-foreground">{formatPrice(cart.total)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Delivery</span>
                                    <span className="text-primary">Free</span>
                                </div>
                            </div>

                            <div className="border-t border-border pt-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="font-medium text-foreground">Total</span>
                                    <span 
                                        data-testid="cart-total"
                                        className="font-serif text-2xl text-foreground"
                                    >
                                        {formatPrice(cart.total)}
                                    </span>
                                </div>
                            </div>

                            {isAuthenticated ? (
                                <Link to="/checkout">
                                    <Button 
                                        size="lg"
                                        data-testid="checkout-btn"
                                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        Proceed to Checkout
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            ) : (
                                <div className="space-y-3">
                                    <Link to="/login?redirect=/checkout">
                                        <Button 
                                            size="lg"
                                            data-testid="login-to-checkout-btn"
                                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                        >
                                            Login to Checkout
                                        </Button>
                                    </Link>
                                    <p className="text-xs text-center text-muted-foreground">
                                        You need to be logged in to complete your purchase
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CartPage;
