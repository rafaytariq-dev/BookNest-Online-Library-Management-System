import { useState } from 'react';
import { contactApi } from '../services/api';
import styles from '../styles/ContactPage.module.css';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await contactApi.submit(formData);
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            setError(err.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1>Contact Librarian</h1>
                <p className={styles.subtitle}>Have a question or need assistance? Send us a message.</p>

                {submitted ? (
                    <div className={styles.successMessage}>
                        <h3>Message Sent!</h3>
                        <p>Thank you for contacting us. We will get back to you shortly.</p>
                        <button onClick={() => setSubmitted(false)} className={styles.resetBtn}>
                            Send Another Message
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && <div className={styles.errorMessage}>{error}</div>}
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="subject">Subject</label>
                            <select
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a subject</option>
                                <option value="general">General Inquiry</option>
                                <option value="book_request">Book Request</option>
                                <option value="account">Account Issue</option>
                                <option value="feedback">Feedback</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="5"
                            ></textarea>
                        </div>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ContactPage;
