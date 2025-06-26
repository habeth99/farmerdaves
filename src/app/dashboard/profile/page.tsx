'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getUserProfile, updateUserProfile, UserData } from '../../../utils/authService';

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    birthMonth: '',
    birthDay: '',
    birthYear: ''
  });
  
  const router = useRouter();

  // Generate options for dropdowns
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const days = Array.from({ length: 31 }, (_, i) => {
    const day = (i + 1).toString().padStart(2, '0');
    return { value: day, label: day };
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => {
    const year = currentYear - i;
    return { value: year.toString(), label: year.toString() };
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        const user = await getCurrentUser();
        if (!user) {
          router.push('/signin');
          return;
        }

        setCurrentUser(user);

        // Fetch user profile data
        const profile = await getUserProfile(user.uid);
        setUserData(profile);

        // Populate edit form with current data
        if (profile) {
          const birthParts = profile.birthdate ? profile.birthdate.split('-') : ['', '', ''];
          setEditForm({
            fullName: profile.fullName || '',
            email: profile.email || '',
            phoneNumber: formatPhoneNumber(profile.phoneNumber || ''),
            birthYear: birthParts[0] || '',
            birthMonth: birthParts[1] || '',
            birthDay: birthParts[2] || ''
          });
        }
      } catch (error: any) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [router]);

  // Format birthdate for display
  const formatBirthdate = (birthdate?: string) => {
    if (!birthdate) return '';
    const date = new Date(birthdate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format member since date
  const formatMemberSince = (createdAt?: any) => {
    if (!createdAt) return '';
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  // Get initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // If canceling edit, reset form to original data
      if (userData) {
        const birthParts = userData.birthdate ? userData.birthdate.split('-') : ['', '', ''];
        setEditForm({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phoneNumber: formatPhoneNumber(userData.phoneNumber || ''),
          birthYear: birthParts[0] || '',
          birthMonth: birthParts[1] || '',
          birthDay: birthParts[2] || ''
        });
      }
    }
  };

  // Format phone number as (xxx)-xxx-xxxx
  const formatPhoneNumber = (phone: string) => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Don't format if empty
    if (!cleaned) return '';
    
    // Format based on length
    if (cleaned.length <= 3) {
      return `(${cleaned}`;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)})-${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)})-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    if (field === 'phoneNumber') {
      // Format phone number as user types
      const formatted = formatPhoneNumber(value);
      setEditForm(prev => ({
        ...prev,
        [field]: formatted
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle save changes
  const handleSave = async () => {
    if (!currentUser) return;

    try {
      setIsSaving(true);
      setError(''); // Clear any previous errors
      
      // Format birthdate
      const birthdate = editForm.birthYear && editForm.birthMonth && editForm.birthDay
        ? `${editForm.birthYear}-${editForm.birthMonth}-${editForm.birthDay}`
        : undefined;

      // Prepare update data
      const updateData: Partial<UserData> = {
        fullName: editForm.fullName,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber.replace(/\D/g, ''), // Save only digits to database
        birthdate
      };

      // Update in Firestore
      await updateUserProfile(currentUser.uid, updateData);

      // Fetch fresh data from database to ensure we display the latest saved data
      const updatedProfile = await getUserProfile(currentUser.uid);
      setUserData(updatedProfile);

      // Update edit form with the fresh data from database
      if (updatedProfile) {
        const birthParts = updatedProfile.birthdate ? updatedProfile.birthdate.split('-') : ['', '', ''];
        setEditForm({
          fullName: updatedProfile.fullName || '',
          email: updatedProfile.email || '',
          phoneNumber: formatPhoneNumber(updatedProfile.phoneNumber || ''),
          birthYear: birthParts[0] || '',
          birthMonth: birthParts[1] || '',
          birthDay: birthParts[2] || ''
        });
      }
      
      // Exit edit mode
      setIsEditing(false);
      
      console.log('Profile updated successfully and fresh data loaded');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-64"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
              <p className="text-gray-600">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-800">Profile</h1>
          <div className="flex gap-2">
            {isEditing && (
              <button
                onClick={handleEditToggle}
                disabled={isSaving}
                className="px-4 py-2 rounded-md font-medium bg-gray-500 hover:bg-gray-600 text-white transition-colors duration-200 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            )}
            <button
              onClick={isEditing ? handleSave : handleEditToggle}
              disabled={isSaving}
              className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                isEditing
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:cursor-not-allowed`}
            >
              {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
              {getInitials(userData?.fullName)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-800">
                {userData?.fullName || 'User'}
              </h2>
              <p className="text-green-600">Professional Farmer & Bigfoot Enthusiast</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-green-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-green-800 py-2">{userData?.fullName || ''}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                ) : (
                  <p className="text-green-800 py-2">{userData?.email || ''}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                ) : (
                  <p className="text-green-800 py-2">{formatPhoneNumber(userData?.phoneNumber || '')}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Birthday</label>
                {isEditing ? (
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={editForm.birthMonth}
                      onChange={(e) => handleInputChange('birthMonth', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Month</option>
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editForm.birthDay}
                      onChange={(e) => handleInputChange('birthDay', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Day</option>
                      {days.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editForm.birthYear}
                      onChange={(e) => handleInputChange('birthYear', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Year</option>
                      {years.map((year) => (
                        <option key={year.value} value={year.value}>
                          {year.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-green-800 py-2">{formatBirthdate(userData?.birthdate)}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-green-700 mb-1">Member Since</label>
                <p className="text-green-800 py-2">{formatMemberSince(userData?.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 