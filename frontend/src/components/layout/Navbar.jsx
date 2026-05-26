/**
 * Navbar Component - Premium glassmorphism navigation
 * Includes search, cart, profile, and theme toggle
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, Moon, Sun, LogOut, Settings, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { user, isAuthenticated, logout, isAdmin } = useAuth();
    const { getItemCount } = useCart();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const cartCount = getItemCount();

    return (
        <nav 
            data-testid="navbar"
            className="fixed top-0 left-0 right-0 z-50 glass bg-background/70 border-b border-primary/20"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link 
                        to="/" 
                        data-testid="nav-logo"
                        className="flex items-center space-x-2"
                    >
                        <span className="font-serif text-2xl md:text-3xl tracking-tight text-foreground">
                            Le Marché
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        <Link 
                            to="/products" 
                            data-testid="nav-products"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Shop
                        </Link>
                        <Link 
                            to="/about" 
                            data-testid="nav-about"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            About
                        </Link>
                        <Link 
                            to="/contact" 
                            data-testid="nav-contact"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Contact
                        </Link>
                        {isAdmin() && (
                            <Link 
                                to="/admin" 
                                data-testid="nav-admin"
                                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                Admin
                            </Link>
                        )}
                    </div>

                    {/* Search Bar - Desktop */}
                    <form 
                        onSubmit={handleSearch}
                        className="hidden md:flex items-center flex-1 max-w-sm mx-8"
                    >
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                data-testid="search-input"
                                className="pl-10 bg-secondary/50 border-primary/20 focus:border-primary"
                            />
                        </div>
                    </form>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Theme Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            data-testid="theme-toggle"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </Button>

                        {/* Cart */}
                        <Link to="/cart" data-testid="nav-cart">
                            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                                <ShoppingBag className="h-5 w-5" />
                                {cartCount > 0 && (
                                    <span 
                                        data-testid="cart-count"
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium"
                                    >
                                        {cartCount}
                                    </span>
                                )}
                            </Button>
                        </Link>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        data-testid="user-menu-trigger"
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <User className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <div className="px-2 py-1.5">
                                        <p className="text-sm font-medium">{user?.name}</p>
                                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link to="/profile" data-testid="menu-profile" className="flex items-center cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/orders" data-testid="menu-orders" className="flex items-center cursor-pointer">
                                            <Package className="mr-2 h-4 w-4" />
                                            Orders
                                        </Link>
                                    </DropdownMenuItem>
                                    {isAdmin() && (
                                        <DropdownMenuItem asChild>
                                            <Link to="/admin" data-testid="menu-admin" className="flex items-center cursor-pointer">
                                                <Settings className="mr-2 h-4 w-4" />
                                                Admin Panel
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        onClick={handleLogout}
                                        data-testid="menu-logout"
                                        className="cursor-pointer text-destructive focus:text-destructive"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link to="/login">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    data-testid="nav-login"
                                    className="border-primary/50 text-foreground hover:bg-primary hover:text-primary-foreground"
                                >
                                    Sign In
                                </Button>
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden text-muted-foreground"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            data-testid="mobile-menu-toggle"
                        >
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div 
                        data-testid="mobile-menu"
                        className="lg:hidden py-4 border-t border-primary/20"
                    >
                        {/* Mobile Search */}
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-secondary/50 border-primary/20"
                                />
                            </div>
                        </form>

                        <div className="space-y-2">
                            <Link 
                                to="/products"
                                onClick={() => setIsMenuOpen(false)}
                                className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Shop
                            </Link>
                            <Link 
                                to="/about"
                                onClick={() => setIsMenuOpen(false)}
                                className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                About
                            </Link>
                            <Link 
                                to="/contact"
                                onClick={() => setIsMenuOpen(false)}
                                className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Contact
                            </Link>
                            {isAdmin() && (
                                <Link 
                                    to="/admin"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block py-2 text-primary hover:text-primary/80 transition-colors"
                                >
                                    Admin Panel
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
