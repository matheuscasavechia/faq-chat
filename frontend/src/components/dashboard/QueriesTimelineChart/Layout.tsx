import { memo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts'
import { CHART_COLORS } from '@/constants/colors'
import { CHART_MARGIN } from '@/constants/spacing'
import { CHART_TYPOGRAPHY } from '@/constants/typography'
import { formatInteger } from '@/utils/formatters'
import { styles } from './styles'
import type { QueriesTimelineChartProps } from './types'

const SERIES = [
  { key: 'answered', label: 'Answered', color: CHART_COLORS.answered },
  { key: 'unanswered', label: 'Unanswered', color: CHART_COLORS.unanswered },
] as const

const TimelineTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>): React.JSX.Element | null => {
  if (!active || !payload || payload.length === 0) return null

  const total = payload.reduce((sum, entry) => sum + (entry.value ?? 0), 0)

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{String(label)}</p>
      {payload.map((entry) => (
        <p key={entry.name} className={styles.tooltipRow}>
          <span>
            <span className={styles.swatch} style={{ backgroundColor: entry.color }} />
            {entry.name}
          </span>
          <span className={styles.tooltipValue}>{formatInteger(entry.value ?? 0)}</span>
        </p>
      ))}
      <p className={styles.tooltipRow}>
        <span>Total</span>
        <span className={styles.tooltipValue}>{formatInteger(total)}</span>
      </p>
    </div>
  )
}

const QueriesTimelineChartComponent = ({
  points,
}: QueriesTimelineChartProps): React.JSX.Element => (
  <div className={styles.wrapper}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={points} margin={CHART_MARGIN}>
        <defs>
          {SERIES.map((series) => (
            <linearGradient key={series.key} id={`fill-${series.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series.color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={series.color} stopOpacity={0.04} />
            </linearGradient>
          ))}
        </defs>

        <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          stroke={CHART_COLORS.axis}
          tick={{ fill: CHART_COLORS.label, fontSize: CHART_TYPOGRAPHY.tickFontSize }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          allowDecimals={false}
          stroke={CHART_COLORS.axis}
          tick={{ fill: CHART_COLORS.label, fontSize: CHART_TYPOGRAPHY.tickFontSize }}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<TimelineTooltip />} cursor={{ stroke: CHART_COLORS.axis }} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: CHART_TYPOGRAPHY.tickFontSize, color: CHART_COLORS.label }}
        />

        {SERIES.map((series) => (
          <Area
            key={series.key}
            type="monotone"
            dataKey={series.key}
            name={series.label}
            stackId="queries"
            stroke={series.color}
            strokeWidth={2}
            fill={`url(#fill-${series.key})`}
            activeDot={{ r: 4, strokeWidth: 2, stroke: CHART_COLORS.surface }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  </div>
)

export const QueriesTimelineChart = memo(QueriesTimelineChartComponent)
