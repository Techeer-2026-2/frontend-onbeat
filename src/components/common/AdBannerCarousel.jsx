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
  // 자동 넘김: 넘어가는 중(isTransitioning)이 끝난 뒤에 다음 타이머를 건다
  // (예전에는 넘어가는 중인 상태를 기억한 채 타이머가 실행돼서 한 번 넘긴 뒤 멈췄음)
  useEffect(() => {
    if (isTransitioning) return undefined;
    const timer = window.setTimeout(() => changeTo(index + 1), SLIDE_DELAY);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- changeTo는 매번 새로 만들어지므로 제외
  }, [index, banners.length, isTransitioning]);
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
    if (!banner.link) event.preventDefault(); // 이동할 곳이 없으면 페이지 이동은 막음
    // 광고는 링크가 없어도 누른 것 자체를 클릭으로 기록 (같은 notificationId는 서버가 한 번만 집계)
    if (banner.isAd) recordBannerClick(banner.notificationId).catch(() => {});
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
              className={`ad-banner-slide ${banner.isAd ? "is-ad" : ""}`}
              key={banner.id}
              href={banner.link || undefined}
              target={banner.isAd && banner.link ? "_blank" : undefined}
              rel={banner.isAd ? "noopener noreferrer sponsored" : undefined}
              onClick={(event) => clickBanner(event, banner)}
              aria-label={
                banner.isAd
                  ? `광고: ${banner.alt}`
                  : banner.link
                    ? banner.alt
                    : `${banner.alt} (연결된 링크 없음)`
              }
            >
              {banner.image ? (
                <img src={banner.image} alt={banner.alt} />
              ) : (
                <div className="ad-banner-text">
                  <strong>{banner.title}</strong>
                  {banner.body && <span>{banner.body}</span>}
                </div>
              )}
              {banner.isAd && <span className="ad-banner-badge">광고</span>}
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
