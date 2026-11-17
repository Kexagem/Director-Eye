
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Shot, Prompts, VisualConcept } from './types';
import * as geminiService from './services/geminiService';

import Header from './components/Header';
import ScriptPanel from './components/ScriptPanel';
import BreakdownPanel from './components/BreakdownPanel';
import StylePanel from './components/StylePanel';
import PromptPanel from './components/PromptPanel';
import CreativeModal from './components/CreativeModal';
import Loader from './components/Loader';
import PanelHeader from './components/PanelHeader';
import PromptIcon from './components/icons/PromptIcon';


const App: React.FC = () => {
  const [script, setScript] = useState<string>('');
  const [breakdown, setBreakdown] = useState<Shot[]>([]);
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = useState<Prompts | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('Hyper-realistic');
  
  const [isLoadingBreakdown, setIsLoadingBreakdown] = useState<boolean>(false);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState<boolean>(false);
  const [isLoadingModal, setIsLoadingModal] = useState<boolean>(false);

  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState<string>('');
  
  const [error, setError] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<number | null>(null);
  
  const selectedShot = breakdown.find(shot => shot.id === selectedShotId) || null;
  
  // Removed useEffect for API key check as it's now an environment variable.
  // The geminiService will throw an error if API_KEY is not set.

  const handleApiCall = useCallback(async <T,>(
    apiFunc: () => Promise<T>, 
    setLoading?: React.Dispatch<React.SetStateAction<boolean>>
  ): Promise<T | undefined> => {
    setError(null);
    if (setLoading) setLoading(true);
    try {
      const result = await apiFunc();
      if (setLoading) setLoading(false);
      return result;
    } catch (err) {
      console.error("API Call Error:", err);
      const errorMessage = (err instanceof Error) ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      if (setLoading) setLoading(false);
      return undefined;
    }
  }, []);

  const fetchBreakdown = useCallback(async (currentScript: string) => {
    if (!currentScript.trim()) { 
      setBreakdown([]); 
      setSelectedShotId(null);
      setGeneratedPrompts(null);
      return; 
    }
    const newBreakdown = await handleApiCall(() => geminiService.analyzeScript(currentScript), setIsLoadingBreakdown);
    setBreakdown(newBreakdown || []);
    setSelectedShotId(null); // Reset selected shot
    setGeneratedPrompts(null); // Reset prompts
  }, [handleApiCall]);

  const fetchPrompts = useCallback(async (shot: Shot, style: string) => {
    if (!shot) return;
    const prompts = await handleApiCall(() => geminiService.generatePromptsForShot(shot, style), setIsLoadingPrompts);
    setGeneratedPrompts(prompts || null);
  }, [handleApiCall]);

  useEffect(() => {
    if (selectedShot && selectedStyle) {
      fetchPrompts(selectedShot, selectedStyle);
    } else {
      setGeneratedPrompts(null); // Clear prompts if no shot or style
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShotId, selectedStyle]); // fetchPrompts is memoized by handleApiCall

  const handleScriptChange = (newScript: string) => {
    setScript(newScript);
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = window.setTimeout(() => {
      fetchBreakdown(newScript);
    }, 1200);
  };
  
  const handleGenerateConcept = async () => {
    if (!selectedShot) return;
    setModalTitle("✨ Visual Concept");
    setModalContent(<Loader text="Generating visual concept..." />); // Show loader immediately
    setIsLoadingModal(true); // Though Loader is shown, this can be used for modal state
    setModalContent(null); // Clear previous content before new loader

    const concept = await handleApiCall(() => geminiService.generateVisualConcept(selectedShot, selectedStyle));
    
    if (concept) {
      setModalContent(
        <div className="space-y-4 text-sm">
          <div><h5 className="font-semibold text-blue-400 mb-1">Color Palette</h5><p className="text-gray-300 whitespace-pre-wrap">{concept.colorPalette}</p></div>
          <div><h5 className="font-semibold text-blue-400 mb-1">Lighting</h5><p className="text-gray-300 whitespace-pre-wrap">{concept.lighting}</p></div>
          <div><h5 className="font-semibold text-blue-400 mb-1">Wardrobe</h5><p className="text-gray-300 whitespace-pre-wrap">{concept.wardrobe}</p></div>
          <div><h5 className="font-semibold text-blue-400 mb-1">Set Dressing</h5><p className="text-gray-300 whitespace-pre-wrap">{concept.setDressing}</p></div>
        </div>
      );
    } else {
       setModalContent(<p className="text-red-400">Could not generate visual concept. {error ? `Error: ${error}`: ''}</p>);
    }
    setIsLoadingModal(false); // General loading state for modal if needed
  };
  
  const handleGenerateStoryboard = async () => {
    if (!selectedShot) return;
    setModalTitle("✨ Storyboard Suggestion");
    setModalContent(<Loader text="Generating storyboard sequence..." />);
    setIsLoadingModal(true);
    setModalContent(null);

    const sequence = await handleApiCall(() => geminiService.generateStoryboardSequence(selectedShot, selectedStyle));
    
    if (sequence && sequence.length > 0) {
      setModalContent(
        <ol className="list-decimal list-inside space-y-3 text-sm text-gray-300">
          {sequence.map((item: string, index: number) => <li key={index} className="whitespace-pre-wrap">{item}</li>)}
        </ol>
      );
    } else {
      setModalContent(<p className="text-red-400">Could not generate storyboard. {error ? `Error: ${error}`: ''}</p>);
    }
    setIsLoadingModal(false);
  };
  
  const copyToClipboard = useCallback((text: string, buttonElement: HTMLButtonElement) => {
    navigator.clipboard.writeText(text).then(() => {
        buttonElement.textContent = 'Copied!';
        buttonElement.classList.add('bg-green-500');
        buttonElement.classList.remove('hover:bg-blue-600', 'bg-gray-700');
        setTimeout(() => { 
            buttonElement.textContent = 'Copy'; 
            buttonElement.classList.remove('bg-green-500');
            buttonElement.classList.add('hover:bg-blue-600', 'bg-gray-700');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        buttonElement.textContent = 'Error';
        setTimeout(() => { buttonElement.textContent = 'Copy'; }, 2000);
    });
  }, []);

  const handleCloseModal = () => {
    setModalContent(null);
    setModalTitle('');
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#121212] text-gray-300">
      {/* SettingsModal removed as API key is handled by environment variable */}
      {modalContent && !isLoadingModal && <CreativeModal title={modalTitle} onClose={handleCloseModal}>{modalContent}</CreativeModal>}
      {isLoadingModal && modalContent && <CreativeModal title={modalTitle} onClose={handleCloseModal}><Loader text={modalTitle.includes("Storyboard") ? "Generating storyboard..." : "Generating concept..."} /></CreativeModal>}
      
      <Header /> {/* Removed onSettingsClick */}
      
      {error && (
        <div className="p-3 bg-red-700 text-white text-center text-sm shadow-md flex justify-between items-center" role="alert">
          <span>Error: {error}</span>
          <button onClick={() => setError(null)} className="ml-4 text-lg font-bold hover:text-red-200">&times;</button>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        <ScriptPanel script={script} onScriptChange={handleScriptChange} />
        <BreakdownPanel 
            shots={breakdown} 
            selectedShotId={selectedShotId} 
            onSelectShot={setSelectedShotId} 
            isLoading={isLoadingBreakdown} 
            onGenerateConcept={handleGenerateConcept} 
            onGenerateStoryboard={handleGenerateStoryboard} 
        />
        <StylePanel 
            selectedStyle={selectedStyle} 
            onStyleChange={setSelectedStyle} 
            isDisabled={!selectedShotId || isLoadingPrompts || isLoadingBreakdown} 
        />
        <main className="flex-1 bg-[#121212] flex flex-col">
          <PanelHeader icon={<PromptIcon />} title="4. Generated Prompts" />
          <div className="flex-1 overflow-y-auto p-6">
              {!selectedShotId ? (
                <div className="text-center text-gray-500 h-full flex items-center justify-center text-sm p-4">
                  Select a shot from the 'Breakdown' panel to generate prompts.
                </div>
              ) : (
                <PromptPanel 
                    prompts={generatedPrompts} 
                    isLoading={isLoadingPrompts} 
                    onCopyToClipboard={copyToClipboard}
                />
              )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
