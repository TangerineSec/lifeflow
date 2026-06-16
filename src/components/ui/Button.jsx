import { forwardRef } from 'react';

/**
 * 统一按钮组件
 * 支持 variant: 'primary' | 'ghost' | 'danger'
 */
const Button = forwardRef(
  ({ children, variant = 'ghost', size = 'md', className = '', icon: Icon, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
      primary:
        'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm',
      ghost:
        'text-gray-600 hover:bg-gray-100 active:bg-gray-200',
      danger:
        'text-red-500 hover:bg-red-50 active:bg-red-100',
    };
    const sizes = {
      sm: 'px-2.5 py-1 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {Icon && <Icon size={16} />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
