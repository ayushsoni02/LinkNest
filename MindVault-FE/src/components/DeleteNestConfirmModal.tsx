import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteNestConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nestName: string;
}

export default function DeleteNestConfirmModal({ 
  open, 
  onClose, 
  onConfirm, 
  nestName 
}: DeleteNestConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
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
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <AlertTriangle size={18} className="text-red-400" />
                  </div>
                  <div className="flex-1">
                    <Dialog.Title className="text-base font-semibold text-white">
                      Delete Nest?
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="absolute top-3 right-3 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Message */}
                <p className="text-sm text-zinc-400 mb-4">
                  All links in <span className="text-zinc-200 font-medium">"{nestName}"</span> will be moved to Uncategorized. This action cannot be undone.
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="flex-1 px-3 py-2 bg-zinc-800 text-zinc-400 text-sm font-medium rounded-lg hover:bg-zinc-700 hover:text-zinc-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-500 transition-all"
                  >
                    Delete
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
