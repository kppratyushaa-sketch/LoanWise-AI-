import React from 'react';

interface CreditScoreGaugeProps {
  score: number; // 300 to 900
  showDetails?: boolean;
}

export const CreditScoreGauge: React.FC<CreditScoreGaugeProps> = ({ score, showDetails = true }) => {
  const minScore = 300;
  const maxScore = 900;
  const clampedScore = Math.max(minScore, Math.min(maxScore, score));
  const percentage = Math.max(0, Math.min(100, ((clampedScore - minScore) / (maxScore - minScore)) * 100));

  let tier = 'Subprime (< 650)';
  let tierColor = 'text-red-600';
  let badgeBg = 'bg-red-50 text-red-700 border-red-200';
  let tierDesc = 'Elevated credit risk. Higher borrowing costs or collateral typically required.';

  if (clampedScore >= 750) {
    tier = 'Excellent / Tier-1 Prime';
    tierColor = 'text-emerald-600';
    badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    tierDesc = 'Top-tier creditworthiness. Eligible for lowest retail interest rates.';
  } else if (clampedScore >= 700) {
    tier = 'Good / Near-Prime';
    tierColor = 'text-blue-600';
    badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';
    tierDesc = 'Solid credit standing. Meets standard prime bank qualification criteria.';
  } else if (clampedScore >= 650) {
    tier = 'Fair / Moderate';
    tierColor = 'text-amber-600';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
    tierDesc = 'Acceptable baseline. May face tighter debt-to-income restrictions.';
  }

  // Semicircle arc constants
  const size = 220;
  const strokeWidth = 14;
  const center = size / 2;
  const radius = 80;
  // Semicircle arc length = PI * radius
  const arcLength = Math.PI * radius;
  const strokeOffset = arcLength * (1 - percentage / 100);

  // Needle angle from -180 (left) to 0 (right)
  const angleDeg = -180 + (percentage / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;
  const needleLength = radius - 16;
  const needleX = center + needleLength * Math.cos(angleRad);
  const needleY = center + needleLength * Math.sin(angleRad);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Visual Semicircular Speedometer */}
      <div className="relative flex flex-col items-center justify-center">
        <svg width={size} height={125} viewBox={`0 0 ${size} 125`} className="overflow-visible">
          <defs>
            <linearGradient id="creditScoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Colored Value Arc */}
          <path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            fill="none"
            stroke="url(#creditScoreGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arcLength}`}
            strokeDashoffset={`${strokeOffset}`}
            className="transition-all duration-1000 ease-out"
          />

          {/* Needle Center Pivot Base */}
          <circle cx={center} cy={center} r={6} fill="#173B70" />
          <circle cx={center} cy={center} r={2.5} fill="#FFFFFF" />

          {/* Needle Pointer */}
          <line
            x1={center}
            y1={center}
            x2={needleX}
            y2={needleY}
            stroke="#173B70"
            strokeWidth={3}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Clean Center Readout Positioned Properly */}
        <div className="text-center -mt-6">
          <div className="text-4xl font-black tracking-tight font-mono" style={{ color: tierColor === 'text-emerald-600' ? '#059669' : tierColor === 'text-blue-600' ? '#2563EB' : tierColor === 'text-amber-600' ? '#D97706' : '#DC2626' }}>
            {clampedScore}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Credit Bureau Score
          </div>
        </div>
      </div>

      {/* Structured Scale Axis */}
      <div className="w-full max-w-[210px] flex items-center justify-between text-[10px] font-semibold text-slate-400 mt-2 px-1 border-t border-slate-100 pt-1.5">
        <span>300 Min</span>
        <span>650</span>
        <span>750</span>
        <span>900 Max</span>
      </div>

      {/* Tier Badge */}
      <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${badgeBg}`}>
        {tier}
      </div>

      {showDetails && (
        <p className="mt-2 text-center text-xs text-slate-500 max-w-[240px] leading-relaxed">
          {tierDesc}
        </p>
      )}
    </div>
  );
};
