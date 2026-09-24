import Sidebar from '@/app/(plataforma)/components/Sidebar';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-col flex-1 overflow-y-auto">
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}