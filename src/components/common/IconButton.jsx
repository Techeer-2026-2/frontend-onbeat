function IconButton({
  children,
  label,        /*버튼의 기능을 설명하는 이름*/
  size = 'md',
  disabled = false,
  className = '',
  onClick,
  type = 'button',
}) {
  const sizeStyles = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <button
      type={type}
      aria-label={label}
      title={label}        /*마우스 올렸을 때 설명 표시*/
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex shrink-0 items-center justify-center
        rounded-full text-white
        transition-colors hover:bg-white/10
        focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-spotify-green
        disabled:cursor-not-allowed disabled:opacity-50
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default IconButton;
