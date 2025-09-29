import React, { useEffect, useRef, useState, useCallback } from 'react';

interface CustomScrollbarProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const CustomScrollbar: React.FC<CustomScrollbarProps> = ({ contentRef }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartScrollTop = useRef(0);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  const updateScrollbar = useCallback(() => {
    if (!contentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;

    // Only show scrollbar if content is scrollable
    const isScrollable = scrollHeight > clientHeight;
    if (!isScrollable) {
      setIsVisible(false);
      return;
    }

    // Calculate thumb size and position
    const scrollRatio = clientHeight / scrollHeight;
    const calculatedThumbHeight = Math.max(40, clientHeight * scrollRatio);
    const maxScrollTop = scrollHeight - clientHeight;
    const scrollProgress = scrollTop / maxScrollTop;
    const maxThumbTop = clientHeight - calculatedThumbHeight;
    const calculatedThumbTop = maxThumbTop * scrollProgress;

    setThumbHeight(calculatedThumbHeight);
    setThumbTop(calculatedThumbTop);

    // Show scrollbar while scrolling
    setIsVisible(true);

    // Hide scrollbar after delay
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    if (!isDragging) {
      hideTimeout.current = setTimeout(() => {
        setIsVisible(false);
      }, 1500);
    }
  }, [contentRef, isDragging]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const handleScroll = () => {
      updateScrollbar();
    };

    const handleMouseEnter = () => {
      updateScrollbar();
    };

    content.addEventListener('scroll', handleScroll);
    content.addEventListener('mouseenter', handleMouseEnter);

    // Initial update
    updateScrollbar();

    // Update on window resize
    const handleResize = () => updateScrollbar();
    window.addEventListener('resize', handleResize);

    return () => {
      content.removeEventListener('scroll', handleScroll);
      content.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('resize', handleResize);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [contentRef, updateScrollbar]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartScrollTop.current = contentRef.current?.scrollTop || 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!contentRef.current) return;

      const deltaY = e.clientY - dragStartY.current;
      const { scrollHeight, clientHeight } = contentRef.current;
      const maxScrollTop = scrollHeight - clientHeight;
      const scrollRatio = maxScrollTop / (clientHeight - thumbHeight);

      contentRef.current.scrollTop = dragStartScrollTop.current + deltaY * scrollRatio;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // Start hide timeout after dragging ends
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      hideTimeout.current = setTimeout(() => {
        setIsVisible(false);
      }, 1500);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Calculate position relative to content container
  const getScrollbarPosition = () => {
    if (!contentRef.current) return {};
    const rect = contentRef.current.getBoundingClientRect();
    return {
      top: `${rect.top}px`,
      height: `${rect.height}px`,
      right: '2px'
    };
  };

  return (
    <div
      ref={scrollbarRef}
      className={`custom-scrollbar ${isVisible ? 'visible' : ''}`}
      style={getScrollbarPosition()}
    >
      <div
        ref={thumbRef}
        className={`custom-scrollbar-thumb ${isDragging ? 'dragging' : ''}`}
        style={{
          height: `${thumbHeight}px`,
          top: `${thumbTop}px`
        }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default CustomScrollbar;