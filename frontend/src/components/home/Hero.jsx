/**
 * Hero Component - Full-height hero with dramatic imagery
 */

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

const Hero = () => {
    return (
        <section 
            data-testid="hero-section"
            className="relative h-screen min-h-[600px] max-h-[900px] flex items-center"
        >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1655522060985-6769176edff7?w=1920&q=80"
                    alt="Premium Gourmet Grocery"
                    className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
                <div className="max-w-2xl">
                    {/* Overline */}
                    <p 
                        className="overline text-primary mb-6 animate-fade-in"
                        style={{ animationDelay: '0.2s' }}
                    >
                        Premium Gourmet Grocery
                    </p>

                    {/* Heading */}
                    <h1 
                        className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white font-light tracking-tighter leading-[1.1] mb-6 animate-fade-in"
                        style={{ animationDelay: '0.4s' }}
                    >
                        The Finest
                        <br />
                        <span className="text-primary">Gourmet Selection</span>
                    </h1>

                    {/* Description */}
                    <p 
                        className="text-lg text-gray-300 mb-8 max-w-lg leading-relaxed animate-fade-in"
                        style={{ animationDelay: '0.6s' }}
                    >
                        Discover a curated collection of imported cheeses, artisanal breads, 
                        organic produce, and specialty foods from around the world.
                    </p>

                    {/* CTA Buttons */}
                    <div 
                        className="flex flex-col sm:flex-row gap-4 animate-fade-in"
                        style={{ animationDelay: '0.8s' }}
                    >
                        <Link to="/products">
                            <Button 
                                size="lg"
                                data-testid="hero-shop-btn"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
                            >
                                Shop Collection
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link to="/about">
                            <Button 
                                size="lg"
                                variant="outline"
                                data-testid="hero-about-btn"
                                className="border-white/30 text-white hover:bg-white/10"
                            >
                                Our Story
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce" />
                </div>
            </div>
        </section>
    );
};

export default Hero;
