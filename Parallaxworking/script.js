document.documentElement.classList.add("js");

const hasGsap = typeof window.gsap !== "undefined";
const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";
const hasLenis = typeof window.Lenis !== "undefined";

if (hasGsap && hasScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

/* smooth scroll */

let lenisInstance = null;

if (hasLenis) {
  lenisInstance = new Lenis();

  function raf(time){
    lenisInstance.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}

/* loader */

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  if (!loader) return;

  const hideLoader = () => {
    loader.classList.add("is-hidden");
    setTimeout(() => {
      loader.style.display = "none";
      if (hasScrollTrigger && typeof ScrollTrigger.refresh === "function") {
        ScrollTrigger.refresh();
      }
    }, 600);
  };

  if (hasGsap) {
    gsap.to("#loader", {
      opacity: 0,
      duration: 1,
      delay: 1,
      onComplete: () => {
        loader.style.display = "none";
        if (hasScrollTrigger && typeof ScrollTrigger.refresh === "function") {
          ScrollTrigger.refresh();
        }
      }
    });
  } else {
    setTimeout(hideLoader, 1000);
  }
});

/* zoom text */

if (hasGsap && hasScrollTrigger) {
  gsap.to(".zoom-text",{
    scale:6,
    opacity:0,
    scrollTrigger:{
      trigger:".text-intro",
      start:"top top",
      end:"bottom top",
      scrub:1,
      pin:true
    }
  });
}

/* after video 3: cinematic zoom text reveal into image 4 */

const afterVideo3Zoom = document.querySelector(".after-video3-zoom");
const image4Section = document.querySelector(".image4-section");
const image4Bg = document.querySelector(".image4-bg");

if (afterVideo3Zoom && image4Section && hasGsap && hasScrollTrigger) {
  const afterVideo3Tl = gsap.timeline({
    scrollTrigger:{
      trigger:afterVideo3Zoom,
      start:"top top",
      end:"+=1500",
      scrub:1,
      pin:true,
      anticipatePin:1
    }
  });

  afterVideo3Tl
    .fromTo(".after-video3-text",
      { scale:1, opacity:1 },
      { scale:6, opacity:0, ease:"none", duration:1 }
    )
    .fromTo(image4Section,
      { opacity:0 },
      { opacity:1, ease:"none", duration:1 },
      0.2
    );

  if (image4Bg) {
    afterVideo3Tl.fromTo(image4Bg,
      { scale:1.1 },
      { scale:1, ease:"none", duration:1 },
      0.2
    );
  }
}

/* video 3 mute toggle */

const video3 = document.querySelector("#video3");
const video3MuteBtn = document.querySelector('[data-video-mute="video3"]');
const video3MutedIcon = "\uD83D\uDD07";
const video3UnmutedIcon = "\uD83D\uDD0A";

if (video3 && video3MuteBtn) {
  const updateMuteIcon = () => {
    const isMuted = video3.muted;
    video3MuteBtn.textContent = isMuted ? video3MutedIcon : video3UnmutedIcon;
    video3MuteBtn.setAttribute("aria-label", isMuted ? "Unmute video" : "Mute video");
    video3MuteBtn.setAttribute("aria-pressed", (!isMuted).toString());
  };

  updateMuteIcon();

  video3MuteBtn.addEventListener("click", () => {
    video3.muted = !video3.muted;
    if (!video3.muted) {
      const playPromise = video3.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    }
    updateMuteIcon();
  });

  video3.addEventListener("volumechange", updateMuteIcon);
}

/* video 3 audio tip */

const video3Section = document.querySelector(".video-loop");
const video3Tip = document.querySelector(".video3-tip");

