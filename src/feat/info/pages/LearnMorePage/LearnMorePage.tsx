import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/ui/Button";
import { ArrowLeft, Shirt, Users, Award, Heart, Truck, Shield, ArrowRight } from "lucide-react";
import learnMoreBg from "@/assets/learn-more-bg.png";
import learnMoreHero from "@/assets/learn-more-hero.png";
import learnMoreStory from "@/assets/learn-more-story.png";
import trendsBg from "@/assets/trends-card-bg.png";
import deliveryBg from "@/assets/delivery-card-bg.png";
import qualityBg from "@/assets/quality-card-bg.png";

export function LearnMorePage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-background overflow-hidden">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-[#4AA3A0]/10 via-background to-[#E17B5A]/10 py-20 md:py-32 border-b border-border">
                {/* Background image overlay */}
                <img
                    src={learnMoreBg}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay pointer-events-none"
                />
                {/* Floating blur designs */}
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-[#4AA3A0]/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#E17B5A]/15 rounded-full blur-3xl pointer-events-none" />

                <div className="container px-4 mx-auto text-center relative z-10">
                    <Button variant="ghost" asChild className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
                        <Link to="/" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back to Home
                        </Link>
                    </Button>

                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs tracking-wider uppercase mb-4">
                        About Pravokha
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-foreground via-[#4AA3A0] to-[#E17B5A] bg-clip-text text-transparent leading-none py-2">
                        Your Trusted Fashion Destination
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Premium quality clothing and exceptional style, delivered with care directly from the textile capital of India.
                    </p>
                    <div className="mt-8">
                        <Link to="/products">
                            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 shadow-xl rounded-xl h-12">
                                Shop Our Collection
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Our Story Section */}
            <div className="container px-4 mx-auto py-16 md:py-24 max-w-6xl relative">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h2>
                    <p className="text-sm uppercase tracking-widest text-[#E17B5A] font-semibold mb-6">Founded with Passion</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Story Image */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#4AA3A0] to-[#E17B5A] rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                        <div className="relative bg-card rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
                            <img
                                src={learnMoreHero}
                                alt="Pravokha fashion collection showcasing premium quality clothing"
                                className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-6">
                                <p className="text-white text-sm font-medium tracking-wide">
                                    Premium Fashion, Curated for You
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Story Text */}
                    <div className="space-y-6">
                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                            Founded with a passion for quality and style, <strong className="text-foreground font-semibold">Pravokha</strong> has been delivering premium clothing to customers across India. We believe that everyone deserves to look and feel their best, which is why we carefully curate our collection to bring you the finest fabrics and the latest trends.
                        </p>
                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                            From classic tees to comfortable track pants and versatile shorts, every piece in our collection is designed with your comfort and style in mind. We're committed to providing <em className="text-primary italic">exceptional quality at prices that make sense</em>.
                        </p>
                        <div className="relative group mt-4">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#E17B5A] to-[#4AA3A0] rounded-2xl blur opacity-20" />
                            <div className="relative bg-card rounded-2xl overflow-hidden shadow-lg aspect-[4/3]">
                                <img
                                    src={learnMoreStory}
                                    alt="Pravokha premium fabrics and clothing quality craftsmanship"
                                    className="w-full h-full object-cover transform scale-100 group-hover:scale-103 transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-[#4AA3A0]/5 border-y border-border py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#E17B5A]/10 text-[#E17B5A] font-semibold text-xs tracking-wider uppercase mb-4">
                            Our Promises
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Pravokha</h2>
                        <p className="text-muted-foreground">Experience the best in premium fabrics, lightning-fast logistics, and curated trends.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {/* Trending card with image bg */}
                        <div className="relative overflow-hidden bg-card border rounded-xl hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
                            <img src={trendsBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative z-10 p-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Shirt className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Premium Quality</h3>
                                <p className="text-muted-foreground text-sm">We source only the finest fabrics and materials to ensure every product meets our high standards.</p>
                            </div>
                        </div>

                        <div className="relative overflow-hidden bg-card border rounded-xl hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
                            <img src={trendsBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative z-10 p-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Award className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Trendy Designs</h3>
                                <p className="text-muted-foreground text-sm">Stay ahead of fashion trends with our regularly updated collection of stylish clothing.</p>
                            </div>
                        </div>

                        <div className="relative overflow-hidden bg-card border rounded-xl hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
                            <img src={qualityBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative z-10 p-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Heart className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Customer First</h3>
                                <p className="text-muted-foreground text-sm">Your satisfaction is our priority. We're here to ensure you have the best shopping experience.</p>
                            </div>
                        </div>

                        <div className="relative overflow-hidden bg-card border rounded-xl hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
                            <img src={deliveryBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative z-10 p-6">
                                <div className="w-12 h-12 bg-[#E17B5A]/10 rounded-full flex items-center justify-center mb-4">
                                    <Truck className="h-6 w-6 text-[#E17B5A]" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
                                <p className="text-muted-foreground text-sm">Free shipping on orders above ₹999 with delivery within 3-5 business days.</p>
                            </div>
                        </div>

                        <div className="relative overflow-hidden bg-card border rounded-xl hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
                            <img src={qualityBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative z-10 p-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Shield className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Secure Shopping</h3>
                                <p className="text-muted-foreground text-sm">Shop with confidence knowing your payments and personal information are protected.</p>
                            </div>
                        </div>

                        <div className="relative overflow-hidden bg-card border rounded-xl hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
                            <img src={trendsBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative z-10 p-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Community</h3>
                                <p className="text-muted-foreground text-sm">Join thousands of satisfied customers who trust Pravokha for their fashion needs.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-[#4AA3A0] to-[#E17B5A] text-white py-16 md:py-20 text-center relative overflow-hidden">
                {/* Background image overlay */}
                <img
                    src={learnMoreBg}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay pointer-events-none"
                />
                {/* Visual accent rings */}
                <div className="absolute -top-10 -left-10 w-40 h-40 border-4 border-white/10 rounded-full" />
                <div className="absolute -bottom-10 -right-10 w-60 h-60 border-4 border-white/10 rounded-full" />

                <div className="container px-4 mx-auto relative z-10 max-w-xl">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-white font-bold text-xs tracking-wider uppercase mb-4">
                        Elevate Your Style
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                        Ready to Upgrade Your Wardrobe?
                    </h2>
                    <p className="text-white/95 mb-8 text-base md:text-lg">
                        Explore our collection and find the perfect pieces that match your style.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/products">
                            <Button size="lg" className="bg-white text-[#4AA3A0] hover:bg-white/90 font-bold px-8 shadow-xl transition duration-300 rounded-xl h-12">
                                Shop Now
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/support">
                            {/* Visible in both light and dark modes */}
                            <Button size="lg" className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-[#4AA3A0] font-bold px-8 transition-all duration-300 rounded-xl h-12 shadow-lg">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LearnMorePage;
