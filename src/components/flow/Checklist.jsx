import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Square, Trash2, Plus } from 'lucide-react';
import useFlowStore from '../../store/useFlowStore';

/**
 * 子任务清单组件
 * 每个节点下可挂载一个 Checklist，代表该阶段具体要做的琐事
 */
export default function Checklist({ nodeId }) {
  const node = useFlowStore((s) => s.nodes[nodeId]);
  const addChecklistItem = useFlowStore((s) => s.addChecklistItem);
  const toggleChecklistItem = useFlowStore((s) => s.toggleChecklistItem);
  const removeChecklistItem = useFlowStore((s) => s.removeChecklistItem);

  const [newText, setNewText] = useState('');

  if (!node) return null;

  const { checklist } = node;
  const doneCount = checklist.filter((item) => item.done).length;

  const handleAdd = () => {
    const text = newText.trim();
    if (!text) return;
    addChecklistItem(nodeId, text);
    setNewText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-1">
      {/* 进度条 */}
      {checklist.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand-400 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${(doneCount / checklist.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs text-gray-400 tabular-nums">
            {doneCount}/{checklist.length}
          </span>
        </div>
      )}

      {/* 清单列表 */}
      <div className="space-y-0.5">
        {checklist.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 group px-1 py-0.5 rounded-lg hover:bg-gray-50"
          >
            <button
              onClick={() => toggleChecklistItem(nodeId, item.id)}
              className="flex-shrink-0 text-gray-400 hover:text-brand-500 transition-colors"
            >
              {item.done ? (
                <CheckSquare size={14} className="text-emerald-500" />
              ) : (
                <Square size={14} />
              )}
            </button>
            <span
              className={`flex-1 text-xs ${
                item.done
                  ? 'line-through text-gray-300'
                  : 'text-gray-600'
              }`}
            >
              {item.text}
            </span>
            <button
              onClick={() => removeChecklistItem(nodeId, item.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
            >
              <Trash2 size={12} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* 新增输入 */}
      <div className="flex items-center gap-1 mt-1">
        <Plus size={12} className="text-gray-300 flex-shrink-0" />
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="添加子任务..."
          className="flex-1 text-xs bg-transparent border-none outline-none text-gray-400 placeholder-gray-300 py-0.5"
        />
      </div>
    </div>
  );
}
