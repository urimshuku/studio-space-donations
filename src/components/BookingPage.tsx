import { useState, useEffect, useRef } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { BookingCalendar } from './BookingCalendar';
import { scrollToTopEaseOut } from '../lib/scrollToTop';

interface BookingPageProps {
  /** Used for header logo and "Back to Home" link — navigates to venue page */
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const SUCCESS_DURATION_MS = 4000;

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
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
    setIsSubmitting(true);
    setIsSuccess(true);
    setSelectedDates([]);
    setName('');
    setStartTime('');
    setEndTime('');
    setContact('');
    setActivityType('');
    setGroupSize('');
    setAdditionalRequests('');

    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = setTimeout(() => {
      setIsSuccess(false);
      setIsSubmitting(false);
      resetTimeoutRef.current = null;
    }, SUCCESS_DURATION_MS);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        selectedTab="General Donations"
        onTabChange={() => {}}
        onLogoClick={() => scrollToTopEaseOut(550)}
        logoVariant="venue"
      />
      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-6 pb-8 sm:pt-8 sm:pb-12 md:pt-10 md:pb-16">
          <button
            type="button"
            onClick={() => {
              onBackToEntry();
              window.scrollTo(0, 0);
            }}
            className="mb-4 sm:mb-6 ml-2 sm:ml-3 inline-flex items-center justify-center p-0 bg-transparent border-0 cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="Back to Home"
          >
            <img
              src={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/arrow-back.svg`}
              alt=""
              className="w-6 h-6 sm:w-7 sm:h-7 object-contain block opacity-50"
            />
          </button>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 md:p-8 border border-gray-100 space-y-4 sm:space-y-6 min-w-0 overflow-hidden">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Book the Space
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
              <div className="mt-3 flex flex-row gap-3 w-full min-w-0 max-w-full">
                <div className="w-1/2 sm:flex-1 min-w-0 max-w-full">
                  <label htmlFor="booking-start-time" className="block text-sm font-medium text-gray-700 mb-1">
                    Start time
                  </label>
                  <input
                    id="booking-start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="booking-time-input w-full max-w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 box-border"
                  />
                </div>
                <div className="w-1/2 sm:flex-1 min-w-0 max-w-full">
                  <label htmlFor="booking-end-time" className="block text-sm font-medium text-gray-700 mb-1">
                    End time
                  </label>
                  <input
                    id="booking-end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="booking-time-input w-full max-w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 box-border"
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

            <div className="flex flex-col items-center justify-center gap-0 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white shadow-md min-w-[140px] min-h-[44px] disabled:cursor-default transition-colors duration-300 ease-out"
                style={{ backgroundColor: isSuccess ? '#9ca3af' : '#d5a220' }}
              >
                {isSuccess ? '✓ Sent' : 'Send request'}
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
