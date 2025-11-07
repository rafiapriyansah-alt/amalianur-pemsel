import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from '../../../lib/supabase_server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { title, content, lang, category } = req.body
  const { data, error } = await supabaseServer.from('posts').insert([{
    title, content, lang, category
  }])
  if (error) return res.status(500).json({ error })
  res.status(200).json({ data })
}