if (video3Section && video3Tip) {
  const triggerTip = () => {
    video3Section.classList.remove("is-active");
    void video3Tip.offsetWidth;
    video3Section.classList.add("is-active");
  };

  if ("IntersectionObserver" in window) {
    let wasVisible = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target !== video3Section) return;
        if (entry.isIntersecting && !wasVisible) {
          triggerTip();
        }
        wasVisible = entry.isIntersecting;
        if (!entry.isIntersecting) {
          video3Section.classList.remove("is-active");
        }
      });
    }, { threshold: 0.4 });

    observer.observe(video3Section);
  } else {
    triggerTip();
  }
}

/* explore button scroll */

const exploreBtn = document.querySelector(".explore-btn");
const exploreSection = document.querySelector("#explore");
const homeBtn = document.querySelector(".home-btn");

const smoothScrollTo = (target, duration = 1.1) => {
  if (!target) return 0;
  if (lenisInstance && typeof lenisInstance.scrollTo === "function") {
    lenisInstance.scrollTo(target, { duration });
    return duration * 1000;
  }
  target.scrollIntoView({ behavior: "smooth" });
  return 800;
};

if (hasGsap && hasScrollTrigger) {
  gsap.fromTo(".explore-wrap",
    { opacity:0, y:20 },
    {
      opacity:1,
      y:0,
      duration:0.6,
      ease:"power2.out",
      scrollTrigger:{
        trigger:".image4-section",
        start:"top 70%"
      }
    }
  );
}

/* horizontal scroll panels */

const hSection = document.querySelector(".h-scroll");
let horizontalScrollTween = null;
let horizontalPanelTweens = [];
let horizontalImageTweens = [];
let horizontalFinalTweens = [];
let isHorizontalActive = false;
let horizontalDeactivateTimer = null;

const initHorizontalScroll = () => {
  if (!hSection || !hasGsap || !hasScrollTrigger || isHorizontalActive) return;
  if (horizontalDeactivateTimer) {
    clearTimeout(horizontalDeactivateTimer);
    horizontalDeactivateTimer = null;
  }
  const panels = gsap.utils.toArray(".h-panel");
  if (!panels.length) return;

  isHorizontalActive = true;
  hSection.classList.add("is-active");

  const finalPanel = panels[panels.length - 1];
  const finalImage = finalPanel ? finalPanel.querySelector("img") : null;
  const finalOverlay = finalPanel ? finalPanel.querySelector(".h-final-overlay") : null;

  const panelImages = panels
    .map(panel => panel.querySelector("img"))
    .filter(Boolean);

  gsap.set(panels, { xPercent: 0, opacity: 1, scale: 1 });
  gsap.set(panelImages, { scale: 1.1 });
  if (finalImage) {
    gsap.set(finalImage, { scale: 1.35 });
  }
  if (finalOverlay) {
    gsap.set(finalOverlay, { autoAlpha: 0, scale: 3.6, yPercent: 0 });
  }

  ScrollTrigger.refresh();

  horizontalScrollTween = gsap.to(panels, {
    xPercent: -100 * (panels.length - 1),
    ease: "none",
    scrollTrigger: {
      trigger: hSection,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      end: () => "+=" + (window.innerWidth * panels.length)
    }
  });

  panels.forEach(panel => {
    const isFinalPanel = panel === finalPanel;
    const panelTween = gsap.fromTo(panel,
      { opacity: 0, scale: 0.98 },
      {
        opacity: 1,
        scale: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: panel,
          containerAnimation: horizontalScrollTween,
          start: "left center",
          end: "right center",
          scrub: true
        }
      }
    );
    horizontalPanelTweens.push(panelTween);

    const panelImg = panel.querySelector("img");
    if (panelImg && !isFinalPanel) {
      const imgTween = gsap.fromTo(panelImg,
        { scale: 1.15 },
        {
          scale: 1.05,
          ease: "none",
          scrollTrigger: {
            trigger: panel,
            containerAnimation: horizontalScrollTween,
            start: "left center",
            end: "right center",
            scrub: true
          }
        }
      );
      horizontalImageTweens.push(imgTween);
    }
  });

  if (finalPanel && finalImage) {
    const finalTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: finalPanel,
        containerAnimation: horizontalScrollTween,
        start: "left center",
        end: "right right",
        scrub: true
      }
    });

    finalTimeline.fromTo(finalImage,
      { scale: 1.35 },
      { scale: 1.0, ease: "none" },
      0
    );

    if (finalOverlay) {
      finalTimeline.fromTo(finalOverlay,
        { autoAlpha: 1, scale: 3.6, yPercent: 0 },
        { autoAlpha: 1, scale: 1.0, yPercent: -60, ease: "none" },
        0
      );
    }

    horizontalFinalTweens.push(finalTimeline);
  }
};

