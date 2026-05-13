import { useState, useEffect } from 'react';

const PLATFORMS_DEFAULT = [
  'Netflix','Disney+','HBO Max','Crunchyroll','Prime Video',
  'Spotify','Apple TV+','Paramount+','Star+','DIRECTV GO','YouTube Premium'
];

const STORAGE_KEY = 'custom_platforms_v1';

function getCustomPlatforms() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function addCustomPlatform(name) {
  const list = getCustomPlatforms();
  if (name && !list.includes(name) && !PLATFORMS_DEFAULT.includes(name)) {
    list.push(name);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

export default function PlatformSelect({ value, onChange, className = '' }) {
  const [customPlatforms, setCustomPlatforms] = useState(getCustomPlatforms);

  const allKnown = [...PLATFORMS_DEFAULT, ...customPlatforms];
  const isKnown = (v) => !v || allKnown.includes(v);

  const [showCustom, setShowCustom] = useState(() => !!value && !isKnown(value));
  const [customValue, setCustomValue] = useState(() => (value && !isKnown(value)) ? value : '');

  // React when parent changes value from outside (e.g. AccountSearch auto-fill)
  useEffect(() => {
    if (!value) {
      setShowCustom(false);
      setCustomValue('');
    } else if (allKnown.includes(value)) {
      setShowCustom(false);
      setCustomValue('');
    } else {
      // Custom platform coming from outside - show it in the input
      setShowCustom(true);
      setCustomValue(value);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (e) => {
    const val = e.target.value;
    if (val === '__otro__') {
      setShowCustom(true);
      setCustomValue('');
      onChange('');
    } else {
      setShowCustom(false);
      setCustomValue('');
      onChange(val);
    }
  };

  const handleCustomChange = (e) => {
    setCustomValue(e.target.value);
    onChange(e.target.value);
  };

  const handleCustomBlur = () => {
    const trimmed = customValue.trim();
    if (trimmed && !allKnown.includes(trimmed)) {
      addCustomPlatform(trimmed);
      setCustomPlatforms(getCustomPlatforms());
      // Now it's in the list, switch to select mode
      setShowCustom(false);
      onChange(trimmed);
    }
  };

  const handleCustomKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
  };

  const selectValue = showCustom ? '__otro__' : (value || '');

  return (
    <div className="space-y-2">
      <select
        className={`input-neon text-sm ${className}`}
        value={selectValue}
        onChange={handleSelect}
      >
        <option value="">Seleccionar plataforma</option>
        {PLATFORMS_DEFAULT.map(p => <option key={p} value={p}>{p}</option>)}
        {customPlatforms.length > 0 && (
          <>
            <option disabled value="">──── Mis plataformas ────</option>
            {customPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
          </>
        )}
        <option value="__otro__">Otra (escribir nombre)...</option>
      </select>

      {showCustom && (
        <>
          <input
            className="input-neon text-sm"
            placeholder="Escribe el nombre de la plataforma (ej: Viki Rakuten)"
            value={customValue}
            onChange={handleCustomChange}
            onBlur={handleCustomBlur}
            onKeyDown={handleCustomKeyDown}
            autoFocus
          />
          {customValue.trim() && (
            <p className="text-xs" style={{ color: 'rgba(0,212,255,0.6)' }}>
              Presiona Enter o haz clic fuera para guardarla en la lista
            </p>
          )}
        </>
      )}
    </div>
  );
}
