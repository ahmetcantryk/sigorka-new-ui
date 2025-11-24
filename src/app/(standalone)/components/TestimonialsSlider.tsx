"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Draggable from "gsap/Draggable";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GsapSlider() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const slides = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    gsap.registerPlugin(Draggable);
    const stage = stageRef.current;
    if (!stage) return;
    slides.current = Array.from(stage.querySelectorAll(".slide")) as HTMLDivElement[];

    const depth = 150;
    const gap = 60;

    const layout = (i: number) => {
      slides.current.forEach((el, k) => {
        let diff = (k - i) % slides.current.length;
        if (diff > slides.current.length / 2) diff -= slides.current.length;
        if (diff < -slides.current.length / 2) diff += slides.current.length;

        let x = 0,
          z = 0,
          scale = 0.85,
          op = 0.4,
          blur = 1.5,
          zIndex = 1;

        if (diff === 0) {
          x = 0;
          z = 0;
          scale = 1;
          op = 1;
          blur = 0;
          zIndex = 5;
        } else if (Math.abs(diff) === 1) {
          x = (gap + 320) * diff * 0.5;
          z = -depth * 0.6;
          scale = 0.93;
          op = 0.8;
          blur = 0.8;
          zIndex = 4;
        } else {
          x = (gap + 320) * diff * 0.6;
          z = -depth * (Math.abs(diff) * 0.9);
          op = 0.25;
          blur = 2.5;
          zIndex = 2;
        }

        gsap.to(el, {
          duration: 0.8,
          x,
          y: 0,
          z,
          scale,
          opacity: op,
          filter: `blur(${blur}px)`,
          ease: "power3.out",
        });
        el.style.zIndex = String(zIndex);
      });
    };

    layout(index);

    // drag
    let startX = 0;
    let deltaX = 0;
    let isDown = false;

    const handleDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.clientX;
    };
    const handleUp = () => {
      isDown = false;
      if (deltaX < -60) setIndex((prev) => (prev + 1) % slides.current.length);
      else if (deltaX > 60) setIndex((prev) => (prev - 1 + slides.current.length) % slides.current.length);
      deltaX = 0;
      gsap.to(stage, { x: 0, duration: 0.4 });
    };
    const handleMove = (e: MouseEvent) => {
      if (!isDown) return;
      deltaX = e.clientX - startX;
      gsap.to(stage, { x: deltaX * 0.25, duration: 0.2 });
    };
    const handleLeave = () => {
      isDown = false;
      gsap.to(stage, { x: 0, duration: 0.4 });
    };

    stage.addEventListener("mousedown", handleDown);
    stage.addEventListener("mouseup", handleUp);
    stage.addEventListener("mousemove", handleMove);
    stage.addEventListener("mouseleave", handleLeave);

    return () => {
      stage.removeEventListener("mousedown", handleDown);
      stage.removeEventListener("mouseup", handleUp);
      stage.removeEventListener("mousemove", handleMove);
      stage.removeEventListener("mouseleave", handleLeave);
    };
  }, [index]);

  useEffect(() => {
    // Her index değişiminde animasyonlu geçiş
    const stage = stageRef.current;
    if (!stage) return;
    const depth = 150;
    const gap = 60;

    slides.current.forEach((el, k) => {
      let diff = (k - index) % slides.current.length;
      if (diff > slides.current.length / 2) diff -= slides.current.length;
      if (diff < -slides.current.length / 2) diff += slides.current.length;

        let x = 0,
          z = 0,
          scale = 0.7,
          blur = 0,
          zIndex = 1;

        if (diff === 0) {
          x = 0;
          z = 0;
          scale = 1;
          blur = 0;
          zIndex = 5;
        } else if (Math.abs(diff) === 1) {
          x = (gap + 400) * diff * 0.8;
          z = -depth * 0.6;
          scale = 0.7;
          blur = 0;
          zIndex = 4;
        } else {
          x = (gap + 200) * diff * 0.8;
          z = -depth * (Math.abs(diff) * 0.9);
          scale = 0.7;
          blur = 0;
          zIndex = 2;
        }

      gsap.to(el, {
        duration: 0.8,
        x,
        y: 0,
        z,
        scale,
        filter: `blur(${blur}px)`,
        ease: "power3.out",
      });
      el.style.zIndex = String(zIndex);
    });
  }, [index]);

  const handleNext = () => setIndex((prev) => (prev + 1) % slides.current.length);
  const handlePrev = () => setIndex((prev) => (prev - 1 + slides.current.length) % slides.current.length);

  const testimonials = [
    { name: 'AYŞE O.', text: 'İlgili ve profesyonel bir ekip, her soruma hızlıca dönüş yaptılar. Güvenle tercih edebilir.' },
    { name: 'UTKU T.', text: 'Herkese tavsiye ederim' },
    { name: 'SERKAN U.', text: 'İlgili ve güzel bir firma.' },
    { name: 'BURÇE Ö.', text: 'İlgiliniz ve yönlendirmeleriniz için teşekkür ederim.' },
    { name: 'BERİL D.', text: 'Ailece hizmetlerinden çok memnun kaldığımız, hayatımızı kolaylaştıran Sigorka firmasına çok teşekkür ederiz.' },
    { name: 'İ20 HYUNDAI', text: 'İlk Katılım Sigorta Online pazarı' },
    { name: 'YUSUF İ.', text: 'İlk kez online sigorta aldım. Mükemmel!' },
    { name: 'EVRİM D.', text: 'İşini iyi bilen güçlü ekibe tebrikler 👏🏻👏🏻' }
  ];

  return (
    <div className="testimonialsSliderWrapper">
      <div
        ref={stageRef}
        className="stage"
      >
        {testimonials.map((testimonial, idx) => {
          const diff = (idx - index) % testimonials.length;
          const normalizedDiff = diff > testimonials.length / 2 ? diff - testimonials.length : (diff < -testimonials.length / 2 ? diff + testimonials.length : diff);
          const isActive = normalizedDiff === 0;
          const isVisible = Math.abs(normalizedDiff) <= 1;
          
          return (
          <div
            key={idx}
            className="slide"
            data-active={isActive}
            style={{ display: isVisible ? 'block' : 'none' }}
          >
            <div className="testimonialCard">
              <div className="testimonialName">{testimonial.name}</div>
              <p className="testimonialText">{testimonial.text}</p>
              <div className="testimonialStars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`star ${isActive ? 'active' : ''}`}>★</span>
                ))}
              </div>
            </div>
          </div>
        );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="testimonialsNavigation">
        <button onClick={handlePrev} className="navButton" aria-label="Önceki">
          <ChevronLeft size={30} />
        </button>
        <button onClick={handleNext} className="navButton" aria-label="Sonraki">
          <ChevronRight size={30} />
        </button>
      </div>
    </div>
  );
}
