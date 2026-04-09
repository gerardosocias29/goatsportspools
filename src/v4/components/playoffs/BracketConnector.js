import React from 'react';

/**
 * CSS-only bracket connector that draws lines between two matchups
 * feeding into one next-round matchup.
 *
 * @param {'ltr'|'rtl'} direction - East = 'ltr', West = 'rtl'
 */
const BracketConnector = ({ direction = 'ltr' }) => {
  const isLtr = direction === 'ltr';

  return (
    <div className="flex flex-col w-5 self-stretch">
      {/* Top half: ┐ or ┌ */}
      <div
        className={`flex-1 ${
          isLtr
            ? 'border-r-2 border-b-2'
            : 'border-l-2 border-b-2'
        } border-gray-300 dark:border-gray-600`}
      />
      {/* Bottom half: ┘ or └ */}
      <div
        className={`flex-1 ${
          isLtr
            ? 'border-r-2 border-t-2'
            : 'border-l-2 border-t-2'
        } border-gray-300 dark:border-gray-600`}
      />
    </div>
  );
};

/**
 * Horizontal stub connecting a connector to the next matchup card.
 */
export const ConnectorStub = ({ direction = 'ltr' }) => {
  return (
    <div className="flex items-center w-3 self-stretch">
      <div className="w-full h-0 border-t-2 border-gray-300 dark:border-gray-600" />
    </div>
  );
};

export default BracketConnector;
