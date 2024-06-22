import { useState } from "react";

const NFL = () => {
  
  const wageType = [
    { name: 'Parlay', value: 'parlay' },
    { name: 'Straight', value: 'straight' },
    { name: 'Teaser', value: 'teaser' },
  ];
  
  const [activeWagerType, setActiveWagerType] = useState(wageType[0]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-blue-900 text-3xl font-semibold">NFL</div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <div>
          <div className="font-bold mb-2">Bet Type</div>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {wageType.map(wt => (
              <div key={wt.id} 
                className={`cursor-pointer select-none bg-white rounded-lg shadow-lg border p-4 text-center hover:bg-primaryS hover:text-white ${activeWagerType.value == wt.value ? 'bg-primaryS text-white' : ''}`}
                onClick={() => setActiveWagerType(wt)}
              >
                <h2 className="text-xl font-semibold">{wt.name}</h2>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="font-bold mb-2 mt-5">Teams</div>
          <div className="w-full rounded-lg bg-background text-white font-bold">
            <div className="grid grid-cols-10">
              <div className="col-span-4 p-4 text-center">Team</div>
              <div className="col-span-2 p-4 border-l border-white text-center">Spread</div>
              <div className="col-span-2 p-4 border-l border-white text-center">Total Points</div>
              <div className="col-span-2 p-4 border-l border-white text-center">Money Line</div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default NFL;