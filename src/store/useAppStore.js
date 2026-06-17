import { create } from 'zustand';

/**
 * 应用全局状态
 * 管理 UI 相关的状态（当前 Tab、侧边栏、编辑中的节点、视图导航等）
 */
const useAppStore = create((set) => ({
  // 当前选中的象限 Tab
  activeQuadrant: 'work',

  // 流程详情视图（进入流程图详情的全屏视图）
  viewingFlowId: null,

  // 视图模式（'linear' | 'fishbone'）
  viewMode: 'linear',

  // 侧边栏（节点详情）
  sidebarOpen: false,
  activeNodeId: null,
  activeFlowId: null,

  // 模态对话框
  modalOpen: false,
  modalType: null, // 'template' | 'import' | 'nodeDetail' | 'flowInfo'
  modalData: null,

  // 确认对话框
  confirmDialog: null, // { title, message, confirmText, onConfirm } | null

  // 已展开的分支（用于 UI 折叠/展开控制）
  expandedBranches: {},

  // Action: 设置当前 Tab
  setActiveQuadrant: (quadrant) => set({ activeQuadrant: quadrant }),

  // Action: 设置当前 Flow
  setActiveFlowId: (flowId) => set({ activeFlowId: flowId }),

  // Action: 进入流程详情视图
  openFlowView: (flowId) => set({ viewingFlowId: flowId }),

  // Action: 退出流程详情视图
  closeFlowView: () => set({ viewingFlowId: null }),

  // Action: 设置视图模式
  setViewMode: (mode) => set({ viewMode: mode }),

  // Action: 打开侧边栏编辑节点
  openSidebar: (nodeId, flowId) =>
    set({
      sidebarOpen: true,
      activeNodeId: nodeId,
      activeFlowId: flowId,
    }),

  // Action: 关闭侧边栏
  closeSidebar: () =>
    set({
      sidebarOpen: false,
      activeNodeId: null,
    }),

  // Action: 打开模态框
  openModal: (type, data = null) =>
    set({ modalOpen: true, modalType: type, modalData: data }),

  // Action: 关闭模态框
  closeModal: () =>
    set({ modalOpen: false, modalType: null, modalData: null }),

  // Action: 显示确认对话框
  showConfirmDialog: (dialog) => set({ confirmDialog: dialog }),

  // Action: 关闭确认对话框
  closeConfirmDialog: () => set({ confirmDialog: null }),

  // Action: 切换分支展开/折叠
  toggleBranch: (nodeId) =>
    set((state) => ({
      expandedBranches: {
        ...state.expandedBranches,
        [nodeId]: !state.expandedBranches[nodeId],
      },
    })),

  // Action: 展开所有分支
  expandAll: () =>
    set((state) => ({
      expandedBranches: Object.keys(state.expandedBranches).reduce(
        (acc, k) => ({ ...acc, [k]: true }),
        {}
      ),
    })),

  // Action: 折叠所有分支
  collapseAll: () => set({ expandedBranches: {} }),
}));

export default useAppStore;
