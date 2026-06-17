import { useState, useRef, useCallback } from 'react';
import { Download, Upload, Undo2, Redo2, RotateCcw, History as HistoryIcon } from 'lucide-react';
import useFlowStore from '../../store/useFlowStore';
import useAppStore from '../../store/useAppStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

/**
 * =========================================================
 * BackupModal — 备份与恢复面板
 * =========================================================
 *
 * 功能：
 * 1. 数据备份 — 导出全部数据为 JSON / 从 JSON 导入恢复
 * 2. 版本历史 — 查看最近 10 次本地快照，支持一键回滚
 * 3. 撤销 / 重做
 *
 * 通过 useAppStore 的 modalType === 'backup' 控制显隐。
 * 版本历史数据来自 useFlowStore 的 snapshotHistory 字段。
 */

function formatTime(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BackupModal() {
  const modalOpen = useAppStore((s) => s.modalOpen && s.modalType === 'backup');
  const closeModal = useAppStore((s) => s.closeModal);

  const {
    snapshotHistory,
    snapshotIndex,
    saveSnapshot,
    undo,
    redo,
    exportAllData,
    importAllData,
    clearHistory,
  } = useFlowStore();

  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(null);

  // ── 撤销 / 重做 ──
  const canUndo = snapshotIndex > 0;
  const canRedo = snapshotIndex < snapshotHistory.length - 1;

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

  // ── 导出全部数据 ──
  const handleExport = useCallback(() => {
    exportAllData();
  }, [exportAllData]);

  // ── 导入备份（全量恢复） ──
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImporting(true);
      setImportError(null);

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // 校验数据格式
        if (!data.flows || !data.nodes) {
          throw new Error('无效的备份文件：缺少 flows 或 nodes 字段');
        }

        importAllData(data);
        closeModal(); // 导入成功后关闭弹窗
      } catch (err) {
        setImportError(err.message || '导入失败，请检查文件格式');
      } finally {
        setImporting(false);
        // 重置 file input 以便重复选择同一文件
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [importAllData, closeModal]
  );

  // ── 回滚到指定版本 ──
  const handleRollback = useCallback(
    (targetIndex) => {
      const store = useFlowStore.getState();
      const snapshot = store.snapshotHistory[targetIndex];
      if (!snapshot) return;

      // 直接从 store 设置快照状态
      useFlowStore.setState({
        flows: JSON.parse(JSON.stringify(snapshot.flows)),
        nodes: JSON.parse(JSON.stringify(snapshot.nodes)),
        snapshotIndex: targetIndex,
      });

      closeModal();
    },
    [closeModal]
  );

  // ── 已保存的快照列表（最近 10 条） ──
  const recentSnapshots = snapshotHistory.slice(-10).reverse();

  return (
    <>
      {/* 隐藏的文件输入，用于导入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="备份与恢复"
        width="max-w-xl"
      >
        <div className="space-y-6">
          {/* ═══ 区域一：撤销/重做 ═══ */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              操作历史
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={Undo2}
                onClick={handleUndo}
                disabled={!canUndo}
              >
                撤销 (Undo)
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={Redo2}
                onClick={handleRedo}
                disabled={!canRedo}
              >
                重做 (Redo)
              </Button>
              <div className="text-xs text-gray-400 ml-2">
                共 {snapshotHistory.length} 个快照
                {snapshotIndex >= 0 && ` · 当前位置 #${snapshotIndex + 1}`}
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* ═══ 区域二：导入/导出 ═══ */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              数据备份
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={Download}
                onClick={handleExport}
              >
                导出全部数据 (JSON)
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={Upload}
                onClick={handleImportClick}
                disabled={importing}
              >
                {importing ? '正在导入…' : '导入备份恢复'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={RotateCcw}
                onClick={clearHistory}
                disabled={snapshotHistory.length === 0}
              >
                清空历史
              </Button>
            </div>

            {/* 导入错误提示 */}
            {importError && (
              <div className="mt-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                {importError}
              </div>
            )}

            <p className="mt-2 text-xs text-gray-400">
              导出：将当前所有流程和节点保存为 JSON 文件。
              导入：选择历史备份文件进行全量数据恢复（将替换当前所有数据）。
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* ═══ 区域三：版本历史列表 ═══ */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              版本历史（最近 {Math.min(recentSnapshots.length, 10)} 条）
            </h3>

            {recentSnapshots.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                <HistoryIcon size={28} className="mx-auto mb-2 opacity-50" />
                <p>暂无历史快照</p>
                <p className="text-xs mt-1">
                  执行添加/删除节点、修改状态等操作后，系统会自动保存快照
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentSnapshots.map((snap, idx) => {
                  // 计算该快照在原始数组中的索引
                  const originalIndex = snapshotHistory.indexOf(snap);
                  const isCurrent = originalIndex === snapshotIndex;

                  return (
                    <div
                      key={originalIndex}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        isCurrent
                          ? 'bg-brand-50 border-brand-200'
                          : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-400 tabular-nums">
                            #{originalIndex + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-700 truncate">
                            {snap.description || '无描述'}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-100 text-brand-600 rounded">
                              当前
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {formatTime(snap.timestamp)}
                        </div>
                      </div>
                      {!isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRollback(originalIndex)}
                        >
                          回滚
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </Modal>
    </>
  );
}
