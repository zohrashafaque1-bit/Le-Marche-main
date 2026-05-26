/**
 * Profile Page - User profile management
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Save, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        pincode: ''
    });

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Populate form with user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                pincode: user.pincode || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setLoading(true);
        try {
            await updateProfile(formData);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <main data-testid="profile-page" className="min-h-screen pt-24 pb-16">
            <div className="max-w-2xl mx-auto px-6 md:px-12">
                {/* Page Header */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-serif text-3xl text-foreground">{user.name}</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                        {user.role === 'admin' && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium uppercase tracking-wider bg-primary text-primary-foreground rounded-sm">
                                Admin
                            </span>
                        )}
                    </div>
                </div>

                {/* Profile Form */}
                <div className="bg-card border border-border/50 rounded-sm p-6 md:p-8">
                    <h2 className="font-serif text-xl text-foreground mb-6">Edit Profile</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                data-testid="profile-name"
                                placeholder="Your name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                data-testid="profile-phone"
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                data-testid="profile-address"
                                placeholder="House no., Building, Street"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    data-testid="profile-city"
                                    placeholder="City"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pincode">PIN Code</Label>
                                <Input
                                    id="pincode"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    data-testid="profile-pincode"
                                    placeholder="122011"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            data-testid="profile-save"
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default ProfilePage;
