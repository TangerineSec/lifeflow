import { motion } from 'framer-motion';
import { Plus, FolderOpen, ChevronRight, Layers } from 'lucide-react';
import useFlowStore from '../../store/useFlowStore';
import useAppStore from '../../store/useAppStore';
import Button from '../ui/Button';

/**
 * 非工作区的通用区域组件
 * 学习 | 生活 | 兴趣 三个象限使用
 * 按项目/标签聚合展示
 */
export default function GenericSection({ quadrant }) {
  const { flows, addFlow } = useFlowStore();
  const openFlowView = useAppStore((s) => s.openFlowView);

  // 过滤出该象限的 flow
  const sectionFlows = Object.values(flows).filter(
    (f) => f.quadrant === quadrant
  );

  const handleAddFlow = () => {
    const labels = { study: '学习', life: '生活', hobby: '兴趣' };
    addFlow({ name: `新${labels[quadrant] || '流程'}`, quadrant });
  };

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={handleAddFlow}
        >
          新建流程
        </Button>
      </div>

      {/* 无数据状态 */}
      {sectionFlows.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <FolderOpen size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">该分类还没有流程，点上方按钮创建</p>
        </div>
      )}

      {/* 流程列表卡片 */}
      <div className="grid gap-3 md:grid-cols-2">
        {sectionFlows.map((flow, idx) => (
          <motion.div
            key={flow.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.2 }}
            whileHover={{ y: -1 }}
          >
            <div
              onClick={() => openFlowView(flow.id)}
              className="card p-4 cursor-pointer hover:shadow-md hover:border-gray-200
                         transition-all duration-200 group h-full"
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
                    {flow.description && (
                      <>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400 truncate">
                          {flow.description}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-gray-200 group-hover:text-gray-400 transition-colors flex-shrink-0"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
