"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function UcapanKepalaYayasan() {
  return (
    <section className="py-20 bg-gradient-to-br from-white via-blue-50 to-amalia-light">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-10">
        
        {/* Foto Kepala Yayasan */}
        <motion.div
          className="md:w-1/3 flex justify-center"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <Image
              src="/images/kepala-yayasan.jpg"
              alt="Kepala Yayasan Amalianur"
              width={350}
              height={350}
              className="rounded-2xl shadow-xl object-cover border-4 border-white"
            />
            {/* efek dekorasi glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/10 to-white/30 blur-xl" />
          </div>
        </motion.div>

        {/* Ucapan */}
        <motion.div
          className="md:w-2/3"
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Ucapan dari Kepala Yayasan
          </h2>
          <p className="mt-6 text-gray-600 leading-relaxed text-lg">
            “Assalamu’alaikum warahmatullahi wabarakatuh.
            <br /><br />
            Dengan penuh rasa syukur kepada Allah SWT, kami menyambut kehadiran
            Anda di website resmi <b>Yayasan Amalianur</b>. Kami berkomitmen
            untuk membangun generasi penerus bangsa yang tidak hanya unggul
            dalam ilmu pengetahuan, tetapi juga berakhlak mulia dan berjiwa sosial.
            <br /><br />
            Terima kasih atas dukungan, doa, dan kepercayaan yang telah diberikan.
            Semoga kerja sama dan semangat kebaikan ini terus tumbuh demi masa
            depan yang lebih baik.
            <br /><br />
            Wassalamu’alaikum warahmatullahi wabarakatuh.”
          </p>

          {/* Tanda tangan digital */}
          <div className="mt-10">
            <Image
              src="/images/ttd-kepala.png"
              alt="Tanda Tangan Kepala Yayasan"
              width={180}
              height={80}
              className="mb-2"
            />
            <p className="font-semibold text-gray-800 text-lg">
              H. Muhammad Arif, S.Pd.I
            </p>
            <p className="text-gray-500 text-sm">Kepala Yayasan Amalianur</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
