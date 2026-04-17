import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const footerLinks = {
  pools: [
    { label: 'Super Bowl Squares', path: '/pools' },
    { label: 'NBA Playoff Bracket', path: '/playoffs' },
    { label: 'March Madness Auction', path: '/march-madness' },
    { label: 'Freeroll League', path: '/freeroll' },
  ],
  support: [
    { label: 'How to Play', path: '/help' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Help Center', path: '/help' },
    { label: 'Contact Support', path: '/contact' },
  ],
  company: [
    { label: 'Become a Commissioner', path: '/commissioner' },
    { label: 'About OKRNG', path: '/about' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Privacy Policy', path: '/privacy' },
  ],
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-white pt-24 pb-12 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[128px] -translate-y-1/2 translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand & Newsletter Section */}
          <div className="lg:col-span-5 space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/img/v2_logo.png" alt="OKRNG" className="h-12 w-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />
              <span className="font-black text-3xl tracking-tighter uppercase">
                OK<span className="text-brand-500">RNG</span>
              </span>
            </Link>

            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              The ultimate platform for sports enthusiasts.
              Host pools, join auctions, and compete with friends in a premium social betting environment.
            </p>

            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-brand-500">Stay Updated</h4>
              <div className="flex gap-2 max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button className="bg-brand-500 hover:bg-brand-600 px-6 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95">
                  Join
                </button>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">No spam. Only huge pools & updates.</p>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-500 mb-6">Play & Win</h4>
              <ul className="space-y-4">
                {footerLinks.pools.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-gray-400 hover:text-white transition-colors font-medium">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-500 mb-6">Support</h4>
              <ul className="space-y-4">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-gray-400 hover:text-white transition-colors font-medium">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-500 mb-6">Company</h4>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-gray-400 hover:text-white transition-colors font-medium">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-6">
            <SocialLink href="https://x.com/okrngonx" icon={<XIcon />} />
            <SocialLink href="https://www.instagram.com/weareokrng/" icon={<InstagramIcon />} />
            <SocialLink href="https://www.facebook.com/profile.php?id=61585452525518" icon={<FacebookIcon />} />
          </div>

          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            &copy; {currentYear} OKRNG Sports. 18+ Please play responsibly.
          </p>

          <div className="flex gap-4">
            <img src="/img/payment_gateways.png" alt="Payments" className="h-6 w-auto opacity-50 grayscale hover:grayscale-0 transition-all cursor-not-allowed" title="Coming Soon" />
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.1, color: '#6366F1' }}
    className="text-gray-500 transition-colors"
  >
    {icon}
  </motion.a>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

export default Footer;
