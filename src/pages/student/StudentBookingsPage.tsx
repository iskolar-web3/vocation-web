import React, { useState } from 'react';
import { Calendar, Award, ArrowLeft, Plus } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { BookingItem } from '../../components/student/BookingItem';
import { PayMongoModal } from '../../components/common/PayMongoModal';
import { RatingModal } from '../../components/common/RatingModal';
import { Booking } from '../../types';

interface StudentBookingsPageProps {
  navigate: (path: string) => void;
}

export const StudentBookingsPage: React.FC<StudentBookingsPageProps> = ({ navigate }) => {
  const { bookings } = useData();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'pending' | 'completed'>('upcoming');
  const [payBooking, setPayBooking] = useState<Booking | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed');
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  const getDisplayedBookings = () => {
    if (activeTab === 'upcoming') return upcomingBookings;
    if (activeTab === 'pending') return pendingBookings;
    return completedBookings;
  };

  const displayedList = getDisplayedBookings();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate('/app')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#3f58b2] hover:text-[#021F53] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Student Dashboard</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#021F53] font-display">
            My Coaching Sessions (S-023)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your scheduled mock interviews, resume audits, and join video calls.
          </p>
        </div>

        <button
          onClick={() => navigate('/coaches')}
          className="px-5 py-2.5 bg-[#3f58b2] hover:bg-[#021F53] text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Another Coach</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'upcoming', label: 'Upcoming Confirmed', count: upcomingBookings.length },
          { id: 'pending', label: 'Pending Payment', count: pendingBookings.length },
          { id: 'completed', label: 'Completed History', count: completedBookings.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-[#3f58b2] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {displayedList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#3f58b2]/10 shadow-soft space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#f0f7ff] text-[#3f58b2] flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#021F53]">No sessions in this view</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You do not have any sessions categorized under "{activeTab}".
            </p>
            <button
              onClick={() => navigate('/coaches')}
              className="mt-2 px-5 py-2 bg-[#f0f7ff] text-[#3f58b2] font-bold text-xs rounded-full border border-[#3f58b2]/20"
            >
              Find a Coach
            </button>
          </div>
        ) : (
          displayedList.map((booking) => (
            <BookingItem
              key={booking.id}
              booking={booking}
              onPay={(b) => setPayBooking(b)}
              onReview={(b) => setReviewBooking(b)}
            />
          ))
        )}
      </div>

      {/* PayMongo Modal */}
      <PayMongoModal
        isOpen={!!payBooking}
        onClose={() => setPayBooking(null)}
        booking={payBooking}
      />

      {/* Rating Modal */}
      <RatingModal
        isOpen={!!reviewBooking}
        onClose={() => setReviewBooking(null)}
        booking={reviewBooking}
      />
    </div>
  );
};
