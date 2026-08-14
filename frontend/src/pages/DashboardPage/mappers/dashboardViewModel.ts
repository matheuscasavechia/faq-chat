import type { RankedQuestionItem } from '@/components/dashboard/RankedQuestionList'
import type { AnalyticsOverview, TopQuestion, UnansweredQuestion } from '@/types/analytics'
import { formatInteger, formatPercent, formatRelativeDay } from '@/utils/formatters'
import type { KpiViewModel } from '../types'

const PLACEHOLDER_VALUE = '—'

const answerRateTone = (overview: AnalyticsOverview): KpiViewModel['tone'] => {
  if (overview.totalQueries === 0) return 'neutral'
  return overview.answerRate >= 0.8 ? 'positive' : 'attention'
}

export const toKpis = (overview: AnalyticsOverview | null): KpiViewModel[] => {
  if (!overview) {
    return [
      {
        label: 'Total queries',
        value: PLACEHOLDER_VALUE,
        hint: 'Questions received',
        tone: 'neutral',
      },
      { label: 'Answered', value: PLACEHOLDER_VALUE, hint: 'Matched a FAQ', tone: 'neutral' },
      {
        label: 'Unanswered',
        value: PLACEHOLDER_VALUE,
        hint: 'No confident match',
        tone: 'neutral',
      },
      { label: 'Answer rate', value: PLACEHOLDER_VALUE, hint: 'Answered / total', tone: 'neutral' },
    ]
  }

  return [
    {
      label: 'Total queries',
      value: formatInteger(overview.totalQueries),
      hint: `${formatInteger(overview.uniqueSessions)} distinct sessions`,
      tone: 'neutral',
    },
    {
      label: 'Answered',
      value: formatInteger(overview.answeredQueries),
      hint:
        overview.averageSimilarity === null
          ? 'Matched a registered FAQ'
          : `Average match ${formatPercent(overview.averageSimilarity)}`,
      tone: 'neutral',
    },
    {
      label: 'Unanswered',
      value: formatInteger(overview.unansweredQueries),
      hint: 'Knowledge base gaps to review',
      tone: overview.unansweredQueries > 0 ? 'attention' : 'neutral',
    },
    {
      label: 'Answer rate',
      value: formatPercent(overview.answerRate),
      hint: 'Share of questions answered',
      tone: answerRateTone(overview),
    },
  ]
}

export const toRankedQuestions = (questions: TopQuestion[]): RankedQuestionItem[] => {
  const highestTotal = questions[0]?.total ?? 0

  return questions.map((question) => ({
    id: question.faqId,
    question: question.question,
    total: question.total,
    share: highestTotal === 0 ? 0 : question.total / highestTotal,
    meta: `${question.categoryName} · ${formatPercent(question.share)} of all queries · last asked ${formatRelativeDay(question.lastAskedAt)}`,
  }))
}

export const toRankedUnansweredQuestions = (
  questions: UnansweredQuestion[],
  unansweredTotal: number,
): RankedQuestionItem[] => {
  const highestTotal = questions[0]?.total ?? 0

  return questions.map((question, index) => ({
    id: `${String(index)}-${question.question}`,
    question: question.question,
    total: question.total,
    share: highestTotal === 0 ? 0 : question.total / highestTotal,
    meta:
      unansweredTotal === 0
        ? `last asked ${formatRelativeDay(question.lastAskedAt)}`
        : `${formatPercent(question.total / unansweredTotal)} of unanswered · last asked ${formatRelativeDay(question.lastAskedAt)}`,
  }))
}
