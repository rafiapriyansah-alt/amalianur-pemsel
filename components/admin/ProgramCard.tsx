import Link from 'next/link'

export default function ProgramCard({program}:{program:{title:string,excerpt?:string,slug?:string}}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-lg transition">
      <h3 className="font-semibold">{program.title}</h3>
      <p className="text-sm text-gray-500 mt-2">{program.excerpt || 'Deskripsi singkat program.'}</p>
      <div className="mt-4">
        <Link href={`/programs/${program.slug || ''}`} className="text-amalia-green font-semibold">Selengkapnya →</Link>
      </div>
    </div>
  )
}
