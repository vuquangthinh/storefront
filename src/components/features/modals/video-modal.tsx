"use client";
import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface VideoModalProps {
    isOpen?: boolean;
    closeModal?: () => void;
    singleSlug?: string;
}

export default function VideoModal({ isOpen = false, closeModal = () => {}, singleSlug = '' }: VideoModalProps) {
    const pathname = usePathname();

    // Close when route changes
    useEffect(() => {
        closeModal && closeModal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    if (!isOpen || !singleSlug) return null;

    return (
        <div className="video-modal-overlay opened" role="dialog" aria-modal="true">
            <div className="row video-modal" id="video-modal">
                <video src={process.env.NEXT_PUBLIC_ASSET_URI + singleSlug} autoPlay loop controls className="p-0" />
                <button title="Close (Esc)" type="button" className="mfp-close" onClick={closeModal}><span>×</span></button>
            </div>
        </div>
    );
}