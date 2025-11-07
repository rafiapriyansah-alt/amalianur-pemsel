// pages/api/test-admin.ts
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase.auth.admin.createUser({
    email: "testuser@example.com",
    password: "password123",
    email_confirm: true,
  });

  if (error) {
    console.error("Test Error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ success: true, data });
}
