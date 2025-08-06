import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { getMyDreams } from '../../services/firebaseService';
import Layout from '../../components/Layout';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

// Custom colors for charts
const MOOD_COLORS = {
  happy: '#10B981',
  peaceful: '#3B82F6', 
  excited: '#F59E0B',
  confused: '#8B5CF6',
  scared: '#EF4444',
  sad: '#6B7280',
  anxious: '#F97316',
  neutral: '#6B7280'
};



export default function Analytics() {
  const { user, isAuthenticated } = useFirebaseAuth();
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDreams = async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userDreams = await getMyDreams();
      console.log('🔄 Fetched dreams for analytics:', userDreams.length);
      setDreams(userDreams);
    } catch (error) {
      console.error('Error fetching dreams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDreams();
  }, [isAuthenticated, user]);

  // Calculate analytics
  const totalDreams = dreams.length;
  const publicDreams = dreams.filter(dream => dream.isPublic).length;
  const privateDreams = totalDreams - publicDreams;
  
  // Mood analysis
  const moodCounts = dreams.reduce((acc, dream) => {
    if (dream.mood) {
      acc[dream.mood] = (acc[dream.mood] || 0) + 1;
    }
    return acc;
  }, {});

  // Convert mood data for pie chart
  const moodChartData = Object.entries(moodCounts).map(([mood, count]) => ({
    name: mood.charAt(0).toUpperCase() + mood.slice(1),
    value: count,
    color: MOOD_COLORS[mood] || '#6B7280'
  }));

  // Privacy distribution for pie chart
  const privacyData = [
    { name: 'Public', value: publicDreams, color: '#10B981' },
    { name: 'Private', value: privateDreams, color: '#EF4444' }
  ].filter(item => item.value > 0);

  // Tag analysis
  const tagCounts = dreams.reduce((acc, dream) => {
    if (dream.tags) {
      dream.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
    }
    return acc;
  }, {});

  // Convert tag data for bar chart (top 10)
  const tagChartData = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({
      tag: tag.length > 10 ? tag.substring(0, 10) + '...' : tag,
      count
    }));

  // Dream frequency over time (last 30 days)
  const getDreamFrequencyData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const dreamsByDate = dreams.reduce((acc, dream) => {
      if (dream.createdAt) {
        try {
          let dreamDate;
          // Handle both Firestore timestamp and ISO string formats
          if (typeof dream.createdAt === 'string') {
            dreamDate = new Date(dream.createdAt).toISOString().split('T')[0];
          } else if (dream.createdAt.seconds) {
            dreamDate = new Date(dream.createdAt.seconds * 1000).toISOString().split('T')[0];
          } else {
            return acc;
          }
          acc[dreamDate] = (acc[dreamDate] || 0) + 1;
        } catch (error) {
          console.warn('Invalid date in dream:', dream.id, error);
        }
      }
      return acc;
    }, {});

    // Debug logging
    console.log('📊 Analytics Debug:');
    console.log('Total dreams loaded:', dreams.length);
    console.log('Dreams by date:', dreamsByDate);
    console.log('Date range:', last30Days[0], 'to', last30Days[last30Days.length - 1]);

    const chartData = last30Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dreams: dreamsByDate[date] || 0
    }));

    console.log('Chart data:', chartData);
    return chartData;
  };

  const frequencyData = getDreamFrequencyData();

  // Average dream length
  const avgDreamLength = dreams.length > 0 
    ? Math.round(dreams.reduce((acc, dream) => acc + (dream.content?.length || 0), 0) / dreams.length)
    : 0;

  // Dreams per week
  const dreamsThisWeek = dreams.filter(dream => {
    if (!dream.createdAt) return false;
    try {
      // Handle both Firestore timestamp and ISO string formats
      let dreamDate;
      if (typeof dream.createdAt === 'string') {
        dreamDate = new Date(dream.createdAt);
      } else if (dream.createdAt.seconds) {
        dreamDate = new Date(dream.createdAt.seconds * 1000);
      } else {
        return false;
      }
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return dreamDate >= weekAgo;
    } catch (error) {
      console.warn('Invalid date in dream for weekly filter:', dream.id, error);
      return false;
    }
  }).length;

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view analytics</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dream Analytics</h1>
        </div>
        
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Total Dreams</div>
            <div className="stat-value text-primary">{totalDreams}</div>
            <div className="stat-desc">All time</div>
          </div>
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">This Week</div>
            <div className="stat-value text-secondary">{dreamsThisWeek}</div>
            <div className="stat-desc">Last 7 days</div>
          </div>
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Avg Length</div>
            <div className="stat-value text-accent">{avgDreamLength}</div>
            <div className="stat-desc">Characters</div>
          </div>
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Dream Rate</div>
            <div className="stat-value text-info">{(dreamsThisWeek / 7).toFixed(1)}</div>
            <div className="stat-desc">Per day</div>
          </div>
        </div>

        {totalDreams === 0 && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">No dreams yet!</h2>
            <p className="text-gray-600 mb-6">Start logging your dreams to see beautiful analytics and insights.</p>
            <a href="/my-dreams" className="btn btn-primary">Start Dreaming</a>
          </div>
        )}

        {totalDreams > 0 && (
          <>
            {/* Dream Frequency Chart */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Dream Frequency (Last 30 Days)</h2>
              <div className="bg-base-200 p-6 rounded-lg">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={frequencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="dreams" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              
              {/* Mood Distribution */}
              {moodChartData.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Mood Distribution</h2>
                  <div className="bg-base-200 p-6 rounded-lg">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={moodChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {moodChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Privacy Distribution */}
              {privacyData.length > 1 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Privacy Settings</h2>
                  <div className="bg-base-200 p-6 rounded-lg">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={privacyData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {privacyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Popular Tags Chart */}
            {tagChartData.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Most Popular Tags</h2>
                <div className="bg-base-200 p-6 rounded-lg">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={tagChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tag" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Mood Analysis Table */}
              {Object.keys(moodCounts).length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Mood Breakdown</h2>
                  <div className="bg-base-200 rounded-lg overflow-hidden">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>Mood</th>
                          <th>Count</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(moodCounts)
                          .sort(([,a], [,b]) => b - a)
                          .map(([mood, count]) => (
                            <tr key={mood}>
                              <td className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: MOOD_COLORS[mood] || '#6B7280' }}
                                ></div>
                                {mood.charAt(0).toUpperCase() + mood.slice(1)}
                              </td>
                              <td>{count}</td>
                              <td>{((count / totalDreams) * 100).toFixed(1)}%</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tag Cloud */}
              {Object.keys(tagCounts).length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Tag Cloud</h2>
                  <div className="bg-base-200 p-6 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(tagCounts)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 20)
                        .map(([tag, count]) => (
                          <div 
                            key={tag} 
                            className="badge badge-primary gap-2"
                            style={{ 
                              fontSize: `${Math.min(1.2, 0.8 + (count / Math.max(...Object.values(tagCounts))) * 0.4)}rem`
                            }}
                          >
                            {tag} <span className="badge badge-ghost badge-sm">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
} 