
import React from 'react';
import PanelHeader from './PanelHeader';
import ScriptIcon from './icons/ScriptIcon';

interface ScriptPanelProps {
  script: string;
  onScriptChange: (script: string) => void;
}

const ScriptPanel: React.FC<ScriptPanelProps> = ({ script, onScriptChange }) => (
  <aside className="w-[25%] flex-shrink-0 bg-[#161616] border-r border-[#2A2A2A] flex flex-col">
    <PanelHeader icon={<ScriptIcon />} title="1. Script" />
    <div className="p-4 flex-1">
      <textarea 
        className="w-full h-full bg-[#212121] text-gray-300 p-3 rounded-md border border-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
        placeholder="Paste your script here..." 
        value={script} 
        onChange={(e) => onScriptChange(e.target.value)} 
      />
    </div>
  </aside>
);

export default ScriptPanel;
