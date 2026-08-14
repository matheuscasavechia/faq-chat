import { cx } from '@/utils/cx'
import classes from './styles.module.css'

export const styles = {
  row: (isUser: boolean): string =>
    cx(classes.row, isUser ? classes.rowUser : classes.rowAssistant),
  meta: cx(classes.meta),
  userBubble: (hasFailed: boolean): string =>
    cx(classes.bubble, classes.bubbleUser, hasFailed && classes.bubbleFailed),
  assistantBubble: (isUnanswered: boolean): string =>
    cx(classes.bubble, classes.bubbleAssistant, isUnanswered && classes.bubbleUnanswered),
  answerFooter: cx(classes.answerFooter),
  suggestions: cx(classes.suggestions),
  suggestionsLabel: cx(classes.suggestionsLabel),
  suggestionList: cx(classes.suggestionList),
}
