/** Slowly falling marigold petals (pure CSS animation). */
export default function Petals({ count = 14 }: { count?: number }) {
  return (
    <div className="petals" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 97) % 100}%`,
            animationDelay: `${(i * 1.3) % 9}s`,
            animationDuration: `${9 + (i % 5) * 2}s`,
            ['--drift' as string]: `${(i % 2 ? 1 : -1) * (30 + (i % 4) * 20)}px`,
            ['--size' as string]: `${8 + (i % 4) * 3}px`,
          }}
        />
      ))}
    </div>
  );
}
