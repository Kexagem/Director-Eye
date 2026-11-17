
import React from 'react';
import PanelHeader from './PanelHeader';
import StyleIcon from './icons/StyleIcon';

interface StylePanelProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
  isDisabled: boolean;
}

const StylePanel: React.FC<StylePanelProps> = ({ selectedStyle, onStyleChange, isDisabled }) => {
    const styles = ['Hyper-realistic', 'Anime', 'Cyberpunk', 'Film Noir', 'Vintage', 'Fantasy Art', 'Minimalist', 'Impressionistic', 'Gothic', 'Steampunk'];
    return (
        <aside className="w-52 flex-shrink-0 bg-[#161616] border-r border-[#2A2A2A] flex flex-col">
            <PanelHeader icon={<StyleIcon />} title="3. Style" />
            <div className={`flex-1 overflow-y-auto p-4 transition-opacity duration-300 ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}>
                <div className="space-y-2">
                    {styles.map(style => (
                        <button 
                          key={style} 
                          onClick={() => { if (!isDisabled) onStyleChange(style); }} 
                          disabled={isDisabled} 
                          className={`w-full p-2.5 rounded-md text-sm font-medium text-left transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50
                            ${selectedStyle === style ? 'bg-blue-600 text-white ring-blue-400' : 'bg-[#212121] text-gray-400 hover:bg-[#2A2A2A] hover:text-gray-200 ring-transparent'}
                            ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            {style}
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default StylePanel;
