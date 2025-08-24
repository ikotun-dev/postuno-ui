
"use client"
import Editor from "@monaco-editor/react";
import { useState } from "react";

export default function Page() {
    const [code, setCode] = useState("<html></html>");
    return (
        <div className="h-screen w-full">
            <Editor
                height="100%"
                defaultLanguage="html"
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-light"
            />
        </div>
    )
}