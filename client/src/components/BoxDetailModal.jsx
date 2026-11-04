import React, { useState, useRef } from 'react';
import { X, MapPin, Calendar, Share2, Play, Pause, Volume2, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const BoxDetailModal = ({ box, isOpen, onClose, onVisit }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const audioRef = useRef(null);

  if (!isOpen || !box) return null;

  // Debug: Log the box data
  console.log('BoxDetailModal - Box data:', box);
  console.log('BoxDetailModal - mainImage:', box.mainImage);
  console.log('BoxDetailModal - images:', box.images);
  console.log('BoxDetailModal - audioUrl:', box.audioUrl);

  // Get all images (main image + additional images)
  const allImages = [];
  if (box.mainImage) {
    allImages.push(box.mainImage);
  }
  
  // Handle images field - it could be an array, null, or undefined
  if (box.images) {
    if (Array.isArray(box.images)) {
      allImages.push(...box.images);
    } else if (typeof box.images === 'string') {
      // If it's a string, try to parse it
      try {
        const parsed = JSON.parse(box.images);
        if (Array.isArray(parsed)) {
          allImages.push(...parsed);
        }
      } catch (e) {
        console.error('Failed to parse box.images:', e);
      }
    }
  }

  console.log('BoxDetailModal - allImages:', allImages);

  const hasImages = allImages.length > 0;
  const hasAudio = box.audioUrl && box.audioUrl !== 'null' && box.audioUrl !== '';

  const handleVisit = () => {
    onVisit(box.id);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsAudioPlaying(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-garden-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-garden-600">{box.number}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-garden-800">{box.name}</h2>
              <p className="text-garden-600">Garden Box #{box.number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image Gallery */}
          {hasImages ? (
            <div className="mb-6">
              <div className="relative w-full h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden group">
                <img
                  src={normalizeAssetUrl(allImages[currentImageIndex])}
                  alt={`${box.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                />
                
                {/* Zoom button */}
                <button
                  onClick={() => setShowImageModal(true)}
                  className="absolute top-3 right-3 bg-black bg-opacity-50 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="View full size"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>

                {/* Navigation buttons (only show if multiple images) */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Image counter */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail strip (only show if multiple images) */}
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-garden-500 ring-2 ring-garden-200'
                          : 'border-gray-300 hover:border-garden-300'
                      }`}
                    >
                      <img
                        src={normalizeAssetUrl(image)}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6">
              <div className="w-full h-48 bg-gradient-to-br from-garden-100 to-garden-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-garden-400 mx-auto mb-2" />
                  <p className="text-garden-600 font-medium">{box.name}</p>
                  <p className="text-sm text-garden-500">Garden Box #{box.number}</p>
                </div>
              </div>
            </div>
          )}

          {/* Audio Player */}
          {hasAudio && (
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleAudio}
                  className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
                >
                  {isAudioPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Volume2 className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-semibold text-purple-900">Audio Description Available</p>
                  </div>
                  <p className="text-xs text-purple-700">
                    {isAudioPlaying ? 'Playing...' : 'Click play to listen to the description'}
                  </p>
                </div>
              </div>
              <audio
                ref={audioRef}
                src={normalizeAssetUrl(box.audioUrl)}
                onEnded={handleAudioEnded}
                className="hidden"
              />
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-garden-800 mb-3 flex items-center">
              <span className="w-2 h-2 bg-garden-500 rounded-full mr-2"></span>
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {box.description}
            </p>
          </div>

          {/* Details */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-garden-50 rounded-lg p-4">
              <h4 className="font-semibold text-garden-800 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Box Number
              </h4>
              <p className="text-garden-600">#{box.number}</p>
            </div>
            <div className="bg-garden-50 rounded-lg p-4">
              <h4 className="font-semibold text-garden-800 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Status
              </h4>
              <p className="text-garden-600">Available for viewing</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 bg-garden-600 hover:bg-garden-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Close
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${box.name} - Garden Box #${box.number}`);
                // Could add toast notification here
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-screen Image Modal */}
      {showImageModal && hasImages && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60]" onClick={() => setShowImageModal(false)}>
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-8">
            <img
              src={normalizeAssetUrl(allImages[currentImageIndex])}
              alt={`${box.name} - Full size`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-4 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition-all"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-4 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition-all"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BoxDetailModal;

function normalizeAssetUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  return `${base}${url.startsWith('/') ? url : '/' + url}`;
}
