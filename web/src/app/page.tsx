// Pantalla provisoria: el mapa de calor se construye en T009 (docs/PLAN.md §6.5).
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">
        Mapa del delito · San Salvador de Jujuy
      </h1>
      <p className="max-w-md text-zinc-600">
        Datos oficiales y reportes ciudadanos no verificados para la prevención
        del delito.
      </p>
    </main>
  );
}
