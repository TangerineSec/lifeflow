import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { genId } from '../utils/id';
import {
  DEFAULT_TEMPLATES,
  flattenTemplateNodes,
} from '../utils/defaultTemplates';

/**
 * =========================================================
 * LifeFlow 核心数据模型（Zustand + persist）
 * =========================================================
 *
 * 数据结构设计思路：
 *
 * ┌──────────────────────────────────────────────┐
 * │  flows: { [flowId]: Flow }                   │
 * │    ├── 描述一个独立的「流程图」                │
 * │    ├── quadrant → 四象限归属                   │
 * │    ├── nodes → 顶层 nodeId 数组（有序）        │
 * │    └── dateContext / dateParent → 仅 Work 象限 │
 * ├──────────────────────────────────────────────┤
 * │  nodes: { [nodeId]: Node }                   │
 * │    ├── 扁平化存储（非树形嵌套）                │
 * │    ├── children → 子节点 ID 数组（递归指针）    │
 * │    ├── parentNode → 指向父节点（null=顶层）     │
 * │    ├── status → 'completed' | 'pending'       │
 * │    ├── checklist → 子任务数组                  │
 * │    └── order → 同层排序权重                    │
 * ├──────────────────────────────────────────────┤
 * │  templates: [Template]                        │
 * └──────────────────────────────────────────────┘
 *
 * 分支流程的递归渲染逻辑（在 FlowChart / SubFlowList 中实现）：
 *
 *   FlowChart（顶层）
 *     └─ flow.nodes 是顶层 nodeId 列表
 *        └─ 每个 NodeCard 渲染一个节点
 *           └─ 如果 node.children.length > 0
 *              └─ 渲染 SubFlowList(parentNodeId)
 *                 └─ 从 store 读取该 node 的 children 数组
 *                    └─ 每个 childId → NodeCard
 *                       └─ 继续检查该 node 的 children → 递归 SubFlowList
 *
 * 这样实现了无限层级的树状/网状分支结构，且数据更新只需修改
 * 某个节点的 children 数组（O(1) 修改），无需深拷贝整棵树。
 */

const QUADRANTS = ['work', 'study', 'life', 'hobby'];

/**
 * 创建名为 name 的默认流程图
 */
