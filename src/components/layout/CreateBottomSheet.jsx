function CreateBottomSheet({ onClose }) {
  return (
    <div>
      <button onClick={onClose}>닫기</button>

      <button>플레이리스트</button>
      <button>통근 맞춤 플레이리스트 만들기</button>
    </div>
  )
}

export default CreateBottomSheet;