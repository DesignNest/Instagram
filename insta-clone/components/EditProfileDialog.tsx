'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const EditProfileDialog = ({ user, onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    profilePhoto: '',
    description: '',
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    username: '',
    profilePhoto: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        username: user.username || '',
        profilePhoto: user.profilePhoto || '',
        description: user.description || '',
      });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [user, onClose]);

  const handleClickOutside = (e: MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        profilePhoto: reader.result as string,
      }));
      setErrors((prev) => ({ ...prev, profilePhoto: '' }));
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!formData.username.trim()) newErrors.username = 'Username is required.';
    if (!formData.email.trim()) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format.';

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/authenticate/updateProfile', {
        ...formData,
        oldEmail: user.email,
      });

      onSave(formData);
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div
        ref={dialogRef}
        className="w-full max-w-xl bg-white rounded-lg shadow-xl border border-gray-300 p-6 overflow-y-auto max-h-[90vh]"
      >
        <form className="space-y-5">
          {/* Profile Image and Username Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            {/* Profile Image */}
            <div className="w-16 h-16 relative">
              <Image
                src={formData.profilePhoto || '/images/default-profile.png'}
                alt="Profile"
                fill
                className="rounded-full object-cover border border-gray-300"
              />
            </div>
  
            {/* Username and Change Photo */}
            <div className="flex flex-col lg:ml-7">
              <p className="text-sm  font-medium text-gray-800">
                {formData.username || 'username'}
              </p>
              <label className="text-blue-600 text-sm cursor-pointer">
                <span className="hover:underline">Change profile photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
  
          {/* Full Name */}
          <div className="flex flex-col sm:flex-row sm:items-start">
            <label className="sm:w-28 text-sm font-medium text-gray-700 mb-1 sm:mb-0">
              Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
              className={`flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-0 ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
  
          {/* Username */}
          <div className="flex flex-col sm:flex-row sm:items-start">
            <label className="sm:w-28 text-sm font-medium text-gray-700 mb-1 sm:mb-0">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              className={`flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-0 ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
  
          {/* Bio */}
          <div className="flex flex-col sm:flex-row sm:items-start">
            <label className="sm:w-28 text-sm font-medium text-gray-700 mb-1 sm:mb-0">
              Bio
            </label>
            <div className="flex-1">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                rows={3}
                maxLength={150}
                className={`w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-0 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.description.length} / 150 characters
              </div>
            </div>
          </div>
  
          {/* Email */}
          <div className="flex flex-col sm:flex-row sm:items-start">
            <label className="sm:w-28 text-sm font-medium text-gray-700 mb-1 sm:mb-0">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className={`flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-0 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
  
          {/* Suggestions Checkbox */}
         
  
          {/* Submit Button */}
          <div className="flex justify-start sm:ml-28 mt-4">
            <button
              onClick={handleSubmit}
              type="button"
              disabled={loading}
              className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white text-sm px-6 py-2 rounded-md flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
};

export default EditProfileDialog;
