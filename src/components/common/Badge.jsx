const variantStyles = {
  default: 'bg-spotify-card text-spotify-subtext',  /*일반 카테고리*/
  primary: 'bg-spotify-green text-black',   /*기본 상태*/
  info: 'bg-blue-500/20 text-blue-400',     /*정보성 상태*/
  warning: 'bg-amber-500/20 text-amber-400',    /*주의가 필요한 상태*/
  danger: 'bg-red-500/20 text-red-400',     /*오류나 위험 상태*/
};

function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        rounded-full font-bold
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export default Badge;