function createDefaultFlow({ name = '新流程', quadrant = 'life' } = {}) {
  return {
    id: genId(),
    title: name,
    description: '',
    notes: '',
    quadrant,
    dateContext: null,
    dateParent: null,
    nodes: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * 创建一个空的节点
 */
function createNode({ title = '新节点', parentFlow, parentNode = null, order = 0 } = {}) {
  return {
    id: genId(),
    title,
    description: '',
    notes: '',
    status: 'pending',
    order,
    parentFlow,
    parentNode,
    children: [],
    checklist: [],
    createdAt: Date.now(),
  };
}

const useFlowStore = create(
  persist(
    (set, get) => ({
      // ===== 数据 =====
      flows: {},
      nodes: {},
      templates: [...DEFAULT_TEMPLATES],

      // ===== 加载预设模版 =====
      // 在应用启动时调用，如果没有任何 flow，则加载预设
      loadDefaultTemplates: () => {
        const state = get();
        if (Object.keys(state.flows).length > 0) return; // 已存在数据，不覆盖

        const newFlows = {};
        const newNodes = {};

        state.templates.forEach((tpl) => {
          // 为每个模版跳过已存在的 — 用模版 ID 派生出 flow ID
          const { flatNodes, rootIds } = flattenTemplateNodes(
            tpl.nodes,
            tpl.id
          );
          const flow = createDefaultFlow({
            name: tpl.name,
            quadrant: tpl.quadrant,
          });
          flow.id = tpl.id; // 保持与模版 ID 一致，便于识别
          flow.nodes = rootIds;
          Object.assign(newNodes, flatNodes);
          newFlows[flow.id] = flow;
        });

        set({ flows: newFlows, nodes: newNodes });
      },

      // ===== Flow 操作 =====
      addFlow: (flowData) => {
        const flow = createDefaultFlow(flowData);
        set((state) => ({
          flows: { ...state.flows, [flow.id]: flow },
        }));
        return flow.id;
      },

      removeFlow: (flowId) => {
        set((state) => {
          const { [flowId]: removed, ...restFlows } = state.flows;
          // 同时删除该 flow 下的所有节点
          const updatedNodes = { ...state.nodes };
          const nodeIdsToRemove = new Set();

          // 收集该 flow 下所有节点 (包括子节点)
          function collectNodeIds(nodeId) {
            nodeIdsToRemove.add(nodeId);
            const node = updatedNodes[nodeId];
            if (node && node.children) {
              node.children.forEach(collectNodeIds);
            }
          }
          if (removed) {
            removed.nodes.forEach(collectNodeIds);
            nodeIdsToRemove.forEach((id) => delete updatedNodes[id]);
          }

          return { flows: restFlows, nodes: updatedNodes };
        });
      },

      updateFlow: (flowId, updates) => {
        set((state) => {
          const flow = state.flows[flowId];
          if (!flow) return state;
          return {
            flows: {
              ...state.flows,
              [flowId]: { ...flow, ...updates, updatedAt: Date.now() },
            },
          };
        });
      },

      // ===== Node 操作 =====
      addNode: ({ title, parentFlow, parentNode = null }) => {
        const state = get();
        const flow = state.flows[parentFlow];
        if (!flow) return null;

        // 计算 order
        let order = 0;
        if (parentNode) {
          const pNode = state.nodes[parentNode];
          if (pNode) order = pNode.children.length;
        } else {
          order = flow.nodes.length;
        }

        const node = createNode({ title, parentFlow, parentNode, order });
        set((s) => {
          const newNodes = { ...s.nodes, [node.id]: node };
          const newFlows = { ...s.flows };

          if (parentNode) {
            // 添加到子分支
            const pNode = s.nodes[parentNode];
            if (pNode) {
              newNodes[parentNode] = {
                ...pNode,
                children: [...pNode.children, node.id],
              };
            }
          } else {
            // 添加到顶层
            newFlows[parentFlow] = {
              ...flow,
              nodes: [...flow.nodes, node.id],
              updatedAt: Date.now(),
            };
          }

          return { nodes: newNodes, flows: newFlows };
        });

        return node.id;
      },

      removeNode: (nodeId) => {
        set((state) => {
          const node = state.nodes[nodeId];
          if (!node) return state;

          const updatedNodes = { ...state.nodes };
          const toRemove = new Set();

          // 递归收集所有子节点
          function collect(id) {
            toRemove.add(id);
            const n = updatedNodes[id];
            if (n && n.children) {
              n.children.forEach(collect);
            }
          }
          collect(nodeId);

          // 从父节点/flow 的 children/nodes 列表中移除
          const newFlows = { ...state.flows };
          if (node.parentNode) {
            const pNode = updatedNodes[node.parentNode];
            if (pNode) {
              updatedNodes[node.parentNode] = {
                ...pNode,
                children: pNode.children.filter((id) => id !== nodeId),
              };
            }
          } else {
            const flow = newFlows[node.parentFlow];
            if (flow) {
              newFlows[node.parentFlow] = {
                ...flow,
                nodes: flow.nodes.filter((id) => id !== nodeId),
                updatedAt: Date.now(),
              };
            }
          }

          toRemove.forEach((id) => delete updatedNodes[id]);

          return { nodes: updatedNodes, flows: newFlows };
        });
      },

      updateNode: (nodeId, updates) => {
        set((state) => {
          const node = state.nodes[nodeId];
          if (!node) return state;
          return {
            nodes: {
              ...state.nodes,
              [nodeId]: { ...node, ...updates },
            },
          };
        });
      },

      toggleNodeStatus: (nodeId) => {
        set((state) => {
          const node = state.nodes[nodeId];
          if (!node) return state;
          return {
            nodes: {
              ...state.nodes,
              [nodeId]: {
                ...node,
                status: node.status === 'completed' ? 'pending' : 'completed',
              },
            },
          };
        });
      },

      // ===== Checklist 操作 =====
      addChecklistItem: (nodeId, text) => {
        set((state) => {
          const node = state.nodes[nodeId];
          if (!node) return state;
          const newItem = { id: genId(), text, done: false };
          return {
            nodes: {
              ...state.nodes,
              [nodeId]: {
                ...node,
                checklist: [...node.checklist, newItem],
              },
            },
          };
        });
      },

      toggleChecklistItem: (nodeId, itemId) => {
        set((state) => {
          const node = state.nodes[nodeId];
          if (!node) return state;
          return {
            nodes: {
              ...state.nodes,
              [nodeId]: {
                ...node,
                checklist: node.checklist.map((item) =>
                  item.id === itemId ? { ...item, done: !item.done } : item
                ),
              },
            },
          };
        });
      },

      removeChecklistItem: (nodeId, itemId) => {
        set((state) => {
          const node = state.nodes[nodeId];
          if (!node) return state;
          return {
            nodes: {
              ...state.nodes,
              [nodeId]: {
                ...node,
                checklist: node.checklist.filter((item) => item.id !== itemId),
              },
            },
          };
        });
      },

      // ===== 拖拽排序 =====
      // @dnd-kit 完成拖拽后重新排序
      reorderNodes: (flowId, parentNodeId, newOrder) => {
        // newOrder: [nodeId_1, nodeId_2, ...] 排序后的 ID 列表
        set((state) => {
          const updatedNodes = { ...state.nodes };
          const newFlows = { ...state.flows };

          // 更新 order 字段
          newOrder.forEach((nodeId, index) => {
            const n = updatedNodes[nodeId];
            if (n) {
              updatedNodes[nodeId] = { ...n, order: index };
            }
          });

          if (parentNodeId) {
            // 更新子节点的 children 列表
            const pNode = updatedNodes[parentNodeId];
            if (pNode) {
              updatedNodes[parentNodeId] = { ...pNode, children: newOrder };
            }
          } else {
            // 更新 flow 的顶层节点列表
            const flow = newFlows[flowId];
            if (flow) {
              newFlows[flowId] = { ...flow, nodes: newOrder, updatedAt: Date.now() };
            }
          }

          return { nodes: updatedNodes, flows: newFlows };
        });
      },

      // ===== 模板管理 =====
      addTemplate: (template) => {
        set((state) => ({
          templates: [
            ...state.templates,
            { ...template, id: genId() },
          ],
        }));
      },

      removeTemplate: (templateId) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== templateId),
        }));
      },

      // 将当前 flow 保存为模板
      saveFlowAsTemplate: (flowId, name) => {
        const state = get();
        const flow = state.flows[flowId];
        if (!flow) return;

        // 导出该 flow 下的节点树结构
        function exportNode(nodeId) {
          const node = state.nodes[nodeId];
          if (!node) return null;
          const { parentFlow, children, ...nodeData } = node;
          return {
            ...nodeData,
            children: children
              .map((cid) => exportNode(cid))
              .filter(Boolean),
          };
        }

        const treeNodes = flow.nodes.map((nid) => exportNode(nid)).filter(Boolean);

        const newTemplate = {
          id: genId(),
          name: name || flow.title,
          quadrant: flow.quadrant,
          icon: 'FileText',
          description: `从流程图「${flow.title}」保存`,
          nodes: treeNodes,
        };

        set((s) => ({
          templates: [...s.templates, newTemplate],
        }));
      },

      // 从模板加载到当前工作区
      loadTemplateToFlow: (templateId, quadrant) => {
        const state = get();
        const tpl = state.templates.find((t) => t.id === templateId);
        if (!tpl) return null;

        const flowId = genId();
        const { flatNodes, rootIds } = flattenTemplateNodes(tpl.nodes, flowId);

        const flow = createDefaultFlow({
          name: tpl.name,
          quadrant: quadrant || tpl.quadrant,
        });
        flow.id = flowId;
        flow.nodes = rootIds;

        set((s) => ({
          flows: { ...s.flows, [flowId]: flow },
          nodes: { ...s.nodes, ...flatNodes },
        }));

        return flowId;
      },

      // ===== 批量导入 =====
      batchImportFlows: (flowsData) => {
        const newFlows = {};
        const newNodes = {};

        flowsData.forEach((flowData) => {
          const flow = createDefaultFlow({
            name: flowData.title || '导入的流程',
            quadrant: flowData.quadrant || 'life',
          });

          if (flowData.nodes && Array.isArray(flowData.nodes)) {
            const { flatNodes, rootIds } = flattenTemplateNodes(
              flowData.nodes,
              flow.id
            );
            flow.nodes = rootIds;
            Object.assign(newNodes, flatNodes);
          }

          newFlows[flow.id] = flow;
        });

        set((s) => ({
          flows: { ...s.flows, ...newFlows },
          nodes: { ...s.nodes, ...newNodes },
        }));
      },
    }),
    {
      name: 'lifeflow-storage',
      version: 1,
    }
  )
);

export default useFlowStore;
