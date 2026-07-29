import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from "recharts";
import { useThemeContext } from "../../context/ThemeContext";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const STATUS_COLORS = {
  Pending: "#f59e0b",
  Confirmed: "#3b82f6",
  Processing: "#8b5cf6",
  Packed: "#06b6d4",
  Shipped: "#6366f1",
  "Out For Delivery": "#f97316",
  Delivered: "#10b981",
  Cancelled: "#ef4444",
  Returned: "#ec4899",
  Refunded: "#78716c",
};

export default function AnalyticsCharts({ products = [], categories = [], dashboardStats = null }) {
  const { theme } = useThemeContext();
  const isDark = theme === "dark";

  const gridStroke = isDark ? "#44403c" : "#f5f5f4";
  const axisStroke = isDark ? "#78716c" : "#a8a29e";
  const cardBg = isDark ? "bg-stone-900 border-stone-800" : "bg-white border-stone-100";
  const titleColor = isDark ? "text-stone-100" : "text-stone-900";
  const tooltipStyle = isDark
    ? { background: "#1c1917", border: "1px solid #44403c", borderRadius: "12px", fontSize: "11px", color: "#e7e5e4" }
    : { background: "#fffbf5", border: "1px solid #e7e5e4", borderRadius: "12px", fontSize: "11px" };

  // ── Chart 1: Monthly Revenue from API ──────────────────────────────────────
  const monthlySales = dashboardStats?.monthlySales || [];
  const revenueData = [...monthlySales]
    .sort((a, b) => {
      if (a._id.year !== b._id.year) return a._id.year - b._id.year;
      return a._id.month - b._id.month;
    })
    .map((d) => ({
      month: `${MONTH_NAMES[(d._id.month || 1) - 1]} ${String(d._id.year).slice(-2)}`,
      revenue: Math.round(d.revenue || 0),
      orders: d.orders || 0,
    }));

  // ── Chart 2: Orders by Status ───────────────────────────────────────────────
  const ordersByStatus = dashboardStats?.ordersByStatus || {};
  const statusData = Object.entries(ordersByStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ name: status, value: count }));

  // ── Chart 3: Top Products by sold count ────────────────────────────────────
  const topProducts = dashboardStats?.topProducts || [];
  const topProductsData = topProducts.length > 0
    ? topProducts.map((p) => ({
        name: p.name.length > 16 ? p.name.slice(0, 16) + "…" : p.name,
        sold: p.soldCount || 0,
        revenue: Math.round((p.soldCount || 0) * (p.price || 0)),
      }))
    : [...products]
        .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
        .slice(0, 5)
        .map((p) => ({
          name: p.name.length > 16 ? p.name.slice(0, 16) + "…" : p.name,
          sold: p.soldCount || 0,
          revenue: Math.round((p.soldCount || 0) * (p.price || 0)),
        }));

  // ── Chart 4: Stock Levels ───────────────────────────────────────────────────
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const healthyStock = products.filter((p) => p.stock > 10).length;
  const stockData = [
    { name: "Out of Stock", count: outOfStock, color: "#ef4444" },
    { name: "Low (1–10)", count: lowStock, color: "#f59e0b" },
    { name: "Healthy (>10)", count: healthyStock, color: "#10b981" },
  ];

  const totalOrders = statusData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6" id="dashboard-analytics-grid">

      {/* ── Row 1: Revenue Trend + Order Status ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Monthly Revenue Area Chart */}
        <div className={`${cardBg} p-5 rounded-2xl border shadow-xs flex flex-col lg:col-span-2`} style={{ height: "360px" }}>
          <div className="mb-4">
            <h3 className={`font-sans font-bold ${titleColor} text-sm tracking-tight`}>Monthly Revenue Trend</h3>
            <p className="text-stone-400 text-[10px] font-medium mt-0.5">
              {revenueData.length > 0
                ? `Last ${revenueData.length} months · Total Rs. ${(dashboardStats?.stats?.totalRevenue || 0).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`
                : "Connect backend to see live revenue data"}
            </p>
          </div>
          <div className="flex-1 min-h-0">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#292524" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#292524" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="month" stroke={axisStroke} fontSize={9} tickLine={false} />
                  <YAxis stroke={axisStroke} fontSize={9} tickLine={false} tickFormatter={(v) => `Rs.${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(val, name) => [
                      name === "revenue" ? `Rs. ${val.toLocaleString("en-PK")}` : val,
                      name === "revenue" ? "Revenue" : "Orders",
                    ]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={2} fill="url(#revenueGrad)" dot={false} />
                  <Area type="monotone" dataKey="orders" stroke="#292524" strokeWidth={1.5} fill="url(#ordersGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-stone-300">
                <span className="text-4xl">📈</span>
                <p className="text-xs font-medium text-stone-400">Revenue data loads from the backend API</p>
              </div>
            )}
          </div>
        </div>

        {/* Orders by Status Donut */}
        <div className={`${cardBg} p-5 rounded-2xl border shadow-xs flex flex-col`} style={{ height: "360px" }}>
          <div className="mb-4">
            <h3 className={`font-sans font-bold ${titleColor} text-sm tracking-tight`}>Orders by Status</h3>
            <p className="text-stone-400 text-[10px] font-medium mt-0.5">{totalOrders} total orders tracked</p>
          </div>
          {statusData.length > 0 ? (
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3">
              <div className="relative w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value">
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.name] || "#a8a29e"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className={`font-extrabold text-xl ${titleColor}`}>{totalOrders}</span>
                  <span className="text-stone-400 text-[9px] tracking-widest uppercase font-mono">Orders</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full max-w-xs">
                {statusData.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[s.name] || "#a8a29e" }} />
                    <span className="text-[10px] text-stone-500 font-medium truncate">{s.name}</span>
                    <span className={`text-[10px] font-bold ml-auto ${titleColor}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-stone-300">
              <span className="text-4xl">🛒</span>
              <p className="text-xs font-medium text-stone-400">Order data loads once backend is connected</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Top Products + Stock Levels ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Products Bar Chart */}
        <div className={`${cardBg} p-5 rounded-2xl border shadow-xs flex flex-col`} style={{ height: "320px" }}>
          <div className="mb-4">
            <h3 className={`font-sans font-bold ${titleColor} text-sm tracking-tight`}>Top Selling Products</h3>
            <p className="text-stone-400 text-[10px] font-medium mt-0.5">By units sold</p>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="name" stroke={axisStroke} fontSize={9} tickLine={false} />
                <YAxis stroke={axisStroke} fontSize={9} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="sold" name="Units Sold" fill="#d97706" radius={[4, 4, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Levels Horizontal Bar */}
        <div className={`${cardBg} p-5 rounded-2xl border shadow-xs flex flex-col`} style={{ height: "320px" }}>
          <div className="mb-4">
            <h3 className={`font-sans font-bold ${titleColor} text-sm tracking-tight`}>Inventory Health</h3>
            <p className="text-stone-400 text-[10px] font-medium mt-0.5">{products.length} total SKUs tracked</p>
          </div>
          <div className="flex-1 min-h-0 flex flex-col justify-center gap-6 py-2">
            {stockData.map((item) => {
              const pct = products.length > 0 ? Math.round((item.count / products.length) * 100) : 0;
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                      <span className="font-medium text-stone-600">{item.name}</span>
                    </div>
                    <span className={`font-bold font-mono ${titleColor}`}>{item.count} <span className="text-stone-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Category breakdown */}
            <div className="pt-3 border-t border-stone-100 space-y-1.5">
              <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest font-mono block">By Category</span>
              {categories.slice(0, 4).map((cat) => {
                const count = products.filter((p) => p.category === cat.name).length;
                return (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <span className="text-stone-500 font-medium truncate">{cat.name}</span>
                    <span className={`font-bold font-mono text-[11px] ${titleColor}`}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
