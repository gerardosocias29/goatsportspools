import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const SignUpPage = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();

  const containerStyles = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  };

  const contentStyles = {
    width: '100%',
    maxWidth: '480px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
        <div style={logoContainerStyles} onClick={() => navigate('/v2')}>
          <div style={logoStyles}>
            <img
              src="/assets/images/favicon.png"
              alt="GoatSportsPools"
              style={{ height: '48px', width: 'auto' }}
            />
            <span style={logoTextStyles}>GoatSportsPools</span>
          </div>
        </div>

        {/* Clerk SignUp Component */}
        <SignUp
          path="/v2/sign-up"
          routing="path"
          signInUrl="/v2/sign-in"
          afterSignUpUrl="/v2/dashboard"
           
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

export default SignUpPage;
