import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Hero from '../components/sections/Hero';
import Card, { CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const Home = () => {
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();

  const containerStyles = {
    maxWidth: '1536px',
    margin: '0 auto',
    padding: '0 2rem',
  };

  const sectionStyles = {
    padding: '5rem 0',
  };

  const sectionTitleStyles = {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 800,
    fontFamily: '"Hubot Sans", sans-serif',
    textAlign: 'center',
    marginBottom: '1rem',
  };

  const sectionDescStyles = {
    fontSize: '1.25rem',
    textAlign: 'center',
    color: colors.text,
    opacity: 0.8,
    marginBottom: '4rem',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  };

  const featureIconStyles = {
    width: '56px',
    height: '56px',
    borderRadius: '1rem',
    backgroundColor: colors.brand.primary,
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  };

  const testimonialStyles = {
    padding: '2rem',
    borderRadius: '1rem',
    backgroundColor: isDark ? 'rgba(30, 39, 54, 0.5)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${colors.border}`,
  };

  const quoteStyles = {
    fontSize: '1.125rem',
    lineHeight: 1.6,
    marginBottom: '1.5rem',
    fontStyle: 'italic',
  };

  const authorStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  };

  const avatarStyles = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: colors.brand.primary,
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '1.125rem',
  };

  const authorInfoStyles = {
    flex: 1,
  };

  const authorNameStyles = {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '0.25rem',
  };

  const authorTitleStyles = {
    fontSize: '0.875rem',
    opacity: 0.7,
  };

  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section style={sectionStyles}>
        <div style={containerStyles}>
          <h2 style={sectionTitleStyles}>Everything You Need to Win</h2>
          <p style={sectionDescStyles}>
            Powerful features designed to make sports betting social, fun, and profitable.
          </p>

          <div style={gridStyles}>
            {/* Feature 1 */}
            <Card padding="lg" hover>
              <div style={featureIconStyles}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Football Squares
              </h3>
              <p style={{ fontSize: '1rem', opacity: 0.8, lineHeight: 1.6 }}>
                Classic 10x10 grid pools with automated payouts and real-time score tracking.
                Perfect for game day parties.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card padding="lg" hover>
              <div style={featureIconStyles}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Private Leagues
              </h3>
              <p style={{ fontSize: '1rem', opacity: 0.8, lineHeight: 1.6 }}>
                Create custom leagues with friends, family, or coworkers. Set your own rules and prizes.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card padding="lg" hover>
              <div style={featureIconStyles}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Sports Betting
              </h3>
              <p style={{ fontSize: '1rem', opacity: 0.8, lineHeight: 1.6 }}>
                NFL, NBA, and more. Spread, moneyline, totals, parlays, and teasers all supported.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card padding="lg" hover>
              <div style={featureIconStyles}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Live Updates
              </h3>
              <p style={{ fontSize: '1rem', opacity: 0.8, lineHeight: 1.6 }}>
                Real-time scores, odds, and pool updates. Never miss a moment of the action.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card padding="lg" hover>
              <div style={featureIconStyles}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Multi-Sport Support
              </h3>
              <p style={{ fontSize: '1rem', opacity: 0.8, lineHeight: 1.6 }}>
                Football, basketball, baseball, hockey, and more. All your favorite sports in one place.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card padding="lg" hover>
              <div style={featureIconStyles}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Secure Payments
              </h3>
              <p style={{ fontSize: '1rem', opacity: 0.8, lineHeight: 1.6 }}>
                Bank-level encryption and instant payouts. Your money is always safe and accessible.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ ...sectionStyles, backgroundColor: isDark ? 'rgba(30, 39, 54, 0.3)' : 'rgba(250, 246, 242, 0.5)' }}>
        <div style={containerStyles}>
          <h2 style={sectionTitleStyles}>Loved by Sports Fans</h2>
          <p style={sectionDescStyles}>
            See what our community has to say about their experience.
          </p>

          <div style={gridStyles}>
            {/* Testimonial 1 */}
            <div style={testimonialStyles}>
              <div style={quoteStyles}>
                "OKRNG has completely changed how we do our office football pool.
                Everything is automated and transparent. Love it!"
              </div>
              <div style={authorStyles}>
                <div style={avatarStyles}>JD</div>
                <div style={authorInfoStyles}>
                  <div style={authorNameStyles}>John Davis</div>
                  <div style={authorTitleStyles}>League Commissioner</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div style={testimonialStyles}>
              <div style={quoteStyles}>
                "The live updates during games are incredible. I can track all my bets and pools
                in one place without refreshing constantly."
              </div>
              <div style={authorStyles}>
                <div style={avatarStyles}>SM</div>
                <div style={authorInfoStyles}>
                  <div style={authorNameStyles}>Sarah Martinez</div>
                  <div style={authorTitleStyles}>Active Better</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div style={testimonialStyles}>
              <div style={quoteStyles}>
                "Finally, a platform that makes it easy to run multiple pools at once.
                The interface is clean and my friends love using it."
              </div>
              <div style={authorStyles}>
                <div style={avatarStyles}>MJ</div>
                <div style={authorInfoStyles}>
                  <div style={authorNameStyles}>Mike Johnson</div>
                  <div style={authorTitleStyles}>Pool Organizer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={sectionStyles}>
        <div style={containerStyles}>
          <Card padding="xl" glass>
            <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
              <h2 style={{ ...sectionTitleStyles, marginBottom: '1.5rem' }}>
                Ready to Get Started?
              </h2>
              <p style={{ ...sectionDescStyles, marginBottom: '2rem' }}>
                Join thousands of sports fans who trust OKRNG for their betting needs.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="primary" size="xl" onClick={() => navigate('/sign-up')}>
                  Create Free Account
                </Button>
                <Button variant="outline" size="xl" onClick={() => navigate('/demo')}>
                  Schedule Demo
                </Button>
              </div>
              <p style={{ fontSize: '0.875rem', marginTop: '1.5rem', opacity: 0.7 }}>
                No credit card required • Free to start • Cancel anytime
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
