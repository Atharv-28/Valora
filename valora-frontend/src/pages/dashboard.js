import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../services/userApi';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './dashboard.css';

const Dashboard = () => {
  const { currentUser, getIdToken, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [currentUser, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch interviews and analytics
      const [interviewsData, analyticsData] = await Promise.all([
        userApi.getInterviews(getIdToken),
        userApi.getAnalytics(getIdToken)
      ]);

      setInterviews(interviewsData.interviews || []);
      setAnalytics(analyticsData.analytics || null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // If it's an index building error, show a more helpful message
      if (err.message && err.message.includes('index')) {
        setError('Dashboard is initializing... Please wait 1-2 minutes and refresh the page.');
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleViewInterview = (interviewId) => {
    navigate(`/interview-report/${interviewId}`);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchData}>Retry</button>
      </div>
    );
  }

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Prepare data for charts
  const typeData = analytics?.scoresByType ? 
    Object.entries(analytics.scoresByType).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: parseFloat(Number(value).toFixed(1))
    })) : [];

  const difficultyData = analytics?.scoresByDifficulty ?
    Object.entries(analytics.scoresByDifficulty).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: parseFloat(Number(value).toFixed(1))
    })) : [];

  const trendData = analytics?.recentTrend || [];

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>📊 Your Dashboard</h1>
          <p className="welcome-text">Welcome back, {currentUser?.email}</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate('/start-interview')}>
            Start New Interview
          </button>
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Show empty state message if no interviews */}
      {interviews.length === 0 && !analytics && (
        <div className="empty-state">
          <h2>👋 Welcome to Valora!</h2>
          <p>You haven't completed any interviews yet.</p>
          <p>Start your first interview to see your progress and analytics here.</p>
          <button className="btn-primary" onClick={() => navigate('/start-interview')}>
            Start Your First Interview
          </button>
        </div>
      )}

      {/* Analytics Summary Cards */}
      {analytics && analytics.totalInterviews > 0 && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>Total Interviews</h3>
              <p className="stat-value">{analytics.totalInterviews}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>Average Score</h3>
              <p className="stat-value">{Number(analytics.averageScore || 0).toFixed(1)}/10</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💪</div>
            <div className="stat-content">
              <h3>Top Skills</h3>
              <p className="stat-list">
                {analytics.topSkills?.slice(0, 3).join(', ') || 'No data yet'}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>Recent Trend</h3>
              <p className="stat-value">
                {trendData.length > 1 ? 
                  (trendData[trendData.length - 1].score > trendData[0].score ? '↑ Improving' : '↓ Declining') 
                  : 'Not enough data'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {analytics && analytics.totalInterviews > 0 && (
        <div className="charts-section">
          {/* Score Trend Line Chart */}
          {trendData.length > 0 && (
            <div className="chart-card">
              <h2>Score Trend (Recent 10 Interviews)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#0088FE" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="charts-row">
            {/* Scores by Interview Type */}
            {typeData.length > 0 && (
              <div className="chart-card half-width">
                <h2>Average Scores by Type</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Scores by Difficulty */}
            {difficultyData.length > 0 && (
              <div className="chart-card half-width">
                <h2>Average Scores by Difficulty</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={difficultyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Skills Analysis */}
          <div className="skills-section">
            <div className="skills-card">
              <h2>💪 Top Strengths</h2>
              <ul>
                {analytics.topSkills?.slice(0, 5).map((skill, idx) => (
                  <li key={idx}>{skill}</li>
                )) || <li>Complete more interviews to see your strengths</li>}
              </ul>
            </div>
            <div className="skills-card">
              <h2>📚 Areas to Improve</h2>
              <ul>
                {analytics.areasToImprove?.slice(0, 5).map((area, idx) => (
                  <li key={idx}>{area}</li>
                )) || <li>Complete more interviews for personalized feedback</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Recent Interviews Table */}
      <div className="interviews-section">
        <h2>📝 Recent Interviews</h2>
        {interviews.length > 0 ? (
          <div className="interviews-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Position</th>
                  <th>Type</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {interviews.map((interview) => (
                  <tr key={interview.id}>
                    <td>{new Date(interview.createdAt).toLocaleDateString()}</td>
                    <td>{interview.jobPosition}</td>
                    <td className="capitalize">{interview.interviewType}</td>
                    <td className="capitalize">{interview.difficulty}</td>
                    <td>
                      <span className={`score-badge ${interview.report?.overallScore >= 7 ? 'good' : interview.report?.overallScore >= 5 ? 'medium' : 'low'}`}>
                        {interview.report?.overallScore}/10
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-view" 
                        onClick={() => handleViewInterview(interview.id)}
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No interviews yet. Start your first interview to see your progress!</p>
            <button className="btn-primary" onClick={() => navigate('/start-interview')}>
              Start Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
