/**
 * About Page - Brand story and information
 */

import { MapPin, Clock, Award, Leaf } from 'lucide-react';

const AboutPage = () => {
    return (
        <main data-testid="about-page" className="min-h-screen pt-24 pb-16">
            {/* Hero Section */}
            <section className="relative h-[50vh] min-h-[400px] flex items-center">
                <div className="absolute inset-0">
                    <img
                        src="https://images.pexels.com/photos/7670333/pexels-photo-7670333.jpeg?w=1920"
                        alt="Le Marché Store"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
                    <p className="overline mb-4">Our Story</p>
                    <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white max-w-3xl">
                        Premium Gourmet Experience in Delhi NCR
                    </h1>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <p className="overline mb-4">Who We Are</p>
                            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6">
                                Curating the World's Finest Ingredients
                            </h2>
                            <div className="space-y-4 text-muted-foreground leading-relaxed">
                                <p>
                                    Le Marché is a premium gourmet grocery destination located in the heart of 
                                    Gurugram. We cater to discerning shoppers who seek high-quality, imported, 
                                    and specialty foods that are otherwise difficult to find in standard supermarkets.
                                </p>
                                <p>
                                    Our shelves feature an exceptional selection of fine cheeses, premium meats, 
                                    sustainable seafood, artisan bakery goods, organic vegetables, and a growing 
                                    range of vegan and gluten-free alternatives.
                                </p>
                                <p>
                                    We believe that exceptional cooking starts with exceptional ingredients. 
                                    That's why we personally source products from trusted suppliers around the 
                                    world, ensuring every item meets our rigorous quality standards.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="https://images.pexels.com/photos/7101917/pexels-photo-7101917.jpeg?w=800"
                                alt="Premium Ingredients"
                                className="w-full rounded-sm"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 px-6 md:px-12 bg-secondary/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="overline mb-4">Our Values</p>
                        <h2 className="font-serif text-3xl md:text-4xl text-foreground">
                            What Sets Us Apart
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                                <Award className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-serif text-xl text-foreground mb-3">Premium Quality</h3>
                            <p className="text-muted-foreground text-sm">
                                Every product is carefully selected and verified for exceptional quality 
                                and authenticity.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                                <Leaf className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-serif text-xl text-foreground mb-3">Sustainability</h3>
                            <p className="text-muted-foreground text-sm">
                                We prioritize sustainable sourcing and support local organic farmers 
                                whenever possible.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                                <MapPin className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-serif text-xl text-foreground mb-3">Global Sourcing</h3>
                            <p className="text-muted-foreground text-sm">
                                From French cheeses to Japanese teas, we bring the world's best 
                                ingredients to your doorstep.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                                <Clock className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-serif text-xl text-foreground mb-3">Freshness Guaranteed</h3>
                            <p className="text-muted-foreground text-sm">
                                Regular deliveries and proper storage ensure every product reaches 
                                you at peak freshness.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Location Section */}
            <section className="py-24 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <div>
                            <p className="overline mb-4">Visit Us</p>
                            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6">
                                Our Store
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-medium text-foreground mb-2">Address</h3>
                                    <p className="text-muted-foreground">
                                        UG-23, Golf Course Road<br />
                                        Parsvnath Exotica, DLF Phase 5<br />
                                        Sector 53, Gurugram, Haryana 122011<br />
                                        India
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground mb-2">Store Hours</h3>
                                    <p className="text-muted-foreground">
                                        Monday - Saturday: 9:00 AM - 9:00 PM<br />
                                        Sunday: 10:00 AM - 8:00 PM
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground mb-2">Contact</h3>
                                    <p className="text-muted-foreground">
                                        Phone: +91 98765 43210<br />
                                        Email: hello@lemarche.com
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-secondary/30 rounded-sm h-[400px] flex items-center justify-center">
                            <div className="text-center">
                                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    Located in the heart of Gurugram's<br />
                                    premium residential corridor
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default AboutPage;
