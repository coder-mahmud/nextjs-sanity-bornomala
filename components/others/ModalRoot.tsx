// components/ModalRoot.tsx
'use client';

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function ModalRoot({ children,open }: { children: React.ReactNode, open:Boolean }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}
