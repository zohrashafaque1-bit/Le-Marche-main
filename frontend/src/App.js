/**
 * Le Marché - Premium Gourmet Grocery Store
 * Main App component with routing
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";

// Layout Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Pages
import HomePage from "./pages/Home/HomePage";
import ProductsPage from "./pages/Products/ProductsPage";
import ProductDetailPage from "./pages/Products/ProductDetailPage";
import CartPage from "./pages/Cart/CartPage";
import CheckoutPage from "./pages/Checkout/CheckoutPage";
import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/SignupPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import OrdersPage from "./pages/Orders/OrdersPage";
import AboutPage from "./pages/About/AboutPage";
import ContactPage from "./pages/Contact/ContactPage";
import AdminPage from "./pages/Admin/AdminPage";

// Styles
import "./App.css";

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <CartProvider>
                    <BrowserRouter>
                        <div className="App min-h-screen flex flex-col bg-background">
                            {/* Global Toast Notifications */}
                            <Toaster 
                                position="top-right" 
                                richColors 
                                closeButton
                                toastOptions={{
                                    style: {
                                        background: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        color: 'hsl(var(--foreground))'
                                    }
                                }}
                            />
                            
                            {/* Navigation */}
                            <Navbar />
                            
                            {/* Main Content */}
                            <div className="flex-1">
                                <Routes>
                                    {/* Public Routes */}
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/products" element={<ProductsPage />} />
                                    <Route path="/products/:id" element={<ProductDetailPage />} />
                                    <Route path="/cart" element={<CartPage />} />
                                    <Route path="/about" element={<AboutPage />} />
                                    <Route path="/contact" element={<ContactPage />} />
                                    
                                    {/* Auth Routes */}
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/signup" element={<SignupPage />} />
                                    <Route path="/register" element={<SignupPage />} />
                                    
                                    {/* Protected Routes */}
                                    <Route path="/checkout" element={<CheckoutPage />} />
                                    <Route path="/profile" element={<ProfilePage />} />
                                    <Route path="/orders" element={<OrdersPage />} />
                                    
                                    {/* Admin Routes */}
                                    <Route path="/admin" element={<AdminPage />} />
                                </Routes>
                            </div>
                            
                            {/* Footer */}
                            <Footer />
                        </div>
                    </BrowserRouter>
                </CartProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
