import { useState } from 'react';
import { useStore } from '../store/useStore.js';
import { APP_PIN } from '../lib/config.js';
import BrandMark from './BrandMark.jsx';

export default function PinGate() {
  const unlock = useStore((s) => s.unlock);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const push = (d) => {
    setError('');
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) {
      if (next === APP_PIN) {
        setTimeout(unlock, 120);
      } else {
        setError('PIN incorrecto');
        setTimeout(() => setPin(''), 350);
      }
    }
  };

  const del = () => { setError(''); setPin((p) => p.slice(0, -1)); };

  return (
    <div className="pin-screen">
      <div className="pin-card">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <BrandMark variant="full" width={190} />
        </div>
        <p className="muted" style={{ marginTop: 4 }}>Ingresá tu PIN para continuar</p>

        <div className="pin-dots">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`pin-dot ${i < pin.length ? 'on' : ''}`} />
          ))}
        </div>

        <div className="pin-pad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} className="pin-key" onClick={() => push(String(n))}>{n}</button>
          ))}
          <button className="pin-key wide" onClick={del}>Borrar</button>
          <button className="pin-key" onClick={() => push('0')}>0</button>
          <span />
        </div>
        <div className="pin-error">{error}</div>
      </div>
    </div>
  );
}
