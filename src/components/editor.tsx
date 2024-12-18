
import React, { useState, useCallback, useEffect } from 'react'
import { Block } from './block'
import { FloatingToolbar } from './toolbar'
import { SlashCommandMenu } from './SlashCommandMenu'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { v4 as uuidv4 } from 'uuid'
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import * as Y from 'yjs';
interface BlockData {
    id: string;
    type: string;
    content: string;
}
//savedBlocks ? JSON.parse(savedBlocks) :
export function Editor() {
    const [blocks, setBlocks] = useState<BlockData[]>(() => {
        // const savedBlocks = localStorage.getItem('notionLikeBlocks');
        return  [
            { id: uuidv4(), type: 'heading-1', content: 'Welcome to Your Notion-like Editor' },
            { id: uuidv4(), type: 'paragraph', content: 'Start typing or use "/" for commands' },
        ];
    });
    const [ydoc] = useState(() => new Y.Doc());
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [showSlashMenu, setShowSlashMenu] = useState<boolean>(false);
    const [slashMenuBlockId, setSlashMenuBlockId] = useState<string | null>(null);
    const [slashMenuPosition, setSlashMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    useEffect(() => {
        const blocksArray = ydoc.getArray<string>('blocksArray');
        const blocksData:Y.Map<Y.Map<string>>=ydoc.getMap<Y.Map<string>>('blocksData');
        const initialBlocks = [
            { id: uuidv4(), type: 'heading-1', content: 'Welcome to Your Notion-like Editor' },
            { id: uuidv4(), type: 'paragraph', content: 'Start typing or use "/" for commands' },
        ];
        if(blocksArray.length!=0)
        {
            blocksArray.observe(event => {
                const newBlocks: BlockData[] = [];
                        console.log(blocksArray.length);
                    blocksArray.forEach((blockMap:string) => {
                        // console.log(blocksData.get(blockMap));
                        console.log(blocksData.get(blockMap)!.get('id')!);
                        newBlocks.push({
                          id: blocksData.get(blockMap)!.get('id')!,
                          content: blocksData.get(blockMap)!.get('content')!,
                          type: blocksData.get(blockMap)!.get('type')!,
                        });
                      });
                      setBlocks(newBlocks);
            });
        }
        if (blocksArray.length === 0) {
            initialBlocks.forEach(block => {
                blocksArray.push([block.id]);
                // console.log(block.id);
                const newYmap:Y.Map<string> =new Y.Map();
                newYmap.set('id',block.id);
                newYmap.set('type',block.type);
                newYmap.set('content',block.content);
                blocksData.set(block.id,newYmap);
            });
        }
        //blocksArray变动时发生里面的函数
        return () => {
          ydoc.destroy();
        };
      }, []);
    // useEffect(() => {
    //     localStorage.setItem('notionLikeBlocks', JSON.stringify(blocks));
    // }, [blocks]);
    // useEffect(() => {
    //     console.log("Updated blocks:", blocks);  // 每次 blocks 更新时都会打印
    // }, [blocks]);
    //处理内容content改变的函数
    const handleBlockChange = useCallback((id: string, content: string) => {
        // setBlocks(blocks => blocks.map(block =>
        //     block.id === id ? { ...block, content } : block
        // ));
        const blocksData:Y.Map<Y.Map<string>>=ydoc.getMap<Y.Map<string>>('blocksData');
        blocksData.forEach((blockMap) => {
          if (blockMap.get('id') === id) {
            blockMap.set('content', content);
          }
        });
    }, []);
    
    const handleBlockFocus = useCallback((id: string) => {
        setSelectedBlockId(id);
        // console.log(id);
    }, []);

    const handleBlockBlur = useCallback((id: string|null) => {
        if(id==null)
        {
            setSelectedBlockId(null);
            // console.log('no id');
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
            // const newBlock: BlockData = { id: uuidv4(), type: 'paragraph', content: '' };
            // setBlocks(blocks => {
            //     const index = blocks.findIndex(block => block.id === blockId);
            //     return [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)];
            // });
            const blocksArray = ydoc.getArray<string>('blocksArray');
            const blocksData:Y.Map<Y.Map<string>>=ydoc.getMap<Y.Map<string>>('blocksData');
            const newBlockMap: Y.Map<string> = new Y.Map();
            const id:string=uuidv4();
            newBlockMap.set('id',id) ;
            newBlockMap.set('content', '');
            newBlockMap.set('type', 'paragraph');
            // 查找目标 block 的位置
            let targetIndex = -1;
            blocksArray.forEach((blockMap, index) => {
            if (blockMap === blockId) {
                targetIndex = index;
            }
        });

        // 如果找到了目标 block，就插入新的 block
        if (targetIndex !== -1) {
            blocksData.set(id, newBlockMap);
            blocksArray.insert(targetIndex + 1, [id]); // 在目标块后面插入
           
        } else {
            console.log("Block with id " + blockId + " not found.");
        }


        } else if (e.key === 'Backspace' && (e.target as HTMLElement).textContent === '') {
            e.preventDefault();
            deleteBlock(blockId);
        }
    }, []);
    const addBlock = useCallback((type: string) => {
        // const newBlock: BlockData = { id: uuidv4(), type, content };
        // setBlocks(blocks => {
        //     console.log('Previous blocks:', blocks);  // 打印当前的 blocks 数组
        //     return [...blocks, newBlock];
        // });
        setShowSlashMenu(false);
        // console.log('Updated blocks:', blocks);  // 这会打印当前的 blocks，但因为 setBlocks 是异步的，所以这里的值不会被更新
        const blocksArray = ydoc.getArray<string>('blocksArray');
        const blocksData:Y.Map<Y.Map<string>>=ydoc.getMap<Y.Map<string>>('blocksData');
        const newBlockMap=new Y.Map<string>();
        const id:string = uuidv4()
        console.log(id);
        newBlockMap.set('id', id);
        newBlockMap.set('content', '');
        newBlockMap.set('type', type);
        blocksData.set(id, newBlockMap);
        blocksArray.push([id]);
        
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

    const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
        const blocksArray = ydoc.getArray<string>('blocksArray');
        const blocksData:Y.Map<Y.Map<string>>=ydoc.getMap<Y.Map<string>>('blocksData');
        const DragBlockID:string = blocksArray.get(dragIndex);
        const HoverBlockID:string = blocksArray.get(hoverIndex);
        console.log(dragIndex,hoverIndex);
        // blocksArray.unobserve(event => {
        //     const newBlocks: BlockData[] = [];
        //             console.log(blocksArray.length);
        //         blocksArray.forEach((blockMap:string) => {
        //             // console.log(blocksData.get(blockMap));
        //             console.log(blocksData.get(blockMap)!.get('id')!);
        //             newBlocks.push({
        //               id: blocksData.get(blockMap)!.get('id')!,
        //               content: blocksData.get(blockMap)!.get('content')!,
        //               type: blocksData.get(blockMap)!.get('type')!,
        //             });
        //           });
        //           setBlocks(newBlocks);
        // });
        ydoc.transact(()=>{
            hoverIndex ===blocksArray.length? blocksArray.push([DragBlockID.toString()]): blocksArray.insert(hoverIndex+1,[DragBlockID.toString()]);
            blocksArray.delete(hoverIndex,1);
            dragIndex ===blocksArray.length? blocksArray.unshift([HoverBlockID.toString()]): blocksArray.insert(dragIndex+1,[HoverBlockID.toString()]);
            blocksArray.delete(dragIndex,1);
        }) 
        
    }, []);
    const deleteBlock = useCallback((id: string) => {
        // console.log(id);
        const blocksArray = ydoc.getArray<string>('blocksArray');
        const blocksData:Y.Map<Y.Map<string>> = ydoc.getMap<Y.Map<string>>('blocksData');
        blocksArray.forEach((blockMap, indexArray) => {
        if (blockMap === id) {
            console.log('delete success');
            blocksData.delete(blockMap);
            blocksArray.delete(indexArray, 1);
        }
        // console.log(blockMap);
    });
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
