import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const RatingStars = ({ rating = 0, editable = false, onChange }) => {
  const [hovered, setHovered] = useState(0);

  const displayRating = editable && hovered ? hovered : rating;

  const handleClick = (value) => {
    if (editable && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (editable) setHovered(value);
  };

  const handleMouseLeave = () => {
    if (editable) setHovered(0);
  };

  const renderStar = (index) => {
    const value = index + 1;
    const fill = displayRating >= value;

    if (fill) {
      return <FaStar key={index} className="text-primary-400" />;
    }

    if (displayRating >= value - 0.5 && displayRating < value) {
      return <FaStarHalfAlt key={index} className="text-primary-400" />;
    }

    return <FaRegStar key={index} className="text-primary-400" />;
  };

  return (
    <div
      className={`flex items-center gap-0.5 ${editable ? 'cursor-pointer' : ''}`}
      onMouseLeave={handleMouseLeave}
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <span
          key={index}
          className={`text-lg ${editable ? 'hover:scale-110 transition-transform' : ''}`}
          onClick={() => handleClick(index + 1)}
          onMouseEnter={() => handleMouseEnter(index + 1)}
          role={editable ? 'button' : undefined}
          aria-label={`${index + 1} star${index + 1 > 1 ? 's' : ''}`}
        >
          {renderStar(index)}
        </span>
      ))}
    </div>
  );
};

export default RatingStars;
