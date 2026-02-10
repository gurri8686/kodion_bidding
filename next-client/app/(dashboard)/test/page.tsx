'use client';

import { useState } from 'react';
import { Home, BarChart3, Trophy, Users, Swords, Award, Gift, Settings, ChevronLeft, Search, Bell, User, MapPin, Calendar, Clock, Target } from 'lucide-react';

export default function Test() {
  const [activeNav, setActiveNav] = useState('Dashboard');

  const navItems = [
    { icon: Home, label: 'Dashboard' },
    { icon: BarChart3, label: 'Feeds' },
    { icon: Trophy, label: 'Leaderboards' },
    { icon: Users, label: 'Courts' },
    { icon: Swords, label: 'Matches' },
  ];

  const quickActions = [
    { icon: MapPin, title: 'Find Nearby Games', subtitle: 'Discover local events', color: 'from-emerald-500 to-teal-500' },
    { icon: Users, title: 'Find Skill Matches', subtitle: 'Improve skill', color: 'from-purple-500 to-pink-500' },
    { icon: Target, title: 'Play Virtually', subtitle: 'Play from home', color: 'from-yellow-500 to-orange-500' },
  ];

  const upcomingEvents = [
    { title: 'Beginner Clinic - Serve & Volley', date: '17/07/2025', icon: '🎾', color: 'from-red-400 to-orange-400' },
    { title: 'Social Mixer Evening', date: '19/07/2025', icon: '⚽', color: 'from-teal-400 to-cyan-400' },
    { title: 'Monthly Club Tournament', date: '21/07/2025', icon: '🎯', color: 'from-green-400 to-emerald-400' },
  ];

  const leaderboard = [
    { name: 'Umang Sarma', rank: '148 PICKLE', badge: 'Ping Pong', img: '1' },
    { name: 'Thages Pahidor', rank: '148 PICKLE', badge: 'Ping Pong', img: '2' },
    { name: 'Umang Sarma', rank: '148 PICKLE', badge: 'Ping Pong', img: '3' },
  ];

  const nearbyCourts = [
    { name: 'Naples Bath & Tennis Club', date: '17/07/2025', img: '🎾' },
    { name: 'Delray Beach Tennis Center', date: '17/07/2025', img: '🏖️' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-purple-5100 to-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <span className="font-bold text-xl">PICKLEZONE</span>
            <ChevronLeft className="w-5 h-5 ml-auto text-gray-400" />
          </div>
        </div>

        <nav className="flex-1 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Navigate</p>
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveNav(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                activeNav === item.label
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}

          <div className="mt-8">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Powerslide</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5">
              <Gift className="w-5 h-5" />
              <span>Rewards</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
            <div className="flex-1">
              <p className="font-medium">John</p>
              <p className="text-xs text-gray-400">Level 2</p>
            </div>
            <Settings className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Good morning, <span className="text-purple-400">John</span></h1>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-400">0 Pickles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-400">0 wins</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-gray-400">Level Beginner</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <button className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10">
                <Bell className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {quickActions.map((action, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">{action.title}</h3>
                <p className="text-sm text-gray-400">{action.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Featured Card - Ping Pong */}
            <div className="col-span-2">
              <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-8 overflow-hidden h-64">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

                <div className="relative z-10">
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm mb-4">
                    Popular
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Ping Pong</h2>
                  <p className="text-white/80 text-sm max-w-md">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vel nisi euismod eros faucibus egestas at lobortis ante.
                  </p>

                  <div className="flex items-center gap-4 mt-6">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full border-2 border-purple-600" />
                      ))}
                    </div>
                    <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      +10 Students
                    </button>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute right-0 bottom-0 w-96 h-96">
                  <div className="absolute bottom-8 right-12 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-2xl opacity-60"></div>
                  <div className="absolute bottom-16 right-24 w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-xl opacity-80"></div>
                </div>
              </div>

              {/* My Stats */}
              <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6">My Stats</h3>
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-emerald-500/20 p-3 rounded-xl">
                        <Trophy className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">250</p>
                        <p className="text-sm text-gray-400">Win Rate</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-500/20 p-3 rounded-xl">
                        <Target className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">80</p>
                        <p className="text-sm text-gray-400">Total Attended</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r="80" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                      <circle cx="96" cy="96" r="80" stroke="url(#statsGradient)" strokeWidth="12" fill="none" strokeDasharray="502" strokeDashoffset="125" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="statsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <div className="w-3 h-3 bg-white rounded-full mb-2"></div>
                      <p className="text-4xl font-bold">100</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Weekly Leaderboard */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold">Weekly Leaderboard</h3>
                    <p className="text-xs text-gray-400">Most Played And Earned Points In Game</p>
                  </div>
                </div>
                {leaderboard.map((player, i) => (
                  <div key={i} className="flex items-center gap-3 mb-4 last:mb-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{player.name}</p>
                      <p className="text-xs text-gray-400">{player.rank}</p>
                    </div>
                    <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full">{player.badge}</span>
                  </div>
                ))}
                <button className="w-full mt-4 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-sm">
                  View Lead boards
                </button>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Upcoming Events</h3>
                  <button className="text-blue-400 text-sm">See more</button>
                </div>
                {upcomingEvents.map((event, i) => (
                  <div key={i} className="flex items-center gap-3 mb-4 last:mb-0">
                    <div className={`w-12 h-12 bg-gradient-to-br ${event.color} rounded-xl flex items-center justify-center text-2xl`}>
                      {event.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-gray-400">{event.date}</p>
                    </div>
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full border-2 border-gray-900" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Nearby Courts */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Nearby Courts</h3>
                  <button className="text-blue-400 text-sm">Find more</button>
                </div>
                {nearbyCourts.map((court, i) => (
                  <div key={i} className="flex items-center gap-3 mb-4 last:mb-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl flex items-center justify-center text-2xl">
                      {court.img}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{court.name}</p>
                      <p className="text-xs text-gray-400">{court.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
