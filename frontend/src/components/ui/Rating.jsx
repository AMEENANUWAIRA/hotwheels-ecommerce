// frontend/src/components/ui/Rating.jsx
import { Star } from 'lucide-react';

export function Rating({ value, max = 5, size = 'md', interactive = false, onChange }) {
  const sizeMap = { sm: 14, md: 18, lg: 24 };
  const sz = sizeMap[size];

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onChange?.(star)}
          disabled={!interactive}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            size={sz}
            className={star <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );
}