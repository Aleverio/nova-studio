import React from 'react';
import { LucideIcon, Check, Loader2 } from 'lucide-react';

// ─── Button ──────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'text' | 'destructive';
  size?: 'sm' | 'md';
  icon?: LucideIcon;
  trailingIcon?: LucideIcon;
  loading?: boolean;
}

export function Button({
  variant = 'ghost',
  size = 'md',
  icon: Icon,
  trailingIcon: TrailingIcon,
  loading,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center gap-[6px] rounded-[8px] font-[Inter,system-ui,sans-serif] font-semibold leading-none cursor-pointer transition-opacity select-none shrink-0';
  const sizes = size === 'sm'
    ? 'px-[8px] py-[5px] text-[10px]'
    : 'px-[11px] py-[7px] text-[11.5px]';
  const variants: Record<string, string> = {
    primary:     'bg-[--n-paper] text-[--n-on-paper] hover:opacity-90',
    ghost:       'bg-transparent border border-[--n-line2] text-[--n-mid] hover:text-[--n-hi]',
    text:        'bg-transparent text-[--n-faint] hover:text-[--n-mid] px-0 py-0',
    destructive: 'bg-[--n-del] text-[--n-on-paper] hover:opacity-90',
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${base} ${sizes} ${variants[variant]} ${disabled || loading ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? (
        <Loader2 size={11} className="animate-spin" />
      ) : Icon ? (
        <Icon size={11} />
      ) : null}
      {children}
      {TrailingIcon && !loading && <TrailingIcon size={9} />}
    </button>
  );
}

// ─── IconButton ───────────────────────────────────────────────────────────────

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  size?: number;
}

export function IconButton({ icon: Icon, label, active, size = 13, className = '', ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={`w-[28px] h-[28px] flex items-center justify-center rounded-[6px] cursor-pointer transition-colors
        ${active ? 'bg-[--n-paper] text-[--n-on-paper]' : 'text-[--n-low] hover:text-[--n-mid] hover:bg-[--n-hover]'}
        ${className}`}
      {...props}
    >
      <Icon size={size} />
    </button>
  );
}

// ─── DockItem ─────────────────────────────────────────────────────────────────

interface DockItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function DockItem({ icon: Icon, label, active, onClick }: DockItemProps) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`w-[32px] h-[32px] flex items-center justify-center rounded-[9px] cursor-pointer transition-colors
        ${active ? 'bg-[--n-paper]' : 'hover:bg-[--n-hover]'}`}
    >
      <Icon size={16} color={active ? 'var(--n-on-paper)' : 'var(--n-low)'} />
    </button>
  );
}

// ─── Keycap ───────────────────────────────────────────────────────────────────

