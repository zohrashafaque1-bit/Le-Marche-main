/**
 * CartContext - Manages shopping cart state
 * Syncs with backend when user is authenticated
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    // Fetch cart from server when authenticated
    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) {
            // Load from localStorage for guests
            const savedCart = localStorage.getItem('guestCart');
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
            return;
        }

        setLoading(true);
        try {
            const response = await api.get('/cart');
            setCart(response.data);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Add item to cart
    const addToCart = async (productId, quantity = 1) => {
        if (!isAuthenticated) {
            // Handle guest cart locally
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '{"items":[],"total":0}');
            const existingItem = guestCart.items.find(item => item.product_id === productId);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                // For guest, we'll need to fetch product details
                try {
                    const response = await api.get(`/products/${productId}`);
                    const product = response.data;
                    guestCart.items.push({
                        product_id: productId,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity
                    });
                } catch (error) {
                    throw new Error('Failed to add product to cart');
                }
            }
            
            // Recalculate total
            guestCart.total = guestCart.items.reduce(
                (sum, item) => sum + item.price * item.quantity, 
                0
            );
            
            localStorage.setItem('guestCart', JSON.stringify(guestCart));
            setCart(guestCart);
            return guestCart;
        }

        setLoading(true);
        try {
            const response = await api.post('/cart/add', { product_id: productId, quantity });
            setCart(response.data);
            return response.data;
        } finally {
            setLoading(false);
        }
    };

    // Update item quantity
    const updateQuantity = async (productId, quantity) => {
        if (!isAuthenticated) {
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '{"items":[],"total":0}');
            
            if (quantity <= 0) {
                guestCart.items = guestCart.items.filter(item => item.product_id !== productId);
            } else {
                const item = guestCart.items.find(item => item.product_id === productId);
                if (item) {
                    item.quantity = quantity;
                }
            }
            
            guestCart.total = guestCart.items.reduce(
                (sum, item) => sum + item.price * item.quantity, 
                0
            );
            
            localStorage.setItem('guestCart', JSON.stringify(guestCart));
            setCart(guestCart);
            return guestCart;
        }

        setLoading(true);
        try {
            const response = await api.put('/cart/update', { product_id: productId, quantity });
            setCart(response.data);
            return response.data;
        } finally {
            setLoading(false);
        }
    };

    // Remove item from cart
    const removeFromCart = async (productId) => {
        if (!isAuthenticated) {
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '{"items":[],"total":0}');
            guestCart.items = guestCart.items.filter(item => item.product_id !== productId);
            guestCart.total = guestCart.items.reduce(
                (sum, item) => sum + item.price * item.quantity, 
                0
            );
            localStorage.setItem('guestCart', JSON.stringify(guestCart));
            setCart(guestCart);
            return guestCart;
        }

        setLoading(true);
        try {
            const response = await api.delete(`/cart/remove/${productId}`);
            setCart(response.data);
            return response.data;
        } finally {
            setLoading(false);
        }
    };

    // Clear cart
    const clearCart = async () => {
        if (!isAuthenticated) {
            localStorage.removeItem('guestCart');
            setCart({ items: [], total: 0 });
            return;
        }

        setLoading(true);
        try {
            await api.delete('/cart/clear');
            setCart({ items: [], total: 0 });
        } finally {
            setLoading(false);
        }
    };

    // Sync guest cart to server after login
    const syncGuestCart = async () => {
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart && isAuthenticated) {
            const parsed = JSON.parse(guestCart);
            for (const item of parsed.items) {
                try {
                    await api.post('/cart/add', { 
                        product_id: item.product_id, 
                        quantity: item.quantity 
                    });
                } catch (error) {
                    console.error('Failed to sync item:', error);
                }
            }
            localStorage.removeItem('guestCart');
            fetchCart();
        }
    };

    // Get cart item count
    const getItemCount = () => {
        return cart.items.reduce((sum, item) => sum + item.quantity, 0);
    };

    const value = {
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        syncGuestCart,
        fetchCart,
        getItemCount
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
