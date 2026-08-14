import { atom } from 'jotai'
import { createSessionId } from '@/services/chatSession'

export const chatSessionIdAtom = atom<string>(createSessionId())
