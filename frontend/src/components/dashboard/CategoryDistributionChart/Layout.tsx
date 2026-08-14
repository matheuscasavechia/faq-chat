import { memo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts'
import { CHART_COLORS } from '@/constants/colors'
import { CHART_TYPOGRAPHY } from '@/constants/typography'
import { formatInteger, formatPercent } from '@/utils/formatters'
import { styles } from './styles'
import type { CategoryDistributionChartProps } from './types'

const ROW_HEIGHT = 34
const MIN_HEIGHT = 160

const CategoryTooltip = ({
  active,
  payload,
}: TooltipProps<number, string>): React.JSX.Element | null => {
  const slice = payload?.[0]?.payload as
    { categoryName: string; total: number; share: number } | undefined

  if (!active || !slice) return null

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{slice.categoryName}</p>
      <p className={styles.tooltipDetail}>
        {formatInteger(slice.total)} answered queries · {formatPercent(slice.share)} of the total
      </p>
    </div>
  )
}

const CategoryDistributionChartComponent = ({
  slices,
}: CategoryDistributionChartProps): React.JSX.Element => (
  <div
    className={styles.wrapper}
    style={{ height: `${Math.max(MIN_HEIGHT, slices.length * ROW_HEIGHT + 24)}px` }}
  >
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={slices} layout="vertical" margin={{ top: 4, right: 44, bottom: 4, left: 4 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          stroke={CHART_COLORS.axis}
          tick={{ fill: CHART_COLORS.label, fontSize: CHART_TYPOGRAPHY.tickFontSize }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="categoryName"
          stroke={CHART_COLORS.axis}
          tick={{ fill: CHART_COLORS.label, fontSize: CHART_TYPOGRAPHY.tickFontSize }}
          tickLine={false}
          width={92}
        />
        <Tooltip content={<CategoryTooltip />} cursor={{ fill: 'transparent' }} />
        <Bar
          dataKey="total"
          name="Answered queries"
          fill={CHART_COLORS.answered}
          radius={[0, 4, 4, 0]}
          barSize={14}
        >
          <LabelList
            dataKey="total"
            position="right"
            fill={CHART_COLORS.label}
            fontSize={CHART_TYPOGRAPHY.labelFontSize}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
)

export const CategoryDistributionChart = memo(CategoryDistributionChartComponent)
