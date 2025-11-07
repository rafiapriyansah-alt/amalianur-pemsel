import { useState, useEffect } from "react";
import { getSupabase } from "../../lib/supabaseClient";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { Eye, EyeOff, School, RefreshCw } from "lucide-react";

interface LoginSettings {
  background_image: string;
  logo_image: string;
  title: string;
  subtitle: string;
}

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<LoginSettings | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const router = useRouter();
  const supabase = getSupabase();

  // 🔹 Load login settings
  useEffect(() => {
    loadLoginSettings();
  }, [lastUpdate]);

  async function loadLoginSettings() {
    try {
      const { data, error } = await supabase
        .from("login_settings")
        .select("*")
        .single();

      if (error || !data) {
        setSettings({
          background_image: "",
          logo_image: "",
          title: "Login Dashboard Amalianur",
          subtitle: "Yayasan Pendidikan Islam Terpadu",
        });
        return;
      }

      const cacheBuster = Date.now();
      setSettings({
        ...data,
        background_image: `${data.background_image}?t=${cacheBuster}`,
       logo_image: data.logo_image ? `${data.logo_image}?t=${cacheBuster}` : "",

      });
    } catch (err) {
      console.error("🚨 Failed to load login settings:", err);
    }
  }

  const forceRefresh = () => setLastUpdate(Date.now());

  // 🔹 Handle Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Login via Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError || !authData.user) {
        setError("❌ Email atau kata sandi salah.");
        return;
      }

      // Ambil info role dari tabel users
      const { data: userRow, error: userErr } = await supabase
        .from("users")
        .select("email, name, role")
        .eq("email", email.trim())
        .single();

      if (userErr || !userRow) {
        setError("⚠️ Akun tidak ditemukan di database users.");
        return;
      }

      localStorage.setItem(
        "amalianur_user",
        JSON.stringify({
          email: userRow.email,
          name: userRow.name,
          role: userRow.role,
        })
      );

      // Arahkan berdasarkan role
      if (userRow.role === "super_admin") {
        router.push("/admin/users");
      } else {
        router.push("/admin/home");
      }
    } catch (err: any) {
      console.error("🚨 Login error:", err);
      setError("Terjadi kesalahan tidak terduga saat login.");
    } finally {
      setLoading(false);
    }
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('${settings?.background_image || "https://placehold.co/"}')`,
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px] md:backdrop-blur-[1px]"></div>

      {process.env.NODE_ENV === "development" && (
        <button
          onClick={forceRefresh}
          className="absolute top-4 right-4 z-50 bg-green-600 text-white p-2 rounded-full shadow-lg hover:bg-green-700 transition-colors"
          title="Refresh Settings"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl w-full max-w-sm border border-white/20 relative z-10"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            {settings?.logo_image && settings.logo_image.trim() !== "" ? (

              <motion.img
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                src={settings.logo_image}
                alt="Logo Amalianur"
                className="w-16 h-16 object-contain rounded-full border-4 border-green-100 shadow-lg"
              />
            ) : (
            <div className=" bg-gray-200 animate-pulse"></div>
            )}
          </div>

          <h2 className="text-xl font-bold text-green-800 mb-1">
            {settings?.title || "Login Dashboard Amalianur"}
          </h2>
          <p className="text-gray-600 text-xs">
            {settings?.subtitle || "Yayasan Pendidikan Islam Terpadu"}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Masukkan email anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white/80"
              required
            />
          </div>

          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Kata Sandi
  </label>
  <div className="relative">
    <input
      type="password"
      placeholder="Masukkan kata sandi"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white/80"
      required
    />
  </div>
</div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <p className="text-red-600 text-xs text-center">{error}</p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg py-2.5 text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Memproses...
              </>
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-4 pt-4 border-t border-gray-200"
        >
          <p className="text-xs text-gray-500">
            Yayasan Amalianur © {new Date().getFullYear()}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
