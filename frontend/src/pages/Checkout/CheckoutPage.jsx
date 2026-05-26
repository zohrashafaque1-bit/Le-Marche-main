/**
 * Checkout Page - Address form and order placement
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../services/api';
import { toast } from 'sonner';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cart, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        pincode: ''
    });

    // Pre-fill form with user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                pincode: user.pincode || ''
            });
        }
    }, [user]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/checkout');
        }
    }, [isAuthenticated, navigate]);

    // Redirect if cart is empty
    useEffect(() => {
        if (cart.items.length === 0 && !orderPlaced) {
            navigate('/cart');
        }
    }, [cart.items.length, navigate, orderPlaced]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await ordersApi.create({
                address: formData
            });
            
            setOrderId(response.data.id);
            setOrderPlaced(true);
            await clearCart();
            toast.success('Order placed successfully!');
        } catch (error) {
            console.error('Order failed:', error);
            toast.error(error.response?.data?.detail || 'Failed to place order');
        } finally {
            setLoading(false);
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

    // Order Success View
    if (orderPlaced) {
        return (
            <main data-testid="checkout-success" className="min-h-screen pt-24 pb-16">
                <div className="max-w-xl mx-auto px-6 md:px-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8">
                        <Check className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
                        Order Confirmed!
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        Thank you for shopping with Le Marché. Your order has been placed successfully.
                    </p>
                    <p className="text-sm text-muted-foreground mb-8">
                        Order ID: <span className="text-foreground font-mono">{orderId}</span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/orders">
                            <Button 
                                data-testid="view-orders-btn"
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                View Orders
                            </Button>
                        </Link>
                        <Link to="/products">
                            <Button variant="outline" className="border-primary/50">
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main data-testid="checkout-page" className="min-h-screen pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-6 md:px-12">
                {/* Back Button */}
                <Link 
                    to="/cart"
                    className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Cart
                </Link>

                <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-12">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Delivery Address Form */}
                    <div>
                        <h2 className="font-serif text-xl text-foreground mb-6">Delivery Address</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    data-testid="checkout-name"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    data-testid="checkout-phone"
                                    placeholder="+91 98765 43210"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    data-testid="checkout-address"
                                    placeholder="House no., Building, Street"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        data-testid="checkout-city"
                                        placeholder="City"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pincode">PIN Code</Label>
                                    <Input
                                        id="pincode"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        data-testid="checkout-pincode"
                                        placeholder="122011"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                disabled={loading}
                                data-testid="place-order-btn"
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Placing Order...
                                    </>
                                ) : (
                                    'Place Order'
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <h2 className="font-serif text-xl text-foreground mb-6">Order Summary</h2>
                        <div className="bg-card border border-border/50 rounded-sm p-6">
                            {/* Items */}
                            <div className="space-y-4 mb-6">
                                {cart.items.map((item) => (
                                    <div 
                                        key={item.product_id}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="w-16 h-16 rounded-sm overflow-hidden bg-secondary/20 shrink-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-foreground truncate">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm text-foreground">
                                            {formatPrice(item.price * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="border-t border-border pt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="text-foreground">{formatPrice(cart.total)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Delivery</span>
                                    <span className="text-primary">Free</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-border">
                                    <span className="font-medium text-foreground">Total</span>
                                    <span 
                                        data-testid="checkout-total"
                                        className="font-serif text-2xl text-foreground"
                                    >
                                        {formatPrice(cart.total)}
                                    </span>
                                </div>
                            </div>

                            {/* Note */}
                            <p className="text-xs text-muted-foreground mt-6 text-center">
                                By placing this order, you agree to our Terms of Service
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CheckoutPage;
