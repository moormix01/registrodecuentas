import { useState, useEffect } from 'react';

const PLATFORMS_LIST = [
  'Netflix','Disney+','HBO Max','Crunchyroll','Prime Video',
  'Spotify','Apple TV+','Paramount+','Star+','DIRECTV GO','YouTube Premium','Otro'
];

export default function PlatformSelect({ value, onChange, className = '' }) {
  const isOther = value && !PLATFORMS_LIST.slice(0, -1).includes(value);
  const [showCustom, setShowCustom] = useState(isOther);
  const [customValue, setCustomValue] = useState(isOther ? value : '');

  useEffect(() => {
    const other = value && !PLATFORMS_LIST.slice(0, -1).includes(value);
    setShowCustom(other);
    if (other) setCustomValue(value);
  }, []);

  const handleSelect = (e) => {
    const val = e.target.value;
    if (val === 'Otro') {
      setShowCustom(true);
      setCustomValue('');
      onChange('');
    } else {
      setShowCustom(false);
      onChange(val);
    }
  };

  const handleCustom = (e) => {
    setCustomValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <select
        className={`input-neon text-sm ${className}`}
        value={showCustom ? 'Otro' : (value || '')}
        onChange={handleSelect}
      >
        <option value="">Seleccionar plataforma</option>
        {PLATFORMS_LIST.map(p => <option key={p}>{p}</option>)}
      </select>
      {showCustom && (
        <input
          className="input-neon text-sm"
          placeholder="Escribe el nombre de la plataforma"
          value={customValue}
          onChange={handleCustom}
          autoFocus
        />
      )}
    </div>
  );
}
