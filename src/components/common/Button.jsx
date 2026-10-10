const variantStyles = {
  primary:
    'bg-spotify-green text-black hover:bg-spotify-green-hover',
  secondary:
    'bg-spotify-card text-white hover:bg-spotify-card-hover',
  ghost:
    'bg-transparent text-spotify-subtext hover:bg-white/10 hover:text-white',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base',
};

function Button({
  children,         /* 버튼 내부 콘텐츠 */
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  onClick,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-full font-bold transition-colors
        focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-spotify-green
        disabled:cursor-not-allowed disabled:opacity-50
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default Button;
