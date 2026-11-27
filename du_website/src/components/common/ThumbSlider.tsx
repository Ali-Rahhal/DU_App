import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCompanyAssets } from "@/hooks/useCompanyAssets";

interface ThumbSliderProps {
  images: string[];
}

const SWIPE_THRESHOLD = 40;

const ThumbSlider = ({ images }: ThumbSliderProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const [isZooming, setIsZooming] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const { companyPlaceholder } = useCompanyAssets();

  useEffect(() => {
    setActiveIndex(0);
    setFailed({});
  }, [images]);

  // Keep the active thumbnail centred in its rail
  useEffect(() => {
    const track = trackRef.current;
    const thumb = track?.children[activeIndex] as HTMLElement | undefined;

    if (!track || !thumb) return;

    track.scrollTo({
      top: thumb.offsetTop - track.clientHeight / 2 + thumb.offsetHeight / 2,
      left: thumb.offsetLeft - track.clientWidth / 2 + thumb.offsetWidth / 2,
      behavior: "smooth",
    });
  }, [activeIndex]);

  if (!images?.length) {
    return null;
  }

  const total = images.length;
  const hasMultipleImages = total > 1;

  const goTo = (index: number) => setActiveIndex((index + total) % total);
  const goToPrevious = () => goTo(activeIndex - 1);
  const goToNext = () => goTo(activeIndex + 1);

  const srcFor = (image: string, index: number) =>
    failed[index] || !image ? companyPlaceholder : image;

  const markFailed = (index: number) =>
    setFailed((prev) => ({ ...prev, [index]: true }));

  /* Hover zoom: follow the cursor */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    e.currentTarget.style.setProperty(
      "--zoom-x",
      `${((e.clientX - rect.left) / rect.width) * 100}%`,
    );
    e.currentTarget.style.setProperty(
      "--zoom-y",
      `${((e.clientY - rect.top) / rect.height) * 100}%`,
    );
  };

  /* Swipe */
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    if (!start || !hasMultipleImages) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    touchStart.current = null;

    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goToNext();
      else goToPrevious();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!hasMultipleImages) return;

    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
  };

  return (
    <div className="thumb-slider">
      {/* Main image */}
      <div
        className={`thumb-slider-main ${isZooming ? "is-zooming" : ""}`}
        tabIndex={hasMultipleImages ? 0 : undefined}
        aria-roledescription="carousel"
        aria-label="Product images"
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className={`thumb-slider-slide ${
              index === activeIndex ? "is-active" : ""
            }`}
            aria-hidden={index !== activeIndex}
          >
            <Image
              src={srcFor(image, index)}
              alt={`Product image ${index + 1}`}
              fill
              priority={index === 0}
              draggable={false}
              sizes="(max-width: 767px) 100vw, 40vw"
              className="thumb-slider-main-image"
              onError={() => markFailed(index)}
            />
          </div>
        ))}

        {hasMultipleImages && (
          <>
            <button
              type="button"
              className="thumb-slider-arrow thumb-slider-arrow-prev"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              className="thumb-slider-arrow thumb-slider-arrow-next"
              onClick={goToNext}
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>

            <div className="thumb-slider-counter">
              {activeIndex + 1} / {total}
            </div>

            <div className="thumb-slider-dots">
              {images.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  className={`thumb-slider-dot ${
                    index === activeIndex ? "is-active" : ""
                  }`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultipleImages && (
        <div className="thumb-slider-thumbnails">
          <div className="thumb-slider-thumbnails-track" ref={trackRef}>
            {images.map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                className={`thumb-slider-thumb ${
                  index === activeIndex ? "thumb-slider-thumb-active" : ""
                }`}
                onClick={() => setActiveIndex(index)}
                aria-label={`View product image ${index + 1}`}
                aria-current={index === activeIndex}
              >
                <Image
                  src={srcFor(image, index)}
                  alt={`Product thumbnail ${index + 1}`}
                  fill
                  sizes="72px"
                  className="thumb-slider-thumb-image"
                  onError={() => markFailed(index)}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThumbSlider;
