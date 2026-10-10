import BottomSheet from '../common/BottomSheet';
import Button from '../common/Button';

function CreateBottomSheet({ onClose }) {
  return (
    <BottomSheet
      isOpen={true}
      onClose={onClose}
      title="만들기"
    >
      <div className="flex flex-col gap-3">
        <Button
          variant="secondary"
          className="w-full justify-start"
          onClick={onClose}
        >
          플레이리스트
        </Button>

        <Button
          variant="secondary"
          className="w-full justify-start"
          onClick={onClose}
        >
          통근 맞춤 플레이리스트 만들기
        </Button>
      </div>
    </BottomSheet>
  );
}

export default CreateBottomSheet;