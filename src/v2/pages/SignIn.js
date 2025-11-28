import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const SignInPage = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get return URL from URL params (preferred) or location state (fallback)
  const redirectUrl = searchParams.get('redirect_url');
  const returnTo = redirectUrl ? decodeURIComponent(redirectUrl) : (location.state?.returnTo || '/dashboard');

  const containerStyles = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  };

  const contentStyles = {
    width: '100%',
    maxWidth: '580px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    margin: '0 auto',
  };

  const logoContainerStyles = {
    marginBottom: '2rem',
    cursor: 'pointer',
  };

  const logoStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  };

  const logoTextStyles = {
    fontSize: '1.75rem',
    fontWeight: 800,
    fontFamily: '"Hubot Sans", sans-serif',
    color: colors.text,
  };

  const subtitleStyles = {
    fontSize: '1rem',
    color: colors.text,
    opacity: 0.7,
    marginBottom: '2rem',
  };

  return (
    <div style={containerStyles}>
      <div style={contentStyles} className="v2-fade-in">
        {/* Logo and Brand */}
        <div style={logoContainerStyles} onClick={() => navigate('/')}>
          <div style={logoStyles}>
            <img
              src="/img/v2_logo.png"
              alt="OKRNG"
              style={{ height: '48px', width: 'auto' }}
            />
            <span style={logoTextStyles}>OKRNG</span>
          </div>
        </div>

        {/* Clerk SignIn Component */}
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          afterSignInUrl={returnTo}
          appearance={{
            elements: {
              rootBox: {
                className: 'v2-fade-in lg:w-[500px] w-full',
              },
              cardBox: {
                width: '100%',
              },
              card: {
                boxShadow: colors.shadow,
                borderRadius: '1rem',
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.card,
              },
              socialButtonsBlockButton: {
                borderRadius: '0.75rem',
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.card,
                color: colors.text,
              },
              formButtonPrimary: {
                backgroundColor: colors.brand.primary,
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: 600,
                padding: '0.75rem 1.5rem',
                height: '2.75rem',
              },
              formFieldInput: {
                borderRadius: '0.75rem',
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.card,
                color: colors.text,
                fontSize: '1rem',
                padding: '0.75rem 1rem',
                height: '2.75rem',
              },
              formFieldLabel: {
                color: colors.text,
                fontSize: '0.875rem',
                fontWeight: 600,
              },
              footerActionLink: {
                color: colors.brand.primary,
                fontWeight: 600,
              },
              identityPreviewText: {
                color: colors.text,
              },
              identityPreviewEditButton: {
                color: colors.brand.primary,
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default SignInPage;
