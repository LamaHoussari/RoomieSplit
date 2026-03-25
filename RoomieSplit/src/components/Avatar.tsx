type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  initials: string;
  colorClass: string;
  size?: AvatarSize;
}

export default function Avatar({ initials, colorClass, size = 'md' }: AvatarProps) {
  const sizes: Record<AvatarSize, string> = { sm: 'w-8 h-8 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-bold flex-shrink-0 ${sizes[size]} ${colorClass}`}>
      {initials}
    </span>
  );
}
