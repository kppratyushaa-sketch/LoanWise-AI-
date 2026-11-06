import React from 'react';

interface RiskScoreGaugeProps {
  score: number; // 0 to 100 (0=safest, 100=highest risk)
  showDetails?: boolean;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({ score, showDetails = true }) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  let category = 'Low Risk';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let categoryColor = '#059669';
  let riskDesc = 'High probability of loan approval with prime retail banking terms.';

  if (clampedScore > 65) {
    category = 'High Risk';
    badgeBg = 'bg-red-50 text-red-700 border-red-200';
    categoryColor = '#DC2626';
    riskDesc = 'Elevated probability of rejection or severe collateral prerequisites.';
  } else if (clampedScore > 35) {
    category = 'Moderate Risk';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
    categoryColor = '#D97706';
    riskDesc = 'Standard retail risk. Requires underwriting cashflow verification.';
  }

  // Semicircle arc constants
  const size = 220;
  const strokeWidth = 14;
  const center = size / 2;
  const radius = 80;
  const arcLength = Math.PI * radius;
  const strokeOffset = arcLength * (1 - clampedScore / 100);

  // Needle angle from -180 (left, 0 risk) to 0 (right, 100 risk)
  const angleDeg = -180 + (clampedScore / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;
  const needleLength = radius - 16;
  const needleX = center + needleLength * Math.cos(angleRad);
  const needleY = center + needleLength * Math.sin(angleRad);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Semicircular Risk Gauge */}
      <div className="relative flex flex-col items-center justify-center">
        <svg width={size} height={125} viewBox={`0 0 ${size} 125`} className="overflow-visible">
          <defs>
            <linearGradient id="riskScoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
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
            stroke="url(#riskScoreGrad)"
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

        {/* Clean Center Readout */}
        <div className="text-center -mt-6">
          <div className="text-4xl font-black tracking-tight font-mono" style={{ color: categoryColor }}>
            {clampedScore}
            <span className="text-base font-normal text-slate-400">/100</span>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
            Credit Risk Index
          </div>
        </div>
      </div>

      {/* Structured Scale Axis */}
      <div className="w-full max-w-[210px] flex items-center justify-between text-[10px] font-semibold text-slate-400 mt-2 px-1 border-t border-slate-100 pt-1.5">
        <span className="text-emerald-600 font-bold">0 Safe</span>
        <span>35</span>
        <span>65</span>
        <span className="text-red-600 font-bold">100 High</span>
      </div>

      {/* Risk Category Badge */}
      <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${badgeBg}`}>
        {category}
      </div>

      {showDetails && (
        <p className="mt-2 text-center text-xs text-slate-500 max-w-[240px] leading-relaxed">
          {riskDesc}
        </p>
      )}
    </div>
  );
};
