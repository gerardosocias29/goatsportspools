import React from 'react';
import moment from 'moment'; // Assuming Moment.js is installed and imported

// Exporting TeamTemplate as a named export
export const TeamTemplate = (value, data, field) => {
  const { odd } = data;
  if(!odd){ return '' }
  return (
    <div className="flex flex-col gap-1 justify-center text-center items-center select-none">
      <div className="flex items-center gap-2 border rounded-lg shadow-md px-4 min-w-[250px]" style={{
        backgroundImage: `url(${odd.favored_team.background_url})`,
        backgroundSize: 'cover', // Ensures the image covers the entire div
        backgroundPosition: 'center', // Centers the image within the div
      }}>
        <img src={odd.favored_team.image_url} alt={odd.favored_team.name} className="w-[50px]"/>
        <p className="font-bold text-white select-none drop-shadow-md">{odd.favored_team.name}</p>
      </div>
      <p className='text-sm font-bold'>vs</p>
      <div className="flex items-center gap-2 border rounded-lg shadow-md px-4 min-w-[250px]" style={{
        backgroundImage: `url(${odd.underdog_team.background_url})`,
        backgroundSize: 'cover', // Ensures the image covers the entire div
        backgroundPosition: 'center', // Centers the image within the div
      }}>
        <img src={odd.underdog_team.image_url} alt={odd.underdog_team.name} className="w-[50px]"/>
        <p className="font-bold text-white select-none drop-shadow-md">{odd.underdog_team.name}</p>
      </div>
    </div>
  );
};

// Exporting DateTemplate as a named export
export const DateTemplate = (value, data, field) => {
  return (
    <div className="text-center">
      {moment(value).format('MMM DD')}<br/>{moment(value).format('hh:mm A')}
    </div>
  );
};