import React from 'react';

/**
 * Lightweight, zero-dependency star rating picker and display component.
 * Replaces react-star-picker to eliminate React 16 peer-dependency conflicts.
 */
const StarPicker = ({ value = 0, onChange, size = 28, maxStars = 5 }) => {
  const currentVal = Number(value) || 0;
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    const isFilled = i <= currentVal;
    stars.push(
      <span
        key={i}
        onClick={() => {
          if (typeof onChange === 'function') {
            onChange(i);
          }
        }}
        style={{
          cursor: typeof onChange === 'function' ? 'pointer' : 'default',
          fontSize: `${size}px`,
          lineHeight: '1',
          color: isFilled ? '#FFD700' : '#D1D5DB',
          marginRight: '4px',
          userSelect: 'none',
          transition: 'color 0.15s ease, transform 0.1s ease',
          display: 'inline-block'
        }}
        role="button"
        title={`${i} of ${maxStars} stars`}
        aria-label={`${i} stars`}
      >
        ★
      </span>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      {stars}
    </div>
  );
};

export default StarPicker;
