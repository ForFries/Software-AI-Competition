import React, { useState } from 'react';
import './App.css';
interface Block {
  type: 'title' | 'content';
  value: string;
}

const App: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  // 添加新的块
  const addBlock = (type: 'title' | 'content', index: number | null = null) => {
    const newBlock: Block = { type, value: '' };
    const updatedBlocks =
      index === null
        ? [...blocks, newBlock]
        : [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)];
    setBlocks(updatedBlocks);
  };

  // 更新块的内容
  const updateBlock = (index: number, newValue: string) => {
    const updatedBlocks = blocks.map((block, i) =>
      i === index ? { ...block, value: newValue } : block
    );
    setBlocks(updatedBlocks);
  };

  return (
    <div className="app">
      {blocks.map((block, index) => (
        <div className="block-wrapper" key={index}>
          <div className={`block ${block.type}`}>
            {block.type === 'title' ? (
              <input
                type="text"
                className="input title-input"
                placeholder="请输入标题"
                value={block.value}
                onChange={(e) => updateBlock(index, e.target.value)} // 确保更新了正确的块
              />
            ) : (
              <textarea
                className="input content-input"
                placeholder="请输入内容"
                value={block.value}
                onChange={(e) => updateBlock(index, e.target.value)} // 确保更新了正确的块
              />
            )}
          </div>
          {/* 加号按钮 */}
          <div className="add-button">
            <button
              onClick={() => addBlock('title', index)}
              className="add-option"
            >
              添加标题
            </button>
            <button
              onClick={() => addBlock('content', index)}
              className="add-option"
            >
              添加内容
            </button>
          </div>
        </div>
      ))}

      {/* 初始添加按钮 */}
      {blocks.length === 0 && (
        <div className="initial-add">
          <button onClick={() => addBlock('title')} className="add-option">
            添加标题
          </button>
          <button onClick={() => addBlock('content')} className="add-option">
            添加内容
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
