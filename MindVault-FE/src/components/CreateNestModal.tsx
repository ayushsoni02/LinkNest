import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Folder } from 'lucide-react';

interface CreateNestModalProps {
  open: boolean;
  onClose: () => void;
  onCreate?: (nestData: { name: string; icon: string; color: string; description: string }) => void;
}

// Preset emoji options
const EMOJI_OPTIONS = ['📚', '⚡', '🤖', '🌐', '💡', '🎯', '🚀', '💼', '🎨', '📱', '⭐', '🔥', '💰', '🏆', '🎮', '📊'];

// Preset color palette
const COLOR_OPTIONS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Green', value: '#10B981' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Solana', value: '#14F195' },
  { name: 'Gray', value: '#6B7280' },
];

export default function CreateNestModal({ open, onClose, onCreate }: CreateNestModalProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(EMOJI_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a nest name');
      return;
    }

    onCreate?.({ name, icon: selectedIcon, color: selectedColor, description });
    
    // Reset form
    setName('');
    setSelectedIcon(EMOJI_OPTIONS[0]);
    setSelectedColor(COLOR_OPTIONS[0].value);
    setDescription('');
    onClose();
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-2xl transition-all">
                
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <Folder size={24} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <Dialog.Title className="text-xl font-bold text-zinc-900 dark:text-white">
                      Create New Nest
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Form */}
                <div className="space-y-6">
                  {/* Nest Name */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Nest Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., AI Research, Solana"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white"
                    />
                  </div>

                  {/* Icon Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Choose an Icon
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setSelectedIcon(emoji)}
                          className={`p-3 text-2xl rounded-lg transition-all ${
                            selectedIcon === emoji
                              ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500 scale-110'
                              : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Pick a Color
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setSelectedColor(color.value)}
                          className={`h-10 rounded-lg transition-all ${
                            selectedColor === color.value
                              ? 'ring-2 ring-offset-2 ring-zinc-400 dark:ring-zinc-600 scale-110'
                              : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Description (Optional) */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What's this nest about?"
                      rows={3}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white resize-none"
                    />
                  </div>

                  {/* Preview */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 font-semibold uppercase tracking-wider">
                      Preview
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: selectedColor + '20' }}
                      >
                        {selectedIcon}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-white">
                          {name || 'Your Nest Name'}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                  >
                    Create Nest
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
