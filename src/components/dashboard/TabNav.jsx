import {
  Briefcase,
  BookOpen,
  Heart,
  Sparkles,
} from 'lucide-react';
import useAppStore from '../../store/useAppStore';

/**
 * 四象限 Tab 导航
 * 工作 | 学习 | 生活 | 兴趣
 */
const TABS = [
  { key: 'work', label: '工作', icon: Briefcase },
  { key: 'study', label: '学习', icon: BookOpen },
  { key: 'life', label: '生活', icon: Heart },
  { key: 'hobby', label: '兴趣', icon: Sparkles },
];

export default function TabNav() {
  const activeQuadrant = useAppStore((s) => s.activeQuadrant);
  const setActiveQuadrant = useAppStore((s) => s.setActiveQuadrant);

  return (
    <nav className="flex gap-1 p-1 bg-gray-100/80 rounded-2xl w-fit">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActiveQuadrant(key)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            transition-all duration-200
            ${
              activeQuadrant === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </nav>
  );
}
