
import React from 'react';

interface PanelHeaderProps {
  icon: React.ReactNode;
  title: string;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({ icon, title }) => (
    <div className="flex items-center space-x-3 p-4 border-b border-[#2A2A2A] flex-shrink-0">
        {icon}
        <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">{title}</h2>
    </div>
);

export default PanelHeader;
