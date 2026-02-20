import React from 'react';
import ReactPlayer from 'react-player';

const StreamEmbed = ({ url, showLiveBadge = false }) => {
  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black">
      {showLiveBadge && (
        <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-error-600 px-2.5 py-1 text-xs font-bold !text-white uppercase tracking-wider shadow-lg">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Live
        </div>
      )}

      {url ? (
        <div className="relative pt-[56.25%]">
          <ReactPlayer
            url={url}
            playing
            controls
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
            config={{
              youtube: {
                playerVars: { showinfo: 1, modestbranding: 1, rel: 0 },
              },
            }}
          />
        </div>
      ) : (
        <div className="relative pt-[56.25%]">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span className="text-sm">Stream not available</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamEmbed;
