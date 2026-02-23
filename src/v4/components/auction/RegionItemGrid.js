import React from 'react';

const regions = ['East', 'West', 'Midwest', 'South'];

const RegionItemGrid = React.memo(({
  items = [],
  activeItemId,
  onSelectItem,
  selectedRegion,
  onRegionChange,
  readOnly = false,
}) => {
  const filteredItems = items.filter((item) => item?.region === selectedRegion);

  return (
    <div>
      {/* Region Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {regions.map((region) => (
          <button
            key={region}
            onClick={() => onRegionChange(region)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedRegion === region
                ? 'bg-brand-500 !text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 gap-2">
        {filteredItems.map((item) => {
          const isActive = activeItemId === item.id;
          const isSold = !!item.sold_to;

          return (
            <button
              key={item.id}
              onClick={() => !readOnly && !isSold && onSelectItem?.(item)}
              disabled={readOnly || isSold}
              title={
                isSold
                  ? `Sold to ${item.bids?.[0]?.user?.name || 'Unknown'} for $${Number(item.sold_amount || 0).toFixed(2)}`
                  : `#${item.seed} ${item.description || ''} ${item.name}`
              }
              className={`relative flex items-center justify-between gap-1.5 px-3 py-2.5 rounded-lg text-left text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-brand-500 !text-white border-2 border-brand-500 shadow-md ring-2 ring-brand-500/30'
                  : isSold
                  ? 'bg-gray-50 text-gray-400 border border-gray-200 opacity-50 cursor-not-allowed dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-500'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-300 hover:shadow-sm cursor-pointer dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:border-brand-500/50'
              }`}
            >
              <span className="truncate">
                #{item.seed} {item.description || ''} {item.name}
              </span>
              {isSold && (
                <svg className="w-4 h-4 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
          No items in this region
        </div>
      )}
    </div>
  );
});

RegionItemGrid.displayName = 'RegionItemGrid';
export default RegionItemGrid;
