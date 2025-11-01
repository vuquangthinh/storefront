"use client";
import type React from "react";
import Link from "next/link";
import type { LinkProps } from "next/link";

import { parseContent } from '~/utils';

type HrefType = string | { pathname: string; query?: Record<string, any> };

interface ALinkProps {
  children?: React.ReactNode;
  className?: string;
  content?: string;
  style?: React.CSSProperties;
  href: LinkProps["href"] | HrefType;
  onClick?: () => void;
  [x: string]: any;
}

export default function ALink({ children, className, content, style, ...props }: ALinkProps) {
  const preventDefault = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof props.href === 'string' && props.href === '#') {
      e.preventDefault();
    }

    if (props.onClick) {
      props.onClick();
    }
  };

  return content ? (
    <Link {...props} className={className} style={style} onClick={preventDefault} prefetch={false}>
      <span dangerouslySetInnerHTML={parseContent(content)} />
    </Link>
  ) : (
    <Link {...props} className={className} style={style} onClick={preventDefault} prefetch={false}>
      {children}
    </Link>
  );
}