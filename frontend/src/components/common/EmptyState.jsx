import React from 'react';
import { Plus } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h4 className="text-base font-bold text-slate-900 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} icon={Plus} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
