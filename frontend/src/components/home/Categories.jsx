/**
 * Categories Component - Bento grid layout for product categories
 */

import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const categories = [
    {
        name: 'Organic Produce',
        description: 'Farm-fresh organic vegetables and fruits',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
        slug: 'Organic+Produce',
        size: 'large'
    },
    {
        name: 'Artisan Bakery',
        description: 'Freshly baked breads and pastries',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
        slug: 'Bakery',
        size: 'medium'
    },
    {
        name: 'Fine Cheeses',
        description: 'Imported and artisanal cheeses',
        image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800',
        slug: 'Cheese+%26+Dairy',
        size: 'medium'
    },
    {
        name: 'Confectionery',
        description: 'Premium chocolates and gourmet sweets',
        image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800',
        slug: 'Confectionery',
        size: 'small'
    },
    {
        name: 'Premium Seafood',
        description: 'Wild-caught and sustainable seafood',
        image: 'https://images.unsplash.com/photo-1499125562588-29fb8a56b5d5?w=800',
        slug: 'Seafood',
        size: 'small'
    },
    {
        name: 'Gourmet Pantry',
        description: 'Specialty oils, vinegars and spices',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800',
        slug: 'Oils+%26+Vinegars',
        size: 'small'
    },
    {
        name: 'Beverages',
        description: 'Premium teas, coffees and more',
        image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800',
        slug: 'Beverages',
        size: 'small'
    },
    {
        name: 'Meat & Deli',
        description: 'Premium cured meats and deli selections',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
        slug: 'Meat+%26+Deli',
        size: 'small'
    },
    {
        name: 'Breakfast',
        description: 'Start your day with gourmet essentials',
        image: 'https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?w=800',
        slug: 'Breakfast',
        size: 'small'
    }
];

const CategoryCard = ({ category }) => {
    return (
        <Link 
            to={`/products?category=${category.slug}`}
            data-testid={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="group relative overflow-hidden rounded-sm block h-full w-full"
        >
            {/* Image */}
            <div className="absolute inset-0">
                <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-6">
                <div className="transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                    <h3 className="font-serif text-xl md:text-2xl text-white mb-2">
                        {category.name}
                    </h3>
                    <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {category.description}
                    </p>
                </div>

                {/* Arrow Icon */}
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-primary">
                    <ArrowUpRight className="h-5 w-5 text-white" />
                </div>
            </div>
        </Link>
    );
};

const Categories = () => {
    return (
        <section data-testid="categories-section" className="py-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <p className="overline mb-4">Explore</p>
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
                        Shop by Category
                    </h2>
                </div>

                {/* Bento Grid - 4 column layout with explicit positioning */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ gridAutoRows: '220px' }}>
                    {/* Large Card - Organic Produce (spans 2x2) */}
                    <div className="col-span-2 md:row-span-2 h-full">
                        <CategoryCard category={categories[0]} />
                    </div>

                    {/* Top Right - Artisan Bakery */}
                    <div className="h-full">
                        <CategoryCard category={categories[1]} />
                    </div>
                    
                    {/* Top Right - Fine Cheeses */}
                    <div className="h-full">
                        <CategoryCard category={categories[2]} />
                    </div>

                    {/* Second Row Right - Confectionery */}
                    <div className="h-full">
                        <CategoryCard category={categories[3]} />
                    </div>
                    
                    {/* Second Row Right - Premium Seafood */}
                    <div className="h-full">
                        <CategoryCard category={categories[4]} />
                    </div>

                    {/* Third Row - All 4 categories */}
                    <div className="h-full">
                        <CategoryCard category={categories[5]} />
                    </div>
                    <div className="h-full">
                        <CategoryCard category={categories[6]} />
                    </div>
                    <div className="h-full">
                        <CategoryCard category={categories[7]} />
                    </div>
                    <div className="h-full">
                        <CategoryCard category={categories[8]} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Categories;
