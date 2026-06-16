import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import NodeDetail from './components/flow/NodeDetail';
import FlowInfoModal from './components/flow/FlowInfoModal';
import DataInitializer from './components/layout/DataInitializer';
import TemplateManager from './components/template/TemplateManager';
import ConfirmDialog from './components/ui/ConfirmDialog';
import useAppStore from './store/useAppStore';

/**
 * LifeFlow 主应用组件
 */
function App() {
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

export default App;
