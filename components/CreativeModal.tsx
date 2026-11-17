
import React from 'react';

interface CreativeModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const CreativeModal: React.FC<CreativeModalProps> = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div 
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" 
          onClick={e => e.stopPropagation()}
        >
            <header className="p-4 border-b border-[#2A2A2A] flex justify-between items-center flex-shrink-0">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <button 
                  onClick={onClose} 
                  className="text-gray-400 hover:text-white text-2xl leading-none px-2 py-1 rounded hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Close modal"
                >
                  &times;
                </button>
            </header>
            <div className="p-6 overflow-y-auto text-gray-300">
                {children}
            </div>
        </div>
    </div>
);

export default CreativeModal;
