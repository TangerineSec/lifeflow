import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  CalendarDays,
  FolderOpen,
  ChevronRight,
  Layers,
  Trash2,
} from 'lucide-react';
import useFlowStore from '../../store/useFlowStore';
import useAppStore from '../../store/useAppStore';
import Button from '../ui/Button';

/**
 * 工作区特殊逻辑：
 * - 默认按日期维度展示（Calendar/Timeline）
 * - 支持在「父级日期目录」下添加通用流程（如：每日站会、日报）
 * - 支持在「具体日期」下挂载特定项目流程
 */
export default function WorkSection() {
  const { flows, addFlow, removeFlow } = useFlowStore();
  const openFlowView = useAppStore((s) => s.openFlowView);
  const showConfirmDialog = useAppStore((s) => s.showConfirmDialog);

  // 过滤出工作区的 flow
  const workFlows = Object.values(flows).filter((f) => f.quadrant === 'work');

  // 按日期分组
  const groupedByDate = workFlows.reduce((acc, flow) => {
    const dateKey = flow.dateContext || '__general__';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(flow);
    return acc;
  }, {});

  // 排序：通用在最前，然后按日期倒序
  const dateKeys = Object.keys(groupedByDate).sort((a, b) => {
    if (a === '__general__') return -1;
    if (b === '__general__') return 1;
    return b.localeCompare(a);
  });

  const handleAddFlow = (dateContext = null) => {
    const flowId = addFlow({
      name: dateContext ? `项目 - ${dateContext}` : '通用流程',
      quadrant: 'work',
      dateContext,
    });
  };

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => handleAddFlow(null)}
        >
          添加通用流程
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={CalendarDays}
          onClick={() => {
            const today = new Date().toISOString().slice(0, 10);
            handleAddFlow(today);
          }}
        >
          添加今日流程
        </Button>
      </div>

      {/* 日期分组展示 */}
      {dateKeys.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <FolderOpen size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">还没有工作流程，点上方按钮添加</p>
        </div>
      )}

      {dateKeys.map((dateKey) => (
        <motion.div
          key={dateKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* 日期分组标题 */}
          <div className="flex items-center gap-2 mb-3">
            <div className="px-2.5 py-0.5 bg-brand-50 text-brand-600 text-xs font-semibold rounded-lg">
              {dateKey === '__general__' ? '📋 通用流程' : `📅 ${dateKey}`}
            </div>
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">
              {groupedByDate[dateKey].length} 个流程
            </span>
          </div>

          {/* 该日期下的流程列表 */}
          <div className="space-y-3">
            {groupedByDate[dateKey].map((flow) => (
              <motion.div
                key={flow.id}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.15 }}
              >
                <div
                  onClick={() => openFlowView(flow.id)}
                  className="card p-4 cursor-pointer hover:shadow-md hover:border-gray-200
                             transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    {/* 流程图标 */}
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <Layers size={18} className="text-brand-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {flow.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">
                          {flow.nodes.length} 个节点
                        </span>
                        {(flow.description) && (
                          <>
                            <span className="text-gray-200">·</span>
                            <span className="text-xs text-gray-400 truncate">
                              {flow.description}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          showConfirmDialog({
                            title: '删除流程',
                            message: `确定删除「${flow.title}」？该流程下的所有节点和子任务将一并删除。`,
                            confirmText: '删除',
                            onConfirm: () => removeFlow(flow.id),
                          });
                        }}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50
                                   opacity-0 group-hover:opacity-100 transition-all"
                        title="删除流程"
                      >
                        <Trash2 size={14} />
                      </button>
                      <ChevronRight
                        size={16}
                        className="text-gray-200 group-hover:text-gray-400 transition-colors flex-shrink-0"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
