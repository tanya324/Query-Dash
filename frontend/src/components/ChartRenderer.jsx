import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

const COLORS = ['#00b8d9', '#f5a623', '#e63946', '#22c55e', '#a78bfa', '#fb923c']

const TIP_STYLE = {
  backgroundColor: '#111827',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#f0f4ff',
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 12,
  padding: '9px 13px',
}

const AXIS_PROPS = {
  tick: { fill: '#445577', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 },
  axisLine: { stroke: 'rgba(255,255,255,0.05)' },
  tickLine: false,
}

const GRID_PROPS = {
  stroke: 'rgba(255,255,255,0.05)',
  strokeDasharray: '4 4',
}

export default function ChartRenderer({ chartType, labels = [], data = [], name = 'Value' }) {
  if (!data?.length || !labels?.length) return null

  const chartData = labels.map((label, i) => ({
    name:  label,
    value: data[i] ?? 0,
  }))

  /* ── Line chart ── */
  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis
            dataKey="name"
            {...AXIS_PROPS}
            tick={{ ...AXIS_PROPS.tick }}
            interval="preserveStartEnd"
          />
          <YAxis
            {...AXIS_PROPS}
            tickFormatter={v => `${v}M`}
          />
          <Tooltip
            contentStyle={TIP_STYLE}
            formatter={v => [`${v}M views`, name]}
            cursor={{ stroke: 'rgba(0,184,217,0.2)', strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#00b8d9"
            strokeWidth={2.5}
            fill="rgba(0,184,217,0.08)"
            dot={{ fill: '#00b8d9', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 7, fill: '#00b8d9', stroke: 'rgba(0,184,217,0.3)', strokeWidth: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  /* ── Area chart ── */
  if (chartType === 'area') {
    return (
      <ResponsiveContainer width="100%" height={340}>
        <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="name" {...AXIS_PROPS} />
          <YAxis {...AXIS_PROPS} />
          <Tooltip contentStyle={TIP_STYLE} formatter={v => [v, name]} cursor={{ stroke: 'rgba(0,184,217,0.2)' }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#00b8d9"
            fill="rgba(0,184,217,0.1)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  /* ── Bar chart ── */
  if (chartType === 'bar') {
    const hasNeg = data.some(v => v < 0)
    return (
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }} barCategoryGap="38%">
          <CartesianGrid {...GRID_PROPS} vertical={false} />
          <XAxis dataKey="name" {...AXIS_PROPS} />
          <YAxis {...AXIS_PROPS} />
          <Tooltip
            contentStyle={TIP_STYLE}
            formatter={v => [v, name]}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="value" radius={[5, 5, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  hasNeg
                    ? entry.value >= 0 ? '#00b8d9' : '#e63946'
                    : COLORS[i % COLORS.length]
                }
                fillOpacity={0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  /* ── Pie / Donut chart ── */
  if (chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={340}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={90}
            outerRadius={145}
            paddingAngle={3}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TIP_STYLE}
            formatter={v => [`${v}%`, '']}
          />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return null
}
