export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  model?: string
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface ChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: ChatChoice[]
  usage: ChatUsage
}

export interface ChatChoice {
  index: number
  message: ChatMessage
  finish_reason: string
}

export interface ChatUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export interface StreamingChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: StreamingChoice[]
}

export interface StreamingChoice {
  index: number
  delta: StreamingDelta
  finish_reason?: string | null
}

export interface StreamingDelta {
  role?: string
  content?: string
}

export interface ApiError {
  error: string
}

export type ChatStreamCallback = (chunk: StreamingChatResponse) => void
export type ChatErrorCallback = (error: string) => void
export type ChatCompleteCallback = () => void
