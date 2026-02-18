import React, { useState } from 'react';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        console.log('Form submitted:', formData);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 3000);
    }

    return (
        <div>
            {/* PAGE HEADER */}
            <section className="py-20 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-center">
                <div className="container">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-slideUp">Get in Touch</h1>
                    <p className="text-emerald-100/80 text-lg animate-slideUp">We'd love to hear from you. Send us a message!</p>
                </div>
            </section>

            {/* CONTACT SECTION */}
            <section className="py-20 bg-white dark:bg-slate-800">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                        {/* Contact Form */}
                        <div className="lg:col-span-3">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Send Us a Message</h2>
                            <p className="text-gray-500 dark:text-slate-400 mb-8">Have questions or feedback? Fill out the form below and we'll get back to you soon.</p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Full Name*</label>
                                    <input
                                        type="text" id="name" name="name" placeholder="Enter your full name" required
                                        value={formData.name} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Email Address*</label>
                                    <input
                                        type="email" id="email" name="email" placeholder="your.email@example.com" required
                                        value={formData.email} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Subject*</label>
                                    <input
                                        type="text" id="subject" name="subject" placeholder="What is this regarding?" required
                                        value={formData.subject} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Message*</label>
                                    <textarea
                                        id="message" name="message" placeholder="Type your message here..." rows="6" required
                                        value={formData.message} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-y placeholder:text-gray-400 dark:placeholder:text-slate-500"
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn btn-primary btn-lg w-full">
                                    Send Message
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </form>

                            {submitted && (
                                <div className="flex flex-col items-center text-center mt-6 animate-fadeIn">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-2 text-lg font-bold">✓</div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Message Sent!</h3>
                                    <p className="text-gray-500 dark:text-slate-400">Thank you for contacting us. We'll get back to you shortly.</p>
                                </div>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="lg:col-span-2 space-y-4">
                            {[
                                { icon: '📧', title: 'Email', info: 'soilhealth@project.edu', link: 'mailto:soilhealth@project.edu', linkText: 'Send Email →' },
                                { icon: '📱', title: 'Phone', info: '+91 XXXXX XXXXX', link: 'tel:+91XXXXXXXXXX', linkText: 'Call Us →' },
                                { icon: '🏫', title: 'University', info: 'Department of Computer Science', sub: 'Final Year Project' },
                                { icon: '⏰', title: 'Response Time', info: 'Usually within 24 hours', sub: 'Mon - Fri: 9:00 AM - 6:00 PM' },
                            ].map((item, i) => (
                                <div key={i} className="card-glass p-6">
                                    <div className="text-2xl mb-3">{item.icon}</div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-slate-300">{item.info}</p>
                                    {item.sub && <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{item.sub}</p>}
                                    {item.link && (
                                        <a href={item.link} className="inline-block mt-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium no-underline">{item.linkText}</a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section className="py-20 bg-gray-50 dark:bg-slate-900">
                <div className="container max-w-4xl">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">FAQ</span>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: 'How accurate is the soil analysis?', a: 'Our AI models achieve 95%+ accuracy based on extensive testing with real soil samples. The analysis combines computer vision, geospatial data, and machine learning for reliable results.' },
                            { q: 'What kind of soil images should I upload?', a: 'For best results, upload clear photos of soil in natural lighting. The soil should be slightly moist (not too dry or wet), and the image should show the soil texture clearly.' },
                            { q: 'Is this service free to use?', a: 'Yes! This is a final year capstone project created to help farmers. All features are completely free to use.' },
                            { q: 'Can I use this for commercial farming?', a: 'Absolutely! While this is an academic project, the analysis is designed for real-world farming applications at any scale.' },
                        ].map((faq, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
