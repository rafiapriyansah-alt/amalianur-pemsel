// components/admin/AdminHeader.tsx
"use client";
export default function AdminHeader(){
  return (
    <header className="bg-white p-3 shadow sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="md:hidden">☰</button>
          <div className="font-semibold">Admin Panel</div>
        </div>
        <div className="text-sm text-gray-600">Yayasan Amalianur</div>
      </div>
    </header>
  );
}
