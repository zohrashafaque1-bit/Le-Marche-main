/**
 * Signup Page - User registration
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'sonner';

const SignupPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
    
    const { register, isAuthenticated } = useAuth();
    const { syncGuestCart } = useCart();
    
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate(redirect);
        }
    }, [isAuthenticated, navigate, redirect]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await register(formData.name, formData.email, formData.password);
            await syncGuestCart();
            toast.success('Account created successfully!');
            navigate(redirect);
        } catch (error) {
            console.error('Registration failed:', error);
            toast.error(error.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main data-testid="signup-page" className="min-h-screen pt-24 pb-16 flex items-center">
            <div className="max-w-md mx-auto px-6 w-full">
                <div className="text-center mb-12">
                    <Link to="/" className="inline-block mb-6">
                        <span className="font-serif text-3xl text-foreground">Le Marché</span>
                    </Link>
                    <h1 className="font-serif text-3xl text-foreground mb-2">Create Account</h1>
                    <p className="text-muted-foreground">Join our gourmet community</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            data-testid="signup-name"
                            placeholder="Your name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            data-testid="signup-email"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                data-testid="signup-password"
                                placeholder="Minimum 6 characters"
                                required
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            data-testid="signup-confirm-password"
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        disabled={loading}
                        data-testid="signup-submit"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </form>

                <p className="text-center text-muted-foreground mt-8">
                    Already have an account?{' '}
                    <Link 
                        to={`/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
                        data-testid="login-link"
                        className="text-primary hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
};

export default SignupPage;
