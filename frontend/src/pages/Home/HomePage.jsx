/**
 * Home Page - Landing page with hero, categories, products, testimonials
 */

import { useEffect } from 'react';
import Hero from '../../components/home/Hero';
import Categories from '../../components/home/Categories';
import FeaturedProducts from '../../components/home/FeaturedProducts';
import Testimonials from '../../components/home/Testimonials';
import api from '../../services/api';

const HomePage = () => {
    // Seed database on first load (if empty)
    useEffect(() => {
        const seedData = async () => {
            try {
                await api.post('/seed');
            } catch (error) {
                // Silently fail if already seeded
                console.log('Database may already be seeded');
            }
        };
        seedData();
    }, []);

    return (
        <main data-testid="home-page">
            <Hero />
            <Categories />
            <FeaturedProducts />
            <Testimonials />
        </main>
    );
};

export default HomePage;
