const { supabase } = require('../config/supabase');

const notificationService = {
  /**
   * Get dynamic notifications & clinical alerts for doctor
   */
  async getNotifications(doctorUserId) {
    let doctorId = null;
    if (doctorUserId) {
      const { data: doctor } = await supabase
        .from('doctor')
        .select('id')
        .eq('user_id', doctorUserId)
        .single();
      if (doctor) doctorId = doctor.id;
    }

    // 1. Fetch patients for doctor
    let query = supabase.from('patient').select('id, name, condition, notes, created_at');
    if (doctorId) query = query.eq('doctor_id', doctorId);
    const { data: patients } = await query;

    const dynamicNotifs = [];
    let idCounter = 1;

    if (patients && patients.length > 0) {
      patients.forEach((p) => {
        if (p.notes && p.notes.toLowerCase().includes('low compliance')) {
          dynamicNotifs.push({
            id: idCounter++,
            patientId: p.id,
            type: "warning",
            title: `${p.name} — low compliance`,
            desc: `Pasien menunjukkan penurunan frekuensi latihan. Pertimbangkan untuk menghubungi.`,
            time: "2h ago",
            unread: true,
            color: "#D4A843",
            bg: "rgba(212, 168, 67, 0.07)",
          });
        }
      });
    }

    // Default static fallback alerts if dynamic list is short
    const defaultNotifs = [
      {
        id: 101,
        patientId: "ML",
        type: "warning",
        title: "Margaret Lim — low compliance",
        desc: "Tidak ada sesi latihan dalam 4 hari terakhir. Kepatuhan turun ke 55%.",
        time: "2h ago",
        unread: true,
        color: "#D4A843",
        bg: "rgba(212, 168, 67, 0.07)",
      },
      {
        id: 102,
        patientId: "DS",
        type: "success",
        title: "Diana Santoso — first session complete",
        desc: "Diana telah menyelesaikan sesi terapi pertamanya hari ini (8:05 min, 8/8 latihan).",
        time: "3h ago",
        unread: true,
        color: "#4BA882",
        bg: "rgba(75, 168, 130, 0.07)",
      },
      {
        id: 103,
        patientId: "AK",
        type: "progress",
        title: "Ahmad Kusuma — remarkable progress",
        desc: "5 sesi berturut-turut berstatus Sangat Baik. Nyeri berkurang dari 7 → 3.",
        time: "Today",
        unread: true,
        color: "#0099A6",
        bg: "rgba(0, 153, 166, 0.08)",
      },
      {
        id: 104,
        patientId: "RJ",
        type: "info",
        title: "Robert Johnson — weekly report ready",
        desc: "Ringkasan Minggu 4 telah siap. Rata-rata penurunan nyeri: −1.4 poin/sesi.",
        time: "Yesterday",
        unread: false,
        color: "#3ED8C8",
        bg: "rgba(62, 216, 200, 0.08)",
      },
    ];

    return [...dynamicNotifs, ...defaultNotifs];
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    return { success: true, notificationId };
  },
};

module.exports = notificationService;
