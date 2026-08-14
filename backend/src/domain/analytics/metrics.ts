const roundToPrecision = (value: number, decimals: number): number => {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export const calculateAnswerRate = (totalQueries: number, answeredQueries: number): number => {
  if (totalQueries <= 0) return 0
  return roundToPrecision(answeredQueries / totalQueries, 4)
}

export const calculateShare = (total: number, partial: number): number => {
  if (total <= 0) return 0
  return roundToPrecision(partial / total, 4)
}
