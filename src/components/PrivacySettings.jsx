import { useState, useEffect } from 'react';
import { getUserPrivacySettings, updatePrivacySettings } from '../services/firebaseService';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';

export default function PrivacySettings({ onClose }) {
  const { user } = useFirebaseAuth();
  const [settings, setSettings] = useState({
    profileVisibility: 'public',
    dreamVisibility: 'public',
    allowComments: 'everyone',
    allowLikes: 'everyone',
    allowFavorites: 'everyone',
    showInSearch: true,
    anonymousMode: false,
    showJoinDate: true,
    showDreamCount: true,
    allowDirectMessages: 'everyone'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const privacySettings = await getUserPrivacySettings();
        setSettings(privacySettings);
      } catch (err) {
        console.error('Error loading privacy settings:', err);
        setError('Failed to load privacy settings');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadSettings();
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await updatePrivacySettings(settings);
      onClose?.();
    } catch (err) {
      console.error('Error saving privacy settings:', err);
      setError('Failed to save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-base-100 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto">
          <div className="flex justify-center items-center h-32">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Privacy Settings</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Visibility */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Profile Visibility</h3>
            <p className="text-sm text-base-content/70">Control who can see your profile information</p>
            <select 
              className="select select-bordered w-full"
              value={settings.profileVisibility}
              onChange={(e) => handleChange('profileVisibility', e.target.value)}
            >
              <option value="public">Public - Anyone can see my profile</option>
              <option value="friends">Friends Only - Only friends can see my profile</option>
              <option value="private">Private - Only I can see my profile</option>
            </select>
          </div>

          {/* Dream Visibility */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Dream Visibility</h3>
            <p className="text-sm text-base-content/70">Default visibility for your dreams</p>
            <select 
              className="select select-bordered w-full"
              value={settings.dreamVisibility}
              onChange={(e) => handleChange('dreamVisibility', e.target.value)}
            >
              <option value="public">Public - Anyone can see my dreams</option>
              <option value="friends">Friends Only - Only friends can see my dreams</option>
              <option value="private">Private - Only I can see my dreams</option>
            </select>
          </div>

          {/* Anonymous Mode */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Anonymous Mode</h3>
            <p className="text-sm text-base-content/70">Hide your identity when viewing or interacting with dreams</p>
            <label className="cursor-pointer label">
              <span className="label-text">Enable anonymous mode</span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary"
                checked={settings.anonymousMode}
                onChange={(e) => handleChange('anonymousMode', e.target.checked)}
              />
            </label>
          </div>

          {/* Interaction Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Interaction Permissions</h3>
            
            {/* Comments */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Who can comment on my dreams?</label>
              <select 
                className="select select-bordered w-full"
                value={settings.allowComments}
                onChange={(e) => handleChange('allowComments', e.target.value)}
              >
                <option value="everyone">Everyone</option>
                <option value="friends">Friends Only</option>
                <option value="none">No One</option>
              </select>
            </div>

            {/* Likes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Who can like my dreams?</label>
              <select 
                className="select select-bordered w-full"
                value={settings.allowLikes}
                onChange={(e) => handleChange('allowLikes', e.target.value)}
              >
                <option value="everyone">Everyone</option>
                <option value="friends">Friends Only</option>
                <option value="none">No One</option>
              </select>
            </div>

            {/* Favorites */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Who can favorite my dreams?</label>
              <select 
                className="select select-bordered w-full"
                value={settings.allowFavorites}
                onChange={(e) => handleChange('allowFavorites', e.target.value)}
              >
                <option value="everyone">Everyone</option>
                <option value="friends">Friends Only</option>
                <option value="none">No One</option>
              </select>
            </div>

            {/* Direct Messages */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Who can send me direct messages?</label>
              <select 
                className="select select-bordered w-full"
                value={settings.allowDirectMessages}
                onChange={(e) => handleChange('allowDirectMessages', e.target.value)}
              >
                <option value="everyone">Everyone</option>
                <option value="friends">Friends Only</option>
                <option value="none">No One</option>
              </select>
            </div>
          </div>

          {/* Profile Information Display */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Profile Information Display</h3>
            
            <label className="cursor-pointer label">
              <span className="label-text">Show my profile in search results</span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary"
                checked={settings.showInSearch}
                onChange={(e) => handleChange('showInSearch', e.target.checked)}
              />
            </label>

            <label className="cursor-pointer label">
              <span className="label-text">Show when I joined Dream Speak</span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary"
                checked={settings.showJoinDate}
                onChange={(e) => handleChange('showJoinDate', e.target.checked)}
              />
            </label>

            <label className="cursor-pointer label">
              <span className="label-text">Show my dream count on my profile</span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary"
                checked={settings.showDreamCount}
                onChange={(e) => handleChange('showDreamCount', e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-8">
          <button 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <span className="loading loading-spinner loading-sm"></span> : 'Save Settings'}
          </button>
          <button 
            className="btn btn-outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 