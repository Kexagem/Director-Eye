
import React from 'react';

// Removed onSettingsClick prop as settings modal for API key is no longer needed.
// If other settings are added in the future, this can be reinstated.
const Header: React.FC = () => (
  <header className="flex-shrink-0 bg-[#1A1A1A] p-3 px-6 border-b border-[#2A2A2A] flex items-center justify-between">
    <h1 className="text-lg font-semibold text-gray-100">Director's Eye AI ✨</h1>
    {/* Settings button removed. Add back if other settings functionality is implemented. */}
    {/* 
    <button onClick={onSettingsClick} className="text-gray-400 hover:text-white transition-colors" title="Settings">
        <SettingsIcon />
    </button> 
    */}
  </header>
);

export default Header;
