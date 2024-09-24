import React from 'react';
import moment from 'moment'; // Assuming Moment.js is installed and imported

// Exporting TeamTemplate as a named export
export const TeamTemplate = (value, data, field) => {
  const { odd, home_team, visitor_team } = data;
  if(!odd){ return '' }
  return (
    <div className="flex flex-col gap-1 justify-center text-center items-center select-none">
      <div className="flex items-center gap-2 border rounded-lg shadow-md px-4 min-w-[250px]" style={{
        backgroundImage: `url(${visitor_team.background_url})`,
        backgroundSize: 'cover', // Ensures the image covers the entire div
        backgroundPosition: 'center', // Centers the image within the div
      }}>
        <img src={visitor_team.image_url} alt={visitor_team.name} className="w-[50px]"/>
        <p className="font-bold text-white select-none">{visitor_team.name}</p>
      </div>
      <p className='text-sm font-bold'>at</p>
      <div className="flex items-center gap-2 border rounded-lg shadow-md px-4 min-w-[250px]" style={{
        backgroundImage: `url(${home_team.background_url})`,
        backgroundSize: 'cover', // Ensures the image covers the entire div
        backgroundPosition: 'center', // Centers the image within the div
      }}>
        <img src={home_team.image_url} alt={home_team.name} className="w-[50px]"/>
        <p className="font-bold text-white select-none">{home_team.name}</p>
      </div>
    </div>
  );
};

// this is an example of changing a file

export const TeamTemplateWithScores = (value, data, field) => {
  const { odd, home_team, visitor_team } = data;
  if(!odd){ return '' }
  return (
    <div className="flex gap-5 justify-center text-center items-center select-none">
      <div className="flex items-center justify-between gap-2 border rounded-lg shadow-md px-4 min-w-[250px]" style={{
        backgroundImage: `url(${visitor_team.background_url})`,
        backgroundSize: 'cover', // Ensures the image covers the entire div
        backgroundPosition: 'center', // Centers the image within the div
      }}>
        <img src={visitor_team.image_url} alt={visitor_team.name} className="w-[50px]"/>
        <p className="font-bold text-white select-none">{visitor_team.name}</p>
        <span className='text-white'>{visitor_team.id === data.home_team_id ? data.home_team_score : data.visitor_team_score}</span>
      </div>
      <p className='text-sm font-bold'>vs</p>
      <div className="flex items-center justify-between gap-2 border rounded-lg shadow-md px-4 min-w-[250px]" style={{
        backgroundImage: `url(${home_team.background_url})`,
        backgroundSize: 'cover', // Ensures the image covers the entire div
        backgroundPosition: 'center', // Centers the image within the div
      }}>
        <img src={home_team.image_url} alt={home_team.name} className="w-[50px]"/>
        <p className="font-bold text-white select-none">{home_team.name}</p>
        <span className='text-white'>{home_team.id === data.visitor_team_id ? data.visitor_team_score : data.home_team_score}</span>
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