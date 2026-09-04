interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export default function Spinner({ size = 'md', className = '', label }: SpinnerProps) {
  const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : '';
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className={`spinner ${sizeClass}`} />
      {label && <p className="text-sm text-navy-400 animate-pulse">{label}</p>}
    </div>
  );
}
