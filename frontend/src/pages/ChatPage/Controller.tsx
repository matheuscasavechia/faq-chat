import { useChat } from './hooks/useChat'
import { useKnowledgeBase } from './hooks/useKnowledgeBase'
import { ChatPageLayout } from './Layout'

export const ChatPage = (): React.JSX.Element => {
  const chat = useChat()
  const knowledgeBase = useKnowledgeBase()

  return <ChatPageLayout {...chat} {...knowledgeBase} />
}
