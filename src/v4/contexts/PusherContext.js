import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useUserContext } from './UserContext';

const PusherContext = createContext(null);

export const PusherProvider = ({ children }) => {
  const { isSignedIn, user } = useUserContext();
  const [channel, setChannel] = useState(null);
  const pusherRef = useRef(null);

  useEffect(() => {
    if (isSignedIn && user && !pusherRef.current) {
      const initPusher = async () => {
        try {
          const Pusher = (await import('pusher-js')).default;
          const pusherInstance = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
            cluster: process.env.REACT_APP_PUSHER_CLUSTER,
          });

          const biddingChannel = pusherInstance.subscribe('bidding-channel');
          pusherRef.current = pusherInstance;
          setChannel(biddingChannel);
        } catch (error) {
          console.error('PusherContext: Error initializing Pusher:', error);
        }
      };
      initPusher();
    }

    return () => {
      if (pusherRef.current) {
        pusherRef.current.unsubscribe('bidding-channel');
        pusherRef.current.disconnect();
        pusherRef.current = null;
        setChannel(null);
      }
    };
  }, [isSignedIn, user]);

  return (
    <PusherContext.Provider value={{ channel }}>
      {children}
    </PusherContext.Provider>
  );
};

export const usePusher = () => {
  const context = useContext(PusherContext);
  if (!context) {
    throw new Error('usePusher must be used within PusherProvider');
  }
  return context;
};
