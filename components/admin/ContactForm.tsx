import { useState } from 'react'

export default function ContactForm() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({name:'',email:'',message:''})

  async function handleSubmit(e:any){
    e.preventDefault()
    // For now just simulate send (you can wire supabase/function later)
    setSent(true)
    setTimeout(()=>setSent(false), 2500)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm">
      <div className="mb-3">
        <label className="text-sm">Nama</label>
        <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full border p-2 rounded mt-1" />
      </div>
      <div className="mb-3">
        <label className="text-sm">Email</label>
        <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full border p-2 rounded mt-1" />
      </div>
      <div className="mb-3">
        <label className="text-sm">Pesan</label>
        <textarea value={form.message} onChange={e=>setForm({...form, message:e.target.value})} className="w-full border p-2 rounded mt-1" rows={4}></textarea>
      </div>
      <button className="bg-amalia-dark text-white px-4 py-2 rounded">{sent ? 'Terkirim' : 'Kirim Pesan'}</button>
    </form>
  )
}
