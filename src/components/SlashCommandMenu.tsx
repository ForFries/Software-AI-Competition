import React from 'react'
import { Text, Heading1, Heading2, Heading3, List, ListOrdered, Image, Code, Quote } from 'lucide-react'

interface SlashCommandMenuProps {
    position: { x: number; y: number }
    onSelect: (type: string) => void
    onClose: () => void
}

const commands = [
    { type: 'paragraph', icon: Text, label: 'Text' },
    { type: 'heading-1', icon: Heading1, label: 'Heading 1' },
    { type: 'heading-2', icon: Heading2, label: 'Heading 2' },
    { type: 'heading-3', icon: Heading3, label: 'Heading 3' },
    { type: 'bullet-list', icon: List, label: 'Bullet List' },
    { type: 'numbered-list', icon: ListOrdered, label: 'Numbered List' },
    { type: 'image', icon:Image, label: 'Image' },
    { type: 'code', icon: Code, label: 'Code' },
    { type: 'quote', icon: Quote, label: 'Quote' },
]

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({ position, onSelect, onClose }) => {
    return (
        <div
            className="fixed z-20 bg-white shadow-lg rounded-lg p-2 w-64"
            style={{
                top: `${position.y}px`,
                left: `${position.x}px`,
            }}
        >
            {commands.map((command) => (
                <button
                    key={command.type}
                    className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded text-left"
                    onClick={() => {
                        onSelect(command.type)
                        onClose()
                    }}
                >
                    <command.icon className="h-4 w-4" />
                    <span>{command.label}</span>
                </button>
            ))}
        </div>
    )
}

