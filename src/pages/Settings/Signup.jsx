import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useBackendUser } from '../../hooks/useUsers.jsx';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getApiUrl } from '../../utils';

export default function Signup() {
  const { getIdTokenClaims } = useAuth0();
  const { backendUser, refreshBackendUser } = useBackendUser();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    picture: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (backendUser) {
      setForm({
        firstName: backendUser.firstName || '',
        lastName: backendUser.lastName || '',
        picture: backendUser.picture || ''
      });
    }
  }, [backendUser]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = await getIdTokenClaims();
      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.__raw}`
        },
        body: JSON.stringify({
          query: `
            mutation UpdateUser($firstName: String, $lastName: String, $picture: String) {
              updateUser(firstName: $firstName, lastName: $lastName, picture: $picture) {
                id
                firstName
                lastName
                picture
                email
              }
            }
          `,
          variables: form
        })
      });
      const data = await response.json();
      if (data.errors) throw new Error(data.errors[0].message);
      await refreshBackendUser();
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className='flex flex-col items-center justify-start h-screen'>
        <h1 className='text-4xl font-bold text-center py-6'>Complete Your Profile</h1>
        <form className='max-w-lg w-full space-y-6' onSubmit={handleSubmit}>
          <div>
            <label className='label'>First Name</label>
            <input type='text' className='input input-bordered w-full' value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} required />
          </div>
          <div>
            <label className='label'>Last Name</label>
            <input type='text' className='input input-bordered w-full' value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} required />
          </div>
          <div>
            <label className='label'>Profile Picture URL</label>
            <input type='url' className='input input-bordered w-full' value={form.picture} onChange={e => handleChange('picture', e.target.value)} placeholder='https://example.com/image.jpg' />
          </div>
          {error && <div className='alert alert-error'>{error}</div>}
          <button type='submit' className='btn btn-primary w-full' disabled={loading}>{loading ? 'Saving...' : 'Save & Continue'}</button>
        </form>
      </div>
    </Layout>
  );
} 