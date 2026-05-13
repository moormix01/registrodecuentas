export default function DocPreview() {
  return (
    <div style={{ padding: '8px 0', minHeight: '100vh' }}>
      <h2 style={{ color: '#00d4ff', fontFamily: "'Orbitron', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>
        SISTEMA DE DOCUMENTOS FISCALES
      </h2>
      <p style={{ color: 'rgba(226,232,240,0.5)', fontSize: 12, marginBottom: 28 }}>
        Ejemplos de los documentos que el sistema generaría automáticamente
      </p>

      <SectionTitle n="①" label="Carta de Ingresos del Exterior" />
      <div style={docCard}>
        <div style={{ background: 'linear-gradient(135deg,#1a1a4e,#0d3b6e)', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px 12px 0 0' }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: 2 }}>JACK<span style={{ color: '#00d4ff' }}>.</span>DIGITAL</span>
          <div style={{ textAlign: 'right' }}>
            <span style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 20, color: '#00d4ff', fontSize: 10, padding: '3px 10px', letterSpacing: 1 }}>DOCUMENTO OFICIAL</span>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 5 }}>N° 2024-INE-0042</div>
          </div>
        </div>
        <div style={{ padding: '24px 28px', background: '#fff', borderRadius: '0 0 12px 12px' }}>
          <p style={{ color: '#999', fontSize: 12, textAlign: 'right', marginBottom: 16 }}>Quito, Ecuador — 13 de Mayo del 2025</p>
          <p style={{ color: '#555', fontSize: 13, lineHeight: 1.8, marginBottom: 16 }}>
            Yo, <strong>Jack Nombre Apellido</strong>, portador del RUC <strong>1723456789001</strong>, con actividad económica registrada como <em>"Prestación de servicios digitales al exterior"</em>, hago constar que durante el período <strong>Enero – Diciembre 2024</strong> he percibido los siguientes ingresos:
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
            <thead>
              <tr style={{ background: '#f0f4ff' }}>
                {['Plataforma','País','Moneda','Ingresos USD','Comprobantes'].map(h => (
                  <th key={h} style={{ padding: '9px 12px', fontSize: 11, color: '#1a1a4e', textAlign: 'left', borderBottom: '2px solid #dde3ff' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Gamsgo','Internacional','USD','$4,200.00','12 recibos'],
                ['YouTube Partner','Estados Unidos','USD','$1,850.00','12 recibos'],
                ['Spotify for Artists','Suecia','USD','$620.00','8 recibos'],
                ['Amazon Associates','Estados Unidos','USD','$430.00','5 recibos'],
              ].map((r,i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  {r.map((c,j) => <td key={j} style={{ padding: '9px 12px', fontSize: 13, color: '#374151' }}>{c}</td>)}
                </tr>
              ))}
              <tr style={{ background: '#f0fff4' }}>
                <td colSpan={3} style={{ padding: '9px 12px', fontWeight: 700, color: '#15803d', fontSize: 13 }}>TOTAL ANUAL</td>
                <td style={{ padding: '9px 12px', fontWeight: 700, color: '#15803d', fontSize: 13 }}>$7,100.00</td>
                <td style={{ padding: '9px 12px', fontWeight: 700, color: '#15803d', fontSize: 13 }}>37 recibos</td>
              </tr>
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid #eee' }}>
            <FirmaBox label={"Jack Nombre Apellido\nRUC: 1723456789001"} />
            <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px dashed #1a1a4e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#1a1a4e', textAlign: 'center', fontWeight: 700, lineHeight: 1.4 }}>SELLO<br/>DIGITAL<br/>2024</div>
            <FirmaBox label={"Contador / Firma Opcional\nRUC Contador"} />
          </div>
        </div>
      </div>

      <SectionTitle n="②" label="Historial de Movimientos" />
      <div style={docCard}>
        <div style={{ background: '#0f172a', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px 12px 0 0' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Registro de Retiros — 2024</div>
            <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>Jack Nombre Apellido · RUC 1723456789001</div>
          </div>
          <div style={{ color: '#94a3b8', fontSize: 11, textAlign: 'right' }}>37 transacciones<br/>Exportado: 13/05/2025</div>
        </div>
        <div style={{ background: '#f8fafc', padding: '10px 24px', display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0' }}>
          {['Todas las plataformas','Año 2024'].map(c => <span key={c} style={{ background: '#e0f2fe', color: '#0369a1', fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>{c}</span>)}
          <span style={{ background: '#dcfce7', color: '#15803d', fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>✓ Verificados</span>
        </div>
        <div style={{ background: '#fff', borderRadius: '0 0 12px 12px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                {['#','Fecha','Plataforma','Descripción','Comprobante','Monto USD'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', fontSize: 10, color: '#475569', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['001','05/01/2024','Gamsgo','Retiro mensual enero','REC-001.pdf','$350.00','#fef3c7','#92400e'],
                ['002','03/02/2024','YouTube','Pago AdSense enero','REC-002.pdf','$154.20','#fee2e2','#991b1b'],
                ['003','05/02/2024','Gamsgo','Retiro mensual febrero','REC-003.pdf','$350.00','#fef3c7','#92400e'],
                ['004','20/02/2024','Spotify','Royalties Q4 2023','REC-004.pdf','$78.50','#dcfce7','#166534'],
                ['005','08/03/2024','Amazon','Comisiones febrero','REC-005.pdf','$86.40','#dbeafe','#1d4ed8'],
              ].map(([n,f,p,d,c,m,bg,col]) => (
                <tr key={n} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '11px 14px', fontSize: 13 }}>{n}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13 }}>{f}</td>
                  <td style={{ padding: '11px 14px' }}><span style={{ background: bg, color: col, padding: '3px 9px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{p}</span></td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#374151' }}>{d}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: '#6b7280' }}>📎 {c}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{m}</td>
                </tr>
              ))}
              <tr style={{ background: '#0f172a' }}>
                <td colSpan={5} style={{ padding: '13px 14px', color: '#fff', fontWeight: 700, fontSize: 13, borderRadius: '0 0 0 12px' }}>TOTAL PERÍODO ENERO – DICIEMBRE 2024</td>
                <td style={{ padding: '13px 14px', color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: '0 0 12px 0' }}>$7,100.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <SectionTitle n="③" label="Resumen para Declaración SRI (Formulario 102)" />
      <div style={docCard}>
        <div style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', padding: '22px 28px', borderRadius: '12px 12px 0 0' }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>Resumen de Ingresos del Exterior — IR Personas Naturales</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 4 }}>Período fiscal: Enero 1 – Diciembre 31, 2024</div>
        </div>
        <div style={{ padding: '24px 28px', background: '#fff', borderRadius: '0 0 12px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
            {[['Contribuyente','Jack Nombre Apellido'],['RUC','1723456789001'],['Actividad económica','Servicios digitales al exterior'],['Régimen','Persona Natural — RIMPE Emprendedor']].map(([l,v]) => (
              <div key={l} style={{ background: '#f8fafc', borderRadius: 8, padding: '11px 14px' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 8, paddingBottom: 6, borderBottom: '2px solid #ede9fe' }}>Ingresos gravados del exterior (Casilla 499)</div>
            {[['Gamsgo — servicios streaming','$4,200.00'],['YouTube — monetización','$1,850.00'],['Spotify — royalties','$620.00'],['Amazon Associates','$430.00']].map(([l,v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px dashed #f1f5f9', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>{l}</span><span style={{ fontWeight: 600, color: '#1e293b' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 8, paddingBottom: 6, borderBottom: '2px solid #ede9fe' }}>Retenciones / Impuestos en origen</div>
            {[['Retención en fuente EE.UU. (W-8BEN)','- $142.00'],['Otras retenciones','- $58.00']].map(([l,v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px dashed #f1f5f9', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>{l}</span><span style={{ fontWeight: 600, color: '#dc2626' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: 10, padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>INGRESO NETO DECLARABLE (Casilla 499)</span>
            <span style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>$6,900.00</span>
          </div>
          <div style={{ background: '#fffbeb', borderLeft: '3px solid #f59e0b', padding: '9px 13px', borderRadius: '0 6px 6px 0', marginTop: 14, fontSize: 11, color: '#92400e', lineHeight: 1.6 }}>
            ⚠️ Este resumen es referencial. Entrégalo a tu contador para ingresar los valores en el formulario 102 del SRI.
          </div>
        </div>
      </div>

      <SectionTitle n="④" label="Carpeta de Comprobantes (ZIP descargable)" />
      <div style={{ ...docCard, marginBottom: 40 }}>
        <div style={{ background: '#18181b', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 14, borderRadius: '12px 12px 0 0' }}>
          <div style={{ width: 46, height: 46, background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📦</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>comprobantes_jack_2024.zip</div>
            <div style={{ color: '#71717a', fontSize: 11, marginTop: 2 }}>37 archivos · 14.2 MB · Generado automáticamente</div>
          </div>
        </div>
        <div style={{ padding: '20px 24px', background: '#fafafa' }}>
          {[
            { folder: '📁 Gamsgo (12 recibos)', files: ['REC-001_Gamsgo_2024-01-05_$350.pdf','REC-003_Gamsgo_2024-02-05_$350.pdf'], more: '10 archivos más...' },
            { folder: '📁 YouTube (12 recibos)', files: ['REC-002_YouTube_2024-02-03_$154.20.pdf'], more: '11 archivos más...' },
            { folder: '📁 Spotify (8 recibos)', files: ['REC-004_Spotify_2024-02-20_$78.50.pdf'], more: '7 archivos más...' },
            { folder: '📁 Documentos Generados', files: ['carta_ingresos_2024.pdf','historial_movimientos_2024.pdf','resumen_sri_formulario102_2024.pdf'], more: null },
          ].map(({ folder, files, more }) => (
            <div key={folder} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: '#374151', fontSize: 13, marginBottom: 7 }}>{folder}</div>
              <div style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {files.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: '7px 11px', fontSize: 12 }}>
                    <span>📄</span><span style={{ flex: 1, color: '#374151' }}>{f}</span><span style={{ color: '#10b981' }}>✓</span>
                  </div>
                ))}
                {more && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: 6, padding: '7px 11px', fontSize: 12, color: '#9ca3af' }}>
                    <span>➕</span><span>{more}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '13px 24px', background: '#f3f4f6', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '0 0 12px 12px' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Todos los archivos verificados · Listo para presentar al banco o al SRI</span>
          <button style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>⬇ Descargar ZIP</button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ n, label }) {
  return (
    <div style={{ color: '#00d4ff', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, padding: '5px 12px', background: 'rgba(0,212,255,0.08)', borderLeft: '3px solid #00d4ff', borderRadius: '0 6px 6px 0', display: 'inline-block' }}>
      {n} {label}
    </div>
  );
}

function FirmaBox({ label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 150, borderBottom: '1px solid #999', height: 36, margin: '0 auto 5px' }} />
      <div style={{ fontSize: 11, color: '#666', whiteSpace: 'pre-line' }}>{label}</div>
    </div>
  );
}

const docCard = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
  overflow: 'hidden',
  maxWidth: 820,
  marginBottom: 32,
};
