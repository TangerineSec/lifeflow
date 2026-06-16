import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  MessageSquareText,
  ChevronDown,
  ChevronRight,
  Pencil,
} from 'lucide-react';
import useFlowStore from '../../store/useFlowStore';

/**
 * FlowInfo — 流程的简介与备注内联编辑器
 *
 * 嵌入在流程图卡片头部下方，点击即可展开编辑：
 * - 简介（description）：单行展示，点击展开编辑
 * - 备注（notes）：带图标提示，折叠/展开
 */
export default function FlowInfo({ flowId }) {
  const flow = useFlowStore((s) => s.flows[flowId]);
  const updateFlow = useFlowStore((s) => s.updateFlow);

  const [editing, setEditing] = useState(null); // 'description' | 'notes' | null
  const [expanded, setExpanded] = useState(false);

  if (!flow) return null;

  const hasDescription = !!flow.description;
  const hasNotes = !!flow.notes;
  const showExpand = hasDescription || hasNotes;

  const handleSave = (field, value) => {
    updateFlow(flowId, { [field]: value });
    setEditing(null);
  };

  return (
    <div className="mb-3">
      {/* 简介行（始终可见，点击展开编辑） */}
      <div className="group flex items-start gap-1.5">
        <FileText size={13} className="mt-0.5 flex-shrink-0 text-gray-300" />
        {editing === 'description' ? (
          <div className="flex-1">
            <textarea
              autoFocus
              defaultValue={flow.description}
              rows={2}
              onBlur={(e) => handleSave('description', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setEditing(null);
                }
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSave('description', e.target.value);
                }
              }}
              className="w-full text-xs text-gray-700 bg-gray-50 rounded-lg px-2 py-1
                         border border-gray-200 resize-none
                         focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="添加流程简介..."
            />
            <p className="text-[10px] text-gray-400 mt-0.5">
              Enter 保存 · Shift+Enter 换行 · Esc 取消
            </p>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            {flow.description ? (
              <p
                className="text-xs text-gray-500 leading-relaxed cursor-pointer hover:text-gray-700 transition-colors"
                onClick={() => setEditing('description')}
              >
                {flow.description}
              </p>
            ) : (
              <button
                onClick={() => setEditing('description')}
                className="text-xs text-gray-300 hover:text-gray-500 transition-colors italic opacity-0 group-hover:opacity-100"
              >
                添加简介...
              </button>
            )}
          </div>
        )}
      </div>

      {/* 备注行（折叠/展开） */}
      {hasNotes && (
        <div className="mt-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <MessageSquareText size={12} />
            <span>备注</span>
          </button>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-1 ml-4"
            >
              {editing === 'notes' ? (
                <textarea
                  autoFocus
                  defaultValue={flow.notes}
                  rows={3}
                  onBlur={(e) => handleSave('notes', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setEditing(null);
                  }}
                  className="w-full text-xs text-gray-700 bg-gray-50 rounded-lg px-2 py-1
                             border border-gray-200 resize-none
                             focus:outline-none focus:ring-2 focus:ring-brand-200"
                  placeholder="记录流程备注..."
                />
              ) : (
                <p
                  className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                  onClick={() => setEditing('notes')}
                >
                  {flow.notes}
                </p>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* 无描述无备注时显示快捷添加入口 */}
      {!hasDescription && !hasNotes && (
        <button
          onClick={() => setEditing('description')}
          className="flex items-center gap-1 text-xs text-gray-300 hover:text-brand-500 transition-colors mt-0.5"
        >
          <Pencil size={11} />
          添加简介或备注
        </button>
      )}
    </div>
  );
}
