/**
 * Chaos Computer Club India — chaoscomputerclub.in
 *
 * Copyright (c) 2026 Chaos Computer Club India
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";

export interface ScrollStackItemProps {
  itemClassName?: string;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({
  children,
  itemClassName = "",
  className = "",
  style = {},
}) => (
  <div className={`scroll-stack-item relative w-full ${itemClassName}`.trim()}>
    <div
      className={`scroll-stack-card relative w-full origin-top will-change-transform ${className}`.trim()}
      style={{
        backfaceVisibility: "hidden",
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {children}
    </div>
  </div>
);

export interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string | number;
  scaleEndPosition?: string | number;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  overwriteEffect?: boolean;
  onStackComplete?: () => void;
}

export const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = "",
  itemDistance = 60,
  itemScale = 0.025,
  itemStackDistance = 22,
  stackPosition = "18%",
  scaleEndPosition = "10%",
  baseScale = 0.88,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 1.2,
  useWindowScroll = true,
  overwriteEffect = false,
  onStackComplete,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const lastTransformsRef = useRef<Map<number, any>>(new Map());
  const isUpdatingRef = useRef(false);

  // In overwrite effect, cards pin at exact same spot without scale reduction or offset
  const effItemStackDistance = overwriteEffect ? 0 : itemStackDistance;
  const effItemScale = overwriteEffect ? 0 : itemScale;
  const effBaseScale = overwriteEffect ? 1 : baseScale;
  const effBlurAmount = overwriteEffect ? 0 : blurAmount;
  const effRotationAmount = overwriteEffect ? 0 : rotationAmount;

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === "string" && value.includes("%")) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value as string);
  }, []);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
        scrollContainer: document.documentElement,
      };
    } else {
      const scroller = scrollerRef.current;
      return {
        scrollTop: scroller ? scroller.scrollTop : 0,
        containerHeight: scroller ? scroller.clientHeight : 0,
        scrollContainer: scroller,
      };
    }
  }, [useWindowScroll]);

  const getElementOffset = useCallback(
    (element: HTMLElement) => {
      if (useWindowScroll) {
        const rect = element.getBoundingClientRect();
        return rect.top + window.scrollY;
      } else {
        return element.offsetTop;
      }
    },
    [useWindowScroll]
  );

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    const endElement = useWindowScroll
      ? (document.querySelector(".scroll-stack-end") as HTMLElement | null)
      : (scrollerRef.current?.querySelector(".scroll-stack-end") as HTMLElement | null);

    const endElementTop = endElement ? getElementOffset(endElement) : 0;

    // In overwrite mode, identify the highest card that has fully arrived at the pinned position.
    // Any card underneath it is completely covered, so we can hide it to prevent any borders or books feeling.
    let activeCoverIndex = -1;
    if (overwriteEffect) {
      for (let j = 0; j < cardsRef.current.length; j++) {
        const jCard = cardsRef.current[j];
        if (!jCard) continue;
        const jSlot = (jCard.parentElement as HTMLElement) || jCard;
        const jCardTop = getElementOffset(jSlot);
        if (scrollTop >= jCardTop - stackPositionPx - 1) {
          activeCoverIndex = j;
        }
      }
    }

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const slotElement = (card.parentElement as HTMLElement) || card;
      const cardTop = getElementOffset(slotElement);
      const triggerStart = cardTop - stackPositionPx - effItemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - effItemStackDistance * i;
      const pinEnd = Math.max(endElementTop - containerHeight * 0.4, cardTop + 50);

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = effBaseScale + i * effItemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = effRotationAmount ? i * effRotationAmount * scaleProgress : 0;

      let blur = 0;
      if (effBlurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jCard = cardsRef.current[j];
          if (!jCard) continue;
          const jSlot = (jCard.parentElement as HTMLElement) || jCard;
          const jCardTop = getElementOffset(jSlot);
          const jTriggerStart = jCardTop - stackPositionPx - effItemStackDistance * j;
          if (scrollTop >= jTriggerStart) {
            topCardIndex = j;
          }
        }

        if (i < topCardIndex) {
          const depthInStack = topCardIndex - i;
          blur = Math.max(0, depthInStack * effBlurAmount);
        }
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + effItemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + effItemStackDistance * i;
      }

      let opacityVal = 1;
      if (overwriteEffect) {
        // Any card strictly before activeCoverIndex is fully covered by card activeCoverIndex
        if (i < activeCoverIndex) {
          opacityVal = 0;
        }
      }

      const newTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
        opacity: opacityVal,
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1 ||
        lastTransform.opacity !== newTransform.opacity;

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        const filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : "";

        card.style.transform = transform;
        card.style.filter = filter;
        if (overwriteEffect) {
          card.style.opacity = `${newTransform.opacity}`;
          card.style.pointerEvents = newTransform.opacity === 0 ? "none" : "auto";
        }

        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    effItemScale,
    effItemStackDistance,
    effBaseScale,
    effRotationAmount,
    effBlurAmount,
    overwriteEffect,
    stackPosition,
    scaleEndPosition,
    useWindowScroll,
    onStackComplete,
    calculateProgress,
    parsePercentage,
    getScrollData,
    getElementOffset,
  ]);

  const handleScroll = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      updateCardTransforms();
    });
  }, [updateCardTransforms]);

  useEffect(() => {
    if (!useWindowScroll && !scrollerRef.current) return;

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll(".scroll-stack-card")
        : (scrollerRef.current?.querySelectorAll(".scroll-stack-card") ?? [])
    ) as HTMLElement[];
    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    cards.forEach((card, i) => {
      const slotElement = (card.parentElement as HTMLElement) || card;
      if (i < cards.length - 1) {
        slotElement.style.marginBottom = `${itemDistance}px`;
      }
      // Ensure strict ascending z-index so incoming cards slide over earlier cards
      slotElement.style.zIndex = `${i + 1}`;
      card.style.zIndex = `${i + 1}`;
      card.style.willChange = "transform, opacity, filter";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
      card.style.transform = "translateZ(0)";
      card.style.perspective = "1000px";
      card.style.opacity = "1";
    });

    const scrollTarget = useWindowScroll ? window : scrollerRef.current;
    scrollTarget?.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    updateCardTransforms();
    const timer = setTimeout(updateCardTransforms, 100);

    return () => {
      clearTimeout(timer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      scrollTarget?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      stackCompletedRef.current = false;
      cardsRef.current = [];
      transformsCache.clear();
      isUpdatingRef.current = false;
    };
  }, [
    itemDistance,
    effItemScale,
    effItemStackDistance,
    stackPosition,
    scaleEndPosition,
    effBaseScale,
    effRotationAmount,
    effBlurAmount,
    useWindowScroll,
    overwriteEffect,
    onStackComplete,
    handleScroll,
    updateCardTransforms,
  ]);

  if (useWindowScroll) {
    return (
      <div className={`relative w-full ${className}`.trim()}>
        <div className="scroll-stack-inner w-full">
          {children}
          {/* Spacer so the last pinned card releases cleanly */}
          <div className="scroll-stack-end w-full h-12" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full overflow-y-auto overflow-x-visible ${className}`.trim()}
      ref={scrollerRef}
      style={{
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
        scrollBehavior: "smooth",
        willChange: "scroll-position",
      }}
    >
      <div className="scroll-stack-inner pt-[15vh] px-4 md:px-12 pb-[30rem] min-h-screen">
        {children}
        <div className="scroll-stack-end w-full h-px" />
      </div>
    </div>
  );
};

export default ScrollStack;
