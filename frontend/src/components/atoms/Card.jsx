import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const cardVariants = cva(
    'bg-white rounded-xl shadow-card p-6'
);

const Card = ({ children, className = '', ...props }) => {
    return (
        <div className={cn(cardVariants({ className }))} {...props}>
            {children}
        </div>
    );
};

export default Card;