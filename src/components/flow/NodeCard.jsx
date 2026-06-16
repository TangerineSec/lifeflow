import { memo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  FileEdit,
  Plus,
  Trash2,
  ListTodo,
} from 'lucide-react';
import useFlowStore from '../../store/useFlowStore';
import useAppStore from '../../store/useAppStore';
import IconToggle from '../ui/IconToggle';
import SubFlowList from './SubFlowList';
import Checklist from './Checklist';

/**
 * 单个节点卡片
 *
 * 包含：
 * - 拖拽手柄（GripVertical）— 集成 @dnd-kit/sortable useSortable
 * - 标题、描述
 * - 状态切换图标
 * - 子分支展开/折叠
 * - 快捷操作（添加子节点、编辑、删除）
 * - CheckList 预览
 */
const NodeCard = memo(function NodeCard({ nodeId, flowId, compact = false }) {
  const node = useFlowStore((s) => s.nodes[nodeId]);
  const toggleNodeStatus = useFlowStore((s) => s.toggleNodeStatus);
  const addNode = useFlowStore((s) => s.addNode);
  const removeNode = useFlowStore((s) => s.removeNode);
  const openSidebar = useAppStore((s) => s.openSidebar);
  const expandedBranches = useAppStore((s) => s.expandedBranches);
  const toggleBranch = useAppStore((s) => s.toggleBranch);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: nodeId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  if (!node) return null;

  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedBranches[nodeId] !== false; // 默认展开
  const isCompleted = node.status === 'completed';

  const handleAddChild = useCallback(
    (e) => {
      e.stopPropagation();
      addNode({
        title: '新步骤',
        parentFlow: flowId,
        parentNode: nodeId,
      });
      // 自动展开
      if (!isExpanded) {
        toggleBranch(nodeId);
      }
    },
    [addNode, flowId, nodeId, isExpanded, toggleBranch]
  );

  const handleEdit = useCallback(
    (e) => {
      e.stopPropagation();
      openSidebar(nodeId, flowId);
    },
    [openSidebar, nodeId, flowId]
  );

  const handleDelete = useCallback(
    (e) => {
      e.stopPropagation();
      removeNode(nodeId);
    },
    [removeNode, nodeId]
  );

  return (
    <motion.div
      layout
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      {/* 节点卡片主体 */}
      <div
        className={`
          group relative flex items-start gap-2 p-3 rounded-xl
          border transition-all duration-200 cursor-pointer
          ${isDragging ? 'shadow-lg ring-2 ring-brand-200' : ''}
          ${
            isCompleted
              ? 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-200'
              : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
          }
        `}
        onClick={handleEdit}
      >
        {/* 拖拽手柄 — 连接到 @dnd-kit 的 listeners */}
        <div
          className="mt-0.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </div>

        {/* 状态切换 */}
        <div className="mt-0.5 flex-shrink-0">
          <IconToggle
            status={node.status}
            onToggle={() => toggleNodeStatus(nodeId)}
            size={compact ? 18 : 22}
          />
        </div>

        {/* 内容区 */}
        <div className="flex-1 min-w-0">
          {/* 标题行 */}
          <div className="flex items-center gap-2">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBranch(nodeId);
                }}
                className="flex-shrink-0 text-gray-300 hover:text-gray-600 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            )}
            <span
              className={`font-medium truncate ${
                compact ? 'text-sm' : 'text-base'
              } ${
                isCompleted
                  ? 'text-emerald-700 line-through decoration-emerald-300'
                  : 'text-gray-900'
              }`}
            >
              {node.title}
            </span>
            {node.checklist && node.checklist.length > 0 && (
              <span className="flex-shrink-0 text-[10px] text-gray-300">
                <ListTodo size={12} className="inline mr-0.5" />
                {node.checklist.filter((c) => c.done).length}/{node.checklist.length}
              </span>
            )}
          </div>

          {/* 描述 */}
          {node.description && !compact && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
              {node.description}
            </p>
          )}

          {/* Checklist（折叠在节点内，compact 模式隐藏） */}
          {!compact && isExpanded && node.checklist && node.checklist.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-50">
              <Checklist nodeId={nodeId} />
            </div>
          )}
        </div>

        {/* 快捷操作（hover 显示） */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={handleAddChild}
            className="p-1 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-all"
            title="添加子分支"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={handleEdit}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            title="编辑详情"
          >
            <FileEdit size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-50 transition-all"
            title="删除节点"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* 子分支列表（递归渲染） */}
      {hasChildren && isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="ml-6 mt-2 pl-4 border-l-2 border-brand-100"
        >
          <SubFlowList
            parentNodeId={nodeId}
            flowId={flowId}
            compact={compact}
          />
        </motion.div>
      )}
    </motion.div>
  );
});

export default NodeCard;
