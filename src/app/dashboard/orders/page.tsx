"use client";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="page-heading"><span className="accent">Orders</span> &amp; Logistics</div>
        <div className="page-sub">Current recommendation · Lead time calculation · Order history</div>
      </div>

      <div className="grid-2">
        {/* Current Recommendation */}
        <div className="card-slate">
          <h3 className="heading-sm mb-4">Current Recommendation</h3>
          <div className="text-center py-4">
            <div className="text-[40px] font-[600] font-mono text-[#2563eb]" data-tip="Recommended order: Balanced policy">6,800 L</div>
            <div className="text-[12px] text-[#5a626d] mt-1">Petrol · Balanced policy</div>
          </div>
          <div className="grid-2 pt-4 border-t border-[#d0d5db]">
            <div data-tip="6,800 L × ₹94.50/L"><div className="stat-label">Order Cost</div><div className="text-[16px] font-mono font-semibold mt-1">₹6,42,600</div></div>
            <div data-tip="Purchase price per liter"><div className="stat-label">Per-Liter</div><div className="text-[16px] font-mono font-semibold mt-1">₹94.50</div></div>
            <div data-tip="Days from order to delivery"><div className="stat-label">Lead Time</div><div className="text-[16px] font-mono font-semibold text-[#2563eb] mt-1">3 days</div></div>
            <div data-tip="Probability of stockout before next delivery"><div className="stat-label">Stockout Risk</div><div className="text-[16px] font-mono font-semibold text-[#059669] mt-1">8.4%</div></div>
          </div>
        </div>

        {/* Lead Time Calculator */}
        <div className="card-accent accent-green">
          <h3 className="heading-sm mb-4">Lead Time Calculator</h3>
          <div className="grid-2">
            <div className="form-group">
              <label>Order Date</label>
              <input type="date" className="form-input" defaultValue="2026-06-22" />
            </div>
            <div className="form-group">
              <label>Supplier</label>
              <select className="form-select" defaultValue="jiobp">
                <option value="jiobp">Jio-BP Kandaghat</option>
                <option value="iocl">IOCL Express</option>
              </select>
            </div>
          </div>
          <div className="bg-[#eef1f4] rounded-sm p-3 mb-3">
            <div className="flex justify-between text-[12px]"><span>Processing:</span><span className="text-[#8a94a0] font-mono">1 day</span></div>
            <div className="flex justify-between text-[12px] mt-1"><span>Transit:</span><span className="text-[#8a94a0] font-mono">2 days</span></div>
            <div className="flex justify-between text-[14px] font-semibold mt-2 pt-2 border-t border-[#d0d5db]"><span>Estimated Delivery:</span><span className="text-[#2563eb]">25 Jun 2026</span></div>
          </div>
          <button className="btn btn-primary w-full" data-tip="Confirm order of 6,800 L Petrol">Confirm Order</button>
        </div>
      </div>

      {/* Order History */}
      <div className="card-accent accent-amber">
        <h3 className="heading-sm mb-3">Order History</h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Product</th><th>Qty</th><th>Supplier</th><th>Delivery</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr><td>15 Jun</td><td className="mono">Petrol</td><td className="mono">12,000 L</td><td>Jio-BP</td><td>18 Jun</td><td><span className="badge badge-green">Delivered</span></td></tr>
              <tr><td>08 Jun</td><td className="mono">HSD</td><td className="mono">8,000 L</td><td>IOCL</td><td>11 Jun</td><td><span className="badge badge-green">Delivered</span></td></tr>
              <tr><td>01 Jun</td><td className="mono">Petrol</td><td className="mono">10,000 L</td><td>Jio-BP</td><td>05 Jun</td><td><span className="badge badge-green">Delivered</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