const destroyHorizontalScroll = (delayMs = 800) => {
  if (!hSection || !isHorizontalActive) return;

  if (horizontalDeactivateTimer) {
    clearTimeout(horizontalDeactivateTimer);
  }

  horizontalDeactivateTimer = setTimeout(() => {
    if (horizontalScrollTween) {
      if (horizontalScrollTween.scrollTrigger) {
        horizontalScrollTween.scrollTrigger.kill();
      }
      horizontalScrollTween.kill();
      horizontalScrollTween = null;
    }

    horizontalPanelTweens.forEach(tween => {
      if (tween.scrollTrigger) {
        tween.scrollTrigger.kill();
      }
      tween.kill();
    });
    horizontalPanelTweens = [];

    horizontalImageTweens.forEach(tween => {
      if (tween.scrollTrigger) {
        tween.scrollTrigger.kill();
      }
      tween.kill();
    });
    horizontalImageTweens = [];

    horizontalFinalTweens.forEach(tween => {
      if (tween.scrollTrigger) {
        tween.scrollTrigger.kill();
      }
      tween.kill();
    });
    horizontalFinalTweens = [];

    hSection.classList.remove("is-active");
    isHorizontalActive = false;

    if (hasScrollTrigger) {
      ScrollTrigger.refresh();
    }
    horizontalDeactivateTimer = null;
  }, delayMs);
};

if (exploreBtn && exploreSection) {
  exploreBtn.addEventListener("click", () => {
    initHorizontalScroll();
    requestAnimationFrame(() => {
      smoothScrollTo(exploreSection, 1.0);
    });
  });
}

if (homeBtn && image4Section) {
  homeBtn.addEventListener("click", () => {
    const delayMs = smoothScrollTo(image4Section, 1.2);
    destroyHorizontalScroll(delayMs);
  });
}

/* scroll-scrub videos (video 1 & 2) */