export function Keycap({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[4px] bg-[--n-hover] border border-[--n-line2] font-['JetBrains_Mono',monospace] text-[--n-low] leading-none
        ${small ? 'px-[4px] py-[1px] text-[8.5px]' : 'px-[5px] py-[2px] text-[9px]'}`}
    >
      {children}
    </span>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  size?: number;
}

export function Checkbox({ checked, indeterminate, onChange, label, size = 13 }: CheckboxProps) {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);

  return (
    <label className="inline-flex items-center gap-[6px] cursor-pointer select-none">
      <span className="relative" style={{ width: size, height: size }}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          readOnly={!onChange}
          className="sr-only"
          aria-checked={indeterminate ? 'mixed' : checked}
        />
        <span
          className={`flex items-center justify-center rounded-[4px] border transition-colors
            ${checked || indeterminate
              ? 'bg-[--n-paper] border-[--n-paper]'
              : 'bg-transparent border-[--n-line2]'}`}
          style={{ width: size, height: size }}
        >
          {checked && !indeterminate && <Check size={size - 5} color="var(--n-on-paper)" strokeWidth={3} />}
          {indeterminate && (
            <span className="block bg-[--n-mid] rounded-[1px]" style={{ width: 6, height: 2 }} />
          )}
        </span>
      </span>
      {label && <span className="text-[10.5px] text-[--n-mid]">{label}</span>}
    </label>
  );
}

// ─── Switch ────────────────────────────────────────────────────────────────────

interface SwitchProps {
  checked: boolean;
  onChange?: (v: boolean) => void;
  label?: string;
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <label className="inline-flex items-center gap-[8px] cursor-pointer select-none">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={`relative w-[26px] h-[15px] rounded-[8px] border transition-colors shrink-0
          ${checked ? 'bg-[--n-paper] border-[--n-paper]' : 'bg-[--n-active] border-[--n-line2]'}`}
      >
        <span
          className={`absolute top-[2px] w-[10px] h-[10px] rounded-full transition-all
            ${checked ? 'right-[2px] bg-[--n-on-paper]' : 'left-[2px] bg-[--n-low]'}`}
        />
      </button>
      {label && <span className="text-[10.5px] text-[--n-mid]">{label}</span>}
    </label>
  );
}

// ─── Tag / Badge ───────────────────────────────────────────────────────────────

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-[7px] py-[2px] rounded-[5px] border border-[--n-line2] text-[9.5px] text-[--n-low] font-[Inter,system-ui,sans-serif] leading-none">
      {children}
    </span>
  );
}

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'installed' | 'update' }) {
  const styles: Record<string, string> = {
    default:   'border-[--n-line2] text-[--n-faint]',
    installed: 'border-[--n-add] text-[--n-add]',
    update:    'border-[--n-warn] text-[--n-warn]',
  };
  return (
    <span className={`inline-flex items-center px-[5px] py-[2px] rounded-[4px] border text-[8.5px] font-[Inter,system-ui,sans-serif] leading-none ${styles[variant]}`}>
      {children}
    </span>
  );
}

// ─── Segmented Control ────────────────────────────────────────────────────────

interface SegmentedProps {
  options: { label: string; value: string; count?: number }[];
  value: string;
  onChange: (v: string) => void;
}

export function Segmented({ options, value, onChange }: SegmentedProps) {
  return (
    <div className="flex items-center h-[28px] rounded-[8px] bg-[--n-raise] border border-[--n-line] p-[2px] gap-[2px]">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`h-[24px] px-[8px] rounded-[6px] text-[10.5px] font-[Inter,system-ui,sans-serif] flex items-center gap-[4px] transition-colors cursor-pointer
            ${value === opt.value ? 'bg-[--n-hover] text-[--n-hi]' : 'text-[--n-low] hover:text-[--n-mid]'}`}
        >
          {opt.label}
          {opt.count !== undefined && (
            <span className="font-['JetBrains_Mono',monospace] text-[9px] text-[--n-faint]">{opt.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── SearchField ──────────────────────────────────────────────────────────────

interface SearchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  shortcut?: string;
}

export function SearchField({ shortcut, className = '', ...props }: SearchFieldProps) {
  return (
    <div className={`relative flex items-center h-[30px] rounded-[8px] bg-[--n-raise] border border-[--n-line] focus-within:border-[--n-line2] ${className}`}>
      <svg className="absolute left-[9px] text-[--n-low]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        {...props}
        className="w-full h-full bg-transparent pl-[27px] pr-[8px] text-[11px] text-[--n-hi] placeholder:text-[--n-faint] outline-none font-[Inter,system-ui,sans-serif]"
      />
      {shortcut && (
        <span className="absolute right-[8px] font-['JetBrains_Mono',monospace] text-[9.5px] text-[--n-faint]">
          {shortcut}
        </span>
      )}
    </div>
  );
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────

export function SectionLabel({ children, action, onAction }: { children: React.ReactNode; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between px-[8px] py-[4px]">
      <span className="text-[9.5px] font-semibold tracking-[1.2px] uppercase text-[--n-faint] font-[Inter,system-ui,sans-serif]">
        {children}
      </span>
      {action && (
        <button onClick={onAction} className="text-[9px] text-[--n-faint] hover:text-[--n-low] cursor-pointer">
          {action}
        </button>
      )}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

export function Avatar({ initials, variant = 'neutral', size = 24 }: { initials: string; variant?: 'paper' | 'neutral'; size?: number }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold font-[Inter,system-ui,sans-serif] shrink-0 select-none
        ${variant === 'paper' ? 'bg-[--n-paper] text-[--n-on-paper]' : 'bg-[--n-active] text-[--n-mid]'}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 12 12"
      className="animate-spin"
      style={{ animationDuration: '800ms' }}
    >
      <circle cx="6" cy="6" r="4.5" fill="none" stroke="var(--n-low)" strokeWidth="1.5"
        strokeDasharray="22" strokeDashoffset="6" strokeLinecap="round" />
    </svg>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider({ vertical }: { vertical?: boolean }) {
  return vertical
    ? <span className="w-[1px] h-[16px] bg-[--n-line2] shrink-0" />
    : <div className="w-full h-[1px] bg-[--n-line]" />;
}
