import { useState } from "react";
import { Search } from "lucide-react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { usePlaceSearch } from "../../hooks/useCommute";

// 장소 입력칸 + 카카오 장소 검색 결과 목록
// value: 고른 장소 { placeName, address, latitude, longitude } 또는 null
// onChange(place | null): 장소를 고르면 장소, 다시 타이핑하면 null (좌표가 없는 상태)
export default function PlaceInput({
  value,
  onChange,
  ariaLabel,
  placeholder = "장소 검색",
}) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const keyword = useDebouncedValue(open ? text.trim() : "", 300);
  const places = usePlaceSearch(keyword);
  const results = places.data ?? [];

  const pick = (place) => {
    onChange(place);
    setText(place.placeName);
    setOpen(false);
  };

  return (
    <div className="field-end place-input">
      <input
        value={value ? value.placeName : text}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
          if (value) onChange(null);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)} // 목록 클릭이 먼저 처리되도록 잠깐 기다림
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
      />
      <Search size={19} />
      {open && keyword && (
        <ul
          className="place-suggestions"
          role="listbox"
          aria-label={`${ariaLabel} 검색 결과`}
        >
          {places.isLoading && <li className="place-status">검색 중...</li>}
          {places.isError && (
            <li className="place-status">장소를 불러오지 못했어요.</li>
          )}
          {!places.isLoading && !places.isError && !results.length && (
            <li className="place-status">검색 결과가 없어요.</li>
          )}
          {results.slice(0, 6).map((place) => (
            <li key={`${place.placeName}-${place.latitude}-${place.longitude}`}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(e) => e.preventDefault()} // 입력칸 포커스가 먼저 빠지지 않게
                onClick={() => pick(place)}
              >
                <strong>{place.placeName}</strong>
                {place.address && <small>{place.address}</small>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
