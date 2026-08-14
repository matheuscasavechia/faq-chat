import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { styles } from './styles'
import type { ChatComposerProps } from './types'

export const ChatComposer = ({
  value,
  isSending,
  canSubmit,
  maxLength,
  onChange,
  onSubmit,
}: ChatComposerProps): React.JSX.Element => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onSubmit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSubmit()
    }
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    onChange(event.target.value)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className="visually-hidden" htmlFor="chat-question">
          Your question
        </label>
        <textarea
          id="chat-question"
          className={styles.textarea}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about passwords, payments, delivery, cancellations…"
          rows={1}
          maxLength={maxLength}
          autoComplete="off"
          aria-describedby="chat-composer-hint"
        />
        <Button type="submit" disabled={!canSubmit} isLoading={isSending}>
          {isSending ? 'Sending' : 'Send'}
        </Button>
      </div>
      <div className={styles.footer}>
        <span id="chat-composer-hint">Press Enter to send · Shift + Enter for a new line</span>
        <span className={styles.counter}>
          {value.length}/{maxLength}
        </span>
      </div>
    </form>
  )
}
