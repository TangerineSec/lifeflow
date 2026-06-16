import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

/**
 * ConfirmDialog — 带样式的确认对话框
 * 替换原生 window.confirm
 *
 * 用法：
 *   const [confirm, setConfirm] = useState(null); // { title, message, onConfirm }
 *   ...
 *   {confirm && (
 *     <ConfirmDialog
 *       title={confirm.title}
 *       message={confirm.message}
 *       onConfirm={() => { confirm.onConfirm(); setConfirm(null); }}
 *       onCancel={() => setConfirm(null)}
 *     />
 *   )}
 */
export default function ConfirmDialog({ open, title, message, confirmText = '确定删除', onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} width="max-w-sm">
      <div className="text-center py-2">
        {/* 图标 */}
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-400" />
        </div>

        {/* 标题 */}
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          {title || '确认操作'}
        </h3>

        {/* 消息 */}
        {message && (
          <p className="text-sm text-gray-500 mb-6">{message}</p>
        )}

        {/* 按钮 */}
        <div className="flex items-center gap-2 justify-center">
          <Button variant="ghost" onClick={onCancel}>
            取消
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
