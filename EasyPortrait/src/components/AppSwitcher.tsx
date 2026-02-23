import { useState, useRef, useEffect } from 'react';
import { LayoutGrid, Camera, FileText, X } from 'lucide-react';
import { WITHSWAG_APPS } from '../constants/apps';

const iconMap: Record<string, React.ElementType> = {
  Camera,
  FileText,
};

function AppSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <div ref={ref} className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Open app switcher"
        aria-expanded={open}
        className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 text-gray-700 hover:text-indigo-600"
      >
        {open ? <X size={20} /> : <LayoutGrid size={20} />}
      </button>

      {open && (
        <>
          {/* Desktop dropdown */}
          <div className="hidden md:block absolute top-12 left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">WithSwag Tools</p>
            </div>
            <div className="p-2">
              {WITHSWAG_APPS.map((app) => {
                const Icon = iconMap[app.icon];
                return (
                  <a
                    key={app.path}
                    href={app.path}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors group"
                  >
                    {Icon && <Icon size={18} className="text-indigo-500 group-hover:text-indigo-600" />}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{app.name}</p>
                      <p className="text-xs text-gray-500">{app.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Mobile bottom sheet */}
          <div className="md:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)}>
            <div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <p className="text-base font-semibold text-gray-900">WithSwag Tools</p>
                <button onClick={() => setOpen(false)} aria-label="Close app switcher">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="p-3 pb-8">
                {WITHSWAG_APPS.map((app) => {
                  const Icon = iconMap[app.icon];
                  return (
                    <a
                      key={app.path}
                      href={app.path}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      {Icon && <Icon size={20} className="text-indigo-500" />}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{app.name}</p>
                        <p className="text-xs text-gray-500">{app.description}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AppSwitcher;
