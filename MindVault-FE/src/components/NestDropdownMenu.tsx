import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

interface NestDropdownMenuProps {
  onRename: () => void;
  onDelete: () => void;
}

export default function NestDropdownMenu({ onRename, onDelete }: NestDropdownMenuProps) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button 
        className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50 rounded transition-all opacity-0 group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreVertical size={14} />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-1 w-36 origin-top-right bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRename();
                }}
                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                  active ? 'bg-zinc-800 text-white' : 'text-zinc-300'
                } transition-colors`}
              >
                <Pencil size={14} />
                Rename
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                  active ? 'bg-red-500/10 text-red-400' : 'text-red-400'
                } transition-colors`}
              >
                <Trash2 size={14} />
                Delete Nest
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
