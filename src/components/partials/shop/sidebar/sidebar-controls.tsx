"use client";
import React, { useEffect } from 'react';
import ALink from '~/components/features/custom-link';

export function hideSidebarByType(type?: string) {
  const cls = (type === "left" || type === "off-canvas" || type === "boxed" || type === "banner")
    ? "sidebar-active"
    : "right-sidebar-active";
  document.querySelector('body')?.classList.remove(cls);
}

export default function SidebarControls({ type }: { type?: string }) {
  const onShow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.querySelector('body')?.classList.add("sidebar-active");
  };

  const onHide = (e?: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLDivElement>) => {
    e?.preventDefault?.();
    hideSidebarByType(type);
  };


  useEffect(() => {
    const onResize = () => hideSidebarByType(type);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="sidebar-overlay" onClick={onHide}></div>
      {(type === "boxed" || type === "banner") ? (
        <a href="#" className="sidebar-toggle" onClick={onShow}>
          <i className="fas fa-chevron-right"></i>
        </a>
      ) : null}
      <ALink className="sidebar-close" href="#" onClick={onHide as any}>
        <i className="d-icon-times"></i>
      </ALink>
    </>
  );
}
