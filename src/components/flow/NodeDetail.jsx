import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Save,
  FileText,
  MessageSquareText,
  ListTodo,
  Trash2,
} from 'lucide-react';
import useFlowStore from '../../store/useFlowStore';
import useAppStore from '../../store/useAppStore';
import Checklist from './Checklist';
import Button from '../ui/Button';

/**
 * 节点详情编辑侧边栏
 *
 * 通过点击 NodeCard 打开，支持编辑：
 * - 标题与简介（Description）
 * - 备注/灵感记录（Notes）
 * - 子任务清单（Checklist）
 */
export default function NodeDetail() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const activeNodeId = useAppStore((s) => s.activeNodeId);
  const activeFlowId = useAppStore((s) => s.activeFlowId);
  const closeSidebar = useAppStore((s) => s.closeSidebar);

  const node = useFlowStore((s) => (activeNodeId ? s.nodes[activeNodeId] : null));
  const updateNode = useFlowStore((s) => s.updateNode);
  const removeNode = useFlowStore((s) => s.removeNode);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // 当 activeNodeId 变化时，填充表单
  useEffect(() => {
    if (node) {
      setTitle(node.title || '');
      setDescription(node.description || '');
      setNotes(node.notes || '');
      setHasChanges(false);
    }
  }, [node]);

  const handleSave = useCallback(() => {
    if (!activeNodeId) return;
    updateNode(activeNodeId, { title, description, notes });
    setHasChanges(false);
  }, [activeNodeId, title, description, notes, updateNode]);

  // 自动保存：关闭时如果有未保存的变更则保存
  const handleClose = useCallback(() => {
    if (hasChanges && activeNodeId) {
      updateNode(activeNodeId, { title, description, notes });
    }
    closeSidebar();
  }, [hasChanges, activeNodeId, title, description, notes, updateNode, closeSidebar]);

  const handleDelete = useCallback(() => {
    if (!activeNodeId) return;
    removeNode(activeNodeId);
    closeSidebar();
  }, [activeNodeId, removeNode, closeSidebar]);

  const markChanged = () => {
    if (!hasChanges) setHasChanges(true);
  };

  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: sidebarOpen ? 0 : '100%' }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed right-0 top-14 bottom-0 z-30 w-full sm:w-96 bg-white border-l border-gray-100 shadow-xl flex flex-col"
    >
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          节点详情
        </h2>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {node ? (
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 标题 */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <FileText size={13} />
              标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                markChanged();
              }}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-900
                         focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300
                         transition-all duration-150"
              placeholder="节点标题"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <FileText size={13} />
              简介（Description）
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                markChanged();
              }}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300
                         transition-all duration-150 resize-none"
              placeholder="描述该节点的目标和关键内容..."
            />
          </div>

          {/* 备注 */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
              <MessageSquareText size={13} />
              备注 / 灵感记录
            </label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                markChanged();
              }}
              rows={4}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300
                         transition-all duration-150 resize-none"
              placeholder="记录你的想法、灵感、注意事项..."
            />
          </div>

          {/* 子任务清单 */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
              <ListTodo size={13} />
              子任务清单
            </div>
            <div className="card p-3">
              <Checklist nodeId={activeNodeId} />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="primary"
              size="sm"
              icon={Save}
              onClick={handleSave}
              disabled={!hasChanges}
            >
              保存
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={handleDelete}
            >
              删除节点
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          请选择一个节点
        </div>
      )}
    </motion.aside>
  );
}
