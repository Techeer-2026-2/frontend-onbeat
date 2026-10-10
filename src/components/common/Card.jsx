function Card({
  children,
  padding = 'md',
  hoverable = false,
  className = '',
  onClick,
}) {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl border border-white/10
        bg-spotify-dark
        ${paddingStyles[padding]}
        ${hoverable ? 'transition-colors hover:bg-spotify-card-hover' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Card;
