/**
 * Contact Page - Contact form and information
 */

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

const ContactPage = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
        });
        setLoading(false);
    };

    return (
        <main data-testid="contact-page" className="min-h-screen pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* Page Header */}
                <div className="text-center mb-16">
                    <p className="overline mb-4">Get in Touch</p>
                    <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
                        Contact Us
                    </h1>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Have questions about our products or services? We'd love to hear from you. 
                        Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-card border border-border/50 rounded-sm p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground mb-2">Visit Our Store</h3>
                                    <p className="text-sm text-muted-foreground">
                                        UG-23, Golf Course Road<br />
                                        Parsvnath Exotica, DLF Phase 5<br />
                                        Gurugram, Haryana 122011
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border/50 rounded-sm p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                    <Phone className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground mb-2">Call Us</h3>
                                    <p className="text-sm text-muted-foreground">
                                        +91 98765 43210<br />
                                        Mon - Sat, 9 AM - 9 PM
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border/50 rounded-sm p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground mb-2">Email Us</h3>
                                    <p className="text-sm text-muted-foreground">
                                        hello@lemarche.com<br />
                                        support@lemarche.com
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-card border border-border/50 rounded-sm p-6 md:p-8">
                            <h2 className="font-serif text-2xl text-foreground mb-6">Send a Message</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            data-testid="contact-name"
                                            placeholder="Your name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            data-testid="contact-email"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            data-testid="contact-phone"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            data-testid="contact-subject"
                                            placeholder="How can we help?"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Message *</Label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        data-testid="contact-message"
                                        placeholder="Your message..."
                                        rows={6}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={loading}
                                    data-testid="contact-submit"
                                    className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ContactPage;
