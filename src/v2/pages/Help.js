import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAxios } from '../../app/contexts/AxiosContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Help = () => {
  const { colors, isDark } = useTheme();
  const axiosService = useAxios();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axiosService.post('/api/contact-us/send', formData);
      if (response.data.status) {
        setSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
      } else {
        setError(response.data.message || 'Unable to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const containerStyles = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '3rem 1.5rem',
  };

  const titleStyles = {
    fontSize: 'clamp(2rem, 4vw, 2.5rem)',
    fontWeight: 800,
    fontFamily: '"Hubot Sans", sans-serif',
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: colors.text,
  };

  const subtitleStyles = {
    fontSize: '1.125rem',
    textAlign: 'center',
    color: colors.text,
    opacity: 0.7,
    marginBottom: '2.5rem',
  };

  const labelStyles = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.text,
    marginBottom: '0.5rem',
  };

  const inputStyles = {
    width: '100%',
    padding: '0.875rem 1rem',
    fontSize: '1rem',
    borderRadius: '0.75rem',
    border: `1px solid ${colors.border}`,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    color: colors.text,
    outline: 'none',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  };

  const inputFocusStyles = {
    borderColor: colors.brand.primary,
    boxShadow: `0 0 0 3px ${colors.brand.primary}20`,
  };

  const textareaStyles = {
    ...inputStyles,
    minHeight: '150px',
    resize: 'vertical',
  };

  const successBoxStyles = {
    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    textAlign: 'center',
  };

  const errorBoxStyles = {
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '0.75rem',
    padding: '1rem',
    marginBottom: '1.5rem',
    color: '#EF4444',
    fontSize: '0.875rem',
  };

  const [focusedField, setFocusedField] = useState(null);

  return (
    <div style={containerStyles} className="v2-fade-in">
      <h1 style={titleStyles}>Help Center</h1>
      <p style={subtitleStyles}>
        Have questions or need assistance? We're here to help!
      </p>

      <Card padding="xl">
        {submitted ? (
          <div style={successBoxStyles}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#22C55E', marginBottom: '0.5rem' }}>
              Message Sent!
            </h3>
            <p style={{ fontSize: '0.9375rem', color: colors.text, opacity: 0.8, marginBottom: '1.5rem' }}>
              Thank you for reaching out. We'll get back to you as soon as possible.
            </p>
            <Button variant="outline" size="md" onClick={() => setSubmitted(false)}>
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={errorBoxStyles}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyles} htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...inputStyles,
                  ...(focusedField === 'name' ? inputFocusStyles : {}),
                }}
                placeholder="John Doe"
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyles} htmlFor="email">Your Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...inputStyles,
                  ...(focusedField === 'email' ? inputFocusStyles : {}),
                }}
                placeholder="john@example.com"
                required
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyles} htmlFor="message">Your Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('message')}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...textareaStyles,
                  ...(focusedField === 'message' ? inputFocusStyles : {}),
                }}
                placeholder="How can we help you?"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ animation: 'spin 1s linear infinite' }}
                  >
                    <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Message'
              )}
            </Button>
          </form>
        )}
      </Card>

      {/* Additional Help Options */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '2rem',
      }}>
        <div style={{
          padding: '1.25rem',
          borderRadius: '0.75rem',
          backgroundColor: isDark ? colors.card : 'white',
          border: `1px solid ${colors.border}`,
          textAlign: 'center',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.25rem', color: colors.text }}>
            Email Us
          </h4>
          <a
            href="mailto:socials@okrng.com"
            style={{ fontSize: '0.875rem', color: colors.brand.primary, textDecoration: 'none' }}
          >
            socials@okrng.com
          </a>
        </div>

        <div style={{
          padding: '1.25rem',
          borderRadius: '0.75rem',
          backgroundColor: isDark ? colors.card : 'white',
          border: `1px solid ${colors.border}`,
          textAlign: 'center',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.25rem', color: colors.text }}>
            Social Media
          </h4>
          <p style={{ fontSize: '0.875rem', color: colors.text, opacity: 0.7, margin: 0 }}>
            @weareokrng
          </p>
        </div>
      </div>
    </div>
  );
};

export default Help;
