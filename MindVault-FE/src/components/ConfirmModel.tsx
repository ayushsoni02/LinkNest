// ConfirmModal.tsx using Radix UI
import * as Dialog from "@radix-ui/react-dialog";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export default function ConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
}: ConfirmModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-[90%] max-w-sm">
          <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {description}
          </Dialog.Description>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              Delete
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}