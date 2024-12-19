import { Sidebar } from "@/components/sidebar"
import { Editor } from "@/components/editor"
import { useState } from "react"

export default function Home() {
    const [pageId, setPageId] = useState<string | null>(null);
    const [showConnectModal, setShowConnectModal] = useState(false);

    const handleNewPage = () => {
        // 生成一个6位数的随机页面ID
        const newPageId = Math.floor(100000 + Math.random() * 900000).toString();
        setPageId(newPageId);
    };

    const handleConnect = (id: string) => {
        setPageId(id);
        setShowConnectModal(false);
    };

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            <Sidebar 
                onNewPage={handleNewPage}
                onConnectClick={() => setShowConnectModal(true)}
                currentPageId={pageId}
            />
            <main className="flex-1 overflow-y-auto p-6">
                {pageId ? (
                    <>
                        <div className="mb-4 text-sm text-muted-foreground">
                            Page ID: {pageId}
                        </div>
                        <Editor pageId={pageId} />
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold mb-2">Welcome to Notion Clone</h2>
                            <p className="text-muted-foreground mb-4">Create a new page or connect to an existing one to get started</p>
                        </div>
                    </div>
                )}
            </main>

            {showConnectModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-card p-6 rounded-lg shadow-lg w-[400px]">
                        <h2 className="text-lg font-semibold mb-4">Connect to a Page</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const id = formData.get('pageId') as string;
                            handleConnect(id);
                        }}>
                            <div className="mb-4">
                                <label htmlFor="pageId" className="block text-sm font-medium mb-1">
                                    Page ID
                                </label>
                                <input
                                    type="text"
                                    id="pageId"
                                    name="pageId"
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="Enter page ID (e.g., 123456)"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowConnectModal(false)}
                                    className="px-4 py-2 text-sm border rounded-md hover:bg-accent"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                                >
                                    Connect
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}