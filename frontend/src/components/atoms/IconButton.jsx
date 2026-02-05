import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const iconButtonVariants = cva(
    'p-2 rounded-full transition-colors flex items-center justify-center',
    {
        variants: {
            variant: {
                ghost: 'hover:bg-gray-100',
                danger: 'text-gray-400 hover:text-red-500',
            },
            size: {
                sm: 'p-1',
                md: 'p-2',
            }
        },
        defaultVariants: {
            variant: 'ghost',
            size: 'md',
        },
    }
);

const IconButton = ({
    children,
    onClick,
    type = 'button',
    variant,
    size,
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={cn(iconButtonVariants({ variant, size, className }))}
            {...props}
        >
            {children}
        </button>
    );
};

export default IconButton;
