import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ThumbSliderProps {
  images: string[];
}

const ThumbSlider = ({ images }: ThumbSliderProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  if (!images?.length) {
    return null;
  }

  const hasMultipleImages = images.length > 1;

  const goToPrevious = () => {
    setActiveIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1,
    );
  };

  const goToNext = () => {
    setActiveIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div className="thumb-slider">
      {/* Main image */}
      <div className="thumb-slider-main">
        <Image
          src={images[activeIndex]}
          alt="Product image"
          fill
          priority
          sizes="(max-width: 767px) 100vw, 40vw"
          className="thumb-slider-main-image"
        />

        {hasMultipleImages && (
          <>
            <button
              type="button"
              className="thumb-slider-arrow thumb-slider-arrow-prev"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              className="thumb-slider-arrow thumb-slider-arrow-next"
              onClick={goToNext}
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {hasMultipleImages && (
          <div className="thumb-slider-counter">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultipleImages && (
        <div className="thumb-slider-thumbnails">
          <div className="thumb-slider-thumbnails-track">
            {images.map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                className={`thumb-slider-thumb ${
                  index === activeIndex
                    ? "thumb-slider-thumb-active"
                    : ""
                }`}
                onClick={() => setActiveIndex(index)}
                aria-label={`View product image ${index + 1}`}
                aria-current={index === activeIndex}
              >
                <Image
                  src={image}
                  alt={`Product thumbnail ${index + 1}`}
                  fill
                  sizes="72px"
                  className="thumb-slider-thumb-image"
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