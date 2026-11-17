
import React from 'react';
import { Prompts } from '../types';
import Loader from './Loader';

interface PromptPanelProps {
  prompts: Prompts | null;
  isLoading: boolean;
  onCopyToClipboard: (text: string, buttonElement: HTMLButtonElement) => void;
}

const PromptPanel: React.FC<PromptPanelProps> = ({ prompts, isLoading, onCopyToClipboard }) => (
    <div className="space-y-6">
        {isLoading ? <Loader text="Generating prompts..." /> : prompts ? (
            <>
                {(Object.entries(prompts) as [keyof Prompts, string][]).map(([key, value]) => (
                    <div key={key}>
                        <h4 className="font-mono text-xs text-blue-400 mb-1.5 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                        <div className="bg-[#212121] p-4 rounded-md relative group border border-transparent hover:border-blue-500/30 transition-colors">
                            <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{value}</p>
                            <button 
                                onClick={(e) => onCopyToClipboard(value, e.currentTarget)} 
                                className="absolute top-2 right-2 bg-gray-700 hover:bg-blue-600 text-white px-2.5 py-1 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                ))}
            </>
        ) : (
          <div className="text-center text-gray-500 h-full flex items-center justify-center text-sm p-4">
            Generated prompts for the selected shot and style will appear here.
          </div>
        )}
    </div>
);

export default PromptPanel;
