export function Mascot({small=false}:{small?:boolean}){
  return <svg className={small?'mascot small':'mascot'} viewBox="0 0 210 186" role="img" aria-label="Cani, mascota azul de Canasta Comunidad">
    <ellipse cx="106" cy="174" rx="66" ry="8" fill="#9ccaf9" opacity=".45"/>
    <path d="M81 49V35c0-17 45-17 45 0v14" stroke="#0b5bb5" strokeWidth="12" strokeLinecap="round" fill="none"/>
    <path d="M58 60 51 42 61 30 76 51M92 55 88 20 103 15 111 52" fill="#f6c558"/>
    <path d="M128 51 142 17 154 22 148 55" fill="#c6e7f2"/><circle cx="130" cy="51" r="20" fill="#fa796f"/><path d="M131 32c10-9 22-6 26 0" fill="none" stroke="#3a9e73" strokeWidth="6" strokeLinecap="round"/>
    <path d="M62 63C54 82 58 141 72 151H142c14-11 19-65 10-88Z" fill="#2388ee" stroke="#075fc1" strokeWidth="3"/>
    <path d="M57 62h97" stroke="#0a67c6" strokeWidth="15" strokeLinecap="round"/>
    <circle cx="88" cy="103" r="5" fill="#142e51"/><circle cx="126" cy="103" r="5" fill="#142e51"/>
    <path d="M103 112q4 8 9 0" stroke="#142e51" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="76" cy="116" r="6" fill="#fda6ab" opacity=".8"/><circle cx="140" cy="116" r="6" fill="#fda6ab" opacity=".8"/>
    <path d="M59 108 34 91M155 108l21-20" stroke="#0754a2" strokeWidth="9" strokeLinecap="round"/><circle cx="32" cy="89" r="9" fill="#0754a2"/><circle cx="178" cy="87" r="9" fill="#0754a2"/>
    <path d="M91 152v14m37-14v14" stroke="#0754a2" strokeWidth="9" strokeLinecap="round"/><path d="M78 168h23M117 168h23" stroke="#0754a2" strokeWidth="9" strokeLinecap="round"/>
  </svg>;
}
