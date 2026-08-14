import { CategoryDistributionChart } from '@/components/dashboard/CategoryDistributionChart'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { PeriodFilter } from '@/components/dashboard/PeriodFilter'
import { QueriesTimelineChart } from '@/components/dashboard/QueriesTimelineChart'
import { RankedQuestionList } from '@/components/dashboard/RankedQuestionList'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Skeleton, SkeletonList } from '@/components/feedback/Skeleton'
import { StateMessage } from '@/components/feedback/StateMessage'
import { Card } from '@/components/ui/Card'
import { styles } from './styles'
import type { DashboardPageLayoutProps } from './types'

const KPI_SKELETON_COUNT = 4

export const DashboardPageLayout = ({
  rangeLabel,
  isInitialLoading,
  isRefreshing,
  hasData,
  isEmpty,
  errorMessage,
  lastUpdatedLabel,
  kpis,
  timeline,
  categoryDistribution,
  topQuestions,
  unansweredQuestions,
  onRetry,
}: DashboardPageLayoutProps): React.JSX.Element => {
  const hasBlockingError = errorMessage !== null && !hasData

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Analytics dashboard</h1>
          <p className={styles.description}>
            Everything below is aggregated in PostgreSQL from the interactions the assistant
            recorded. Ask a question in the assistant and the numbers move.
          </p>
        </div>
        <div className={styles.controls}>
          <PeriodFilter isDisabled={isInitialLoading} />
        </div>
      </header>

      <p className={styles.status} role="status">
        {isInitialLoading
          ? 'Loading analytics…'
          : isRefreshing
            ? `${rangeLabel} · refreshing…`
            : lastUpdatedLabel
              ? `${rangeLabel} · updated at ${lastUpdatedLabel}`
              : rangeLabel}
      </p>

      {hasBlockingError ? (
        <ErrorState
          title="The dashboard could not be loaded"
          message={errorMessage}
          onRetry={onRetry}
        />
      ) : null}

      {errorMessage !== null && hasData ? (
        <ErrorState
          compact
          title="Showing the last data we loaded"
          message={errorMessage}
          onRetry={onRetry}
        />
      ) : null}

      {!hasBlockingError ? (
        <>
          <section className={styles.kpiGrid} aria-label="Key indicators">
            {isInitialLoading
              ? Array.from({ length: KPI_SKELETON_COUNT }, (_, index) => (
                  <Skeleton key={index} height="7.25rem" radius="var(--radius-lg)" />
                ))
              : kpis.map((kpi) => (
                  <KpiCard
                    key={kpi.label}
                    label={kpi.label}
                    value={kpi.value}
                    hint={kpi.hint}
                    tone={kpi.tone}
                    isRefreshing={isRefreshing}
                  />
                ))}
          </section>

          {isEmpty && !isInitialLoading ? (
            <StateMessage
              icon="📊"
              title="No interactions in this period"
              description="Ask a few questions in the assistant, or pick a wider period, and the charts will fill up."
            />
          ) : null}

          <section className={styles.chartGrid} aria-label="Query trends">
            <Card
              title="Queries over time"
              subtitle="Answered and unanswered questions per bucket (UTC)"
            >
              {isInitialLoading ? (
                <Skeleton height="17rem" radius="var(--radius-md)" label="Loading chart" />
              ) : (
                <div className={styles.refreshable(isRefreshing)}>
                  <QueriesTimelineChart points={timeline} />
                </div>
              )}
            </Card>

            <Card title="Queries by category" subtitle="Answered queries grouped by FAQ category">
              {isInitialLoading ? (
                <SkeletonList rows={5} label="Loading categories" />
              ) : categoryDistribution.length === 0 ? (
                <StateMessage
                  compact
                  title="No categorised queries yet"
                  description="Categories appear once questions are matched to registered FAQs."
                />
              ) : (
                <div className={styles.refreshable(isRefreshing)}>
                  <CategoryDistributionChart slices={categoryDistribution} />
                </div>
              )}
            </Card>
          </section>

          <section className={styles.listGrid} aria-label="Question rankings">
            <Card title="Most asked questions" subtitle="Registered FAQs ranked by usage">
              {isInitialLoading ? (
                <SkeletonList rows={4} label="Loading top questions" />
              ) : (
                <div className={styles.refreshable(isRefreshing)}>
                  <RankedQuestionList
                    items={topQuestions}
                    emptyMessage="No answered questions in this period yet."
                  />
                </div>
              )}
            </Card>

            <Card
              title="Questions without an answer"
              subtitle="Candidates for the next knowledge base update"
            >
              {isInitialLoading ? (
                <SkeletonList rows={4} label="Loading unanswered questions" />
              ) : (
                <div className={styles.refreshable(isRefreshing)}>
                  <RankedQuestionList
                    items={unansweredQuestions}
                    tone="attention"
                    emptyMessage="Every question in this period found an answer."
                  />
                </div>
              )}
            </Card>
          </section>
        </>
      ) : null}
    </div>
  )
}
