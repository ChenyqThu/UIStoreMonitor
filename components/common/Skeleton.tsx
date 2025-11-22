import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'text',
    width,
    height,
}) => {
    const baseStyles = 'animate-pulse bg-slate-200';

    const variantStyles = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-none',
        rounded: 'rounded-md',
    };

    const style = {
        width,
        height,
    };

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            style={style}
        />
    );
};
