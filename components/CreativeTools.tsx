
import React from 'react';
import SparkleIcon from './icons/SparkleIcon';

interface CreativeToolsProps {
  onGenerateConcept: () => void;
  onGenerateStoryboard: () => void;
}

const CreativeTools: React.FC<CreativeToolsProps> = ({ onGenerateConcept, onGenerateStoryboard }) => (
    <div className="mt-3 pt-3 border-t border-blue-500/20 flex flex-col space-y-2">
         <button 
            onClick={onGenerateConcept} 
            className="flex items-center justify-center space-x-2 w-full text-xs bg-blue-600/80 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
            <SparkleIcon />
            <span>Visual Concept</span>
        </button>
        <button 
            onClick={onGenerateStoryboard} 
            className="flex items-center justify-center space-x-2 w-full text-xs bg-purple-600/80 hover:bg-purple-600 text-white font-semibold py-2 px-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
            <SparkleIcon />
            <span>Suggest Storyboard</span>
        </button>
    </div>
);

export default CreativeTools;
