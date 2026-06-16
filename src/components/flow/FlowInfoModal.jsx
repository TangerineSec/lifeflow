import { useState, useEffect } from 'react';
import { FileText, MessageSquareText, Save } from 'lucide-react';
import useFlowStore from '../../store/useFlowStore';
import useAppStore from '../../store/useAppStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

/**
 * FlowInfoModal — 流程简介与备注编辑弹窗
 *
 * 在流程详情页点击「ℹ️ 简介」按钮后弹出
 */
export default function FlowInfoModal() {
  const modalOpen = useAppStore((s) => s.modalOpen);
  const modalType = useAppStore((s) => s.modalType);
  const modalData = useAppStore((s) => s.modalData);
  const closeModal = useAppStore((s) => s.closeModal);

  const flowId = modalData?.flowId;
  const flow = useFlowStore((s) => (flowId ? s.flows[flowId] : null));
  const updateFlow = useFlowStore((s) => s.updateFlow);

  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (flow) {
      setDescription(flow.description || '');
      setNotes(flow.notes || '');
      setDirty(false);
    }
  }, [flow]);

  const handleSave = () => {
    if (!flowId) return;
    updateFlow(flowId, { description, notes });
    setDirty(false);
    closeModal();
  };

  if (modalType !== 'flowInfo') return null;

  return (
    <Modal open={modalOpen} onClose={closeModal} title="📋 流程简介与备注" width="max-w-lg">
      <div className="space-y-4">
        {/* 简介 */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
            <FileText size={13} />
            简介（Description）
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setDirty(true);
            }}
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700
                       focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300
                       transition-all duration-150 resize-none"
            placeholder="描述这个流程的目标和核心内容..."
          />
        </div>

        {/* 备注 */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
            <MessageSquareText size={13} />
            备注 / 灵感记录
          </label>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setDirty(true);
            }}
            rows={5}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700
                       focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300
                       transition-all duration-150 resize-none"
            placeholder="记录这个流程的备注、注意事项、灵感..."
          />
        </div>

        {/* 保存按钮 */}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button
            variant="primary"
            size="sm"
            icon={Save}
            onClick={handleSave}
            disabled={!dirty}
          >
            保存
          </Button>
        </div>
      </div>
    </Modal>
  );
}
