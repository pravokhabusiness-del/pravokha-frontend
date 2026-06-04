export interface CategorySmallCardProps {
    title: string;
    description: string;
    image: string;
    link: string;
    disabled?: boolean;
    isActive?: boolean;
    isBlurred?: boolean;
    onZoom?: () => void;
}