const setupScrollScrubVideo = (video, { end, maxTime = 3 }) => {
  if (!video || !hasGsap || !hasScrollTrigger) return;

  const ease = gsap.parseEase("power1.out");
  const canFastSeek = typeof video.fastSeek === "function";
  let duration = maxTime;
  let targetTime = 0;
  let lastTime = -1;
  let rafId = null;
  let isReady = false;
  let isVisible = !("IntersectionObserver" in window);

  const applyTime = () => {
    if (!isReady || !isVisible) {
      rafId = null;
      return;
    }

    if (video.readyState >= 2) {
      const delta = Math.abs(targetTime - lastTime);
      if (delta > 0.001) {
        if (canFastSeek) {
          video.fastSeek(targetTime);
        } else {
          video.currentTime = targetTime;
        }
        lastTime = targetTime;
      }
    }

    rafId = requestAnimationFrame(applyTime);
  };

  const scheduleUpdate = () => {
    if (rafId === null) {
      rafId = requestAnimationFrame(applyTime);
    }
  };

  const updateTarget = (progress) => {
    if (!isReady) return;
    const eased = ease ? ease(progress) : progress;
    targetTime = eased * duration;
    if (isVisible) {
      scheduleUpdate();
    }
  };

  video.addEventListener("loadedmetadata", () => {
    const metaDuration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : maxTime;
    duration = Math.min(metaDuration, maxTime);
    isReady = true;
    video.pause();
    video.currentTime = 0;
  });

  video.addEventListener("play", () => {
    if (!video.paused) {
      video.pause();
    }
  });

  const scrollTrigger = ScrollTrigger.create({
    trigger: video,
    start: "top top",
    end,
    scrub: 1,
    pin: true,
    onUpdate: (self) => {
      updateTarget(self.progress);
    }
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target !== video) return;
        isVisible = entry.isIntersecting;
        if (isVisible) {
          updateTarget(scrollTrigger.progress);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(video);
  }
};

const video1 = document.querySelector("#video1");
setupScrollScrubVideo(video1, { end: "+=4000", maxTime: 3 });

/* zigzag cards */

gsap.utils.toArray(".card").forEach(card => {

  const direction = card.classList.contains("left") ? -200 : 200;

  gsap.fromTo(card,
  {
    x: direction,
    opacity: 0,
    scale: 0.9
  },
  {
    x:0,
    opacity:1,
    scale:1,
    duration:1,
    ease:"power3.out",
    scrollTrigger:{
      trigger:card,
      start:"top 85%"
    }
  });

});

/* testimonial parallax cards */

const testimonialSection = document.querySelector(".testimonial-section");

if (testimonialSection && hasGsap && hasScrollTrigger) {
  const testimonialCards = gsap.utils.toArray(".testimonial-card");

  testimonialCards.forEach(card => {
    const speed = parseFloat(card.dataset.speed || "0.3");
    const floatInner = card.querySelector(".testimonial-card-inner");

    gsap.fromTo(card,
      { y: 40 * speed },
      {
        y: -120 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: testimonialSection,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );

    if (floatInner) {
      gsap.to(floatInner, {
        y: -8 - speed * 6,
        duration: 3 + speed * 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });
    }
  });
}

/* bird feeding interaction */

const birdSection = document.querySelector(".bird-feeding-section");
const birdVideo = document.querySelector("#birdVideo");
const feedBtn = document.querySelector("#feedBtn");

if (birdSection && birdVideo && feedBtn) {
  const setButtonState = (state) => {
    if (state === "feeding") {
      feedBtn.disabled = true;
      feedBtn.textContent = "Feeding...";
    } else if (state === "done") {
      feedBtn.disabled = false;
      feedBtn.textContent = "Feed Again";
    } else {
      feedBtn.disabled = false;
      feedBtn.textContent = "Release";
    }
  };

  const pauseVideo = (resetBtn = false) => {
    birdVideo.pause();
    if (resetBtn && !birdVideo.ended) {
      setButtonState("ready");
    }
  };

  birdVideo.addEventListener("loadedmetadata", () => {
    birdVideo.currentTime = 0;
    pauseVideo(true);
  });

  feedBtn.addEventListener("click", () => {
    birdVideo.currentTime = 0;
    setButtonState("feeding");
    const playPromise = birdVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        setButtonState("ready");
      });
    }
  });

  birdVideo.addEventListener("ended", () => {
    setButtonState("done");
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        if (!birdVideo.paused && !birdVideo.ended) {
          pauseVideo(true);
        }
      } else {
        pauseVideo(false);
      }
    });
  }, { threshold: 0.4 });

  observer.observe(birdSection);
}

/* fish tank interaction */

const fishTank = document.querySelector(".fish-tank");

