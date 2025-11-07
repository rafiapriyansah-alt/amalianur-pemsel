export default function Testimonial({items}:{items?:any[]}) {
  const sample = items ?? [
    {name:'Siti', role:'Ibu Rumah Tangga', text:'Anak saya mendapatkan beasiswa, terima kasih Yayasan Amalianur.'},
    {name:'Budi', role:'Relawan', text:'Suasana kerja yang hangat dan profesional.'},
    {name:'Rina', role:'Donatur', text:'Proses donasi cepat dan transparan.'}
  ]

  return (
    <section className="container mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-6">Apa Kata Mereka</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {sample.map((t,i)=>(
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-amalia-green text-white flex items-center justify-center font-bold">{t.name[0]}</div>
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="text-xs text-gray-500">{t.role}</div>
              </div>
            </div>
            <p className="text-gray-600">"{t.text}"</p>
          </div>
        ))}
      </div>
    </section>
  )
}
