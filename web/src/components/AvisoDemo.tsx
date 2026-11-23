export default function AvisoDemo() {
  return (
    <aside
      aria-label="Aviso de demostración"
      className="border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-sm text-amber-950"
    >
      <strong>Demo con datos ficticios.</strong> No es un canal oficial de denuncias: no cargues datos
      reales. Ante una emergencia, llamá al <a href="tel:911" className="font-semibold underline">911</a>.
    </aside>
  );
}
