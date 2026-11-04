import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Play, Pause, Volume2, ZoomIn } from 'lucide-react';

const BoxDetail = ({ box, onClose, isVisited }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const audioRef = useRef(null);

  // Parse images - handle string, array, or null
  let parsedImages = [];
  if (box.images) {
    if (typeof box.images === 'string') {
      try {
        parsedImages = JSON.parse(box.images);
      } catch (e) {
        console.error('Failed to parse images:', e);
        parsedImages = [];
      }
    } else if (Array.isArray(box.images)) {
      parsedImages = box.images;
    }
  }

  // Create full images array (mainImage + additional images)
  const allImages = box.mainImage 
    ? [box.mainImage, ...parsedImages.filter(img => img && img !== box.mainImage)]
    : parsedImages.filter(img => img);

  const hasImages = allImages.length > 0;
  const hasAudio = box.audioUrl && box.audioUrl.trim() !== '';

  // Image navigation
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Audio controls
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

  const currentImage = hasImages ? allImages[currentImageIndex] : null;
  const imageUrl = currentImage ? normalizeAssetUrl(currentImage) : null;
  const audioUrl = hasAudio ? normalizeAssetUrl(box.audioUrl) : null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-t-2xl sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xl sm:text-2xl font-bold">{box.number}</span>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">{box.name}</h2>
                  <p className="text-xs sm:text-sm text-green-100">Garden Box #{box.number}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {/* Status Badge */}
            <div className="mb-4 sm:mb-6">
              {isVisited ? (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Visited
                </div>
              ) : (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  New Discovery
                </div>
              )}
            </div>

            {/* Image Gallery */}
            {hasImages ? (
              <div className="mb-4 sm:mb-6">
                <div className="relative group">
                  {/* Main Image */}
                  <div className="relative w-full h-48 sm:h-64 md:h-80 bg-gray-100 rounded-xl overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`${box.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="20"%3EImage not available%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    
                    {/* Zoom Button */}
                    <button
                      onClick={() => setShowImageModal(true)}
                      className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                    >
                      <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    {/* Image Counter */}
                    {allImages.length > 1 && (
                      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-black/70 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                        {currentImageIndex + 1} / {allImages.length}
                      </div>
                    )}

                    {/* Navigation Arrows */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  {allImages.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                      {allImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex
                              ? 'border-green-500 ring-2 ring-green-200'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <img
                            src={normalizeAssetUrl(img)}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-4 sm:mb-6">
                <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl mb-2">🌱</div>
                    <p className="text-green-600 font-medium text-sm sm:text-base">Garden Box #{box.number}</p>
                    <p className="text-green-500 text-xs sm:text-sm">Image coming soon</p>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Player */}
            {hasAudio && (
              <div className="mb-4 sm:mb-6">
                <div className="relative rounded-xl p-[3px] bg-gradient-to-r from-green-400 via-emerald-500 to-green-600">
                  <div className="bg-white/95 backdrop-blur-sm rounded-[10px] p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3 text-green-700">
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-medium text-xs sm:text-sm">Audio Guide</span>
                      </div>
                      <button
                        onClick={toggleAudio}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-2 sm:p-3 rounded-full transition-all shadow-md"
                      >
                        {isAudioPlaying ? (
                          <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
                        )}
                      </button>
                    </div>
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => setIsAudioPlaying(false)}
                      onPause={() => setIsAudioPlaying(false)}
                      onPlay={() => setIsAudioPlaying(true)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">About {box.name}</h3>
              <div 
                className="text-sm sm:text-base text-gray-600 leading-relaxed html-content"
                dangerouslySetInnerHTML={{ __html: box.description }}
              />
            </div>

            {/* Fun Facts */}
            {box.funFact && box.funFact.trim() !== '' && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Fun Facts</h3>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs">💡</span>
                    </div>
                    <div 
                      className="text-xs sm:text-sm text-gray-600 html-content flex-1"
                      dangerouslySetInnerHTML={{ __html: box.funFact }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Share Button */}
            <div className="mb-3 sm:mb-4">
              <button className="w-full py-2 sm:py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2 text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>Share This Box</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full py-2 sm:py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Image Modal */}
      {showImageModal && hasImages && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          <img
            src={imageUrl}
            alt={`${box.name} - Full size`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default BoxDetail;

function normalizeAssetUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  return `${base}${url.startsWith('/') ? url : '/' + url}`;
}