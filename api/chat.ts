import { 
  ChatRequest, 
  ChatResponse, 
  StreamingChatResponse, 
  ApiError,
  ChatStreamCallback,
  ChatErrorCallback,
  ChatCompleteCallback
} from '@/types/chat'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export class ChatAPI {
  private static baseUrl = `${API_BASE_URL}/ai`

  /**
   * Send a non-streaming chat request
   */
  static async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        stream: false,
      }),
    })

    if (!response.ok) {
      const error: ApiError = await response.json()
      throw new Error(error.error || 'Failed to send message')
    }

    return response.json()
  }

  /**
   * Send a streaming chat request using Server-Sent Events
   */
  static async sendStreamingMessage(
    request: ChatRequest,
    onChunk: ChatStreamCallback,
    onError: ChatErrorCallback,
    onComplete: ChatCompleteCallback
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          stream: true,
        }),
      })

      if (!response.ok) {
        const error: ApiError = await response.json()
        onError(error.error || 'Failed to send message')
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        onError('No response body available')
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              
              if (data === '[DONE]') {
                onComplete()
                return
              }

              try {
                const chunk: StreamingChatResponse = JSON.parse(data)
                onChunk(chunk)
              } catch (parseError) {
                console.warn('Failed to parse streaming chunk:', data)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unknown error occurred')
    }
  }

  /**
   * Check if the AI service is healthy
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      return response.ok
    } catch {
      return false
    }
  }
}

/**
 * Hook for easier React integration
 */
export const useChatAPI = () => {
  const sendMessage = async (content: string): Promise<ChatResponse> => {
    const request: ChatRequest = {
      messages: [{ role: 'user', content }],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1000,
    }
    
    return ChatAPI.sendMessage(request)
  }

  const sendStreamingMessage = (
    content: string,
    onChunk: ChatStreamCallback,
    onError: ChatErrorCallback,
    onComplete: ChatCompleteCallback
  ) => {
    const request: ChatRequest = {
      messages: [{ role: 'user', content }],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1000,
    }
    
    return ChatAPI.sendStreamingMessage(request, onChunk, onError, onComplete)
  }

  return {
    sendMessage,
    sendStreamingMessage,
    healthCheck: ChatAPI.healthCheck,
  }
}
