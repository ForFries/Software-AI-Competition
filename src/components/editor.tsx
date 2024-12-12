
import React, { useState, useCallback, useEffect } from 'react'
import { Block } from './block'
import { FloatingToolbar } from './toolbar'
import { SlashCommandMenu } from './SlashCommandMenu'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { v4 as uuidv4 } from 'uuid'
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'

interface BlockData {
    id: string;
    type: string;
    content: string;
}

export function Editor() {
    const [blocks, setBlocks] = useState<BlockData[]>(() => {
        const savedBlocks = localStorage.getItem('notionLikeBlocks');
        return savedBlocks ? JSON.parse(savedBlocks) : [
            { id: uuidv4(), type: 'heading-1', content: 'Welcome to Your Notion-like Editor' },
            { id: uuidv4(), type: 'paragraph', content: 'Start typing or use "/" for commands' },
        ];
    });

    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [showSlashMenu, setShowSlashMenu] = useState<boolean>(false);
    const [slashMenuBlockId, setSlashMenuBlockId] = useState<string | null>(null);
    const [slashMenuPosition, setSlashMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    useEffect(() => {
        localStorage.setItem('notionLikeBlocks', JSON.stringify(blocks));
    }, [blocks]);

    const handleBlockChange = useCallback((id: string, content: string) => {
        setBlocks(blocks => blocks.map(block =>
            block.id === id ? { ...block, content } : block
        ));
    }, []);

    const handleBlockFocus = useCallback((id: string) => {
        setSelectedBlockId(id);
        console.log(id);
    }, []);

    const handleBlockBlur = useCallback((id: string|null) => {
        if(id==null)
        {
            setSelectedBlockId(null);
            console.log('no id');
        }
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent, blockId: string) => {
        if (e.key === '/') {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setSlashMenuPosition({ x: rect.left, y: rect.bottom });
            setShowSlashMenu(true);
            setSlashMenuBlockId(blockId);
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const newBlock: BlockData = { id: uuidv4(), type: 'paragraph', content: '' };
            setBlocks(blocks => {
                const index = blocks.findIndex(block => block.id === blockId);
                return [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)];
            });
        } else if (e.key === 'Backspace' && (e.target as HTMLElement).textContent === '') {
            e.preventDefault();
            deleteBlock(blockId);
        }
    }, []);

    const handleSlashCommand = useCallback((type: string) => {
        if (slashMenuBlockId) {
            setBlocks(blocks => blocks.map(block =>
                block.id === slashMenuBlockId
                    ? { ...block, type, content: '' }
                    : block
            ));
        } else {
            addBlock(type);
        }
        setShowSlashMenu(false);
        setSlashMenuBlockId(null);
    }, [slashMenuBlockId]);

    const addBlock = useCallback((type: string, content: string = '') => {
        const newBlock: BlockData = { id: uuidv4(), type, content };
        setBlocks(blocks => [...blocks, newBlock]);
        setShowSlashMenu(false);
        console.log(newBlock.id);
    }, []);

    const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
        setBlocks((prevBlocks) => {
            const newBlocks = [...prevBlocks];
            const dragBlock = newBlocks[dragIndex];

            newBlocks.splice(dragIndex, 1);
            newBlocks.splice(hoverIndex, 0, dragBlock);

            return newBlocks;
        });
    }, []);

    const deleteBlock = useCallback((id: string) => {
        setBlocks(blocks => blocks.filter(block => block.id !== id));
    }, []);

    const toggleBlockType = useCallback((id: string, newType: string) => {
        setBlocks(blocks => blocks.map(block =>
            block.id === id
                ? { ...block, type: newType }
                : block
        ));
    }, []);

    return (
        <DndProvider backend={HTML5Backend} options={{ enableMouseEvents: true }}>
            <div className="w-full max-w-4xl mx-auto p-4 bg-white min-h-screen">
                {blocks.map((block, index) => (
                    <Block
                        key={block.id}
                        {...block}
                        onChange={handleBlockChange}
                        onFocus={handleBlockFocus}
                        onBlur={handleBlockBlur}
                        onKeyDown={handleKeyDown}
                        onDelete={deleteBlock}
                        onToggleType={toggleBlockType}
                        index={index}
                        moveBlock={moveBlock}
                    />
                ))}
                <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 text-gray-500 hover:text-gray-700"
                    onClick={() => addBlock('paragraph')}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add a block
                </Button>
                {selectedBlockId && (
                    <FloatingToolbar
                        blockId={selectedBlockId}
                        onToggleType={(type) => toggleBlockType(selectedBlockId, type)}
                    />
                )}
                {showSlashMenu && (
                    <SlashCommandMenu
                        position={slashMenuPosition}
                        onSelect={handleSlashCommand}
                        onClose={() => {
                            setShowSlashMenu(false);
                            setSlashMenuBlockId(null);
                        }}
                    />
                )}
            </div>
        </DndProvider>
    );
}
