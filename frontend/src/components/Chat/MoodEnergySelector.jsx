const MoodEnergySelector = ({ mood, energy, onMoodChange, onEnergyChange }) => {
  const labels = {
    mood: ['Very low', 'Low', 'Neutral', 'Good', 'Excellent'],
    energy: ['Very low', 'Low', 'Balanced', 'High', 'Very high'],
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mood: {mood ? labels.mood[mood - 1] : 'Not selected'}
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={mood || 3}
          onChange={(e) => onMoodChange(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          {labels.mood.map((label, idx) => (
            <span key={idx}>{idx + 1}</span>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Energy: {energy ? labels.energy[energy - 1] : 'Not selected'}
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={energy || 3}
          onChange={(e) => onEnergyChange(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          {labels.energy.map((label, idx) => (
            <span key={idx}>{idx + 1}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodEnergySelector;

