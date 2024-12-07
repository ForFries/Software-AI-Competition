import React, { useState, useEffect } from 'react'
import { Bold, Italic, Code, Type, List, ListOrdered, Quote } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface FloatingToolbarProps {
    blockId: string
    onToggleType: (type: string) => void
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ blockId, onToggleType }) => {
    const [position, setPosition] = useState({ top: 0, left: 0 })
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const updatePosition = () => {
            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                const range = selection.getRangeAt(0)
                const rect = range.getBoundingClientRect()
                setPosition({
                    top: rect.top + window.scrollY - 40,
                    left: rect.left + rect.width / 2,
                })
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        document.addEventListener('selectionchange', updatePosition)
        return () => document.removeEventListener('selectionchange', updatePosition)
    }, [blockId])

    const applyStyle = (tag: string, className?: string) => {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const range = selection.getRangeAt(0)
        const selectedContent = range.extractContents()
        const wrapper = document.createElement(tag)

        if (className) {
            wrapper.className = className
        }

        wrapper.appendChild(selectedContent)
        range.insertNode(wrapper)

        // 重新设置选区
        selection.removeAllRanges()
        const newRange = document.createRange()
        newRange.selectNodeContents(wrapper)
        selection.addRange(newRange)
    }

    const handleInlineStyle = (style: string) => {
        switch (style) {
            case 'bold':
                applyStyle('strong')
                break
            case 'italic':
                applyStyle('em')
                break
            case 'code':
                applyStyle('code', 'bg-gray-100 px-1 rounded font-mono')
                break
            case 'heading-1':
            case 'bullet-list':
            case 'numbered-list':
            case 'quote':
                onToggleType(style)
                break
        }
    }

    const removeStyle = (nodeName: string) => {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const range = selection.getRangeAt(0)
        const ancestor = range.commonAncestorContainer
        const parentElement = ancestor.nodeType === 3 ? ancestor.parentElement : ancestor as Element

        if (parentElement?.nodeName.toLowerCase() === nodeName.toLowerCase()) {
            const content = parentElement.textContent
            const textNode = document.createTextNode(content || '')
            parentElement.parentNode?.replaceChild(textNode, parentElement)
        }
    }

    const toggleStyle = (style: string) => {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const range = selection.getRangeAt(0)
        const ancestor = range.commonAncestorContainer
        const parentElement = ancestor.nodeType === 3 ? ancestor.parentElement : ancestor as Element

        switch (style) {
            case 'bold':
                if (parentElement?.nodeName === 'STRONG') {
                    removeStyle('strong')
                } else {
                    applyStyle('strong')
                }
                break
            case 'italic':
                if (parentElement?.nodeName === 'EM') {
                    removeStyle('em')
                } else {
                    applyStyle('em')
                }
                break
            case 'code':
                if (parentElement?.nodeName === 'CODE') {
                    removeStyle('code')
                } else {
                    applyStyle('code', 'bg-gray-100 px-1 rounded font-mono')
                }
                break
            default:
                onToggleType(style)
                break
        }
    }

    if (!isVisible) return null

    return (
        <div
            className="fixed z-10 bg-white shadow-lg rounded-lg p-1 flex gap-1"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                transform: 'translateX(-50%)',
            }}
        >
            <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleStyle('bold')}
                className="hover:bg-gray-100"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleStyle('italic')}
                className="hover:bg-gray-100"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleStyle('code')}
                className="hover:bg-gray-100"
            >
                <Code className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInlineStyle('heading-1')}
                className="hover:bg-gray-100"
            >
                <Type className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInlineStyle('bullet-list')}
                className="hover:bg-gray-100"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInlineStyle('numbered-list')}
                className="hover:bg-gray-100"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInlineStyle('quote')}
                className="hover:bg-gray-100"
            >
                <Quote className="h-4 w-4" />
            </Button>
        </div>
    )
}
