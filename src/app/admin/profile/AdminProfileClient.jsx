'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateAdminProfile, updateAdminPassword } from '@/actions/adminActions';
import { Shield, User, Mail, KeyRound, Calendar, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminProfileClient({ admin }) {
  const router = useRouter();

  // Profile Form State
  const [name, setName] = useState(admin?.name || '');
  const [email, setEmail] = useState(admin?.email || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileAlert, setProfileAlert] = useState(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState(null);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileAlert(null);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);

      const res = await updateAdminProfile(formData);
      if (res?.error) {
        setProfileAlert({ type: 'error', message: res.error });
      } else {
        setProfileAlert({ type: 'success', message: res.message });
        router.refresh();
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setProfileAlert({ type: 'error', message: 'Gagal memperbarui profil admin.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordAlert(null);

    if (newPassword.length < 6) {
      setPasswordAlert({ type: 'error', message: 'Kata sandi baru minimal 6 karakter.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordAlert({ type: 'error', message: 'Konfirmasi kata sandi baru tidak cocok.' });
      return;
    }

    setIsSavingPassword(true);

    try {
      const formData = new FormData();
      formData.append('currentPassword', currentPassword);
      formData.append('newPassword', newPassword);
      formData.append('confirmPassword', confirmPassword);

      const res = await updateAdminPassword(formData);
      if (res?.error) {
        setPasswordAlert({ type: 'error', message: res.error });
      } else {
        setPasswordAlert({ type: 'success', message: res.message });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Update password error:', err);
      setPasswordAlert({ type: 'error', message: 'Gagal mengubah kata sandi admin.' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const formattedJoinDate = admin?.created_at
    ? new Date(admin.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '17 November 2026';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#171F3F]">Profil Administrator</h1>
        <p className="text-xs text-[#6D6E70] mt-1">
          Kelola informasi akun Anda dan keamanan kredensial portal Admin StudyGear
        </p>
      </div>

      {/* Overview Identity Banner */}
      <div className="bg-gradient-to-r from-[#171F3F] to-[#283776] text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
          <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold">{admin?.name || 'Administrator StudyGear'}</h2>
            <span className="inline-block px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold rounded-full uppercase tracking-wider self-center sm:self-auto">
              Administrator Sistem
            </span>
          </div>
          <p className="text-xs text-[#CED2E3] flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            <span>{admin?.email || 'admin@studygear.id'}</span>
          </p>
          <p className="text-xs text-[#CED2E3]/80 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Terdaftar sejak {formattedJoinDate}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Ubah Informasi Profil */}
        <div className="bg-white rounded-3xl border border-[#CED2E3]/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#CED2E3]/60">
              <div className="w-8 h-8 rounded-xl bg-[#171F3F]/10 text-[#171F3F] flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#171F3F]">Informasi Akun</h3>
                <p className="text-[11px] text-[#6D6E70]">Perbarui nama dan alamat email login</p>
              </div>
            </div>

            {profileAlert && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center justify-between ${
                  profileAlert.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {profileAlert.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{profileAlert.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileAlert(null)}
                  className="p-1 hover:opacity-75"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} id="profileForm" className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nama Administrator"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@studygear.id"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776] transition-colors"
                />
              </div>
            </form>
          </div>

          <div className="pt-6 mt-4 border-t border-[#CED2E3]/60">
            <button
              type="submit"
              form="profileForm"
              disabled={isSavingProfile}
              className="w-full py-2.5 bg-[#171F3F] hover:bg-[#283776] text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isSavingProfile ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Akun'}
            </button>
          </div>
        </div>

        {/* Card 2: Keamanan Kata Sandi */}
        <div className="bg-white rounded-3xl border border-[#CED2E3]/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#CED2E3]/60">
              <div className="w-8 h-8 rounded-xl bg-[#283776]/10 text-[#283776] flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#171F3F]">Keamanan Kata Sandi</h3>
                <p className="text-[11px] text-[#6D6E70]">Ganti kata sandi portal administrator</p>
              </div>
            </div>

            {passwordAlert && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center justify-between ${
                  passwordAlert.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {passwordAlert.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{passwordAlert.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPasswordAlert(null)}
                  className="p-1 hover:opacity-75"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} id="passwordForm" className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
                  Kata Sandi Saat Ini
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171F3F] mb-1.5">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F5F6FA] border border-[#CED2E3] rounded-xl focus:bg-white focus:outline-none focus:border-[#283776] transition-colors"
                />
              </div>
            </form>
          </div>

          <div className="pt-6 mt-4 border-t border-[#CED2E3]/60">
            <button
              type="submit"
              form="passwordForm"
              disabled={isSavingPassword}
              className="w-full py-2.5 bg-[#283776] hover:bg-[#171F3F] text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isSavingPassword ? 'Memperbarui Kata Sandi...' : 'Perbarui Kata Sandi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
