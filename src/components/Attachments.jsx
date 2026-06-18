import { useRef, useState } from 'react';
import { useStore } from '../store/useStore.js';
import * as db from '../lib/db.js';
import { IcUpload, IcPdf } from './icons.jsx';

function isImg(f) {
  return (f.type || '').startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(f.url || f.name || '');
}

export default function Attachments({ value = [], onChange, hint, accept = 'image/*,application/pdf', readOnly = false }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState(null);
  const toast = useStore((s) => s.toast);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setBusy(true);
    try {
      const uploaded = [];
      for (const file of files) uploaded.push(await db.uploadFile(file));
      onChange([...(value || []), ...uploaded]);
      toast(`${uploaded.length} archivo(s) agregado(s)`, 'success');
    } catch (e) {
      toast('Error al subir: ' + e.message, 'error');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div>
      {(value || []).length > 0 && (
        <div className="session imgs" style={{ marginTop: 0, marginBottom: readOnly ? 0 : 12, padding: 0, border: 'none' }}>
          {value.map((f, i) =>
            isImg(f) ? (
              <div key={i} style={{ position: 'relative' }}>
                <img className="thumb" src={f.url} alt={f.name} onClick={() => setZoom(f.url)} />
                {!readOnly && <RemoveBtn onClick={() => remove(i)} />}
              </div>
            ) : (
              <div key={i} style={{ position: 'relative' }}>
                <a className="thumb file" href={f.url} target="_blank" rel="noreferrer" title={f.name}>
                  <IcPdf width={26} height={26} />
                  <span style={{ marginTop: 4, wordBreak: 'break-word' }}>{(f.name || 'PDF').slice(0, 18)}</span>
                </a>
                {!readOnly && <RemoveBtn onClick={() => remove(i)} />}
              </div>
            )
          )}
        </div>
      )}

      {!readOnly && (
        <>
          <div className="dropzone" onClick={() => inputRef.current?.click()}>
            <IcUpload width={24} height={24} style={{ color: 'var(--sage)' }} />
            <div style={{ marginTop: 6 }}>
              {busy ? 'Subiendo…' : <><strong>Subí archivos</strong> o tocá acá</>}
            </div>
            {hint && <div className="small muted" style={{ marginTop: 2 }}>{hint}</div>}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </>
      )}

      {zoom && (
        <div className="lightbox" onClick={() => setZoom(null)}>
          <img src={zoom} alt="" />
        </div>
      )}
    </div>
  );
}

function RemoveBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Quitar"
      style={{
        position: 'absolute', top: -7, right: -7, width: 22, height: 22, borderRadius: '50%',
        background: 'var(--red)', color: '#fff', border: '2px solid #fff', cursor: 'pointer',
        fontSize: 13, lineHeight: 1, padding: 0,
      }}
    >×</button>
  );
}
