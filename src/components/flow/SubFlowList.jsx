import { useMemo } from 'react';
import useFlowStore from '../../store/useFlowStore';
import NodeCard from './NodeCard';

/**
 * SubFlowList — 子分支列表（递归组件）
 *
 * ═══════════════════════════════════════════════════════════
 * 递归渲染逻辑（配合 FlowChart 和 NodeCard）：
 *
 *   FlowChart 渲染顶层节点列表
 *   └─ 每个 NodeCard 检查 node.children
 *       └─ 如果有子节点 → 渲染 SubFlowList(parentNodeId)
 *           └─ SubFlowList 从 store.nodes 读取 parentNode.children
 *               └─ 映射每个 childId → NodeCard
 *                   └─ 新 NodeCard 再检查自己的 children
 *                       └─ 如果有 → 继续渲染 SubFlowList（递归）
 *
 * 这个组件自身是无状态的纯渲染组件，数据全部通过 store 读取。
 * 递归终止条件：node.children 为空数组。
 * ═══════════════════════════════════════════════════════════
 *
 * @param {string} parentNodeId - 父节点的 ID
 * @param {string} flowId - 所属流程图 ID
 * @param {boolean} compact - 紧凑模式
 */
export default function SubFlowList({ parentNodeId, flowId, compact = false }) {
  const parentNode = useFlowStore((s) => s.nodes[parentNodeId]);
  const nodes = useFlowStore((s) => s.nodes);

  // 按 order 排序的子节点列表
  const sortedChildren = useMemo(() => {
    if (!parentNode) return [];
    return parentNode.children
      .map((id) => nodes[id])
      .filter(Boolean)
      .sort((a, b) => a.order - b.order);
  }, [parentNode, nodes]);

  if (!parentNode || sortedChildren.length === 0) return null;

  return (
    <div className="space-y-2">
      {sortedChildren.map((child) => (
        <NodeCard
          key={child.id}
          nodeId={child.id}
          flowId={flowId}
          compact={compact}
        />
      ))}
    </div>
  );
}
