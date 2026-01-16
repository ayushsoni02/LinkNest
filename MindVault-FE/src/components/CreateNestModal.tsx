import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Sparkles } from 'lucide-react';

interface CreateNestModalProps {
  open: boolean;
  onClose: () => void;
  onCreate?: (nestData: { name: string; color: string }) => void;
}

// Simplified 6-color palette with aesthetic colors
const COLOR_OPTIONS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Slate', value: '#64748b' },
];

export default function CreateNestModal({ open, onClose, onCreate }: CreateNestModalProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      return;
    }

    onCreate?.({ name, color: selectedColor });
    
    // Reset form
    setName('');
    setSelectedColor(COLOR_OPTIONS[0].value);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSubmit();
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl transition-all">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <Dialog.Title className="text-lg font-semibold text-white flex items-center gap-2">
                    <Sparkles size={18} className="text-indigo-400" />
                    Create Nest
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Form */}
                <div className="space-y-5">
                  {/* Floating Label Input */}
                  <div className="relative">
                    <input
                      type="text"
                      id="nestName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onKeyDown={handleKeyDown}
                      className="peer w-full px-4 pt-5 pb-2 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-white placeholder-transparent transition-all"
                      placeholder="Nest Name"
                    />
                    <label
                      htmlFor="nestName"
                      className={`absolute left-4 transition-all duration-200 pointer-events-none
                        ${name || isFocused 
                          ? 'top-1.5 text-[10px] text-indigo-400 font-medium' 
                          : 'top-1/2 -translate-y-1/2 text-sm text-zinc-500'
                        }`}
                    >
                      Nest Name
                    </label>
                  </div>

                  {/* Color Picker - Horizontal Row */}
                  <div>
                    <p className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide">
                      Pick a color
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setSelectedColor(color.value)}
                          className={`w-10 h-10 rounded-full transition-all duration-200 ${
                            selectedColor === color.value
                              ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-white scale-110'
                              : 'hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Compact Preview */}
                  <div className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl border border-zinc-800">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: selectedColor + '25' }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selectedColor }}
                      />
                    </div>
                    <span className="text-sm font-medium text-zinc-300">
                      {name || 'Your nest name...'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-5">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-400 font-medium rounded-xl hover:bg-zinc-700 hover:text-zinc-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!name.trim()}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                  >
                    Create
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
