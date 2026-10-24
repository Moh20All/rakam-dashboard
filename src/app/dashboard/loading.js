export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-8 w-56 rounded-lg bg-raised" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => <div key={i} className="card h-24" />)}
      </div>
      <div className="card mt-6 h-72" />
    </div>
  );
}
