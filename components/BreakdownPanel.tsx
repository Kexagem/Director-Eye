
import React from 'react';
import { Shot } from '../types';
import PanelHeader from './PanelHeader';
import BreakdownIcon from './icons/BreakdownIcon';
import Loader from './Loader';
import CreativeTools from './CreativeTools';

interface BreakdownPanelProps {
  shots: Shot[];
  selectedShotId: string | null;
  onSelectShot: (id: string) => void;
  isLoading: boolean;
  onGenerateConcept: () => void;
  onGenerateStoryboard: () => void;
}

const BreakdownPanel: React.FC<BreakdownPanelProps> = ({ shots, selectedShotId, onSelectShot, isLoading, onGenerateConcept, onGenerateStoryboard }) => (
  <aside className="w-[25%] flex-shrink-0 bg-[#161616] border-r border-[#2A2A2A] flex flex-col">
    <PanelHeader icon={<BreakdownIcon />} title="2. Breakdown" />
    <div className="flex-1 overflow-y-auto p-4">
      {isLoading ? <Loader text="Analyzing script..." /> : shots.length === 0 ? (
        <div className="text-center text-gray-500 h-full flex items-center justify-center text-sm p-4">
          Waiting for script input. The analyzed shots will appear here.
        </div>
      ) : (
        <ul className="space-y-2">
          {shots.map(shot => (
            <li 
              key={shot.id} 
              onClick={() => onSelectShot(shot.id)} 
              className={`p-3 rounded-md cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02]
                ${selectedShotId === shot.id ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400' : 'bg-[#212121] text-gray-400 hover:bg-[#2A2A2A] hover:text-gray-200'}`}
            >
              <div className="font-bold text-sm">{shot.scene || 'N/A'} - {shot.type || 'N/A'}</div>
              <p className="text-xs mt-1 opacity-80">{shot.description}</p>
              {selectedShotId === shot.id && <CreativeTools onGenerateConcept={onGenerateConcept} onGenerateStoryboard={onGenerateStoryboard} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  </aside>
);

export default BreakdownPanel;
