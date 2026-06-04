import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Expand, X } from "lucide-react";
import { createPortal } from "react-dom";
import type { CategorySmallCardProps } from './CategorySmallCard.types';
import styles from './CategorySmallCard.module.css';

export const CategorySmallCard = ({
    title,
    description,
    image,
    link,
    disabled,
    isActive,
    isBlurred,
    onZoom,
}: CategorySmallCardProps) => {
    const [modalOpen, setModalOpen] = useState(false);

    const wrapperClass = [
        styles.wrapper,
        isActive ? styles.active : '',
        isBlurred ? styles.blurred : '',
        disabled ? styles.disabled : '',
    ].filter(Boolean).join(' ');

    const handleCardClick = (e: React.MouseEvent) => {
        if (disabled) return;
        // Prevent link navigation, open modal
        e.preventDefault();
        setModalOpen(true);
        onZoom?.();
    };

    const CardInner = () => (
        <div className={wrapperClass}>
            <div className={styles.card} onClick={handleCardClick}>
                {/* Image */}
                <div className={styles.imageContainer}>
                    <img
                        src={image}
                        alt={title}
                        className={styles.image}
                        loading="lazy"
                    />
                </div>

                {/* Dark Gradient Overlay */}
                <div className={styles.overlay} />

                {/* Zoom Hint */}
                <div className={styles.zoomHint}>
                    <Expand size={12} />
                    <span>View</span>
                </div>

                {/* Content — always visible */}
                <div className={styles.content}>
                    <div>
                        <h3 className={styles.title}>{title}</h3>
                        <p className={styles.description}>{description}</p>
                    </div>
                    <div className={styles.actionBtn}>
                        <span>Explore</span>
                        <ArrowRight size={14} />
                    </div>
                </div>
            </div>

            {/* Zoom Modal */}
            {modalOpen && createPortal(
                <div
                    className={styles.modalBackdrop}
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        className={styles.modalCard}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            className={styles.modalClose}
                            onClick={() => setModalOpen(false)}
                            aria-label="Close"
                        >
                            <X size={14} />
                        </button>

                        {/* Modal Image */}
                        <div className={styles.modalImageWrap}>
                            <img
                                src={image}
                                alt={title}
                                className={styles.modalImage}
                            />
                            <div className={styles.modalOverlay} />

                            {/* Modal Content */}
                            <div className={styles.modalContent}>
                                <h2 className={styles.modalTitle}>{title}</h2>
                                <p className={styles.modalDescription}>{description}</p>
                                <Link
                                    to={link}
                                    className={styles.modalBtn}
                                    onClick={() => setModalOpen(false)}
                                >
                                    Shop Now
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );

    if (disabled) {
        return <CardInner />;
    }

    return (
        // We keep the Link for SEO / right-click open in new tab,
        // but the click opens the modal via preventDefault in handleCardClick
        <a
            href={link}
            className={styles.linkWrapper}
            onClick={handleCardClick}
            aria-label={`View ${title} category`}
        >
            <CardInner />
        </a>
    );
};
