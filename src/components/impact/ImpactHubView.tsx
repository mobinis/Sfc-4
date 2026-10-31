import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ImpactDeedRecord,
  RelationshipContact,
  ContactChannel
} from '../../types';
import {
  Heart,
  Plus,
  Users,
  Calendar,
  Sparkles,
  Star,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Phone,
  MessageSquare,
  Coffee,
  Mail,
  Send,
  Compass,
  Search,
  Filter,
  Check
} from 'lucide-react';
import { soundManager } from '../../utils/soundHaptics';
import { DateUtils } from '../../utils/dateUtils';
import { ImpactDeedModal } from './ImpactDeedModal';
import { RelationshipContactModal } from './RelationshipContactModal';

export const ImpactHubView: React.FC = () => {
  const {
    state,
    deleteImpactDeed,
    deleteRelationshipContact,
    logRelationshipCheckIn,
    showToast
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'relationships' | 'deeds'>('relationships');
  const [isDeedModalOpen, setIsDeedModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<RelationshipContact | null>(null);

  // Quick reachout modal/state
  const [quickDeedContactId, setQuickDeedContactId] = useState<string | undefined>(undefined);

  // Filters
  const [contactFilter, setContactFilter] = useState<'all' | 'overdue' | 'favorites' | 'family' | 'friends'>('all');
  const [deedCategoryFilter, setDeedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const today = DateUtils.todayStr();

  // Metrics Calculations
  const deeds = state.impactDeeds || [];
  const contacts = state.relationshipContacts || [];

  const todayDeeds = deeds.filter(d => d.date === today);
  const totalDeedsCount = deeds.length;

  // Altruism Score: deeds count * 10 + sum of ratings * 5 + total check-ins * 3
  const totalRatingsSum = deeds.reduce((sum, d) => sum + (d.impactRating || 3), 0);
  const totalCheckInsSum = contacts.reduce((sum, c) => sum + (c.totalCheckIns || 0), 0);
  const altruismScore = totalDeedsCount * 10 + totalRatingsSum * 5 + totalCheckInsSum * 3;

  // Overdue contacts
  const overdueContacts = contacts.filter(c => {
    const daysSince = DateUtils.daysBetween(c.lastCheckInDate, today);
    return daysSince > c.targetCadenceDays;
  });

  // Streaks: consecutive days with at least 1 deed or touchpoint
  const uniqueActionDates = Array.from(new Set(deeds.map(d => d.date))).sort();
  let currentStreak = 0;
  let checkDate = today;
  if (!uniqueActionDates.includes(today)) {
    checkDate = DateUtils.daysAgoStr(1);
  }
  let checkIdx = 0;
  while (true) {
    const dStr = DateUtils.daysAgoStr(checkIdx + (checkDate === today ? 0 : 1));
    if (uniqueActionDates.includes(dStr)) {
      currentStreak++;
      checkIdx++;
    } else {
      break;
    }
  }

  // Filtered Contacts
  const filteredContacts = contacts.filter(c => {
    const daysSince = DateUtils.daysBetween(c.lastCheckInDate, today);
    const isOverdue = daysSince > c.targetCadenceDays;

    if (contactFilter === 'overdue' && !isOverdue) return false;
    if (contactFilter === 'favorites' && !c.isFavorite) return false;
    if (contactFilter === 'family' && c.relationshipType !== 'family') return false;
    if (contactFilter === 'friends' && c.relationshipType !== 'friend') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q)) ||
        c.relationshipType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Deeds
  const filteredDeeds = deeds.filter(d => {
    if (deedCategoryFilter !== 'all' && d.category !== deedCategoryFilter) return false;
    if (searchQuery.trim() && activeSubTab === 'deeds') {
      const q = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        (d.recipientName && d.recipientName.toLowerCase().includes(q)) ||
        (d.notes && d.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenAddContact = () => {
    soundManager.playChime('click');
    setEditingContact(null);
    setIsContactModalOpen(true);
  };

  const handleOpenEditContact = (c: RelationshipContact) => {
    soundManager.playChime('click');
    setEditingContact(c);
    setIsContactModalOpen(true);
  };

  const handleOpenLogDeedForContact = (c: RelationshipContact) => {
    soundManager.playChime('click');
    setQuickDeedContactId(c.id);
    setIsDeedModalOpen(true);
  };

  const handleQuickCheckIn = (c: RelationshipContact, channel?: ContactChannel) => {
    logRelationshipCheckIn(c.id, undefined, channel || c.preferredChannel);
  };

  const getChannelIcon = (ch?: ContactChannel) => {
    switch (ch) {
      case 'call': return <Phone className="w-3.5 h-3.5" />;
      case 'text': return <MessageSquare className="w-3.5 h-3.5" />;
      case 'coffee': return <Coffee className="w-3.5 h-3.5" />;
      case 'letter': return <Mail className="w-3.5 h-3.5" />;
      case 'in_person': return <Users className="w-3.5 h-3.5" />;
      default: return <Phone className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'kindness_other': return { label: 'Others', icon: '🤝', color: '#68D391' };
      case 'kindness_self': return { label: 'Self', icon: '🌱', color: '#38BDF8' };
      case 'gratitude_expression': return { label: 'Gratitude', icon: '💌', color: '#E5A93C' };
      case 'mentorship_help': return { label: 'Mentorship', icon: '🧭', color: '#A78BFA' };
      case 'community_service': return { label: 'Community', icon: '🌍', color: '#34D399' };
      default: return { label: 'Deed', icon: '✨', color: '#859A90' };
    }
  };

  const kindnessTarget = state.measurableTargets.find(t => t.id === 'target_kindness' || t.category === 'impact');

  return (
    <div className="flex flex-col gap-4">
      {/* 1. TOP KPI DASHBOARD TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Total Deeds */}
        <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] flex flex-col justify-between light:bg-white light:border-[#E5E3DA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Deeds Logged
            </span>
            <span className="text-sm">🌱</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-[#F4F7F4] light:text-[#1C221E] font-mono">
              {totalDeedsCount}
            </span>
            <span className="text-[10px] text-[#68D391] font-bold">
              ({todayDeeds.length} today)
            </span>
          </div>
        </div>

        {/* Altruism Karma */}
        <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] flex flex-col justify-between light:bg-white light:border-[#E5E3DA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Altruism Karma
            </span>
            <span className="text-sm">✨</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-[#E5A93C] font-mono">
              {altruismScore}
            </span>
            <span className="text-[10px] text-[#859A90] light:text-[#5C655E]">pts</span>
          </div>
        </div>

        {/* Cadence Status */}
        <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] flex flex-col justify-between light:bg-white light:border-[#E5E3DA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Cadence Status
            </span>
            <span className="text-sm">{overdueContacts.length > 0 ? '⚠️' : '✅'}</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-xl font-black font-mono ${overdueContacts.length > 0 ? 'text-[#E5A93C]' : 'text-[#68D391]'}`}>
              {overdueContacts.length > 0 ? `${overdueContacts.length} Due` : 'All Clean'}
            </span>
            <span className="text-[10px] text-[#859A90] light:text-[#5C655E]">
              ({contacts.length} total)
            </span>
          </div>
        </div>

        {/* Impact Streak */}
        <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] flex flex-col justify-between light:bg-white light:border-[#E5E3DA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#859A90] uppercase tracking-wider light:text-[#5C655E]">
              Impact Streak
            </span>
            <span className="text-sm">🔥</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-[#68D391] font-mono">
              {currentStreak}d
            </span>
            <span className="text-[10px] text-[#859A90] light:text-[#5C655E]">active</span>
          </div>
        </div>
      </div>

      {/* 2. OVERDUE TOUCHPOINT ALERT BANNER (If any) */}
      {overdueContacts.length > 0 && (
        <div className="p-4 rounded-3xl bg-[#E5A93C]/10 border border-[#E5A93C]/40 text-[#F4F7F4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 light:bg-[#FEF3C7] light:border-[#F59E0B]/50 light:text-[#1C221E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E5A93C]/20 text-[#E5A93C] flex items-center justify-center shrink-0 text-xl light:bg-[#FDE68A]">
              💌
            </div>
            <div>
              <h4 className="text-xs font-black">
                {overdueContacts.length} Touchpoint{overdueContacts.length > 1 ? 's' : ''} Due to Connect
              </h4>
              <p className="text-[11px] text-[#859A90] light:text-[#5C655E] mt-0.5">
                {overdueContacts.map(c => `${c.name} (${DateUtils.daysBetween(c.lastCheckInDate, today)}d ago)`).join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => handleQuickCheckIn(overdueContacts[0])}
              className="px-3.5 py-1.5 rounded-xl bg-[#E5A93C] hover:bg-[#D95D39] text-[#121413] text-xs font-black shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
            >
              {getChannelIcon(overdueContacts[0].preferredChannel)}
              <span>Quick Check-In with {overdueContacts[0].name.split(' ')[0]}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. PROGRESSION TARGET CARD FOR KINDNESS (if exists) */}
      {kindnessTarget && (
        <div className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] flex flex-col gap-2.5 light:bg-white light:border-[#E5E3DA] shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{kindnessTarget.icon || '🌱'}</span>
              <div>
                <h4 className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E]">
                  {kindnessTarget.title}
                </h4>
                <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
                  {kindnessTarget.description}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-black font-mono text-[#68D391]">
                {kindnessTarget.currentProgress} / {kindnessTarget.targetValue} {kindnessTarget.unit}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-[#121413] light:bg-[#E5E3DA] overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-[#3D7D62] to-[#68D391] transition-all duration-500 rounded-full"
              style={{
                width: `${Math.min(100, (kindnessTarget.currentProgress / (kindnessTarget.targetValue || 1)) * 100)}%`
              }}
            />
          </div>
        </div>
      )}

      {/* 4. ACTIONS & VIEW TOGGLE BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Sub-view switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-[#121413] border border-[#384A41] light:bg-[#FAF9F5] light:border-[#E5E3DA]">
          <button
            onClick={() => {
              soundManager.playChime('click');
              setActiveSubTab('relationships');
            }}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'relationships'
                ? 'bg-[#3D7D62] text-white shadow-xs'
                : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Relationship Circle ({contacts.length})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playChime('click');
              setActiveSubTab('deeds');
            }}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'deeds'
                ? 'bg-[#3D7D62] text-white shadow-xs'
                : 'text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-[#E5A93C]" />
            <span>Impact Ledger ({deeds.length})</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {activeSubTab === 'relationships' ? (
            <button
              onClick={handleOpenAddContact}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-white text-xs font-black shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Contact</span>
            </button>
          ) : (
            <button
              onClick={() => {
                soundManager.playChime('click');
                setQuickDeedContactId(undefined);
                setIsDeedModalOpen(true);
              }}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-white text-xs font-black shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Action</span>
            </button>
          )}

          {/* Quick Record Action button always accessible */}
          {activeSubTab === 'relationships' && (
            <button
              onClick={() => {
                soundManager.playChime('click');
                setQuickDeedContactId(undefined);
                setIsDeedModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-[#1B211E] border border-[#384A41] hover:border-[#3D7D62] text-[#68D391] text-xs font-bold transition-all light:bg-white light:border-[#E5E3DA] flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span className="hidden sm:inline">Record Deed</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. FILTER CHIPS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        {/* Filters */}
        {activeSubTab === 'relationships' ? (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Contacts' },
              { id: 'overdue', label: '⚠️ Overdue' },
              { id: 'favorites', label: '⭐ Pinned' },
              { id: 'family', label: '🏡 Family' },
              { id: 'friends', label: '✨ Friends' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  soundManager.playChime('click');
                  setContactFilter(f.id as any);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-medium border shrink-0 transition-all ${
                  contactFilter === f.id
                    ? 'bg-[#242D29] border-[#68D391] text-[#68D391] font-bold light:bg-[#F2F1EC]'
                    : 'bg-[#1B211E] border-[#384A41]/60 text-[#859A90] hover:text-[#F4F7F4] light:bg-white light:border-[#E5E3DA] light:text-[#5C655E]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Deeds' },
              { id: 'kindness_other', label: '🤝 Others' },
              { id: 'gratitude_expression', label: '💌 Gratitude' },
              { id: 'mentorship_help', label: '🧭 Mentorship' },
              { id: 'community_service', label: '🌍 Community' },
              { id: 'kindness_self', label: '🌱 Self' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  soundManager.playChime('click');
                  setDeedCategoryFilter(cat.id);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-medium border shrink-0 transition-all ${
                  deedCategoryFilter === cat.id
                    ? 'bg-[#242D29] border-[#68D391] text-[#68D391] font-bold light:bg-[#F2F1EC]'
                    : 'bg-[#1B211E] border-[#384A41]/60 text-[#859A90] hover:text-[#F4F7F4] light:bg-white light:border-[#E5E3DA] light:text-[#5C655E]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-[#859A90] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={activeSubTab === 'relationships' ? 'Search contacts...' : 'Search deeds...'}
            className="w-full h-8 pl-8 pr-3 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs text-[#F4F7F4] placeholder-[#859A90] focus:border-[#3D7D62] focus:outline-hidden light:bg-white light:border-[#E5E3DA] light:text-[#1C221E]"
          />
        </div>
      </div>

      {/* 6. MAIN CONTENT: RELATIONSHIP CIRCLE OR IMPACT DEEDS */}
      {activeSubTab === 'relationships' ? (
        filteredContacts.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#1B211E] border border-[#384A41] text-center flex flex-col items-center gap-2 light:bg-white light:border-[#E5E3DA]">
            <span className="text-3xl">🤝</span>
            <h4 className="text-sm font-bold text-[#F4F7F4] light:text-[#1C221E]">
              No contacts matching filter
            </h4>
            <p className="text-xs text-[#859A90] max-w-sm light:text-[#5C655E]">
              Add friends, family, mentors, or colleagues to keep meaningful relationships warm.
            </p>
            <button
              onClick={handleOpenAddContact}
              className="mt-2 px-4 py-2 rounded-xl bg-[#3D7D62] text-white text-xs font-black shadow-xs"
            >
              + Add First Contact
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredContacts.map(contact => {
              const daysSince = DateUtils.daysBetween(contact.lastCheckInDate, today);
              const isOverdue = daysSince > contact.targetCadenceDays;
              const daysRemaining = contact.targetCadenceDays - daysSince;

              return (
                <div
                  key={contact.id}
                  className={`p-4 rounded-3xl bg-[#1B211E] border flex flex-col justify-between gap-3 transition-all light:bg-white shadow-xs ${
                    isOverdue
                      ? 'border-[#E5A93C]/60 hover:border-[#E5A93C]'
                      : 'border-[#384A41] hover:border-[#3D7D62] light:border-[#E5E3DA]'
                  }`}
                >
                  {/* Top Row: Avatar, Name, Relationship, Status Badge, Edit */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#242D29] border border-[#384A41] flex items-center justify-center text-xl shrink-0 light:bg-[#FAF9F5] light:border-[#E5E3DA]">
                        {contact.avatarEmoji || '✨'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E]">
                            {contact.name}
                          </h4>
                          {contact.isFavorite && (
                            <Star className="w-3 h-3 text-[#E5A93C] fill-[#E5A93C]" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#242D29] text-[#859A90] uppercase font-bold tracking-wider light:bg-[#F2F1EC]">
                            {contact.relationshipType}
                          </span>
                          <span className="text-[10px] text-[#859A90] light:text-[#5C655E]">
                            Cadence: {contact.targetCadenceDays}d
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditContact(contact)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#859A90] hover:text-[#F4F7F4] hover:bg-[#242D29] transition-colors light:hover:bg-[#F2F1EC]"
                        title="Edit contact"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${contact.name} from relationship circle?`)) {
                            deleteRelationshipContact(contact.id);
                          }
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#859A90] hover:text-[#EF4444] hover:bg-[#242D29] transition-colors light:hover:bg-[#F2F1EC]"
                        title="Delete contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Cadence Indicator Shelf */}
                  <div className="p-2.5 rounded-2xl bg-[#121413] border border-[#384A41]/50 flex items-center justify-between text-xs light:bg-[#FAF9F5] light:border-[#E5E3DA]">
                    <div className="flex items-center gap-2">
                      {isOverdue ? (
                        <div className="flex items-center gap-1 text-[#E5A93C] font-bold text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Overdue by {daysSince - contact.targetCadenceDays}d</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[#68D391] font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Connected ({daysRemaining === 0 ? 'Due today' : `${daysRemaining}d left`})</span>
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-[#859A90] font-mono">
                      Last: {daysSince === 0 ? 'Today' : `${daysSince}d ago`}
                    </span>
                  </div>

                  {/* Notes / Context snippet */}
                  {contact.notes && (
                    <p className="text-[11px] text-[#859A90] light:text-[#5C655E] line-clamp-2 italic">
                      "{contact.notes}"
                    </p>
                  )}

                  {/* Action Buttons Row */}
                  <div className="pt-2 border-t border-[#384A41]/40 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-[#859A90] font-mono">
                      {contact.totalCheckIns || 0} touchpoints logged
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Detailed Deed Logger for Contact */}
                      <button
                        onClick={() => handleOpenLogDeedForContact(contact)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#242D29] hover:bg-[#384A41] text-[#859A90] hover:text-[#F4F7F4] text-[11px] font-bold transition-all light:bg-[#F2F1EC] light:text-[#5C655E] flex items-center gap-1"
                        title="Record a deed for this contact"
                      >
                        <Heart className="w-3 h-3 text-[#E5A93C]" />
                        <span>Log Deed</span>
                      </button>

                      {/* 1-Click Fast Check-In Action */}
                      <button
                        onClick={() => handleQuickCheckIn(contact)}
                        className="px-3 py-1.5 rounded-xl bg-[#3D7D62] hover:bg-[#2D6A4F] text-white text-[11px] font-black shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        {getChannelIcon(contact.preferredChannel)}
                        <span>Touchpoint</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* IMPACT DEED TIMELINE LEDGER */
        filteredDeeds.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#1B211E] border border-[#384A41] text-center flex flex-col items-center gap-2 light:bg-white light:border-[#E5E3DA]">
            <span className="text-3xl">🌱</span>
            <h4 className="text-sm font-bold text-[#F4F7F4] light:text-[#1C221E]">
              No impact deeds recorded
            </h4>
            <p className="text-xs text-[#859A90] max-w-sm light:text-[#5C655E]">
              Track acts of kindness, mentorship moments, words of gratitude, or self-compassion grace.
            </p>
            <button
              onClick={() => {
                soundManager.playChime('click');
                setQuickDeedContactId(undefined);
                setIsDeedModalOpen(true);
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-[#3D7D62] text-white text-xs font-black shadow-xs"
            >
              + Record Meaningful Action
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filteredDeeds.map(deed => {
              const meta = getCategoryLabel(deed.category);

              return (
                <div
                  key={deed.id}
                  className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] flex flex-col gap-2.5 light:bg-white light:border-[#E5E3DA] shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-[#242D29] border border-[#384A41] flex items-center justify-center text-base shrink-0 mt-0.5 light:bg-[#FAF9F5] light:border-[#E5E3DA]">
                        {meta.icon}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E]">
                            {deed.title}
                          </h4>
                          <span
                            className="text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase"
                            style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                          >
                            {meta.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#859A90] light:text-[#5C655E]">
                          {deed.recipientName && (
                            <span>Recipient: <strong className="text-[#F4F7F4] light:text-[#1C221E]">{deed.recipientName}</strong></span>
                          )}
                          <span>•</span>
                          <span className="font-mono">{deed.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Rating Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= deed.impactRating
                                ? 'text-[#E5A93C] fill-[#E5A93C]'
                                : 'text-[#384A41] light:text-[#E5E3DA]'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          if (confirm('Delete this impact record?')) {
                            deleteImpactDeed(deed.id);
                          }
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#859A90] hover:text-[#EF4444] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  {deed.notes && (
                    <p className="text-xs text-[#859A90] light:text-[#5C655E] bg-[#121413] p-2.5 rounded-xl border border-[#384A41]/40 whitespace-pre-line light:bg-[#FAF9F5] light:border-[#E5E3DA]">
                      {deed.notes}
                    </p>
                  )}

                  {/* Badges footer */}
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#384A41]/30">
                    <div className="flex items-center gap-2">
                      <span className="text-[#68D391] font-mono font-bold">
                        +{deed.xpEarned || 20} XP
                      </span>
                      <span className="text-[#E5A93C] font-mono font-bold">
                        +{deed.coinsEarned || 1} 🪙
                      </span>
                    </div>

                    <span className="text-[#859A90] uppercase font-bold tracking-wider">
                      Role: {deed.recipientType}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Modals */}
      {isDeedModalOpen && (
        <ImpactDeedModal
          isOpen={true}
          onClose={() => {
            setIsDeedModalOpen(false);
            setQuickDeedContactId(undefined);
          }}
          initialContactId={quickDeedContactId}
        />
      )}

      {isContactModalOpen && (
        <RelationshipContactModal
          isOpen={true}
          onClose={() => {
            setIsContactModalOpen(false);
            setEditingContact(null);
          }}
          contactToEdit={editingContact}
        />
      )}
    </div>
  );
};
