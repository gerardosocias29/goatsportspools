import React from 'react';
import { Button } from 'primereact/button';
import convertUTCToTimeZone from "../../../utils/utcToTimezone"; // Import the function for UTC conversion
import moment from 'moment';

const NFLCardView = ({ games, handleBetClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {games.map((game, index) => (
        <div key={index} className="p-4 bg-white rounded-lg shadow-lg">
          {/* Game Date using convertUTCToTimeZone */}
          <div className="font-bold text-lg mb-2 text-center">
            {convertUTCToTimeZone(game.game_datetime, 'MMM DD, hh:mm A')}
          </div>

          {/* Teams */}
          <div className="flex justify-between items-center mb-4">
            <div className="font-bold">{game.home_team.name}</div>
            <div className="text-primary">VS</div>
            <div className="font-bold">{game.visitor_team.name}</div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            {/* Spread Button */}
            <Button
              label={`Spread ${decimalToMixedFraction(game.odd.spread, true)}`}
              className="w-full bg-primary text-white"
              onClick={() => handleBetClick({ type: 'spread', game, team: game.home_team })}
            />

            {/* Total Button */}
            <Button
              label={`Total o${decimalToMixedFraction(game.odd.over_total)}`}
              className="w-full bg-primary text-white"
              onClick={() => handleBetClick({ type: 'total', game, team: 'over' })}
            />

            {/* Money Line Button */}
            <Button
              label={`Money Line ${decimalToMixedFraction(game.odd.moneyline, true)}`}
              className="w-full bg-primary text-white"
              onClick={() => handleBetClick({ type: 'moneyline', game, team: game.home_team })}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NFLCardView;