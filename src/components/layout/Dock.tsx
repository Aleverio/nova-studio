import { Files, Search, GitBranch, Users, Puzzle, PanelLeft, HelpCircle, type LucideIcon } from 'lucide-react';
import { DockItem, Avatar } from '../primitives';
import { useAppStore } from '../../store/useAppStore';
import type { Screen } from '../../types';

const dockItems: { icon: LucideIcon; label: string; screen: Screen }[] = [
  { icon: Files,     label: 'Files',          screen: 'editor'         },
  { icon: Search,    label: 'Search',          screen: 'search'         },
  { icon: GitBranch, label: 'Source Control',  screen: 'source-control' },
  { icon: Users,     label: 'Team Room',        screen: 'room'           },
  { icon: Puzzle,    label: 'Extensions',       screen: 'extensions'     },
];

export function Dock() {
  const { screen, setScreen, setRightPanel } = useAppStore();

  const handleClick = (s: Screen) => {
    setScreen(s);
    // room opens the room panel on the right
    if (s === 'room') setRightPanel('room');
    else if (s === 'editor') setRightPanel('ai');
    else setRightPanel('none');
  };

  return (
    <nav
      aria-label="Main navigation"
      className="dock flex flex-col items-center rounded-[12px] border shrink-0 py-[10px] gap-[6px] h-full"
      style={{ background: 'var(--n-card)', borderColor: 'var(--n-line)' }}
    >
      <div className="flex flex-col items-center gap-[6px] flex-1">
        {dockItems.map((item) => (
          <DockItem
            key={item.screen}
            icon={item.icon}
            label={item.label}
            active={screen === item.screen}
            onClick={() => handleClick(item.screen)}
          />
        ))}
        <div className="my-[2px] w-[20px] h-[1px]" style={{ background: 'var(--n-line)' }} />
        <DockItem icon={PanelLeft} label="Layouts" onClick={() => {}} />
      </div>

      {/* Bottom: help + avatar */}
      <div className="flex flex-col items-center gap-[6px]">
        <DockItem icon={HelpCircle} label="Help" onClick={() => {}} />
        <Avatar initials="AR" variant="paper" size={26} />
      </div>
    </nav>
  );
}
