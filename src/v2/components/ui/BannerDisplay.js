import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../../../app/contexts/AxiosContext';
import SquaresApiService from '../../services/squaresApiService';
import Banner from './Banner';
import Button from './Button';

/**
 * BannerDisplay Component
 * Fetches and displays dynamic banners from the database
 *
 * @param {string} page - The page identifier to filter banners (e.g., 'squares', 'home', 'pools')
 * @param {object} style - Additional container styles
 */
const BannerDisplay = ({ page = 'all', style = {} }) => {
  const navigate = useNavigate();
  const axiosService = useAxios();
  const [banners, setBanners] = useState([]);
  const [dismissedBanners, setDismissedBanners] = useState(() => {
    // Load dismissed banners from localStorage
    const stored = localStorage.getItem('dismissedBanners');
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, [page]);

  const loadBanners = async () => {
    try {
      const apiService = new SquaresApiService(axiosService);
      const result = await apiService.getBanners(page);

      if (result.success) {
        setBanners(result.data || []);
      }
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (bannerId) => {
    const newDismissed = [...dismissedBanners, bannerId];
    setDismissedBanners(newDismissed);
    localStorage.setItem('dismissedBanners', JSON.stringify(newDismissed));
  };

  const handleAction = (banner) => {
    if (banner.action_url) {
      // Check if it's an external URL or internal route
      if (banner.action_url.startsWith('http')) {
        window.open(banner.action_url, '_blank');
      } else {
        navigate(banner.action_url);
      }
    }
  };

  // Filter out dismissed banners
  const visibleBanners = banners.filter(
    (banner) => !dismissedBanners.includes(banner.id)
  );

  if (loading || visibleBanners.length === 0) {
    return null;
  }

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    ...style,
  };

  return (
    <div style={containerStyles}>
      {visibleBanners.map((banner) => (
        <Banner
          key={banner.id}
          icon={banner.icon}
          title={banner.title}
          description={banner.description}
          variant={banner.variant || 'primary'}
          dismissible={banner.dismissible}
          onDismiss={() => handleDismiss(banner.id)}
          action={
            banner.action_text && banner.action_url ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleAction(banner)}
              >
                {banner.action_text}
              </Button>
            ) : null
          }
        />
      ))}
    </div>
  );
};

export default BannerDisplay;
