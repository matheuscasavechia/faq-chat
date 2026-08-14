export interface ChatComposerProps {
  value: string
  isSending: boolean
  canSubmit: boolean
  maxLength: number
  onChange: (value: string) => void
  onSubmit: () => void
}
