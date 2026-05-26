/**
 * Footer Component - Premium dark footer with newsletter
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Instagram, Facebook, Twitter } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';

const Footer = () => {
    const [email, setEmail] = useState('');

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (email) {
            toast.success('Thank you for subscribing!');
            setEmail('');
        }
    };

    return (
        <footer data-testid="footer" className="bg-[#050505] text-secondary-foreground">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 lg:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="inline-block mb-6">
                            <span className="font-serif text-3xl text-foreground">Le Marché</span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                            Your destination for premium gourmet groceries. Curated selection of the finest 
                            imported and artisanal foods from around the world.
                        </p>
                        {/* Social Icons */}
                        <div className="flex space-x-4">
                            <a 
                                href="#" 
                                data-testid="social-instagram"
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a 
                                href="#" 
                                data-testid="social-facebook"
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a 
                                href="#" 
                                data-testid="social-twitter"
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-serif text-lg text-foreground mb-6">Quick Links</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Shop All
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?category=Organic+Produce" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Organic Produce
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?category=Cheese+%26+Dairy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Cheese & Dairy
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?category=Bakery" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Bakery
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?category=Beverages" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Beverages
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-serif text-lg text-foreground mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <span className="text-sm text-muted-foreground">
                                    UG-23, Golf Course Road,<br />
                                    Parsvnath Exotica, DLF Phase 5,<br />
                                    Gurugram, Haryana 122011
                                </span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone className="h-5 w-5 text-primary" />
                                <span className="text-sm text-muted-foreground">+91 98765 43210</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Mail className="h-5 w-5 text-primary" />
                                <span className="text-sm text-muted-foreground">hello@lemarche.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-serif text-lg text-foreground mb-6">Newsletter</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            Subscribe for exclusive offers and gourmet updates.
                        </p>
                        <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                data-testid="newsletter-input"
                                className="bg-secondary/50 border-primary/30"
                            />
                            <Button 
                                type="submit"
                                data-testid="newsletter-submit"
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Subscribe
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-primary/10">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-xs text-muted-foreground">
                            © 2024 Le Marché. All rights reserved.
                        </p>
                        <div className="flex space-x-6">
                            <Link to="/about" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                                About
                            </Link>
                            <Link to="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                                Contact
                            </Link>
                            <span className="text-xs text-muted-foreground">
                                Privacy Policy
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Terms of Service
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Large Brand Typography */}
            <div className="border-t border-primary/5 py-12">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <h2 className="font-serif text-6xl md:text-8xl lg:text-9xl text-foreground/5 text-center tracking-tighter">
                        Le Marché
                    </h2>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
