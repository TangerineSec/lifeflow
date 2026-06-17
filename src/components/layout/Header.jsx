import {
  Download,
  Upload,
  LayoutDashboard,
  FileJson,
  History,
} from 'lucide-react';
import Button from '../ui/Button';
import useFlowStore from '../../store/useFlowStore';
import { exportBackup, importBackup } from '../../utils/backup';
import useAppStore from '../../store/useAppStore';

/**
 * 顶部导航栏
 */
export default function Header() {
  const { flows, nodes, templates } = useFlowStore();
  const openModal = useAppStore((s) => s.openModal);

  const handleExport = () => {
    exportBackup({ flows, nodes, templates }, `lifeflow-${Date.now()}.json`);
  };

  const handleImport = async () => {
    try {
      const data = await importBackup();
      useFlowStore.getState().batchImportFlows(
        Object.values(data.flows || {}).map((f) => ({
          title: f.title,
          quadrant: f.quadrant,
          nodes: f.nodes
            .map((nid) => (data.nodes || {})[nid])
            .filter(Boolean),
        }))
      );
    } catch (err) {
      alert('导入失败：' + err.message);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* 左侧：Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">
            LifeFlow
          </h1>
          <span className="hidden sm:inline text-xs text-gray-400 ml-1">
            长事件进度追踪
          </span>
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            icon={Upload}
            onClick={handleImport}
          >
            导入
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Download}
            onClick={handleExport}
          >
            导出
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={History}
            onClick={() => openModal('backup')}
          >
            备份
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={FileJson}
            onClick={() => openModal('template')}
          >
            模版库
          </Button>
        </div>
      </div>
    </header>
  );
}
