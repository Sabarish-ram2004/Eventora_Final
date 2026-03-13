import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiUsers, FiGrid, FiFlag, FiCheck, FiX, FiTrendingUp, FiActivity } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { vendorAPI } from '../services/api'
import toast from 'react-hot-toast'

const CATEGORY_COLORS = ['#FFD700','#6B21A8','#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6']

const MOCK_STATS = {
  totalUsers: 12450, totalVendors: 892, activeBookings: 3241,
  revenue: 85200000, pendingApprovals: 14, flaggedBookings: 3
}

const CATEGORY_DATA = [
  { name: 'Hall', value: 210 }, { name: 'Catering', value: 185 }, { name: 'Decoration', value: 145 },
  { name: 'Photography', value: 132 }, { name: 'DJ/Music', value: 89 }, { name: 'Transport', value: 65 },
  { name: 'Beautician', value: 42 }, { name: 'Tailor', value: 15 }, { name: 'Full Handler', value: 9 }
]

export default function AdminPage() {
  const [pendingVendors, setPendingVendors] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)

  const handleApprove = async (vendorId) => {
    try {
      await vendorAPI.approveVendor(vendorId)
      setPendingVendors(prev => prev.filter(v => v.id !== vendorId))
      toast.success('Vendor approved! 🎉')
    } catch { toast.error('Failed to approve') }
  }

  const handleReject = async (vendorId) => {
    try {
      await vendorAPI.rejectVendor(vendorId, 'Does not meet quality standards')
      setPendingVendors(prev => prev.filter(v => v.id !== vendorId))
      toast.success('Vendor rejected')
    } catch { toast.error('Failed to reject') }
  }

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <HiSparkles className="w-5 h-5 text-brand-gold" />
            <span className="text-brand-gold text-sm font-body">Admin Panel</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white">Platform Administration</h1>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Users', value: MOCK_STATS.totalUsers.toLocaleString(), icon: <FiUsers />, color: 'text-blue-400' },
            { label: 'Total Vendors', value: MOCK_STATS.totalVendors, icon: <FiGrid />, color: 'text-purple-400' },
            { label: 'Active Bookings', value: MOCK_STATS.activeBookings.toLocaleString(), icon: <FiActivity />, color: 'text-green-400' },
            { label: 'Revenue (₹Cr)', value: `${(MOCK_STATS.revenue/10000000).toFixed(1)}Cr`, icon: <FiTrendingUp />, color: 'text-brand-gold' },
            { label: 'Pending Approval', value: MOCK_STATS.pendingApprovals, icon: <FiFlag />, color: 'text-yellow-400' },
            { label: 'Flagged', value: MOCK_STATS.flaggedBookings, icon: <FiFlag />, color: 'text-red-400' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-dark rounded-2xl p-4 border border-white/5">
              <div className={`text-lg mb-1 ${s.color}`}>{s.icon}</div>
              <div className="font-display font-bold text-xl text-white">{s.value}</div>
              <div className="text-gray-500 text-xs font-body">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 glass-dark rounded-2xl w-fit mb-6">
          {['overview','vendor-approval','analytics'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-xl text-sm font-body capitalize whitespace-nowrap transition-all ${
                activeTab === tab ? 'btn-gold' : 'text-gray-400 hover:text-white'
              }`}>{tab.replace('-',' ')}</button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-dark rounded-3xl p-6 border border-white/5">
              <h3 className="font-display font-semibold text-white text-lg mb-4">Vendors by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={CATEGORY_DATA} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({name, value}) => `${name}: ${value}`}
                    labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}>
                    {CATEGORY_DATA.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1E2970', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '12px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-dark rounded-3xl p-6 border border-white/5">
              <h3 className="font-display font-semibold text-white text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { label: 'Review Pending Vendors', count: MOCK_STATS.pendingApprovals, color: 'text-yellow-400', action: () => setActiveTab('vendor-approval') },
                  { label: 'Investigate Flagged Bookings', count: MOCK_STATS.flaggedBookings, color: 'text-red-400', action: () => {} },
                  { label: 'Export Platform Report', count: null, color: 'text-blue-400', action: () => toast.success('Report generation started') },
                ].map(a => (
                  <button key={a.label} onClick={a.action}
                    className="w-full flex items-center justify-between p-4 glass rounded-2xl hover:border-brand-gold/20 transition-all text-left">
                    <span className="text-gray-300 font-body text-sm">{a.label}</span>
                    {a.count != null && <span className={`font-bold font-display ${a.color}`}>{a.count}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vendor-approval' && (
          <div className="space-y-4">
            {pendingVendors.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="font-display text-xl text-white mb-2">All Caught Up!</h3>
                <p className="text-gray-400 font-body">No pending vendor approvals</p>
              </div>
            ) : pendingVendors.map(v => (
              <div key={v.id} className="glass-dark rounded-2xl p-5 border border-white/5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display font-semibold text-white text-lg">{v.businessName}</h4>
                    <p className="text-gray-400 text-sm font-body">{v.category} · {v.city}</p>
                    <p className="text-gray-500 text-xs font-body mt-1">{v.description?.substring(0,100)}...</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(v.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/20 text-green-300 border border-green-500/30 text-sm font-body transition-all hover:bg-green-500/30">
                      <FiCheck className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => handleReject(v.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-sm font-body transition-all hover:bg-red-500/30">
                      <FiX className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="glass-dark rounded-3xl p-6 border border-white/5">
            <h3 className="font-display font-semibold text-white text-xl mb-6">Platform Analytics</h3>
            <p className="text-gray-400 font-body text-sm">Detailed analytics integration available with full backend connection.</p>
          </div>
        )}
      </div>
    </div>
  )
}
