import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Pencil } from 'lucide-react';

interface RenameNestModalProps {
  open: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  currentName: string;
}

export default function RenameNestModal({ 
  open, 
  onClose, 
  onRename, 
  currentName 
}: RenameNestModalProps) {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (open) {
      setName(currentName);
    }
  }, [open, currentName]);

  const handleSubmit = () => {
    if (!name.trim() || name.trim() === currentName) {
      onClose();
      return;
    }
    onRename(name.trim());
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xs transform overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 p-4 shadow-2xl transition-all">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-base font-semibold text-white flex items-center gap-2">
                    <Pencil size={16} className="text-indigo-400" />
                    Rename Nest
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Input */}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-white text-sm transition-all"
                  placeholder="Enter new name"
                />

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-3 py-2 bg-zinc-800 text-zinc-400 text-sm font-medium rounded-lg hover:bg-zinc-700 hover:text-zinc-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!name.trim()}
                    className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
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
