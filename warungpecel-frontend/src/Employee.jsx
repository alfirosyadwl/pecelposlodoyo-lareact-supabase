import { useState, useEffect } from 'react';
import api from './axiosConfig'; // Gunakan axios yang sudah dikonfigurasi

export default function Employee() {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ id: null, name: '', email: '', password: '' });
    const [isEditing, setIsEditing] = useState(false);

    // Ambil data karyawan saat komponen dimuat
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Gagal mengambil data:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/users/${formData.id}`, formData);
                alert('Karyawan berhasil diupdate');
            } else {
                await api.post('/users', formData);
                alert('Karyawan berhasil ditambahkan');
            }
            
            // Reset form dan refresh data
            setFormData({ id: null, name: '', email: '', password: '' });
            setIsEditing(false);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Terjadi kesalahan');
        }
    };

    const handleEdit = (user) => {
        setFormData({ id: user.id, name: user.name, email: user.email, password: '' }); // Password kosong untuk edit
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus karyawan ini?')) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers(); // Refresh data setelah dihapus
            } catch (error) {
                console.error('Gagal menghapus:', error);
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h3>Manajemen Karyawan</h3>
            
            {/* Form Tambah/Edit */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
                <input type="text" name="name" placeholder="Nama Karyawan" value={formData.name} onChange={handleInputChange} required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
                <input 
                    type="password" 
                    name="password" 
                    placeholder={isEditing ? "Password (Kosongkan jika tidak diubah)" : "Password Baru"} 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    required={!isEditing} 
                />
                <button type="submit" style={{ background: isEditing ? 'orange' : 'green', color: 'white' }}>
                    {isEditing ? 'Update Karyawan' : 'Tambah Karyawan'}
                </button>
                {isEditing && (
                    <button type="button" onClick={() => { setIsEditing(false); setFormData({ id: null, name: '', email: '', password: '' }); }}>Batal</button>
                )}
            </form>

            {/* Tabel Karyawan */}
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                <button onClick={() => handleEdit(user)} style={{ marginRight: '10px' }}>Edit</button>
                                <button onClick={() => handleDelete(user.id)} style={{ background: 'red', color: 'white' }}>Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}