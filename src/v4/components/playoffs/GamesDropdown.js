import React from 'react';

const GAMES_OPTIONS = [
  { value: 4, label: '4 (4-0)' },
  { value: 5, label: '5 (4-1)' },
  { value: 6, label: '6 (4-2)' },
  { value: 7, label: '7 (4-3)' },
];

const GamesDropdown = ({ value, onChange, readOnly }) => {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
      disabled={readOnly}
      className={`w-full h-7 text-[11px] font-medium rounded-md border px-2 transition appearance-none bg-no-repeat ${
        value
          ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-400'
          : 'border-gray-300 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400'
      } disabled:opacity-60 disabled:cursor-not-allowed`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3e%3cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd' /%3e%3c/svg%3e")`,
        backgroundPosition: 'right 0.25rem center',
        backgroundSize: '1rem',
        paddingRight: '1.5rem',
      }}
    >
      <option value="">Games?</option>
      {GAMES_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default GamesDropdown;
