import { useMemo, useCallback } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import useFlowStore from '../../store/useFlowStore';
import useAppStore from '../../store/useAppStore';
import NodeCard from './NodeCard';
import FlowControls from './FlowControls';
import Button from '../ui/Button';

/**
 * FlowChart — 流程图引擎主组件
 *
 * ═══════════════════════════════════════════════════════════
 * 分支流程的递归渲染逻辑:
 *
 *   FlowChart（顶层容器）
 *    └─ flow.nodes 是顶层 nodeId 数组（有序）
 *        └─ 每个 nodeId → NodeCard 组件
 *            └─ 如果 node.children.length > 0
 *                └─ 渲染 SubFlowList(parentNodeId)
 *                    └─ 从 store 读取该 node 的 children 数组
 *                        └─ 每个 childId → NodeCard
 *                            └─ 如果该 node 也有 children → 继续递归 SubFlowList
 *
 * 数据结构上采用「扁平化 + 链表指针」方案:
 *   - nodes 对象存储了所有节点（扁平，不嵌套）
 *   - 每个 node 的 children 字段是一个 ID 数组（类似邻接表）
 *   - 修改子节点列表只需更新父节点的 children 数组（O(1)）
 *   - 递归渲染时通过 ID 查表获取节点数据
 *
 * 这样可以实现无限层级的树状/网状分支结构，
 * 同时避免深拷贝整棵树的性能开销。
 * ═══════════════════════════════════════════════════════════
 *
 * @param {string} flowId - 流程图 ID
 * @param {boolean} compact - 紧凑模式（仪表盘预览中使用）
 */
export default function FlowChart({ flowId, compact = false }) {
  const flow = useFlowStore((s) => s.flows[flowId]);
  const nodes = useFlowStore((s) => s.nodes);
  const reorderNodes = useFlowStore((s) => s.reorderNodes);
  const addNode = useFlowStore((s) => s.addNode);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // 按 order 排序的顶层节点列表
  const sortedRootNodes = useMemo(() => {
    if (!flow) return [];
    return flow.nodes
      .map((id) => nodes[id])
      .filter(Boolean)
      .sort((a, b) => a.order - b.order);
  }, [flow, nodes]);

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sortedRootNodes.findIndex((n) => n.id === active.id);
      const newIndex = sortedRootNodes.findIndex((n) => n.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      // 重新排列 ID 顺序
      const ids = sortedRootNodes.map((n) => n.id);
      const [moved] = ids.splice(oldIndex, 1);
      ids.splice(newIndex, 0, moved);

      reorderNodes(flowId, null, ids);
    },
    [sortedRootNodes, flowId, reorderNodes]
  );

  if (!flow) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        请选择一个流程查看详情
      </div>
    );
  }

  const rootIds = sortedRootNodes.map((n) => n.id);

  return (
    <div className={compact ? '' : 'py-4'}>
      {/* 顶部操作栏（非 compact 模式显示） */}
      {!compact && (
        <FlowControls flowId={flowId} />
      )}

      {/* 拖拽排序的节点列表 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={rootIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sortedRootNodes.map((node) => (
              <NodeCard
                key={node.id}
                nodeId={node.id}
                flowId={flowId}
                compact={compact}
              />
            ))}
            {/* 非空时始终显示「添加同级节点」入口 */}
            {sortedRootNodes.length > 0 && (
              <button
                onClick={() =>
                  addNode({ title: '新节点', parentFlow: flowId, parentNode: null })
                }
                className="w-full py-2 text-xs text-gray-300 hover:text-brand-500
                           border border-dashed border-gray-200 hover:border-brand-300
                           rounded-xl transition-all duration-150
                           flex items-center justify-center gap-1"
              >
                <Plus size={12} />
                添加同级节点
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* 空状态 — 含添加节点按钮 */}
      {sortedRootNodes.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm mb-3">暂无节点，开始添加第一个节点吧</p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() =>
              addNode({ title: '新节点', parentFlow: flowId, parentNode: null })
            }
          >
            添加节点
          </Button>
        </div>
      )}
    </div>
  );
}
