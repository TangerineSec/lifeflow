import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Info,
  Pencil,
  Check,
  X,
  FileText,
  MessageSquareText,
  Trash2,
} from 'lucide-react';
import useFlowStore from '../../store/useFlowStore';
import useAppStore from '../../store/useAppStore';
import FlowChart from './FlowChart';
import Button from '../ui/Button';

/**
 * FlowDetailView — 流程详情全屏视图
 *
 * 从 Dashboard 点击流程卡片后进入，展示完整流程图：
 * - 顶部：返回按钮 + 可编辑标题 + 信息按钮
 * - 主体：非 compact 模式的 FlowChart（完整操作栏 + 视觉连线）
 * - 信息弹窗：点击 ℹ️ 打开流程的简介和备注编辑
 */
export default function FlowDetailView() {
  const viewingFlowId = useAppStore((s) => s.viewingFlowId);
  const closeFlowView = useAppStore((s) => s.closeFlowView);
  const openModal = useAppStore((s) => s.openModal);
  const flow = useFlowStore((s) => (viewingFlowId ? s.flows[viewingFlowId] : null));
  const updateFlow = useFlowStore((s) => s.updateFlow);
  const removeFlow = useFlowStore((s) => s.removeFlow);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const startEditTitle = useCallback(() => {
    if (!flow) return;
    setTitleDraft(flow.title);
    setEditingTitle(true);
  }, [flow]);

  const saveTitle = useCallback(() => {
    if (viewingFlowId && titleDraft.trim()) {
      updateFlow(viewingFlowId, { title: titleDraft.trim() });
    }
    setEditingTitle(false);
  }, [viewingFlowId, titleDraft, updateFlow]);

  const cancelEditTitle = useCallback(() => {
    setEditingTitle(false);
  }, []);

  if (!flow) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* 左侧：返回 + 标题 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={closeFlowView}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">返回</span>
            </button>

            <div className="h-5 w-px bg-gray-200 flex-shrink-0" />

            {/* 可编辑标题 */}
            {editingTitle ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveTitle();
                    if (e.key === 'Escape') cancelEditTitle();
                  }}
                  className="px-2 py-0.5 text-base font-semibold text-gray-900
                             bg-gray-50 rounded-lg border border-gray-200
                             focus:outline-none focus:ring-2 focus:ring-brand-200"
                  autoFocus
                />
                <button
                  onClick={saveTitle}
                  className="p-1 rounded-md text-emerald-500 hover:bg-emerald-50 transition-colors"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={cancelEditTitle}
                  className="p-1 rounded-md text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-base font-semibold text-gray-900 truncate">
                  {flow.title}
                </h1>
                <button
                  onClick={startEditTitle}
                  className="p-1 rounded-md text-gray-300 hover:text-gray-500 hover:bg-gray-100 opacity-0 hover:opacity-100 transition-all flex-shrink-0"
                  title="重命名"
                >
                  <Pencil size={13} />
                </button>
              </div>
            )}
          </div>

          {/* 右侧操作 */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon={Info}
              onClick={() => openModal('flowInfo', { flowId: viewingFlowId })}
            >
              简介
            </Button>
            <button
              onClick={() => {
                if (window.confirm(`确定删除流程「${flow.title}」？此操作不可撤销。`)) {
                  removeFlow(viewingFlowId);
                  closeFlowView();
                }
              }}
              className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
              title="删除流程"
            >
              <Trash2 size={15} />
            </button>
            <div className="h-4 w-px bg-gray-200 mx-1" />
            <div className="text-xs text-gray-400 tabular-nums">
              {flow.nodes.length} 节点
            </div>
          </div>
        </div>
      </div>

      {/* 流程图主体 */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        {/* 流程简介横幅（如果有简介内容） */}
        {(flow.description || flow.notes) && (
          <div
            className="card p-3 mb-4 flex items-start gap-3 cursor-pointer hover:shadow-sm transition-shadow"
            onClick={() => openModal('flowInfo', { flowId: viewingFlowId })}
          >
            {flow.description && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-0.5">
                  <FileText size={11} />
                  简介
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{flow.description}</p>
              </div>
            )}
            {flow.notes && (
              <div className="flex-1 min-w-0 border-l border-gray-100 pl-3">
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-0.5">
                  <MessageSquareText size={11} />
                  备注
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{flow.notes}</p>
              </div>
            )}
            <Info size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />
          </div>
        )}

        {/* 流程图 */}
        <div className="card p-4 sm:p-6">
          <FlowChart flowId={viewingFlowId} />
        </div>
      </div>
    </motion.div>
  );
}
