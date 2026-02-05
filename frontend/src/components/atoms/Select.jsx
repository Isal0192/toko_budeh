import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const selectVariants = cva(
    'block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed'
);

const Select = ({
    name,
    value,
    onChange,
    required = false,
    disabled = false,
    className = '',
    children,
    ...props
}) => {
    return (
        <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={cn(selectVariants({ className }))}
            {...props}
        >
            {children}
        </select>
    );
};

export default Select;