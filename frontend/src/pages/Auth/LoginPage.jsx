/**
 * Login Page - User authentication
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

const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
    
    const { login, isAuthenticated } = useAuth();
    const { syncGuestCart } = useCart();
    
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
        
        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await login(formData.email, formData.password);
            await syncGuestCart();
            toast.success('Welcome back!');
            navigate(redirect);
        } catch (error) {
            console.error('Login failed:', error);
            toast.error(error.response?.data?.detail || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main data-testid="login-page" className="min-h-screen pt-24 pb-16 flex items-center">
            <div className="max-w-md mx-auto px-6 w-full">
                <div className="text-center mb-12">
                    <Link to="/" className="inline-block mb-6">
                        <span className="font-serif text-3xl text-foreground">Le Marché</span>
                    </Link>
                    <h1 className="font-serif text-3xl text-foreground mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground">Sign in to continue shopping</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            data-testid="login-email"
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
                                data-testid="login-password"
                                placeholder="Enter your password"
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

                    <Button
                        type="submit"
                        size="lg"
                        disabled={loading}
                        data-testid="login-submit"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </Button>
                </form>

                <p className="text-center text-muted-foreground mt-8">
                    Don't have an account?{' '}
                    <Link 
                        to={`/signup${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
                        data-testid="signup-link"
                        className="text-primary hover:underline"
                    >
                        Create one
                    </Link>
                </p>

                {/* Demo Credentials */}
                <div className="mt-8 p-4 bg-secondary/30 rounded-sm">
                    <p className="text-xs text-muted-foreground text-center mb-2">Demo Credentials</p>
                    <p className="text-xs text-center text-foreground">
                        Admin: <span className="font-mono">admin@lemarche.com</span> / <span className="font-mono">admin123</span>
                    </p>
                </div>
            </div>
        </main>
    );
};

export default LoginPage;