if (fishTank) {
  const food = fishTank.querySelector(".fish-food");
  const fishNodes = Array.from(fishTank.querySelectorAll(".fish"));
  const speeds = [0.02, 0.035, 0.05];

  let bounds = fishTank.getBoundingClientRect();
  let isInside = false;
  let cursor = { x: bounds.width / 2, y: bounds.height / 2 };

  const fishState = fishNodes.map((el, index) => ({
    el,
    speed: speeds[index % speeds.length],
    x: bounds.width / 2,
    y: bounds.height / 2,
    width: 0,
    height: 0,
    idleTarget: { x: bounds.width / 2, y: bounds.height / 2 },
    floatPhase: Math.random() * Math.PI * 2
  }));

  const updateBounds = () => {
    bounds = fishTank.getBoundingClientRect();
    fishState.forEach(fish => {
      fish.width = fish.el.offsetWidth || 120;
      fish.height = fish.el.offsetHeight || 60;
    });
  };

  const clampPoint = (fish, point) => {
    const pad = 8;
    const halfW = fish.width / 2;
    const halfH = fish.height / 2;
    const x = Math.min(Math.max(point.x, halfW + pad), bounds.width - halfW - pad);
    const y = Math.min(Math.max(point.y, halfH + pad), bounds.height - halfH - pad);
    return { x, y };
  };

  const setRandomTarget = (fish) => {
    const point = {
      x: Math.random() * bounds.width,
      y: Math.random() * bounds.height
    };
    fish.idleTarget = clampPoint(fish, point);
  };

  const updateFood = () => {
    if (!food || !fishState.length) return;
    const clamped = clampPoint(fishState[0], cursor);
    food.style.left = `${clamped.x}px`;
    food.style.top = `${clamped.y}px`;
  };

  const initPositions = () => {
    updateBounds();
    fishState.forEach(fish => {
      setRandomTarget(fish);
      fish.x = fish.idleTarget.x;
      fish.y = fish.idleTarget.y;
    });
    updateFood();
  };

  if (document.readyState === "complete") {
    initPositions();
  } else {
    window.addEventListener("load", initPositions);
  }

  window.addEventListener("resize", () => {
    updateBounds();
    if (!isInside) {
      fishState.forEach(setRandomTarget);
    }
  });

  fishTank.addEventListener("mouseenter", () => {
    isInside = true;
    if (food) {
      food.style.opacity = "1";
    }
  });

  fishTank.addEventListener("mouseleave", () => {
    isInside = false;
    if (food) {
      food.style.opacity = "0";
    }
    fishState.forEach(setRandomTarget);
  });

  fishTank.addEventListener("mousemove", (event) => {
    const rect = bounds;
    cursor = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    updateFood();
  });

  setInterval(() => {
    if (!isInside) {
      fishState.forEach(setRandomTarget);
    }
  }, 3200);

  const animateFish = (time) => {
    fishState.forEach(fish => {
      const target = isInside ? cursor : fish.idleTarget;
      const clamped = clampPoint(fish, target);
      const dx = clamped.x - fish.x;
      const dy = clamped.y - fish.y;

      fish.x += dx * fish.speed;
      fish.y += dy * fish.speed;

      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const floatOffset = Math.sin(time * 0.002 + fish.floatPhase) * 4;
      const flip = dx < 0 ? -1 : 1;

      fish.el.style.transform = `translate(${fish.x - fish.width / 2}px, ${fish.y - fish.height / 2 + floatOffset}px) rotate(${angle}deg) scaleX(${flip})`;
    });

    requestAnimationFrame(animateFish);
  };

  requestAnimationFrame(animateFish);
}

/* dark room spotlight */

const darkRoomSection = document.querySelector(".room");

