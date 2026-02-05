import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const inputVariants = cva(
    'block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed'
);

const Input = ({
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={cn(inputVariants({ className }))}
            {...props}
        />
    );
};

export default Input;