import { Sidebar } from "@/components/sidebar"
import { Editor } from "@/components/editor"

export default function Home() {
    return (
        <div className="flex h-[calc(100vh-4rem)]">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">
                <Editor />
            </main>
        </div>
    )
}