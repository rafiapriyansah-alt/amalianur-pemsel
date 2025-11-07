// components/GalleryGrid.tsx
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function GalleryGrid({ items }: { items: any[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!items?.length) return;
    const t = setInterval(() => setIndex(i => (i + 1) % items.length), 3500);
    return () => clearInterval(t);
  }, [items?.length]);

  if (!items?.length) return <div className="text-gray-500">Belum ada foto.</div>;

  const current = items[index];
  return (
    <div className="card p-2">
      <motion.img key={current.id} src={current.image_url} alt={current.title} className="w-full h-64 object-cover rounded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} />
      <div className="mt-2 text-center font-semibold">{current.title}</div>
    </div>
  );
}
