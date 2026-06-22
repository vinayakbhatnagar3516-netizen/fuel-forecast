"use client";

import { useState } from "react";

export default function TrendsPage() {
  const [fuelType, setFuelType] = useState("combined");
  const [horizon, setHorizon] = useState("30");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="page-heading"><span className="accent">Forecast</span> Engine</div>
        <div className="page-sub">Generate predictions · Quantile bands · Model parameters</div>
      </div>

      <div className="grid-2">
        {/* Forecast Chart */}
        <div className="card-slate">
          <h3 className="heading-sm mb-3">30-Day Demand Forecast</h3>
          <p className="text-[11px] text-[#5a626d] mb-3">CatBoost quantile model · q05–q95 bands</p>
          <div className="w-full h-[200px]">
            <svg viewBox="0 0 500 200" preserveAspectRatio="none" className="w-full h-full">
              <line x1="0" y1="40" x2="500" y2="40" stroke="#e4e8ed" strokeWidth="0.5"/>
              <line x1="0" y1="80" x2="500" y2="80" stroke="#e4e8ed" strokeWidth="0.5"/>
              <line x1="0" y1="120" x2="500" y2="120" stroke="#e4e8ed" strokeWidth="0.5"/>
              <line x1="0" y1="160" x2="500" y2="160" stroke="#e4e8ed" strokeWidth="0.5"/>
              <path d="M0,160 L40,154 L80,149 L120,143 L160,136 L200,131 L240,125 L280,120 L320,114 L360,108 L400,103 L440,98 L500,92 L500,55 L440,62 L400,67 L360,72 L320,78 L280,84 L240,90 L200,95 L160,100 L120,106 L80,112 L40,118 L0,126 Z" fill="rgba(37,99,235,0.06)"/>
              <path d="M0,150 L40,143 L80,136 L120,130 L160,124 L200,118 L240,111 L280,106 L320,101 L360,96 L400,90 L440,86 L500,82 L500,63 L440,68 L400,73 L360,78 L320,84 L280,90 L240,96 L200,102 L160,108 L120,114 L80,120 L40,126 L0,133 Z" fill="rgba(37,99,235,0.08)"/>
              <path d="M0,136 L40,128 L80,122 L120,116 L160,110 L200,105 L240,100 L280,96 L320,92 L360,88 L400,84 L440,80 L500,78 L500,70 L440,73 L400,77 L360,81 L320,85 L280,89 L240,93 L200,98 L160,103 L120,108 L80,114 L40,120 L0,128 Z" fill="rgba(37,99,235,0.12)"/>
              <polyline fill="none" stroke="#2563eb" strokeWidth="1.5" points="0,128 40,120 80,114 120,108 160,103 200,98 240,94 280,90 320,87 360,84 400,80 440,78 500,76"/>
              <text x="8" y="164" fontFamily="monospace" fontSize="6" fill="#8a94a0">5K</text>
              <text x="8" y="124" fontFamily="monospace" fontSize="6" fill="#8a94a0">6K</text>
              <text x="8" y="84" fontFamily="monospace" fontSize="6" fill="#8a94a0">7K</text>
              <text x="8" y="44" fontFamily="monospace" fontSize="6" fill="#8a94a0">8K</text>
            </svg>
          </div>
          <div className="flex gap-4 text-[11px] font-mono text-[#8a94a0] mt-2">
            <span><span className="inline-block w-3 h-0.5 bg-[#2563eb] mr-1"></span>q50 median</span>
            <span><span className="inline-block w-3 h-2 bg-[rgba(37,99,235,0.12)] border border-[rgba(37,99,235,0.1)] mr-1"></span>q25–q75</span>
            <span><span className="inline-block w-3 h-2 bg-[rgba(37,99,235,0.06)] border border-[rgba(37,99,235,0.05)] mr-1"></span>q05–q95</span>
            <span className="ml-auto">Coverage: 87.3%</span>
          </div>
        </div>

        {/* Controls */}
        <div className="card-slate">
          <h3 className="heading-sm mb-4">Run Forecast</h3>
          <div className="form-group">
            <label>Fuel Type</label>
            <select className="form-select" value={fuelType} onChange={e => setFuelType(e.target.value)}>
              <option value="combined">Combined</option>
              <option value="Petrol">Petrol</option>
              <option value="High-Speed Diesel">High-Speed Diesel</option>
            </select>
          </div>
          <div className="form-group">
            <label>Horizon</label>
            <select className="form-select" value={horizon} onChange={e => setHorizon(e.target.value)}>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
          <div className="form-group">
            <label>Model</label>
            <select className="form-select">
              <option>CatBoost v3.0 (production)</option>
              <option>CatBoost v2.9 (stable)</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn btn-primary">Generate Forecast</button>
            <button className="btn btn-outline">Schedule Daily</button>
          </div>
          <hr className="my-4 border-[#d0d5db]" />
          <div className="stat-label">Last Run</div>
          <div className="text-[12px] font-mono text-[#5a626d]">21 Jun 2026, 06:30 IST · 270 rows · 30 days</div>
        </div>
      </div>

      {/* Forecast Accuracy Table */}
      <div className="card-accent accent-slate">
        <h3 className="heading-sm mb-3">Forecast Accuracy · Last 7 Days</h3>
        <p className="text-[11px] text-[#5a626d] mb-3">Petrol · CatBoost quantile model · Conformal calibration</p>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Actual</th><th>q50</th><th>q05–q95</th><th>Error</th><th>±%</th><th>Covered</th></tr>
            </thead>
            <tbody>
              <tr><td>15 Jun</td><td className="mono">5,920</td><td className="mono">5,800</td><td>4,900–6,700</td><td className="mono up">+120</td><td className="up">+2.1%</td><td className="text-[#059669] font-semibold">✓</td></tr>
              <tr><td>16 Jun</td><td className="mono">6,100</td><td className="mono">5,950</td><td>5,000–7,000</td><td className="mono up">+150</td><td className="up">+2.5%</td><td className="text-[#059669] font-semibold">✓</td></tr>
              <tr><td>17 Jun</td><td className="mono">5,740</td><td className="mono">6,100</td><td>5,100–7,200</td><td className="mono dn">−360</td><td className="dn">−5.9%</td><td className="text-[#059669] font-semibold">✓</td></tr>
              <tr><td>18 Jun</td><td className="mono">6,350</td><td className="mono">6,200</td><td>5,200–7,300</td><td className="mono up">+150</td><td className="up">+2.4%</td><td className="text-[#059669] font-semibold">✓</td></tr>
              <tr><td>19 Jun</td><td className="mono">5,880</td><td className="mono">6,050</td><td>5,100–7,100</td><td className="mono dn">−170</td><td className="dn">−2.8%</td><td className="text-[#059669] font-semibold">✓</td></tr>
              <tr><td>20 Jun</td><td className="mono">6,420</td><td className="mono">6,150</td><td>5,150–7,250</td><td className="mono up">+270</td><td className="up">+4.4%</td><td className="text-[#059669] font-semibold">✓</td></tr>
            </tbody>
          </table>
        </div>
        <div className="flex gap-6 text-[11px] text-[#8a94a0] mt-3">
          <span>MAPE: 3.35%</span>
          <span>Coverage: 100% (6/6)</span>
          <span>CatBoost · 28 features · Conformal calibration</span>
        </div>
      </div>
    </div>
  );
}
