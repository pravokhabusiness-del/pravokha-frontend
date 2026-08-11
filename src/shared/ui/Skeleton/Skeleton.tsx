import type { SkeletonProps } from './Skeleton.types';
import styles from './Skeleton.module.css';

export const Skeleton = ({
    variant = 'rectangular',
    width,
    height = variant === 'text' ? '1rem' : '100%',
    className = '',
    count = 1,
}: SkeletonProps) => {
    const style = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    const skeletonClass = `${styles.skeleton} ${styles[variant]} ${className}`;

    if (count === 1) {
        return <div className={skeletonClass} style={style} aria-label="Loading..." />;
    }

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className={skeletonClass} style={style} aria-label="Loading..." />
            ))}
        </>
    );
};

// Pre-built skeleton variants for common use cases
export const SkeletonCard = () => (
    <div className={styles.productCard}>
        <div className={`${styles.skeleton} ${styles.productImage}`} />
        <div className={`${styles.skeleton} ${styles.productTitle}`} />
        <div className="flex items-center gap-1 my-1">
            <div className={`${styles.skeleton} h-3 w-16 rounded`} />
            <div className={`${styles.skeleton} h-3 w-8 rounded`} />
        </div>
        <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex items-center gap-1.5">
                <div className={`${styles.skeleton} ${styles.productPrice}`} />
                <div className={`${styles.skeleton} h-4 w-12 rounded-md`} />
            </div>
            <div className="flex items-center gap-1">
                <div className={`${styles.skeleton} h-7 w-7 rounded-full`} />
                <div className={`${styles.skeleton} h-8 w-8 rounded-full`} />
            </div>
        </div>
    </div>
);

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
    <div>
        {Array.from({ length: lines }).map((_, i) => (
            <div
                key={i}
                className={`${styles.skeleton} ${styles.text}`}
                style={{ width: i === lines - 1 ? '60%' : '100%' }}
            />
        ))}
    </div>
);
