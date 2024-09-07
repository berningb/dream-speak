import React from 'react';
import Layout from '../components/Layout';
import useDreams from '../hooks/useDreams';

function MyDreams() {
  const { dreams, loading, error } = useDreams();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  console.log('dreams', dreams);

  return (
    <Layout>
      <div>
        <h1>My Dreams</h1>
        {dreams.length === 0 ? (
          <div>No dreams found</div>
        ) : (
          <ul>
            {dreams.map((dream) => (
              <li key={dream.id}>
                <h2>{dream.title}</h2>
                <p>{dream.description}</p>
                <p>{new Date(dream.date).toLocaleDateString()}</p>
                {dream.image && <img src={dream.image} alt={dream.title} />}
                <p>Tags: {dream.tags.join(', ')}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}

export default MyDreams;