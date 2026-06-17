import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Download,
  Upload,
  LayoutDashboard,
  FileJson,
  History,
  LogOut,
  User,
  ChevronDown,
  Cloud,
  CloudOff,
  Loader2,
} from 'lucide-react';
import Button from '../ui/Button';
import useFlowStore from '../../store/useFlowStore';
import { exportBackup, importBackup } from '../../utils/backup';
import useAppStore from '../../store/useAppStore';
import useAuthStore from '../../store/useAuthStore';

/**
 * 顶部导航栏
 */
export default function Header() {
  const { flows, nodes, templates } = useFlowStore();
  const openModal = useAppStore((s) => s.openModal);
  const { user, signOut, syncStatus } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // 点击外部关闭用户菜单
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

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

  const handleLogout = useCallback(async () => {
    setMenuOpen(false);
    await signOut();
  }, [signOut]);

  // 用户头像首字母（Supabase Auth: user.user_metadata 存储自定义字段）
  const userMeta = user?.user_metadata || {};
  const displayName = userMeta?.nickname || userMeta?.username || userMeta?.name || user?.email?.split('@')[0] || '用户';
  const avatarLetter = displayName[0].toUpperCase();

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

        {/* 右侧：操作按钮 + 用户信息 */}
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

          {/* 云端同步状态 */}
          <div className="flex items-center gap-1.5 px-2 text-[10px] text-gray-400">
            {syncStatus === 'syncing' && (
              <span className="flex items-center gap-1 text-amber-500">
                <Loader2 size={12} className="animate-spin" />
                同步中…
              </span>
            )}
            {syncStatus === 'synced' && (
              <span className="flex items-center gap-1 text-emerald-500">
                <Cloud size={12} />
                已同步
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="flex items-center gap-1 text-red-400">
                <CloudOff size={12} />
                同步失败
              </span>
            )}
            {syncStatus === 'idle' && (
              <span className="flex items-center gap-1">
                <Cloud size={12} className="text-gray-300" />
                就绪
              </span>
            )}
          </div>

          {/* 分割线 */}
          <div className="h-5 w-px bg-gray-200 mx-1" />

          {/* 用户菜单 */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* 用户头像 */}
              <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
                {avatarLetter}
              </div>
              <span className="hidden sm:inline text-xs text-gray-600 max-w-[80px] truncate">
                {displayName}
              </span>
              <ChevronDown
                size={12}
                className={`text-gray-300 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* 下拉菜单 */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-50">
                  <div className="text-xs font-medium text-gray-900 truncate">
                    {displayName}
                  </div>
                  {user?.email && (
                    <div className="text-[10px] text-gray-400 truncate mt-0.5">
                      {user.email}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <LogOut size={13} />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