if (darkRoomSection) {
  const switchButton = darkRoomSection.querySelector(".room-switch");
  let rect = darkRoomSection.getBoundingClientRect();
  let switchCenter = { x: rect.width / 2, y: rect.height / 2 };
  let isActive = false;
  let isOn = false;
  let rafId = null;
  const glowRadius = 200;

  const current = {
    x: rect.width / 2,
    y: rect.height / 2
  };
  const target = {
    x: current.x,
    y: current.y
  };

  const updateRect = () => {
    rect = darkRoomSection.getBoundingClientRect();
    if (switchButton) {
      const switchRect = switchButton.getBoundingClientRect();
      switchCenter = {
        x: switchRect.left - rect.left + switchRect.width / 2,
        y: switchRect.top - rect.top + switchRect.height / 2
      };
    }
  };

  const updateTarget = (clientX, clientY) => {
    target.x = clientX - rect.left;
    target.y = clientY - rect.top;
  };

  const updateGlow = () => {
    if (!switchButton) return;
    if (isOn) {
      switchButton.classList.remove("is-glow");
      return;
    }
    const dx = target.x - switchCenter.x;
    const dy = target.y - switchCenter.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= glowRadius) {
      switchButton.classList.add("is-glow");
    } else {
      switchButton.classList.remove("is-glow");
    }
  };

  const animateSpotlight = () => {
    current.x += (target.x - current.x) * 0.18;
    current.y += (target.y - current.y) * 0.18;
    darkRoomSection.style.setProperty("--spot-x", `${current.x}px`);
    darkRoomSection.style.setProperty("--spot-y", `${current.y}px`);

    if (isActive && !isOn) {
      rafId = requestAnimationFrame(animateSpotlight);
    } else {
      rafId = null;
    }
  };

  const startSpotlight = () => {
    if (isOn) return;
    updateRect();
    isActive = true;
    darkRoomSection.classList.add("is-active");
    if (!rafId) {
      rafId = requestAnimationFrame(animateSpotlight);
    }
  };

  const stopSpotlight = () => {
    if (isOn) return;
    isActive = false;
    darkRoomSection.classList.remove("is-active");
  };

  darkRoomSection.addEventListener("mouseenter", startSpotlight);
  darkRoomSection.addEventListener("mouseleave", stopSpotlight);

  darkRoomSection.addEventListener("mousemove", (event) => {
    if (isOn) return;
    if (!isActive) {
      startSpotlight();
    }
    updateTarget(event.clientX, event.clientY);
    updateGlow();
  });

  darkRoomSection.addEventListener("touchstart", (event) => {
    if (isOn) return;
    const touch = event.touches[0];
    if (!touch) return;
    startSpotlight();
    updateTarget(touch.clientX, touch.clientY);
    updateGlow();
  }, { passive: true });

  darkRoomSection.addEventListener("touchmove", (event) => {
    if (isOn) return;
    const touch = event.touches[0];
    if (!touch) return;
    updateTarget(touch.clientX, touch.clientY);
    updateGlow();
  }, { passive: true });

  window.addEventListener("resize", updateRect);

  if (switchButton) {
    switchButton.addEventListener("click", () => {
      if (isOn) return;
      isOn = true;
      isActive = false;
      switchButton.classList.add("is-clicked");
      darkRoomSection.classList.add("lights-on");
      darkRoomSection.classList.remove("is-active");

      setTimeout(() => {
        switchButton.classList.remove("is-clicked");
      }, 400);
    });
  }
}

/* video 2 */

const video2 = document.querySelector("#video2");
setupScrollScrubVideo(video2, { end: "+=3500", maxTime: 3 });

/* ending section */

const thanosVideo = document.querySelector("#thanosVideo");
const exitBtn = document.querySelector("#exitBtn");
const fadeScreen = document.querySelector(".fade-screen");

if (thanosVideo && exitBtn && fadeScreen) {
  const resetThanos = () => {
    thanosVideo.pause();
    thanosVideo.currentTime = 0;
  };

  thanosVideo.addEventListener("loadedmetadata", () => {
    resetThanos();
  });

  exitBtn.addEventListener("click", () => {
    exitBtn.style.opacity = "0";
    exitBtn.style.pointerEvents = "none";
    thanosVideo.currentTime = 0;
    thanosVideo.muted = false;
    const playPromise = thanosVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        exitBtn.style.opacity = "1";
        exitBtn.style.pointerEvents = "auto";
      });
    }
  });

  thanosVideo.addEventListener("ended", () => {
    fadeScreen.classList.add("is-active");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        fadeScreen.classList.remove("is-active");
        exitBtn.style.opacity = "1";
        exitBtn.style.pointerEvents = "auto";
        resetThanos();
      }, 900);
    }, 2400);
  });
}

/* final gallery fade-in */

if (hasGsap && hasScrollTrigger) {
  gsap.utils.toArray(".final-card").forEach(card => {
    gsap.fromTo(card,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%"
        }
      }
    );
  });
}
