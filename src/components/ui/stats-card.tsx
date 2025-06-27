

interface StatsCardProps {
  title: string;
  description: string;
  value: string | number;
  subtitle?: string;
  onExternalClick?: () => void;
}

export function StatsCard({ title, description, value, subtitle, onExternalClick }: StatsCardProps) {
  return (
    <div className="w-full text-black border grid grid-cols-2 justify-center p-4 gap-4 rounded-lg shadow-md" style={{ background: 'radial-gradient(circle, #fdfdfd, #f5f5f5)', borderColor: '#e5e7eb' }}>
      <div className="col-span-2 text-lg font-bold capitalize rounded-md" style={{ color: '#4b5563' }}>
        {title}
      </div>
      <div className="col-span-2 rounded-md">
        <div className="text-3xl font-bold mb-1" style={{ color: '#1f2937' }}>{value}</div>
        <div className="text-sm text-gray-500">{description}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
      </div>
      {onExternalClick && (
        <div className="col-span-1">
          <button 
            onClick={onExternalClick}
            className="rounded-md bg-white/20 hover:bg-white/30 hover:text-white duration-300 p-2"
            aria-label="Open external link"
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-external-link">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}