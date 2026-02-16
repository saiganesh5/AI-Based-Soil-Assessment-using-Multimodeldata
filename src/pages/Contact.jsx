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
        // In a real app, this would send data to a backend
        console.log('Form submitted:', formData);
        setSubmitted(true);
        // Reset form after delay
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 3000);
    }

    return (
        <div className="contact-page">
            {/* PAGE HEADER */}
            <section className="page-header">
                <div className="container">
                    <h1 className="animate-slideUp">Get in Touch</h1>
                    <p className="animate-slideUp">We'd love to hear from you. Send us a message!</p>
                </div>
            </section>

            {/* CONTACT SECTION */}
            <section className="contact-section">
                <div className="container">
                    <div className="contact-grid">
                        {/* Contact Form */}
                        <div className="contact-form-wrapper">
                            <h2>Send Us a Message</h2>
                            <p>Have questions or feedback? Fill out the form below and we'll get back to you soon.</p>

                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name" className="form-label">Full Name*</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="form-input"
                                        placeholder="Enter your full name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">Email Address*</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="form-input"
                                        placeholder="your.email@example.com"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subject" className="form-label">Subject*</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        className="form-input"
                                        placeholder="What is this regarding?"
                                        required
                                        value={formData.subject}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message" className="form-label">Message*</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        className="form-textarea"
                                        placeholder="Type your message here..."
                                        rows="6"
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn btn-primary btn-lg">
                                    Send Message
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </form>

                            {/* Success Message */}
                            {submitted && (
                                <div className="form-success animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '1rem' }}>
                                    <div className="success-icon" style={{ background: '#10b981', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>✓</div>
                                    <h3>Message Sent!</h3>
                                    <p>Thank you for contacting us. We'll get back to you shortly.</p>
                                </div>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="contact-info">
                            <div className="info-card card-glass">
                                <div className="info-icon">📧</div>
                                <h3>Email</h3>
                                <p>soilhealth@project.edu</p>
                                <a href="mailto:soilhealth@project.edu" className="info-link">Send Email →</a>
                            </div>

                            <div className="info-card card-glass">
                                <div className="info-icon">📱</div>
                                <h3>Phone</h3>
                                <p>+91 XXXXX XXXXX</p>
                                <a href="tel:+91XXXXXXXXXX" className="info-link">Call Us →</a>
                            </div>

                            <div className="info-card card-glass">
                                <div className="info-icon">🏫</div>
                                <h3>University</h3>
                                <p>Department of Computer Science</p>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
                                    Final Year Project
                                </p>
                            </div>

                            <div className="info-card card-glass">
                                <div className="info-icon">⏰</div>
                                <h3>Response Time</h3>
                                <p>Usually within 24 hours</p>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
                                    Mon - Fri: 9:00 AM - 6:00 PM
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section className="faq-section">
                <div className="container container-narrow">
                    <div className="section-header">
                        <span className="section-label">FAQ</span>
                        <h2 className="section-title">Frequently Asked Questions</h2>
                    </div>

                    <div className="faq-list">
                        <div className="faq-item">
                            <h3>How accurate is the soil analysis?</h3>
                            <p>
                                Our AI models achieve 95%+ accuracy based on extensive testing with
                                real soil samples. The analysis combines computer vision, geospatial data,
                                and machine learning for reliable results.
                            </p>
                        </div>

                        <div className="faq-item">
                            <h3>What kind of soil images should I upload?</h3>
                            <p>
                                For best results, upload clear photos of soil in natural lighting.
                                The soil should be slightly moist (not too dry or wet), and the image
                                should show the soil texture clearly.
                            </p>
                        </div>

                        <div className="faq-item">
                            <h3>Is this service free to use?</h3>
                            <p>
                                Yes! This is a final year capstone project created to help farmers.
                                All features are completely free to use.
                            </p>
                        </div>

                        <div className="faq-item">
                            <h3>Can I use this for commercial farming?</h3>
                            <p>
                                Absolutely! While this is an academic project, the analysis is designed
                                for real-world farming applications at any scale.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
