
"use client"
import Editor from "@monaco-editor/react";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/theme-context";
import { ChatBubble } from "@/components/chat-bubble";
import { Bot } from "lucide-react";
import { EnhancedChatBubble } from "@/components/enhanced-chat-bubble";

export default function Page() {
    const { theme } = useTheme();
    const [zoom, setZoom] = useState(1);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showFloatingButton, setShowFloatingButton] = useState(false);
    const [code, setCode] = useState(`<!DOCTYPE html>
<html>
<head>
    <title>Preview</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>Edit the code to see changes here.</p>
</body>
</html>`);

    // Keyboard shortcut listener for Cmd+C
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.metaKey && e.key === 'c' && !e.shiftKey && !e.altKey) {
                // Only trigger if not selecting text (to avoid interfering with copy)
                const selection = window.getSelection();
                if (!selection || selection.toString().length === 0) {
                    e.preventDefault();
                    setIsChatOpen(true);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleTemplateGenerated = (generatedTemplate: string) => {
        console.log('Template generated:', generatedTemplate);
        
        // Set the generated template as the current code
        setCode(generatedTemplate);
        
        // Close the chat bubble after template is generated
        setIsChatOpen(false);
    };

    const handleTemplateStreaming = (partialTemplate: string) => {
        // Update the editor in real-time as the template is being generated
        setCode(partialTemplate);
    };

    return (
        <div
            className="h-screen w-full flex lg:flex-row flex-col relative"
            onMouseEnter={() => setShowFloatingButton(true)}
            onMouseLeave={() => setShowFloatingButton(false)}
        >
            {/* Floating AI Button */}
            <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300 ${showFloatingButton && !isChatOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}>
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-black dark:text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-105 group"
                    title="Generate Email Template (Cmd+C)"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-black/10 dark:bg-white/10 rounded-full flex items-center justify-center">
                            {/* <span className="text-sm font-bold">AI</span>
                             */}
                             <Bot/>
                        </div>
                        <span className="font-medium text-sm">Generate Template</span>
                    </div>
                </button>
            </div>

            <div className="w-[50%]">
                <Editor
                    height="100%"
                    defaultLanguage="html"
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme={theme === "dark" ? "vs-dark" : "vs-light"}
                />
            </div>
            {/* Render */}
            <div className="flex-1 w-[50%] relative group">
                {/* Zoom Controls */}
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                    <button
                        onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
                        className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-md text-sm font-medium"
                        title="Zoom In"
                    >
                        +
                    </button>
                    <button
                        onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.25))}
                        className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-full text-sm font-medium"
                        title="Zoom Out"
                    >
                        -
                    </button>
                    <button
                        onClick={() => setZoom(1)}
                        className="bg-black/70 hover:bg-black/90 text-white px-3 py-2 rounded-md text-xs font-medium"
                        title="Reset Zoom"
                    >
                        {Math.round(zoom * 100)}%
                    </button>
                </div>

                <iframe
                    srcDoc={code}
                    className="w-full h-full border-l origin-top-left"
                    title="HTML Preview"
                    style={{
                        transform: `scale(${zoom})`,
                        width: `${100 / zoom}%`,
                        height: `${100 / zoom}%`
                    }}
                />
            </div>

            {/* Chat Bubble */}
            <EnhancedChatBubble
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                onTemplateGenerated={handleTemplateGenerated}
                onTemplateStreaming={handleTemplateStreaming}
            />
        </div>
    )
}