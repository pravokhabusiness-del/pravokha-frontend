import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/ui/Button";
import { ArrowLeft, Award, Compass, Leaf, Zap } from "lucide-react";
import aboutModels from "@/assets/about-models.png";
import aboutFactory from "@/assets/about-factory.png";
import aboutBg from "@/assets/about-bg.png";

export default function AboutPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-background overflow-hidden">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-[#4AA3A0]/10 via-background to-[#E17B5A]/10 py-20 md:py-32 border-b border-border">
                {/* Background image overlay */}
                <img 
                    src={aboutBg} 
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
                        Welcome to Pravokha – Where Fashion Flows
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        A modern Indian brand with a global vision, born in the legendary textile capital and crafting everyday premium luxury at the click of a button.
                    </p>
                </div>
            </div>

            {/* Section 1: Our Core Identity */}
            <div className="container px-4 mx-auto py-16 md:py-24 max-w-6xl relative">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Identity</h2>
                    <p className="text-sm uppercase tracking-widest text-[#E17B5A] font-semibold mb-6">Who We Are</p>
                </div>

                {/* Main Models Image placed right under Section 1 title */}
                <div className="w-full max-w-4xl mx-auto mb-12 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#4AA3A0] to-[#E17B5A] rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                    <div className="relative bg-card rounded-2xl overflow-hidden shadow-xl">
                        <img
                            src={aboutModels}
                            alt="Pravokha clothing models showcasing modern, flowing fashion styles"
                            className="w-full h-auto block transform scale-100 group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </div>

                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-normal">
                        Welcome to <strong className="text-foreground font-semibold">Pravokha</strong>, an online fashion destination where style meets continuous innovation. The name Pravokha is deeply rooted in the concept of <em className="text-primary italic">"the continuous flow and current of fashion."</em> We do not just follow the trends—we keep them moving forward.
                    </p>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-normal mt-6">
                        Based in the legendary textile hub of <strong className="text-foreground font-semibold">Tiruppur, Tamil Nadu</strong>, we are a modern Indian brand with a global vision. We design, manufacture, and curate premium apparel for individuals who want to look distinct, confident, and ahead of the curve.
                    </p>
                </div>
            </div>

            {/* Section 2: Our Purpose */}
            <div className="bg-[#4AA3A0]/5 border-y border-border py-16 md:py-24">
                <div className="container px-4 mx-auto max-w-4xl text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#E17B5A]/10 text-[#E17B5A] font-semibold text-xs tracking-wider uppercase mb-4">
                        Why We Exist
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Purpose</h2>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                        We noticed that finding high-quality, trendy clothing at fair prices online can be a challenge. Pravokha was built to bridge that gap. We combine India’s rich textile manufacturing heritage with fast, modern style movements. Our goal is to make premium, everyday luxury clothing accessible to everyone at the click of a button.
                    </p>
                </div>
            </div>

            {/* Section 3: The Pravokha Pillars */}
            <div className="container px-4 mx-auto py-16 md:py-24 max-w-6xl">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">The Pravokha Pillars</h2>
                    <p className="text-sm uppercase tracking-widest text-primary font-semibold">What We Promise</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Factory / Design Photo next to Pillars */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#E17B5A] to-[#4AA3A0] rounded-2xl blur opacity-25" />
                        <div className="relative bg-card rounded-2xl overflow-hidden shadow-lg aspect-square sm:aspect-[4/3] lg:aspect-square">
                            <img
                                src={aboutFactory}
                                alt="Ethical design studio and garment packing center of Pravokha in Tiruppur"
                                className="w-full h-full object-cover transform scale-100 group-hover:scale-103 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                                <p className="text-white text-sm font-medium tracking-wide">
                                    Quality Crafted Directly in Tiruppur, India
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pillars Lists */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex gap-4 p-6 bg-card border rounded-xl hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                            <div className="p-3 bg-[#4AA3A0]/10 text-primary rounded-lg h-fit">
                                <Award className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Premium Quality First</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Being from Tiruppur, quality is in our DNA. We source top-grade, skin-friendly fabrics that look great and last long.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-6 bg-card border rounded-xl hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                            <div className="p-3 bg-[#E17B5A]/10 text-[#E17B5A] rounded-lg h-fit">
                                <Compass className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Trendsetting Designs</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Our design team constantly watches global fashion currents to bring you fresh, original styles every single week.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-6 bg-card border rounded-xl hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                            <div className="p-3 bg-[#4AA3A0]/10 text-primary rounded-lg h-fit">
                                <Leaf className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Ethical Manufacturing</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We take pride in fair production practices, ensuring that your clothes are made responsibly and sustainably.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-6 bg-card border rounded-xl hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                            <div className="p-3 bg-[#E17B5A]/10 text-[#E17B5A] rounded-lg h-fit">
                                <Zap className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Seamless Shopping</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    From easy UPI/Google Pay checkouts to fast pan-India shipping, we make your online shopping experience completely effortless.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 4: Our Mission */}
            <div className="relative container px-4 mx-auto py-16 md:py-24 max-w-4xl">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative border border-primary/20 bg-card/60 backdrop-blur-md rounded-2xl p-8 md:p-16 text-center shadow-xl">
                    <span className="text-sm uppercase tracking-widest text-[#E17B5A] font-bold mb-4 block">
                        Our Mission
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold mb-6">Where We Are Going</h2>
                    <blockquote className="text-xl md:text-2xl font-semibold italic text-foreground leading-relaxed max-w-2xl mx-auto font-heading">
                        "Our mission is simple: to inspire confidence through clothing and become India’s most trusted online fashion brand for modern, fluid style."
                    </blockquote>
                </div>
            </div>

            {/* Call to Action (CTA) */}
            <div className="bg-gradient-to-r from-[#4AA3A0] to-[#E17B5A] text-white py-16 md:py-20 text-center relative overflow-hidden">
                {/* Visual accent rings */}
                <div className="absolute -top-10 -left-10 w-40 h-40 border-4 border-white/10 rounded-full" />
                <div className="absolute -bottom-10 -right-10 w-60 h-60 border-4 border-white/10 rounded-full" />

                <div className="container px-4 mx-auto relative z-10 max-w-xl">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                        Ready to step into the flow?
                    </h2>
                    <p className="text-white/95 mb-8 text-base md:text-lg">
                        Explore our latest releases and find pieces engineered for ultimate style and comfort.
                    </p>
                    <Button variant="secondary" size="lg" asChild className="bg-white text-foreground hover:bg-white/90 font-bold px-8 shadow-xl transition duration-300">
                        <Link to="/products" className="flex items-center gap-2">
                            👉 Explore Our Latest Collection Now
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

