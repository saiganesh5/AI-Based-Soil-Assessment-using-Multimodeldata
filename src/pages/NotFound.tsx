import { Link } from 'react-router-dom';
import { Sprout, Home, LayoutDashboard, Cloud, Info, Mail, ArrowLeft } from 'lucide-react';

const quickLinks = [
    { to: '/', label: 'Home', icon: Home, desc: 'Back to landing page' },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Soil analysis tools' },
    { to: '/weather', label: 'Weather', icon: Cloud, desc: 'Live weather data' },
    { to: '/about', label: 'About', icon: Info, desc: 'Learn about the project' },
    { to: '/contact', label: 'Contact', icon: Mail, desc: 'Get in touch with us' },
];

export default function NotFound(): React.JSX.Element {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 relative overflow-hidden">
            {/* Background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-[10%] w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-teal-500/15 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl"></div>
            </div>

            {/* Top bar */}
            <div className="relative z-10 w-full px-6 py-4">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-emerald-300/80 hover:text-white transition-colors no-underline"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center relative z-10 px-6 pb-12">
                <div className="w-full max-w-3xl">
                    {/* Hero section */}
                    <div className="text-center mb-14">
                        {/* Fading plant icon with glow ring */}
                        <div className="flex justify-center mb-8">
                            <div className="relative animate-plantFade">
                                <div className="absolute inset-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl scale-150"></div>
                                <div className="relative w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                                    <Sprout className="w-16 h-16 text-emerald-400" strokeWidth={1.5} />
                                </div>
                            </div>
                        </div>

                        <h1 className="text-8xl md:text-9xl font-extrabold text-white tracking-tighter mb-3 leading-none">
                            4<span className="text-emerald-400">0</span>4
                        </h1>
                        <p className="text-xl md:text-2xl font-semibold text-emerald-200/90 mb-3">
                            Page Not Found
                        </p>
                        <p className="text-emerald-100/50 max-w-lg mx-auto leading-relaxed">
                            The page you are looking for does not exist, has been moved, or is temporarily unavailable.
                        </p>
                    </div>

                    {/* Navigation cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
                        {quickLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-emerald-400/30 transition-all duration-300 no-underline"
                            >
                                <div className="w-10 h-10 rounded-lg bg-emerald-400/10 group-hover:bg-emerald-400/20 flex items-center justify-center transition-colors shrink-0">
                                    <link.icon className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                                        {link.label}
                                    </p>
                                    <p className="text-xs text-emerald-100/40 truncate">
                                        {link.desc}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <Link
                            to="/"
                            className="btn btn-lg bg-white text-emerald-800 font-bold hover:bg-emerald-50 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                        >
                            Go to Homepage
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer hint */}
            <div className="relative z-10 text-center pb-6">
                <p className="text-xs text-emerald-100/30">
                    AI Soil Health &middot; Sustainable Agriculture Platform
                </p>
            </div>
        </div>
    );
}
