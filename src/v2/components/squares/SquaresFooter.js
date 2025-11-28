import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';

/**
 * Simple Footer Component
 * Displays social media links
 */
const SquaresFooter = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Facebook',
      icon: FaFacebook,
      url: 'https://facebook.com',
      color: 'hover:text-blue-500',
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      url: 'https://instagram.com',
      color: 'hover:text-pink-500',
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      url: 'https://twitter.com',
      color: 'hover:text-blue-400',
    },
    {
      name: 'TikTok',
      icon: FaTiktok,
      url: 'https://tiktok.com',
      color: 'hover:text-gray-900',
    },
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="text-gray-400 text-sm">
            &copy; {currentYear} OKRNG. All rights reserved.
          </div>

          {/* Social Media Links */}
          <div className="flex items-center gap-6">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 ${social.color} transition-colors duration-200 text-2xl`}
                  aria-label={social.name}
                  title={social.name}
                >
                  <Icon />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SquaresFooter;
