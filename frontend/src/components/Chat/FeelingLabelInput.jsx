import { useState } from 'react';
import { FiX } from 'react-icons/fi';

const FeelingLabelInput = ({ labels = [], onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newLabel = inputValue.trim();
      if (!labels.includes(newLabel) && labels.length < 10) {
        onChange([...labels, newLabel]);
        setInputValue('');
      }
    }
  };

  const removeLabel = (labelToRemove) => {
    onChange(labels.filter((label) => label !== labelToRemove));
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Feeling labels (optional, press Enter to add)
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="e.g., anxious, calm, tired..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {labels.map((label, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
            >
              {label}
              <button
                type="button"
                onClick={() => removeLabel(label)}
                className="ml-2 hover:text-primary-900"
              >
                <FiX size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeelingLabelInput;

