import React from 'react';
import Input from '../atoms/Input';

const InputWithIcon = ({ icon, ...props }) => {
    return (
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {icon}
            </div>
            <Input className="pl-10" {...props} />
        </div>
    );
};

export default InputWithIcon;
