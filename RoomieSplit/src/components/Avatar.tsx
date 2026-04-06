type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  initials: string;
  colorClass: string;
  size?: AvatarSize;
  src?: string | null;
}

export default function Avatar({ initials, colorClass, size = 'md', src }: AvatarProps) {
  const sizes: Record<AvatarSize, string> = { sm: 'w-8 h-8 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        className={`inline-flex rounded-full object-cover flex-shrink-0 ${sizes[size]}`}
      />
    );
  }
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-bold flex-shrink-0 ${sizes[size]} ${colorClass}`}>
      {initials}
    </span>
  );
}
