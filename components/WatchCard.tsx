
import React from 'react';
import { WatchResult } from '../types';
import { ExternalLinkIcon } from './Icons';

interface WatchCardProps {
  result: WatchResult;
}

const WatchCard: React.FC<WatchCardProps> = ({ result }) => {
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'subscription': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cinema': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'rent': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'buy': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-700 shadow-2xl animate-fade-in max-w-4xl mx-auto mb-12">
      <div className="flex flex-col md:flex-row">
        {/* Poster Image */}
        <div className="md:w-1/3 relative group">
          <img 
            src={result.posterUrl} 
            alt={result.title} 
            className="w-full h-full object-cover aspect-[2/3] md:aspect-auto"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
        </div>

        {/* Details Content */}
        <div className="md:w-2/3 p-6 md:p-8 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">{result.title}</h2>
              <span className="text-slate-400 text-lg">{result.year}</span>
            </div>
          </div>

          <p className="text-slate-300 mb-8 leading-relaxed line-clamp-4">
            {result.overview || "Check out the current availability for this title below."}
          </p>

          <div className="space-y-6 flex-grow">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">Availability</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.options.map((opt, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-indigo-500/50 transition-colors group/item"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-200">{opt.service}</span>
                      {opt.url && (
                        <a 
                          href={opt.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1"
                        >
                          Watch Now <ExternalLinkIcon className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getBadgeColor(opt.type)} capitalize`}>
                      {opt.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {result.sources.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">Live Verify Links</h3>
                <div className="flex flex-wrap gap-2">
                  {result.sources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border border-indigo-500/20 transition-colors"
                    >
                      {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                      <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchCard;
