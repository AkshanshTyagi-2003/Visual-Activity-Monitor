import React, { useState } from 'react';
import { Key, Copy, Check, X, ShieldCheck } from 'lucide-react';

interface ExtensionTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

export const ExtensionTokenModal: React.FC<ExtensionTokenModalProps> = ({ isOpen, onClose, token }) => {
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedApi, setCopiedApi] = useState(false);

  const apiUrl = window.location.origin + '/api';

  if (!isOpen) return null;

  const copyToClipboard = (text: string, isToken: boolean) => {
    navigator.clipboard.writeText(text);
    if (isToken) {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedApi(true);
      setTimeout(() => setCopiedApi(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">Chrome Extension Setup</h3>
            <p className="text-xs text-slate-400">Connect the extension to automatically track tabs & screenshots</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Copy these parameters into the extension popup under <span className="font-semibold text-slate-100">chrome://extensions</span> to establish authentication.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">API Base URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={apiUrl}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono outline-none"
              />
              <button
                onClick={() => copyToClipboard(apiUrl, false)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {copiedApi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedApi ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">JWT Authentication Token</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={token}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono truncate outline-none"
              />
              <button
                onClick={() => copyToClipboard(token, true)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedToken ? 'Token Copied!' : 'Copy Token'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
