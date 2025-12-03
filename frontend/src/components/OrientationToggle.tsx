interface OrientationToggleProps {
  orientation: 'Horizontal' | 'Vertical';
  onOrientationChange: (orientation: 'Horizontal' | 'Vertical') => void;
}

export function OrientationToggle({ orientation, onOrientationChange }: OrientationToggleProps) {
  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-gray-600 mb-2 font-semibold">Orientation:</h3>
      <label className="flex items-center gap-2 cursor-pointer font-medium">
        <input
          type="radio"
          checked={orientation === 'Horizontal'}
          onChange={() => onOrientationChange('Horizontal')}
          className="cursor-pointer"
        />
        Horizontal
      </label>
      <label className="flex items-center gap-2 cursor-pointer font-medium">
        <input
          type="radio"
          checked={orientation === 'Vertical'}
          onChange={() => onOrientationChange('Vertical')}
          className="cursor-pointer"
        />
        Vertical
      </label>
    </div>
  );
}
