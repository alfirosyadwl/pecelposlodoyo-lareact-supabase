import { useNavigate } from "react-router-dom";
import api from "./axiosConfig"; // Gunakan instance axios kita untuk logout
import Employee from "./Employee"; // Import komponen Karyawan
import { useState } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // State untuk mengatur menu apa yang sedang aktif
  const [activeMenu, setActiveMenu] = useState("karyawan");

  const handleLogout = async () => {
    try {
      await api.post("/logout"); // Tidak perlu tulis token lagi berkat interceptor!
    } catch (error) {
      console.error("Gagal memanggil API logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar Kiri */}
      <div style={{ width: "250px", background: "#333", color: "white", padding: "20px" }}>
        <h2>Warung App</h2>
        <p>Halo, {user?.name}</p>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {/* Menu Keuangan bisa dilihat semua role (sementara) */}
          <li style={{ margin: "10px 0", cursor: "pointer", color: activeMenu === "keuangan" ? "yellow" : "white" }} onClick={() => setActiveMenu("keuangan")}>
            💰 Keuangan (Segera)
          </li>

          {/* Menu Karyawan HANYA dirender jika role adalah admin */}
          {user?.role === "admin" && (
            <li style={{ margin: "10px 0", cursor: "pointer", color: activeMenu === "karyawan" ? "yellow" : "white" }} onClick={() => setActiveMenu("karyawan")}>
              👥 Karyawan
            </li>
          )}
        </ul>
        <button onClick={handleLogout} style={{ marginTop: "50px", width: "100%", background: "red", color: "white", border: "none", padding: "10px", cursor: "pointer" }}>
          Logout
        </button>
      </div>

      {/* Konten Kanan */}
      <div style={{ flex: 1, padding: "20px", background: "#f4f4f4" }}>
        {activeMenu === "karyawan" && user?.role === "admin" && <Employee />}
        {activeMenu === "keuangan" && <h3>Halaman Keuangan Belum Dibuat</h3>}
      </div>
    </div>
  );
}
