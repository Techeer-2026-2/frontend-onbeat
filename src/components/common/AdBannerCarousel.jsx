import { useEffect, useRef, useState } from "react";
import { homeAdBanners } from "../../data/mockBanners";
import { useMatchedBanner } from "../../hooks/useBanner";
import { recordBannerClick } from "../../api/banners";

const SLIDE_DELAY = 4000;
const SWIPE_THRESHOLD = 36;

// banners: 앱 자체 프로모션 배너 (로컬 이미지)
// 서버가 나에게 맞는 광고(/banners/match)를 주면 맨 앞에 끼워서 보여준다
export default function AdBannerCarousel({
  banners: promoBanners = homeAdBanners,
}) {
  const { data: adBanner } = useMatchedBanner();
  const banners = adBanner ? [adBanner, ...promoBanners] : promoBanners;
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const startX = useRef(null);
  const dragged = useRef(false);
  const unlockTimer = useRef(null);
  const changeTo = (next) => {
    if (isTransitioning || !banners.length) return;
    setIsTransitioning(true);
    setIndex((next + banners.length) % banners.length);
    unlockTimer.current = window.setTimeout(
      () => setIsTransitioning(false),
      460,
    );
  };
  useEffect(() => {
    const timer = window.setTimeout(() => changeTo(index + 1), SLIDE_DELAY);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 원래 코드 동작 유지 (슬라이드 바뀔 때만 타이머 재설정)
  }, [index, banners.length]);
  useEffect(() => () => window.clearTimeout(unlockTimer.current), []);
  const begin = (event) => {
    startX.current = event.clientX;
    dragged.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const end = (event) => {
    if (startX.current === null) return;
    const distance = event.clientX - startX.current;
    startX.current = null;
    if (Math.abs(distance) > 8) dragged.current = true;
    if (Math.abs(distance) >= SWIPE_THRESHOLD)
      changeTo(index + (distance < 0 ? 1 : -1));
  };
  const clickBanner = (event, banner) => {
    if (dragged.current) {
      event.preventDefault();
      dragged.current = false;
      return;
    }
    if (!banner.link) {
      event.preventDefault();
      return;
    }
    if (banner.notificationId)
      recordBannerClick(banner.notificationId).catch(() => {});
  };
  if (!banners.length) return null;
  return (
    <section className="ad-banner-carousel" aria-label="추천 프로모션">
      <div
        className="ad-banner-viewport"
        onPointerDown={begin}
        onPointerUp={end}
        onPointerCancel={() => {
          startX.current = null;
        }}
      >
        <div
          className="ad-banner-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {banners.map((banner) => (
            <a
              className="ad-banner-slide"
              key={banner.id}
              href={banner.link || undefined}
              target={banner.isAd ? "_blank" : undefined}
              rel={banner.isAd ? "noopener noreferrer sponsored" : undefined}
              onClick={(event) => clickBanner(event, banner)}
              aria-label={
                banner.link ? banner.alt : `${banner.alt} (연결된 링크 없음)`
              }
            >
              <img src={banner.image} alt={banner.alt} />
            </a>
          ))}
        </div>
      </div>
      <div
        className="ad-banner-dots"
        role="tablist"
        aria-label="광고 배너 선택"
      >
        {banners.map((banner, dotIndex) => (
          <button
            key={banner.id}
            type="button"
            className={dotIndex === index ? "active" : ""}
            onClick={() => changeTo(dotIndex)}
            role="tab"
            aria-selected={dotIndex === index}
            aria-label={`${dotIndex + 1}번 배너 보기`}
          />
        ))}
      </div>
    </section>
  );
}
