import { useState, useEffect } from "react";
import api from "./axiosConfig";

export default function Finance() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

  // State Master-Detail Form (Seperti sebelumnya)
  const [headerData, setHeaderData] = useState({
    transaction_date: new Date().toISOString().split("T")[0],
    warung: "Warung Cabang 1",
  });
  const [items, setItems] = useState([{ type: "pemasukan", description: "", amount: "" }]);

  // STATE BARU: Menyimpan data transaksi mana yang sedang dilihat detailnya
  const [selectedBatch, setSelectedBatch] = useState(null);
  // --- STATE & FUNGSI UNTUK EDIT BATCH ---
  const [isEditingBatch, setIsEditingBatch] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  // Fungsi untuk membuka mode edit
  const openEditMode = () => {
    setEditFormData({
      transaction_date: selectedBatch.transaction_date,
      warung: selectedBatch.warung,
      // Deep copy array agar tidak merubah data asli sebelum tombol simpan ditekan
      items: JSON.parse(JSON.stringify(selectedBatch.items)),
    });
    setIsEditingBatch(true);
  };

  const handleEditHeaderChange = (e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

  const handleEditItemChange = (index, field, value) => {
    const newItems = [...editFormData.items];
    newItems[index][field] = value;
    setEditFormData({ ...editFormData, items: newItems });
  };

  const removeEditItem = (index) => {
    const newItems = [...editFormData.items];
    newItems.splice(index, 1);
    setEditFormData({ ...editFormData, items: newItems });
  };

  const addEditItem = () => {
    setEditFormData({ ...editFormData, items: [...editFormData.items, { type: "pemasukan", description: "", amount: "" }] });
  };

  const submitEditBatch = async () => {
    if (editFormData.items.length === 0) {
      return alert("Struk tidak boleh kosong! Jika ingin menghapus semua, gunakan tombol hapus pada menu sebelumnya.");
    }

    try {
      await api.put(`/transactions/batch/${selectedBatch.batch_id}`, editFormData);
      alert("Perubahan berhasil disimpan!");
      setIsEditingBatch(false);
      setSelectedBatch(null); // Tutup modal
      fetchTransactions(); // Refresh tabel
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengupdate transaksi");
    }
  };
  // ---------------------------------------

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get("/transactions");
      setTransactions(response.data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    }
  };

  // Fungsi Form (Tetap sama seperti sebelumnya)
  const handleHeaderChange = (e) => setHeaderData({ ...headerData, [e.target.name]: e.target.value });
  const handleItemChange = (index, event) => {
    const newItems = [...items];
    newItems[index][event.target.name] = event.target.value;
    setItems(newItems);
  };
  const handleAddItem = () => setItems([...items, { type: "pemasukan", description: "", amount: "" }]);
  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/transactions", { ...headerData, items });
      alert("Transaksi berhasil dicatat!");
      setItems([{ type: "pemasukan", description: "", amount: "" }]);
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan saat menyimpan transaksi");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus item ini?")) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchTransactions();
      } catch (err) {
        alert("Gagal menghapus transaksi.");
      }
    }
  };

  // --- LOGIKA PENGELOMPOKKAN (GROUPING) DATA ---
  // Menggabungkan transaksi yang memiliki batch_id yang sama menjadi 1 baris
  const groupedTransactions = transactions.reduce((acc, curr) => {
    const key = curr.batch_id || curr.id; // Fallback jika ada data lama yg blm punya batch_id
    if (!acc[key]) {
      acc[key] = {
        batch_id: curr.batch_id,
        transaction_date: curr.transaction_date,
        warung: curr.warung,
        user: curr.user,
        items: [], // Menyimpan rincian item di dalam baris ini
        totalPemasukan: 0,
        totalPengeluaran: 0,
      };
    }
    acc[key].items.push(curr);
    if (curr.type === "pemasukan") acc[key].totalPemasukan += Number(curr.amount);
    if (curr.type === "pengeluaran") acc[key].totalPengeluaran += Number(curr.amount);
    return acc;
  }, {});

  // Ubah object kembali menjadi array agar bisa di-map ke tabel
  const groupedList = Object.values(groupedTransactions);

  // Kalkulasi Ringkasan Widget (Tetap sama)
  const totalPemasukan = transactions.filter((t) => t.type === "pemasukan").reduce((sum, t) => sum + Number(t.amount), 0);
  const totalPengeluaran = transactions.filter((t) => t.type === "pengeluaran").reduce((sum, t) => sum + Number(t.amount), 0);
  const saldoAkhir = totalPemasukan - totalPengeluaran;

  return (
    <div style={{ padding: "20px" }}>
      <h3>Pencatatan Keuangan Warung</h3>

      {/* --- KARTU RINGKASAN (Dipendekkan demi keterbacaan) --- */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, background: "#d4edda", padding: "20px", borderRadius: "8px" }}>
          <p style={{ margin: 0, color: "#155724" }}>TOTAL PEMASUKAN</p>
          <h2 style={{ margin: "10px 0 0 0", color: "#155724" }}>{formatRupiah(totalPemasukan)}</h2>
        </div>
        <div style={{ flex: 1, background: "#f8d7da", padding: "20px", borderRadius: "8px" }}>
          <p style={{ margin: 0, color: "#721c24" }}>TOTAL PENGELUARAN</p>
          <h2 style={{ margin: "10px 0 0 0", color: "#721c24" }}>{formatRupiah(totalPengeluaran)}</h2>
        </div>
        <div style={{ flex: 1, background: "#cce5ff", padding: "20px", borderRadius: "8px" }}>
          <p style={{ margin: 0, color: "#004085" }}>SALDO AKHIR</p>
          <h2 style={{ margin: "10px 0 0 0" }}>{formatRupiah(saldoAkhir)}</h2>
        </div>
      </div>

      {/* --- FORM INPUT (Dipendekkan demi keterbacaan) --- */}
      <div style={{ background: "white", padding: "20px", borderRadius: "8px", marginBottom: "30px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h4>Catat Transaksi Baru</h4>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: "20px", marginBottom: "15px" }}>
            <input type="date" name="transaction_date" value={headerData.transaction_date} onChange={handleHeaderChange} required style={{ padding: "8px" }} />
            <select name="warung" value={headerData.warung} onChange={handleHeaderChange} style={{ padding: "8px" }}>
              <option value="Warung Cabang 1">Warung Cabang 1</option>
              <option value="Warung Cabang 2">Warung Cabang 2</option>
            </select>
          </div>
          {items.map((item, index) => (
            <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <select name="type" value={item.type} onChange={(e) => handleItemChange(index, e)} style={{ padding: "8px" }}>
                <option value="pemasukan">Pemasukan</option>
                <option value="pengeluaran">Pengeluaran</option>
              </select>
              <input type="text" name="description" placeholder="Keterangan..." value={item.description} onChange={(e) => handleItemChange(index, e)} required style={{ padding: "8px", flex: 1 }} />
              <input type="number" name="amount" placeholder="Nominal" value={item.amount} onChange={(e) => handleItemChange(index, e)} required style={{ padding: "8px" }} />
              {items.length > 1 && (
                <button type="button" onClick={() => handleRemoveItem(index)} style={{ padding: "8px", background: "red", color: "white", border: "none", cursor: "pointer" }}>
                  X
                </button>
              )}
            </div>
          ))}
          <div style={{ marginTop: "15px" }}>
            <button type="button" onClick={handleAddItem} style={{ padding: "8px 15px", marginRight: "10px", background: "green", color: "white", border: "none", cursor: "pointer" }}>
              + Tambah Item
            </button>
            <button type="submit" style={{ padding: "8px 15px", background: "blue", color: "white", border: "none", cursor: "pointer" }}>
              Simpan Data
            </button>
          </div>
        </form>
      </div>

      {/* --- TABEL HISTORI TRANSAKSI --- */}
      <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h4 style={{ marginTop: 0 }}>Histori Transaksi (Rekap)</h4>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
              <th style={{ padding: "12px" }}>Tanggal</th>
              <th style={{ padding: "12px" }}>Warung</th>
              <th style={{ padding: "12px" }}>Pencatat</th>
              <th style={{ padding: "12px" }}>Total Pemasukan</th>
              <th style={{ padding: "12px" }}>Total Pengeluaran</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {groupedList.map((group, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #dee2e6" }}>
                <td style={{ padding: "12px" }}>{group.transaction_date}</td>
                <td style={{ padding: "12px", fontWeight: "bold" }}>{group.warung}</td>
                <td style={{ padding: "12px" }}>{group.user?.name}</td>
                <td style={{ padding: "12px", color: "green", fontWeight: "bold" }}>{formatRupiah(group.totalPemasukan)}</td>
                <td style={{ padding: "12px", color: "red", fontWeight: "bold" }}>{formatRupiah(group.totalPengeluaran)}</td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <button onClick={() => setSelectedBatch(group)} style={{ background: "#17a2b8", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>
                    Lihat Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL POP-UP DETAIL TRANSAKSI --- */}
      {selectedBatch && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "25px", borderRadius: "8px", width: "800px", maxWidth: "95%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }}>{isEditingBatch ? "Edit Data Transaksi" : "Detail Transaksi"}</h3>
              <button
                onClick={() => {
                  setSelectedBatch(null);
                  setIsEditingBatch(false);
                }}
                style={{ background: "none", border: "none", fontSize: "1.5em", cursor: "pointer", color: "red" }}
              >
                &times;
              </button>
            </div>

            {/* HEADER INFORMASI (Berubah jadi form jika mode edit) */}
            <div style={{ background: "#f4f4f4", padding: "15px", borderRadius: "8px", marginBottom: "15px", display: "flex", gap: "20px" }}>
              {isEditingBatch ? (
                <>
                  <div>
                    <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Warung:</label>
                    <select name="warung" value={editFormData.warung} onChange={handleEditHeaderChange} style={{ padding: "5px" }}>
                      <option value="Warung Cabang 1">Warung Cabang 1</option>
                      <option value="Warung Cabang 2">Warung Cabang 2</option>
                      <option value="Warung Pusat">Warung Pusat</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Tanggal:</label>
                    <input type="date" name="transaction_date" value={editFormData.transaction_date} onChange={handleEditHeaderChange} style={{ padding: "5px" }} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 5px 0" }}>
                      <strong>Warung:</strong> {selectedBatch.warung}
                    </p>
                    <p style={{ margin: "0 0 5px 0" }}>
                      <strong>Tanggal:</strong> {selectedBatch.transaction_date}
                    </p>
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <p style={{ margin: 0 }}>
                      <strong>Pencatat:</strong> {selectedBatch.user?.name}
                    </p>

                    {/* TOMBOL EDIT (Hanya untuk Admin) */}
                    {(user?.role === "admin" || user?.id === selectedBatch.user?.id) && (
                      <button onClick={openEditMode} style={{ marginTop: "10px", background: "orange", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer" }}>
                        ✏️ Edit Transaksi
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* TABEL ITEM TRANSAKSI */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#e9ecef" }}>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Tipe</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd" }}>Keterangan</th>
                  <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "right" }}>Nominal</th>
                  {isEditingBatch && <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>Hapus</th>}
                </tr>
              </thead>
              <tbody>
                {(isEditingBatch ? editFormData.items : selectedBatch.items).map((item, index) => (
                  <tr key={item.id || index}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {isEditingBatch ? (
                        <select value={item.type} onChange={(e) => handleEditItemChange(index, "type", e.target.value)} style={{ width: "100%", padding: "5px" }}>
                          <option value="pemasukan">Pemasukan</option>
                          <option value="pengeluaran">Pengeluaran</option>
                        </select>
                      ) : (
                        <span style={{ color: item.type === "pemasukan" ? "green" : "red", fontWeight: "bold" }}>{item.type.toUpperCase()}</span>
                      )}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {isEditingBatch ? <input type="text" value={item.description} onChange={(e) => handleEditItemChange(index, "description", e.target.value)} style={{ width: "90%", padding: "5px" }} /> : item.description}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "right" }}>
                      {isEditingBatch ? <input type="number" value={item.amount} onChange={(e) => handleEditItemChange(index, "amount", e.target.value)} style={{ width: "100px", padding: "5px" }} /> : formatRupiah(item.amount)}
                    </td>

                    {/* Tombol Silang (X) untuk menghapus baris saat Edit */}
                    {isEditingBatch && (
                      <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                        <button onClick={() => removeEditItem(index)} style={{ background: "red", color: "white", border: "none", padding: "5px 10px", cursor: "pointer", borderRadius: "4px" }}>
                          X
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TOMBOL ACTION MODE EDIT */}
            {isEditingBatch && (
              <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
                <button onClick={addEditItem} style={{ background: "green", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer" }}>
                  + Tambah Item
                </button>

                <div>
                  <button onClick={() => setIsEditingBatch(false)} style={{ background: "#6c757d", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer", marginRight: "10px" }}>
                    Batal
                  </button>
                  <button onClick={submitEditBatch} style={{ background: "blue", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
