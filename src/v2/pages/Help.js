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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem 1.5rem',
    width: '100%',
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
        Need assistance?
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
              <label style={labelStyles} htmlFor="name">Name</label>
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
              <label style={labelStyles} htmlFor="email">Email</label>
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
              <label style={labelStyles} htmlFor="message">Question or Suggestion</label>
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
                'Submit to OKRNG'
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
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.25rem', color: colors.text }}>
            Call
          </h4>
          <a
            href="tel:7242-SPORTS"
            style={{ fontSize: '0.875rem', color: colors.brand.primary, textDecoration: 'none' }}
          >
            7242-SPORTS
          </a>
        </div>

        <div
          style={{
          padding: '1.25rem',
          borderRadius: '0.75rem',
          backgroundColor: isDark ? colors.card : 'white',
          border: `1px solid ${colors.border}`,
          textAlign: 'center',
          }}
          className='flex flex-col items-center justify-center'
        >
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem', color: colors.text }}>
            Follow Us
          </h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=61585452525518"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.brand.primary,
                transition: 'background-color 150ms ease',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="https://www.instagram.com/weareokrng/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.brand.primary,
                transition: 'background-color 150ms ease',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            {/* X (Twitter) */}
            <a
              href="https://x.com/okrngonx"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.brand.primary,
                transition: 'background-color 150ms ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
