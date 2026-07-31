import React, { useState } from 'react';
import { Screenshot as ScreenshotType } from '../types';
import { Camera, ExternalLink, X, Maximize2 } from 'lucide-react';

interface ScreenshotGalleryProps {
  screenshots: ScreenshotType[];
  totalCount: number;
}

export const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({ screenshots, totalCount }) => {
  const [selectedImage, setSelectedImage] = useState<ScreenshotType | null>(null);

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <Camera className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-medium">No screenshots captured yet.</p>
        <p className="text-xs text-slate-500 mt-1">The Chrome extension captures visible tab screenshots every 15 seconds.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100">Recent Screenshots</h3>
          <p className="text-xs text-slate-400">Automated visual captures logged in Supabase Storage</p>
        </div>
        <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-mono">
          Total: {totalCount}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {screenshots.map((s) => (
          <div
            key={s.id}
            className="group relative bg-slate-800/50 rounded-lg overflow-hidden border border-slate-800 hover:border-slate-700 transition-all"
          >
            <div className="aspect-video w-full bg-slate-950 relative overflow-hidden">
              <img
                src={s.imageUrl}
                alt={s.pageTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedImage(s)}
                className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                title="View Fullsize"
              >
                <div className="p-2 bg-slate-900/80 rounded-full border border-slate-700">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </button>
            </div>

            <div className="p-3">
              <h4 className="text-xs font-medium text-slate-200 truncate" title={s.pageTitle}>
                {s.pageTitle || s.pageUrl}
              </h4>
              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                <span className="font-mono">{formatTimestamp(s.timestamp)}</span>
                <a
                  href={s.pageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-400"
                  title="Open URL"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Lightbox Viewer */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="min-w-0 pr-4">
                <h3 className="text-sm font-semibold text-slate-100 truncate">{selectedImage.pageTitle}</h3>
                <p className="text-xs text-slate-400 truncate mt-0.5">{selectedImage.pageUrl}</p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.pageTitle}
                className="max-h-[65vh] max-w-full object-contain rounded border border-slate-800"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Captured: {formatTimestamp(selectedImage.timestamp)}</span>
              <a
                href={selectedImage.pageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1"
              >
                Visit Webpage <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
