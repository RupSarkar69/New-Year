import { gsap } from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import "./Gallery.css";

const PHOTOS = [
  { src: "/images/pic1.jpg", alt: "Memory 1" },
  { src: "/images/pic2.jpg", alt: "Memory 2" },
  { src: "/images/pic3.jpg", alt: "Memory 3" },
  { src: "/images/pic4.jpg", alt: "Memory 4" },
  { src: "/images/pic5.jpeg", alt: "Memory 5" },
  { src: "/images/pic6.jpg", alt: "Memory 6" },
];

function Gallery({ isActive }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photosRevealed, setPhotosRevealed] = useState(false);

  const photosRef = useRef([]);
  const lightboxImgRef = useRef(null);

  // Reveal photos with GSAP when page becomes active
  useEffect(() => {
    if (isActive && !photosRevealed) {
      setTimeout(() => setPhotosRevealed(true), 10);

      // Stagger animation for photos
      gsap.fromTo(
        photosRef.current,
        {
          opacity: 0,
          y: 50,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.12,
          ease: "back.out(1.4)",
          delay: 0.2,
        }
      );
    }
  }, [isActive, photosRevealed]);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);

    // Animate lightbox appearance
    if (lightboxImgRef.current) {
      gsap.fromTo(
        lightboxImgRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.4)" }
      );
    }
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  // Handle body overflow in effect
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  const showNext = () => {
    if (lightboxImgRef.current) {
      gsap.to(lightboxImgRef.current, {
        x: -100,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setCurrentIndex((prev) => {
            const newIndex = (prev + 1) % PHOTOS.length;
            requestAnimationFrame(() => {
              if (lightboxImgRef.current) {
                gsap.fromTo(
                  lightboxImgRef.current,
                  { x: 100, opacity: 0 },
                  { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
                );
              }
            });
            return newIndex;
          });
        },
      });
    } else {
      setCurrentIndex((prev) => (prev + 1) % PHOTOS.length);
    }
  };

  const showPrev = () => {
    if (lightboxImgRef.current) {
      gsap.to(lightboxImgRef.current, {
        x: 100,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setCurrentIndex((prev) => {
            const newIndex = (prev - 1 + PHOTOS.length) % PHOTOS.length;
            requestAnimationFrame(() => {
              if (lightboxImgRef.current) {
                gsap.fromTo(
                  lightboxImgRef.current,
                  { x: -100, opacity: 0 },
                  { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
                );
              }
            });
            return newIndex;
          });
        },
      });
    } else {
      setCurrentIndex((prev) => (prev - 1 + PHOTOS.length) % PHOTOS.length);
    }
  };

  const showNextRef = useRef(null);
  const showPrevRef = useRef(null);

  useEffect(() => {
    showNextRef.current = showNext;
    showPrevRef.current = showPrev;
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;

      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        if (showPrevRef.current) showPrevRef.current();
      } else if (e.key === "ArrowRight") {
        if (showNextRef.current) showNextRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, closeLightbox]);

  return (
    <section className="gallery">
      <h2>📸 Some Beautiful Quotes</h2>
      <div className="photos">
        {PHOTOS.map((photo, index) => (
          <img
            key={index}
            ref={(el) => (photosRef.current[index] = el)}
            src={photo.src}
            alt={photo.alt}
            onClick={() => openLightbox(index)}
            loading="lazy"
          />
        ))}
      </div>

      {lightboxOpen && (
        <div className="lightbox" onClick={closeLightbox}>
          <img
            ref={lightboxImgRef}
            src={PHOTOS[currentIndex].src}
            alt={PHOTOS[currentIndex].alt}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="lightbox-close"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            ✖
          </button>
          <button
            className="nav-btn nav-prev"
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            aria-label="Previous photo"
          >
            ‹
          </button>
          <button
            className="nav-btn nav-next"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            aria-label="Next photo"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}

export default Gallery;