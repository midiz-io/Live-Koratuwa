import React from 'react';
import { Users, Eye, Globe, TrendingUp } from 'lucide-react';

const DashboardCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Sessions',
      value: stats?.totalSessions || 0,
      icon: Users,
      color: 'blue',
      description: 'Unique visitors'
    },
    {
      title: 'Total Views',
      value: stats?.totalViews || 0,
      icon: Eye,
      color: 'green',
      description: 'Box views recorded'
    },
    {
      title: 'Languages Used',
      value: stats?.topLanguages?.length || 0,
      icon: Globe,
      color: 'purple',
      description: 'Different languages'
    },
    {
      title: 'Avg Views/Session',
      value: stats?.totalSessions > 0 ? Math.round(stats.totalViews / stats.totalSessions) : 0,
      icon: TrendingUp,
      color: 'orange',
      description: 'Engagement rate'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-lg ${getColorClasses(card.color)}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCards;
