"use client";

export default function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className="w-12 h-6 shrink-0 rounded-full relative transition-colors duration-200 cursor-pointer"
      style={{ backgroundColor: value ? 'var(--primary)' : 'var(--border)' }}>
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  );
}
