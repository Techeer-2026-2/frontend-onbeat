import { useEffect } from 'react';

function BottomSheet({
  isOpen,       /*패널을 보여줄지 결정*/
  onClose,      /*패널을 닫을 때 실행할 함수*/
  children,     /*패널 안에 표시할 메뉴*/
  title = '메뉴',   /*패널의 제목 및 접근성 이름*/
}) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="
          w-full max-w-md rounded-t-2xl
          border border-white/10 bg-spotify-dark
          p-5 pb-8 shadow-2xl
          animate-in slide-in-from-bottom duration-200
        "
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/30" />

        <h2 className="mb-4 text-lg font-bold text-white">
          {title}
        </h2>

        {children}
      </section>
    </div>
  );
}

export default BottomSheet;