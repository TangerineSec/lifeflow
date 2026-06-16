import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Save, Plus, X } from 'lucide-react';
import useFlowStore from '../../store/useFlowStore';
import useAppStore from '../../store/useAppStore';
import TemplateCard from './TemplateCard';
import ImportDialog from './ImportDialog';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

/**
 * 模版管理器 — 模态框入口
 *
 * 根据 store 中的 modalType 决定显示内容：
 * - 'template' → 浏览/搜索/加载模板 + 保存为模板
 * - 'import'   → 批量导入对话框
 */
export default function TemplateManager() {
  const { templates, addTemplate, removeTemplate, loadTemplateToFlow } =
    useFlowStore();
  const { flows } = useFlowStore();
  const modalOpen = useAppStore((s) => s.modalOpen);
  const modalType = useAppStore((s) => s.modalType);
  const modalData = useAppStore((s) => s.modalData);
  const closeModal = useAppStore((s) => s.closeModal);
  const openModal = useAppStore((s) => s.openModal);

  const [search, setSearch] = useState('');
  const [savingFlowId, setSavingFlowId] = useState('');
  const [saveName, setSaveName] = useState('');

  // 搜索过滤
  const filteredTemplates = useMemo(() => {
    if (!search.trim()) return templates;
    const q = search.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
    );
  }, [templates, search]);

  const handleLoadTemplate = (template) => {
    const targetQuadrant = modalData?.flowId
      ? flows[modalData.flowId]?.quadrant
      : template.quadrant;
    loadTemplateToFlow(template.id, targetQuadrant);
    closeModal();
  };

  const handleDeleteTemplate = (templateId) => {
    removeTemplate(templateId);
  };

  const handleSaveAsTemplate = () => {
    if (!savingFlowId || !saveName.trim()) return;
    addTemplate({
      name: saveName.trim(),
      quadrant: flows[savingFlowId]?.quadrant || 'life',
      description: `从流程图「${flows[savingFlowId]?.title}」保存`,
      nodes: exportFlowNodes(savingFlowId),
    });
    setSavingFlowId('');
    setSaveName('');
  };

  // 模版浏览内容
  const TemplateContent = () => (
    <div className="space-y-4">
      {/* 操作栏 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索模版..."
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-xl border border-gray-200
                       focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300
                       transition-all"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={Plus}
          onClick={() => openModal('import')}
        >
          批量导入
        </Button>
      </div>

      {/* 保存为模板 */}
      <div className="card p-3 bg-brand-50/30 border-brand-100">
        <div className="flex items-center gap-2 mb-2">
          <Save size={14} className="text-brand-500" />
          <span className="text-xs font-medium text-gray-600">
            将当前流程保存为个人模版
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={savingFlowId}
            onChange={(e) => setSavingFlowId(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm rounded-xl border border-gray-200
                       focus:outline-none focus:ring-2 focus:ring-brand-200 bg-white"
          >
            <option value="">选择流程图...</option>
            {Object.values(flows).map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="模版名称"
            className="flex-1 px-3 py-1.5 text-sm rounded-xl border border-gray-200
                       focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          <Button
            variant="primary"
            size="sm"
            icon={Save}
            onClick={handleSaveAsTemplate}
            disabled={!savingFlowId || !saveName.trim()}
          >
            保存
          </Button>
        </div>
      </div>

      {/* 模版网格 */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">
            {search ? '没有匹配的模版' : '模版库为空'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
          {filteredTemplates.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              onLoad={handleLoadTemplate}
              onDelete={handleDeleteTemplate}
            />
          ))}
        </div>
      )}

      <div className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
        预设模版不可删除。点击「加载到工作区」将模版添加到当前分类。
      </div>
    </div>
  );

  // 根据 modalType 渲染不同的模态框
  if (modalType === 'template') {
    return (
      <Modal open={modalOpen} onClose={closeModal} title="📚 模版库" width="max-w-3xl">
        <TemplateContent />
      </Modal>
    );
  }

  if (modalType === 'import') {
    return (
      <Modal open={modalOpen} onClose={closeModal} title="📥 批量导入" width="max-w-xl">
        <ImportDialog onClose={closeModal} />
      </Modal>
    );
  }

  return null;
}

/** 导出 flow 的节点树结构（用于保存为模版） */
function exportFlowNodes(flowId) {
  const state = useFlowStore.getState();
  const flow = state.flows[flowId];
  if (!flow) return [];

  function exportNode(nodeId) {
    const node = state.nodes[nodeId];
    if (!node) return null;
    const { parentFlow, children, ...nodeData } = node;
    return {
      ...nodeData,
      children: children.map((cid) => exportNode(cid)).filter(Boolean),
    };
  }

  return flow.nodes.map((nid) => exportNode(nid)).filter(Boolean);
}
