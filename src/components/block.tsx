import React, {useEffect, useRef, useState} from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { Trash2, GripVertical } from 'lucide-react'
import { cn } from "@/lib/utils"

interface BlockProps {
    id: string
    type: string
    content: string
    onChange: (id: string, content: string) => void
    onFocus: (id: string) => void
    onBlur: (id: string|null) => void
    onKeyDown: (e: React.KeyboardEvent, id: string) => void
    onDelete: (id: string) => void
    onToggleType: (id: string, type: string) => void
    index: number
    moveBlock: (DragIndex: number, HoverIndex:  number) => void
}

interface DragItem {
    id: string
    type: string
    index:number
}

export const Block: React.FC<BlockProps> = ({
                                                id,
                                                type,
                                                content,
                                                onChange,
                                                onFocus,
                                                onBlur,
                                                onKeyDown,
                                                onDelete,
                                                onToggleType,
                                                index,
                                                moveBlock,
                                            }) => {
    const ref = useRef<HTMLDivElement>(null)
    const contentEditableRef = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)

    const [{ isDragging }, drag, dragPreview] = useDrag({
        type: 'BLOCK',
        item: (): DragItem => ({
            id,
            type: 'BLOCK',
            index,
        }),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
        accept: 'BLOCK',
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
        hover: (item, monitor) => {
            if (!ref.current) {
                return
            }
    
            const dragIndex = item.index
            const hoverIndex = index
    
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return
            }
    
            // Determine rectangle on screen
            const hoverBoundingRect = ref.current.getBoundingClientRect()
    
            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
    
            // Determine mouse position
            const clientOffset = monitor.getClientOffset()
            if (!clientOffset) {
                return
            }
    
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top
    
            // Only perform the move when the mouse has crossed half of the items height
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return
            }
    
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return
            }
    
            // Don't perform any move until mouse is dropped (this ensures we don't update prematurely)
        },
        drop: (item, monitor) => {
            const dragIndex = item.index
            const hoverIndex = index
            // Only perform the move when the drag has ended (mouse is dropped)
            if (dragIndex !== hoverIndex) {
                moveBlock(dragIndex, hoverIndex)
            }
        },
    })

    // Initialize drag preview         
    useEffect(() => {
        dragPreview(drop(ref))
    }, [dragPreview, drop])

    const getBlockStyle = () => {
        switch (type) {
            case 'heading-1':
                return 'text-4xl font-bold'
            case 'heading-2':
                return 'text-3xl font-semibold'
            case 'heading-3':
                return 'text-2xl font-medium'
            case 'bullet-list':
                return 'list-disc list-inside'
            case 'numbered-list':
                return 'list-decimal list-inside'
            case 'code':
                return 'bg-gray-100 p-2 rounded font-mono'
            case 'quote':
                return 'border-l-4 border-gray-300 pl-4 italic'
            default:
                return ''
        }
    }

    return (
        <div
            ref={ref}
            className={cn(
                "group relative mb-1 transition-all duration-100",
                isHovered && "pl-8",
                isOver && "border-t-2 border-blue-500",
                isDragging && "opacity-50"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered && (
                <div
                    ref={drag}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 cursor-move
                             w-6 h-6 flex items-center justify-center
                             hover:bg-gray-100 rounded"
                >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
            )}
            
            <div
                ref={contentEditableRef}
                contentEditable
                suppressContentEditableWarning
                className={cn(
                    "min-h-[1.5em] p-1 border border-transparent focus:border-blue-300 rounded outline-none",
                    getBlockStyle()
                )}
                onInput={(e) => onChange(id, e.currentTarget.innerHTML || '')}
                onFocus={() => onFocus(id)}
                onBlur={()=>onBlur(id)}
                onKeyDown={(e) => onKeyDown(e, id)}
            >
            {content=='Welcome to Your Notion-like Editor'&&content}
            {content=='Start typing or use "/" for commands'&&content}
            </div>
                {isHovered && (
                <button
                    className="absolute top-1 right-1 opacity-50 hover:opacity-100"
                    onClick={() => onDelete(id)}
                >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
            )}
            
        </div>
    )
}

