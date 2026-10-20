interface Props {
  target: Date;
  now: number;
  label: string;
}

function diff(target: Date, now: number) {
  const ms = Math.max(0, target.getTime() - now);
  return {
    Days: Math.floor(ms / 86_400_000),
    Hours: Math.floor((ms / 3_600_000) % 24),
    Minutes: Math.floor((ms / 60_000) % 60),
    Seconds: Math.floor((ms / 1000) % 60),
  };
}

export default function Countdown({ target, now, label }: Props) {
  const t = diff(target, now);
  return (
    <div className="countdown" role="timer" aria-label={label}>
      {Object.entries(t).map(([name, value]) => (
        <div className="countdown__box" key={name}>
          <span className="countdown__num">{String(value).padStart(2, '0')}</span>
          <span className="countdown__label">{name}</span>
        </div>
      ))}
    </div>
  );
}
