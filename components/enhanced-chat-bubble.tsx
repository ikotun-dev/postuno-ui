"use client"

import { useState, useRef, useEffect } from "react"
import { Send, X, Bot, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChatAPI } from "@/api/chat"
import { ChatMessage, StreamingChatResponse } from "@/types/chat"

interface EnhancedChatBubbleProps {
  isOpen: boolean
  onClose: () => void
  onTemplateGenerated?: (template: string) => void
  onTemplateStreaming?: (partialTemplate: string) => void
}

export function EnhancedChatBubble({ 
  isOpen, 
  onClose, 
  onTemplateGenerated,
  onTemplateStreaming 
}: EnhancedChatBubbleProps) {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentResponse, setCurrentResponse] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { sendStreamingMessage, healthCheck } = useChatAPI()

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, currentResponse])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return

    const userMessage: ChatMessage = { role: 'user', content: query.trim() }
    setMessages(prev => [...prev, userMessage])
    setQuery("")
    setIsLoading(true)
    setIsStreaming(true)
    setCurrentResponse("")

    const conversationMessages = [...messages, userMessage]

    try {
      await sendStreamingMessage(
        query.trim(),
        // onChunk
        (chunk: StreamingChatResponse) => {
          if (chunk.choices && chunk.choices.length > 0) {
            const delta = chunk.choices[0].delta
            if (delta.content) {
              setCurrentResponse(prev => {
                const newContent = prev + delta.content
                
                // Stream to editor if it looks like HTML/template code
                if (onTemplateStreaming && (newContent.includes('<!DOCTYPE html>') || newContent.includes('<html>'))) {
                  onTemplateStreaming(newContent)
                }
                
                // Show streaming content in chat
                return newContent
              })
            }
          }
        },
        // onError
        (error: string) => {
          console.error("Streaming error:", error)
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Error: ${error}`
          }])
          setIsStreaming(false)
          setIsLoading(false)
        },
        // onComplete
        () => {
          // Capture the current response before clearing it
          setCurrentResponse(prev => {
            const fullTemplate = prev
            
            // Always add the full response to chat history for conversation continuity
            setMessages(messages => [...messages, {
              role: 'assistant',
              content: fullTemplate
            }])
            
            // If this looks like a template, call the callback with the full template
            if (onTemplateGenerated && fullTemplate.includes('<!DOCTYPE html>')) {
              onTemplateGenerated(fullTemplate)
            }
            
            return "" // Clear the current response
          })
          
          setIsStreaming(false)
          setIsLoading(false)
        }
      )
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }])
      setIsStreaming(false)
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
    if (e.key === "Escape") {
      onClose()
    }
  }

  const clearChat = () => {
    setMessages([])
    setCurrentResponse("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 h-[80vh]">
        {/* Chat Bubble */}
        <div className="bg-white dark:bg-black rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white dark:text-black" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  AI Email Template Generator
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Describe the email template you want to create
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Start a conversation</p>
                <p className="text-sm">
                  Describe the email template you'd like me to create for you.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white dark:text-black" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {message.content}
                  </pre>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
              </div>
            ))}

            {/* Streaming Response */}
            {isStreaming && currentResponse && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white dark:text-black" />
                </div>
                <div className="max-w-[70%] p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {currentResponse}
                  </pre>
                  <div className="flex items-center gap-1 mt-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs text-gray-500">Generating...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your email template... (e.g., 'Create a welcome email for new users with a modern design')"
                  className="w-full min-h-[60px] max-h-[120px] p-3 pr-12 text-black dark:text-white bg-gray-100 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!query.trim() || isLoading}
                  className="absolute bottom-2 right-2 h-8 w-8 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between mt-3 text-xs text-gray-600 dark:text-gray-300">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span>Powered by OpenAI</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
