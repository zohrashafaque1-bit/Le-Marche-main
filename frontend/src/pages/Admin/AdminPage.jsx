/**
 * Admin Page - Admin dashboard with products and orders management
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Package, ShoppingBag, Users, DollarSign, 
    Plus, Edit, Trash2, Eye, Loader2, Check, X 
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '../../components/ui/tabs';
import { useAuth } from '../../context/AuthContext';
import { productsApi, adminApi, ordersApi } from '../../services/api';
import { toast } from 'sonner';

// Status colors for orders
const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-600',
    confirmed: 'bg-blue-500/10 text-blue-600',
    processing: 'bg-purple-500/10 text-purple-600',
    shipped: 'bg-indigo-500/10 text-indigo-600',
    delivered: 'bg-green-500/10 text-green-600',
    cancelled: 'bg-red-500/10 text-red-600'
};

// Product Form Component
const ProductForm = ({ product, onSave, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        category: product?.category || '',
        image: product?.image || '',
        stock: product?.stock || 100,
        rating: product?.rating || 4.5,
        origin: product?.origin || '',
        weight: product?.weight || '',
        tags: product?.tags?.join(', ') || ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.price || !formData.category) {
            toast.error('Please fill in required fields');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                rating: parseFloat(formData.rating),
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            if (product) {
                await productsApi.update(product.id, payload);
                toast.success('Product updated successfully');
            } else {
                await productsApi.create(payload);
                toast.success('Product created successfully');
            }
            
            onSave();
            onClose();
        } catch (error) {
            console.error('Save failed:', error);
            toast.error(error.response?.data?.detail || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Product name"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Cheese & Dairy">Cheese & Dairy</SelectItem>
                            <SelectItem value="Bakery">Bakery</SelectItem>
                            <SelectItem value="Organic Produce">Organic Produce</SelectItem>
                            <SelectItem value="Meat & Deli">Meat & Deli</SelectItem>
                            <SelectItem value="Seafood">Seafood</SelectItem>
                            <SelectItem value="Oils & Vinegars">Oils & Vinegars</SelectItem>
                            <SelectItem value="Beverages">Beverages</SelectItem>
                            <SelectItem value="Pantry">Pantry</SelectItem>
                            <SelectItem value="Confectionery">Confectionery</SelectItem>
                            <SelectItem value="Breakfast">Breakfast</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Product description"
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="999"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                        id="stock"
                        name="stock"
                        type="number"
                        value={formData.stock}
                        onChange={handleChange}
                        placeholder="100"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                        id="rating"
                        name="rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.rating}
                        onChange={handleChange}
                        placeholder="4.5"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="origin">Origin</Label>
                    <Input
                        id="origin"
                        name="origin"
                        value={formData.origin}
                        onChange={handleChange}
                        placeholder="Country of origin"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="250g"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="organic, imported, premium"
                />
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-primary text-primary-foreground"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        product ? 'Update Product' : 'Add Product'
                    )}
                </Button>
            </div>
        </form>
    );
};

const AdminPage = () => {
    const navigate = useNavigate();
    const { isAdmin, isAuthenticated, loading: authLoading, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Redirect if not admin (wait for auth to load first)
    useEffect(() => {
        // Wait for auth to finish loading
        if (authLoading) return;
        
        if (!isAuthenticated) {
            navigate('/login?redirect=/admin');
        } else if (user && user.role !== 'admin') {
            navigate('/');
            toast.error('Admin access required');
        }
    }, [isAuthenticated, user, authLoading, navigate]);

    // Fetch data when user is confirmed as admin
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, productsRes, ordersRes] = await Promise.all([
                    adminApi.getStats(),
                    productsApi.getAll(),
                    adminApi.getOrders()
                ]);
                
                setStats(statsRes.data);
                setProducts(productsRes.data);
                setOrders(ordersRes.data);
            } catch (error) {
                console.error('Failed to fetch admin data:', error);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch when user is loaded and is admin
        if (!authLoading && user && user.role === 'admin') {
            fetchData();
        }
    }, [authLoading, user]);

    const refreshProducts = async () => {
        const response = await productsApi.getAll();
        setProducts(response.data);
    };

    const handleDeleteProduct = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        
        try {
            await productsApi.delete(id);
            toast.success('Product deleted');
            refreshProducts();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await ordersApi.updateStatus(orderId, newStatus);
            toast.success('Order status updated');
            
            // Refresh orders
            const response = await adminApi.getOrders();
            setOrders(response.data);
        } catch (error) {
            toast.error('Failed to update status');
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

    // Show loading while auth is loading or data is loading
    if (authLoading || (loading && user?.role === 'admin')) {
        return (
            <main className="min-h-screen pt-24 pb-16 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <Skeleton className="h-10 w-48 mb-12" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    // Don't render admin content if user is not admin
    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <main data-testid="admin-page" className="min-h-screen pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-12">Admin Dashboard</h1>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <div className="bg-card border border-border/50 rounded-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Products</p>
                                    <p className="font-serif text-3xl text-foreground mt-1">
                                        {stats.total_products}
                                    </p>
                                </div>
                                <Package className="h-10 w-10 text-primary/50" />
                            </div>
                        </div>

                        <div className="bg-card border border-border/50 rounded-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Orders</p>
                                    <p className="font-serif text-3xl text-foreground mt-1">
                                        {stats.total_orders}
                                    </p>
                                </div>
                                <ShoppingBag className="h-10 w-10 text-primary/50" />
                            </div>
                        </div>

                        <div className="bg-card border border-border/50 rounded-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Users</p>
                                    <p className="font-serif text-3xl text-foreground mt-1">
                                        {stats.total_users}
                                    </p>
                                </div>
                                <Users className="h-10 w-10 text-primary/50" />
                            </div>
                        </div>

                        <div className="bg-card border border-border/50 rounded-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                                    <p className="font-serif text-3xl text-foreground mt-1">
                                        {formatPrice(stats.total_revenue)}
                                    </p>
                                </div>
                                <DollarSign className="h-10 w-10 text-primary/50" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs for Products and Orders */}
                <Tabs defaultValue="products">
                    <TabsList>
                        <TabsTrigger value="products" data-testid="admin-products-tab">
                            Products
                        </TabsTrigger>
                        <TabsTrigger value="orders" data-testid="admin-orders-tab">
                            Orders
                        </TabsTrigger>
                    </TabsList>

                    {/* Products Tab */}
                    <TabsContent value="products" className="mt-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-serif text-xl text-foreground">
                                Manage Products
                            </h2>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button 
                                        data-testid="add-product-btn"
                                        className="bg-primary text-primary-foreground"
                                        onClick={() => setEditingProduct(null)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Product
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <ProductForm 
                                        product={editingProduct}
                                        onSave={refreshProducts}
                                        onClose={() => setIsDialogOpen(false)}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="bg-card border border-border/50 rounded-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-secondary/30">
                                        <tr>
                                            <th className="text-left text-sm font-medium text-muted-foreground p-4">Product</th>
                                            <th className="text-left text-sm font-medium text-muted-foreground p-4">Category</th>
                                            <th className="text-left text-sm font-medium text-muted-foreground p-4">Price</th>
                                            <th className="text-left text-sm font-medium text-muted-foreground p-4">Stock</th>
                                            <th className="text-right text-sm font-medium text-muted-foreground p-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr 
                                                key={product.id} 
                                                data-testid={`admin-product-${product.id}`}
                                                className="border-t border-border/50"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-sm overflow-hidden bg-secondary/20">
                                                            <img
                                                                src={product.image}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <span className="font-medium text-foreground">
                                                            {product.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-muted-foreground">
                                                    {product.category}
                                                </td>
                                                <td className="p-4 text-foreground">
                                                    {formatPrice(product.price)}
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'}>
                                                        {product.stock}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setEditingProduct(product);
                                                                setIsDialogOpen(true);
                                                            }}
                                                            data-testid={`edit-product-${product.id}`}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteProduct(product.id, product.name)}
                                                            data-testid={`delete-product-${product.id}`}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Orders Tab */}
                    <TabsContent value="orders" className="mt-6">
                        <h2 className="font-serif text-xl text-foreground mb-6">
                            Manage Orders ({orders.length})
                        </h2>

                        <div className="space-y-4">
                            {orders.length === 0 ? (
                                <div className="text-center py-12 bg-card border border-border/50 rounded-sm">
                                    <p className="text-muted-foreground">No orders yet</p>
                                </div>
                            ) : (
                                orders.map((order) => (
                                    <div 
                                        key={order.id}
                                        data-testid={`admin-order-${order.id}`}
                                        className="bg-card border border-border/50 rounded-sm p-6"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Order ID</p>
                                                <p className="font-mono text-sm text-foreground">{order.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Customer</p>
                                                <p className="text-sm text-foreground">{order.address.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Total</p>
                                                <p className="font-serif text-lg text-foreground">
                                                    {formatPrice(order.total_amount)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Select
                                                    value={order.status}
                                                    onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                                                >
                                                    <SelectTrigger className="w-36">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                                        <SelectItem value="processing">Processing</SelectItem>
                                                        <SelectItem value="shipped">Shipped</SelectItem>
                                                        <SelectItem value="delivered">Delivered</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Order Items Preview */}
                                        <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                                            {order.items.slice(0, 4).map((item, idx) => (
                                                <div 
                                                    key={idx}
                                                    className="w-10 h-10 rounded-sm overflow-hidden bg-secondary/20"
                                                >
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                            {order.items.length > 4 && (
                                                <div className="w-10 h-10 rounded-sm bg-secondary/30 flex items-center justify-center">
                                                    <span className="text-xs text-muted-foreground">
                                                        +{order.items.length - 4}
                                                    </span>
                                                </div>
                                            )}
                                            <span className="text-sm text-muted-foreground self-center ml-2">
                                                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
};

export default AdminPage;
