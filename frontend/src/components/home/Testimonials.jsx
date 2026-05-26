/**
 * Testimonials Component - Customer reviews section
 */

import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        id: 1,
        name: 'Priya Sharma',
        role: 'Food Blogger',
        content: 'Le Marché has transformed my cooking. The quality of their imported ingredients is unmatched. Their truffle oil collection is divine!',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    },
    {
        id: 2,
        name: 'Rahul Mehta',
        role: 'Home Chef',
        content: 'Finally, a store that understands gourmet. The French cheeses are authentic, and the sourdough bread is the best in Delhi NCR.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    {
        id: 3,
        name: 'Ananya Gupta',
        role: 'Wellness Coach',
        content: 'I love their organic produce selection. Everything is fresh, and the quality is consistent. My go-to store for healthy ingredients.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
    }
];

const TestimonialCard = ({ testimonial }) => {
    return (
        <div className="relative bg-card border border-border/50 rounded-sm p-8 card-hover">
            {/* Quote Icon */}
            <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/20" />

            {/* Stars */}
            <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
            </div>

            {/* Content */}
            <p className="text-muted-foreground leading-relaxed mb-6">
                "{testimonial.content}"
            </p>

            {/* Author */}
            <div className="flex items-center space-x-4">
                <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                    <p className="font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
            </div>
        </div>
    );
};

const Testimonials = () => {
    return (
        <section data-testid="testimonials-section" className="py-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <p className="overline mb-4">Testimonials</p>
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
                        What Our Customers Say
                    </h2>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div 
                            key={testimonial.id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 0.2}s` }}
                        >
                            <TestimonialCard testimonial={testimonial} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
