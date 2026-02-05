import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
    'w-full py-3 flex items-center justify-center gap-2 text-lg rounded-lg font-semibold transition-all disabled:bg-gray-300 disabled:cursor-not-allowed',
    {
        variants: {
            variant: {
                primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl',
                danger: 'bg-red-500 text-white hover:bg-red-600',
                ghost: 'text-gray-500 hover:text-primary-600',
                outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50',
            },
        },
        defaultVariants: {
            variant: 'primary',
        },
    }
);

const Button = ({
    children,
    onClick,
    type = 'button',
    variant,
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={cn(buttonVariants({ variant, className }))}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;