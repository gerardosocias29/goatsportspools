import React from 'react';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Sports from '../components/landing/Sports';
import CTA from '../components/landing/CTA';

const Landing = () => {
  return (
    <div>
      <Hero />
      <Features />
      <HowItWorks />
      <Sports />
      <CTA />
    </div>
  );
};

export default Landing;
