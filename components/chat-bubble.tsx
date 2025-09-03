"use client"

import { useState, useRef, useEffect } from "react"
import { Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatBubbleProps {
  isOpen: boolean
  onClose: () => void
  onSend: (query: string) => void
}

export function ChatBubble({ isOpen, onClose, onSend }: ChatBubbleProps) {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return

    setIsLoading(true)
    try {
      await onSend(query.trim())
      setQuery("")
      onClose()
    } catch (error) {
      console.error("Error sending query:", error)
    } finally {
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4">
        {/* Chat Bubble */}
        <div className="bg-white dark:bg-black rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
                <span className="text-white dark:text-black text-sm font-medium">AI</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Email Template Generator
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Describe the email template you want to create
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your email template... (e.g., 'Create a welcome email for new users with a modern design')"
                className="w-full min-h-[120px] p-4 pr-12 text-black dark:text-white bg-gray-100 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!query.trim() || isLoading}
                className="absolute bottom-3 right-3 h-8 w-8 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between mt-3 text-xs text-gray-600 dark:text-gray-300">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>Cmd+C to open • Esc to close</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
