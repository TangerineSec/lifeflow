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

/**
 * LifeFlow 主应用组件
 * 由 AuthGuard 包裹，未登录时自动显示登录页
 */
function AppContent() {
  const confirmDialog = useAppStore((s) => s.confirmDialog);
  const closeConfirmDialog = useAppStore((s) => s.closeConfirmDialog);

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
