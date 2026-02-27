import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { BookingCalendar } from './BookingCalendar';
import { ArrowLeft } from 'lucide-react';

interface BookingPageProps {
  onBackToEntry: () => void;
}

export function BookingPage({ onBackToEntry }: BookingPageProps) {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [contact, setContact] = useState('');
  const [activityType, setActivityType] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [additionalRequests, setAdditionalRequests] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: in a real app you would send to an API
    console.log({
      selectedDates,
      name,
      startTime,
      endTime,
      contact,
      activityType,
      groupSize: groupSize ? Number(groupSize) : undefined,
      additionalRequests: additionalRequests || undefined,
    });
    alert('Booking request received. We’ll be in touch soon.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        selectedTab="General Donations"
        onTabChange={() => {}}
        onGoHome={onBackToEntry}
        logoVariant="entry"
      />
      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
          <button
            type="button"
            onClick={onBackToEntry}
            className="mb-4 sm:mb-6 inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm sm:text-base transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            <span>Back to Home</span>
          </button>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 md:p-8 border border-gray-100 space-y-4 sm:space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Book the space
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              Choose your date(s), activity, and group size. We’ll get back to you to confirm.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Date(s) – calendar */}
            <fieldset className="space-y-3">
              <legend className="text-lg font-semibold text-gray-900">
                Date(s)
              </legend>
              <div className="flex justify-center">
                <BookingCalendar
                  selectedDates={selectedDates}
                  onChange={setSelectedDates}
                />
              </div>
              <div className="mt-3 flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label htmlFor="booking-start-time" className="block text-sm font-medium text-gray-700 mb-1">
                    Start time
                  </label>
                  <input
                    id="booking-start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="booking-end-time" className="block text-sm font-medium text-gray-700 mb-1">
                    End time
                  </label>
                  <input
                    id="booking-end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
              </div>
            </fieldset>

            {/* Full Name */}
            <div>
              <label htmlFor="booking-name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="booking-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                placeholder="Full Name"
              />
            </div>

            {/* Contact */}
            <div>
              <label htmlFor="booking-contact" className="block text-sm font-medium text-gray-700 mb-1">
                Contact
              </label>
              <input
                id="booking-contact"
                type="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                placeholder="Phone number"
              />
            </div>

            {/* Type of Activity */}
            <div>
              <label htmlFor="booking-activity" className="block text-sm font-medium text-gray-700 mb-1">
                Type of Activity
              </label>
              <input
                id="booking-activity"
                type="text"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                placeholder="e.g. Book club, Workshop, Film screening"
              />
            </div>

            {/* Group size */}
            <div>
              <label htmlFor="booking-group-size" className="block text-sm font-medium text-gray-700 mb-1">
                Size of Group
              </label>
              <input
                id="booking-group-size"
                type="number"
                min={1}
                max={500}
                value={groupSize}
                onChange={(e) => setGroupSize(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                placeholder="e.g. 8"
              />
            </div>

            {/* Other Requests or Considerations */}
            <div>
              <label htmlFor="booking-requests" className="block text-sm font-medium text-gray-700 mb-1">
                Other Requests or Considerations
              </label>
              <textarea
                id="booking-requests"
                value={additionalRequests}
                onChange={(e) => setAdditionalRequests(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 resize-y"
                placeholder="Any special requirements, times, or notes…"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#000' }}
              >
                Send booking request
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
