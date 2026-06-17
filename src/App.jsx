import { useEffect, useRef } from 'react';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import NodeDetail from './components/flow/NodeDetail';
import FlowInfoModal from './components/flow/FlowInfoModal';
import DataInitializer from './components/layout/DataInitializer';
import TemplateManager from './components/template/TemplateManager';
import BackupModal from './components/flow/BackupModal';
import ConfirmDialog from './components/ui/ConfirmDialog';
import AuthGuard from './components/auth/AuthGuard';
import useAppStore from './store/useAppStore';
import useFlowStore from './store/useFlowStore';
import useAuthStore from './store/useAuthStore';

/**
 * LifeFlow 主应用组件
 * 由 AuthGuard 包裹，未登录时自动显示登录页
 */
function AppContent() {
  const confirmDialog = useAppStore((s) => s.confirmDialog);
  const closeConfirmDialog = useAppStore((s) => s.closeConfirmDialog);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialized = useRef(false);

  // 登录后触发云端数据同步
  useEffect(() => {
    if (isAuthenticated && !initialized.current) {
      initialized.current = true;
      useFlowStore.getState().loadFromCloud();
    }
  }, [isAuthenticated]);

  // 监听数据变更，自动推送到云端
  useEffect(() => {
    const unsub = useFlowStore.subscribe((state, prevState) => {
      // 排除首次加载和快照变更
      if (state.flows === prevState.flows && state.nodes === prevState.nodes) return;
      if (Object.keys(prevState.flows).length === 0 && Object.keys(state.flows).length > 0) return;

      state._triggerSync();
    });
    return unsub;
  }, []);

  return (
    <DataInitializer>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Dashboard />
        <NodeDetail />
        <FlowInfoModal />
        <TemplateManager />
        <BackupModal />

        {/* 全局确认对话框 */}
        {confirmDialog && (
          <ConfirmDialog
            open={!!confirmDialog}
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmText={confirmDialog.confirmText}
            onConfirm={() => {
              confirmDialog.onConfirm();
              closeConfirmDialog();
            }}
            onCancel={closeConfirmDialog}
          />
        )}
      </div>
    </DataInitializer>
  );
}

/**
 * App 入口：AuthGuard 路由守卫包裹主内容
 */
function App() {
  return (
    <AuthGuard>
      <AppContent />
    </AuthGuard>
  );
}

export default App;
