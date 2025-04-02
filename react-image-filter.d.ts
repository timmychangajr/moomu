declare module 'react-image-filter' {
    import React from 'react';

    interface ImageFilterProps {
        image: string;
        filter: string;
        className?: string;
        style?: React.CSSProperties;
        colorOne?: [number, number, number];
        colorTwo?: [number, number, number];
    }

    const ImageFilter: React.FC<ImageFilterProps>;
    export default ImageFilter;
}