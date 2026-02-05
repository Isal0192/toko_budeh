import React from 'react';
import Textarea from '../atoms/Textarea';

const TextareaWithIcon = ({ icon, ...props }) => {
    return (
        <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
                {icon}
            </div>
            <Textarea className="pl-10" {...props} />
        </div>
    );
};

export default TextareaWithIcon;
