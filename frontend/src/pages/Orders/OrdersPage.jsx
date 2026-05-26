/**
 * Orders Page - User order history
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Clock, Check, Truck, XCircle, ShoppingBag } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../services/api';

const statusConfig = {
    pending: { icon: Clock, color: 'bg-yellow-500/10 text-yellow-600', label: 'Pending' },
    confirmed: { icon: Check, color: 'bg-blue-500/10 text-blue-600', label: 'Confirmed' },
    processing: { icon: Package, color: 'bg-purple-500/10 text-purple-600', label: 'Processing' },
    shipped: { icon: Truck, color: 'bg-indigo-500/10 text-indigo-600', label: 'Shipped' },
    delivered: { icon: Check, color: 'bg-green-500/10 text-green-600', label: 'Delivered' },
    cancelled: { icon: XCircle, color: 'bg-red-500/10 text-red-600', label: 'Cancelled' }
};

const OrderCard = ({ order }) => {
    const status = statusConfig[order.status] || statusConfig.pending;
    const StatusIcon = status.icon;

    // Format price in INR
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div 
            data-testid={`order-${order.id}`}
            className="bg-card border border-border/50 rounded-sm p-6"
        >
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                    <p className="font-mono text-sm text-foreground">{order.id.slice(0, 8)}...</p>
                </div>
                <div className="text-left sm:text-right">
                    <p className="text-xs text-muted-foreground mb-1">Placed on</p>
                    <p className="text-sm text-foreground">{formatDate(order.created_at)}</p>
                </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3 mb-6">
                {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-sm overflow-hidden bg-secondary/20 shrink-0">
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
                {order.items.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                        +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            {/* Order Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
                <Badge className={`${status.color} border-0 px-3 py-1`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                </Badge>
                <div className="flex items-center gap-4">
                    <p className="font-serif text-xl text-foreground">
                        {formatPrice(order.total_amount)}
                    </p>
                </div>
            </div>

            {/* Delivery Address */}
            <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Delivery Address</p>
                <p className="text-sm text-foreground">
                    {order.address.name}, {order.address.address}, {order.address.city} - {order.address.pincode}
                </p>
            </div>
        </div>
    );
};

const OrdersPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Fetch orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await ordersApi.getAll();
                setOrders(response.data);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated]);

    if (loading) {
        return (
            <main className="min-h-screen pt-24 pb-16 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <Skeleton className="h-10 w-48 mb-12" />
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-48 w-full" />
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main data-testid="orders-page" className="min-h-screen pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6 md:px-12">
                <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-12">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="text-center py-16">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                        <h2 className="font-serif text-2xl text-foreground mb-4">No Orders Yet</h2>
                        <p className="text-muted-foreground mb-8">
                            You haven't placed any orders. Start shopping to see your orders here.
                        </p>
                        <Link to="/products">
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                                Start Shopping
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};

export default OrdersPage;
