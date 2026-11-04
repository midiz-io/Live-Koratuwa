import React from 'react';
import { Check } from 'lucide-react';

const BoxCard = ({ box, isVisited, onClick }) => {
  const hasImage = box.mainImage && box.mainImage !== 'null' && box.mainImage !== '';
  const hasAudio = box.audioUrl && box.audioUrl !== 'null' && box.audioUrl !== '';
  const hasMedia = hasImage || hasAudio;

  return (
    <button
      onClick={onClick}
      className={`relative w-16 h-16 rounded-lg border-2 flex items-center justify-center font-bold text-lg cursor-pointer transition-all duration-200 hover:scale-105 overflow-hidden ${
        isVisited
          ? 'bg-garden-200 border-garden-500 text-garden-900 shadow-md'
          : 'bg-garden-50 border-garden-300 text-garden-800 hover:bg-garden-100 hover:border-garden-400'
      }`}
      title={`Box ${box.number}: ${box.name}${hasMedia ? ' (Has media)' : ''}`}
    >
      {/* Background Image if available */}
      {hasImage && (
        <div className="absolute inset-0 opacity-20">
          <img
            src={normalizeAssetUrl(box.mainImage)}
            alt={box.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Box Number */}
      <span className="z-10 relative">{box.number}</span>
      
      {/* Media Indicators */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5 pb-0.5 z-20">
        {hasImage && (
          <div className="w-1 h-1 bg-blue-500 rounded-full" title="Has images"></div>
        )}
        {hasAudio && (
          <div className="w-1 h-1 bg-purple-500 rounded-full" title="Has audio"></div>
        )}
      </div>

      {/* Visited Indicator */}
      {isVisited && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-garden-600 text-white rounded-full flex items-center justify-center shadow-lg z-20">
          <Check className="w-3 h-3" />
        </div>
      )}
      
      {/* Hover Effect */}
      <div className={`absolute inset-0 rounded-lg transition-opacity duration-200 ${
        isVisited 
          ? 'bg-garden-300 opacity-0 hover:opacity-20' 
          : 'bg-garden-200 opacity-0 hover:opacity-30'
      }`}></div>
    </button>
  );
};

export default BoxCard;

function normalizeAssetUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  return `${base}${url.startsWith('/') ? url : '/' + url}`;
}
