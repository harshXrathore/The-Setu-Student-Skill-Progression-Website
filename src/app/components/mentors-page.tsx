import { useState, useEffect } from "react";
import { apiRequest } from "../lib/api";
import { MentorProfileDialog } from "./mentor-profile-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { MyMentorshipsPage } from "./my-mentorships-page";
import { Users, Calendar, Star, CheckCircle, Search, BadgeCheck } from "lucide-react";

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
      <div className="p-3 bg-secondary rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export function MentorsPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeMentors: 0,
    totalSessions: 0,
    avgRating: "4.8",
    yourSessions: 0
  });
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [bookingTopic, setBookingTopic] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mentorsData, statsData] = await Promise.all([
            apiRequest<any[]>("/mentors"),
            apiRequest<any>("/mentors/platform-stats").catch(() => null)
        ]);
        setMentors(mentorsData);
        if (statsData) {
            setStats({
                ...statsData,
                activeMentors: mentorsData.length || statsData.activeMentors
            });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError("");
    setBookingLoading(true);

    if (!selectedMentor || !bookingTopic || !bookingDate || !bookingTime) {
      setBookingError("Please fill out all required fields.");
      setBookingLoading(false);
      return;
    }

    if (selectedMentor.mentorDetails?.availability && selectedMentor.mentorDetails.availability.length > 0) {
      const localDate = new Date(`${bookingDate}T00:00:00`);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = days[localDate.getDay()];

      const dayAvail = selectedMentor.mentorDetails.availability.find((a: any) => a.day === dayOfWeek);
      if (!dayAvail) {
        setBookingError(`Mentor is not available on ${dayOfWeek}s.`);
        setBookingLoading(false);
        return;
      }

      let isValidTime = false;
      if (dayAvail.slots && dayAvail.slots.length > 0) {
        for (const slot of dayAvail.slots) {
          if (bookingTime >= slot.startTime && bookingTime <= slot.endTime) {
            isValidTime = true;
            break;
          }
        }
        if (!isValidTime) {
          const slotStrings = dayAvail.slots.map((s: any) => `${s.startTime}-${s.endTime}`).join(', ');
          setBookingError(`Requested time is outside available hours for ${dayOfWeek}. Available slots: ${slotStrings}.`);
          setBookingLoading(false);
          return;
        }
      }
    }

    const combinedDate = new Date(`${bookingDate}T${bookingTime}`);

    try {
      await apiRequest("/mentors/book", {
        method: "POST",
        body: JSON.stringify({
          mentorId: selectedMentor.user?._id || selectedMentor.user,
          topic: bookingTopic,
          date: combinedDate.toISOString(),
          notes: bookingNotes,
          studentTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      });
      setBookingSuccess(true);
      setTimeout(() => {
        closeBookingModal();
      }, 2000);
    } catch (err: any) {
      setBookingError(err.message || "Failed to book session");
    } finally {
      setBookingLoading(false);
    }
  };

  const openBookingModal = (mentor: any) => {
    setSelectedMentor(mentor);
    setBookingSuccess(false);
    setBookingError("");
    setBookingTopic("");
    setBookingDate("");
    setBookingTime("");
    setBookingNotes("");
  };

  const closeBookingModal = () => {
    setSelectedMentor(null);
  };

  return (
    <Tabs defaultValue="find" className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Mentors</h1>
          <p className="text-muted-foreground">Connect with industry experts for personalized guidance</p>
        </div>
        <TabsList>
          <TabsTrigger value="find">Find Mentor</TabsTrigger>
          <TabsTrigger value="my-mentorships">My Mentorships</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="find" className="space-y-6 mt-0">
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard icon={<Users className="size-6 text-blue-600 dark:text-blue-400" />} label="Active Mentors" value={stats.activeMentors.toString()} />
          <StatCard icon={<Calendar className="size-6 text-green-600 dark:text-green-400" />} label="Sessions Completed" value={stats.totalSessions.toString()} />
          <StatCard icon={<Star className="size-6 text-yellow-500" />} label="Avg Rating" value={stats.avgRating} />
          <StatCard icon={<CheckCircle className="size-6 text-purple-600 dark:text-purple-400" />} label="Your Sessions" value={stats.yourSessions.toString()} />
        </div>

        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search by name, company, or specialty..."
                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select className="px-4 py-2 bg-background border border-input rounded-lg text-foreground">
              <option>All Specialties</option>
              <option>Frontend</option>
              <option>Backend</option>
              <option>DevOps</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 text-center py-8">Loading mentors...</div>
          ) : mentors.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-muted-foreground">No mentors found. Be the first to join!</div>
          ) : (
            mentors.map((profile: any, index: number) => {
              try {
                const mDetails = profile?.mentorDetails || {};
                const name = profile?.user?.name || (profile?.general?.firstName ? profile.general.firstName + " " + (profile.general?.lastName || "") : "Unknown Mentor");
                const role = profile?.occupation?.jobTitle || profile?.occupation?.role || "Mentor";
                const company = profile?.occupation?.company || "Independent";
                const experience = profile?.experience?.[0]?.startDate ? new Date().getFullYear() - new Date(profile.experience[0].startDate).getFullYear() + "+ years" : "Experienced";
                const specialties = Array.isArray(mDetails?.specialties) && mDetails.specialties.length > 0 ? mDetails.specialties : (Array.isArray(profile?.skills) ? profile.skills.slice(0, 3) : []);
                const rating = mDetails?.rating || 0;
                const sessionCount = mDetails?.sessionCount || 0;
                const availability = mDetails?.availabilityStatus || "Available";
                const price = mDetails?.rate || "Free";

                return (
                  <div key={profile?._id || index} className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="size-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {profile?.general?.avatar ? <img src={profile.general.avatar} alt={name} className="w-full h-full rounded-full object-cover" /> : name.slice(0, 1)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          <h3 className="text-xl font-semibold text-foreground">{name}</h3>
                          {profile?.user?.isVerified && (
                            <BadgeCheck className="size-5 text-blue-500 fill-blue-500/10" />
                          )}
                        </div>
                        <p className="text-muted-foreground mb-1">{role}</p>
                        <p className="text-sm text-muted-foreground">{company} • {experience}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${availability === "Available"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : availability === "Limited"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                          : "bg-secondary text-muted-foreground"
                        }`}>
                        {availability}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-2">
                        {specialties.map((specialty: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Star className="size-4 text-yellow-500" />
                        {rating > 0 ? rating.toFixed(1) : "New"} ({sessionCount} sessions)
                      </span>
                      <span className="font-semibold text-foreground">{price}</span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => openBookingModal(profile)}
                        className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
                      >
                        Book Session
                      </button>
                      <MentorProfileDialog mentor={profile}>
                        <button className="px-4 py-2 border border-input text-foreground rounded-lg hover:bg-secondary">
                          View Profile
                        </button>
                      </MentorProfileDialog>
                    </div>
                  </div>
                );
              } catch (err) {
                console.error("Error rendering mentor card:", err);
                return null;
              }
            })
          )}
        </div>

        {selectedMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Book Session</h2>
                <button onClick={closeBookingModal} className="text-muted-foreground hover:text-foreground">
                  ✕
                </button>
              </div>

              {bookingSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="size-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="size-8" />
                  </div>
                  <h3 className="text-xl font-semibold">Request Sent!</h3>
                  <p className="text-muted-foreground">
                    Your session request has been sent to the mentor. They will review and confirm shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookSession} className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg mb-4">
                    <div className="size-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold">
                      {(selectedMentor.user?.name || "M")[0]}
                    </div>
                    <div>
                      <p className="font-medium">{selectedMentor.user?.name}</p>
                      <p className="text-xs text-muted-foreground">Mentor</p>
                    </div>
                  </div>

                  {bookingError && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                      {bookingError}
                    </div>
                  )}

                  {selectedMentor.mentorDetails?.availability?.length > 0 && (
                    <div className="mb-4 p-3 bg-secondary/50 rounded-lg border border-border">
                      <h4 className="text-sm font-semibold mb-2">Mentor Availability</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {selectedMentor.mentorDetails.availability.map((avail: any) => (
                          <li key={avail.day} className="flex justify-between">
                            <span className="font-medium">{avail.day}</span>
                            <span>{avail.slots.map((s: any) => `${s.startTime} - ${s.endTime}`).join(', ')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">Select Topic</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Resume Review, React Help..."
                      className="w-full px-3 py-2 bg-background border border-input text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      value={bookingTopic}
                      onChange={(e) => setBookingTopic(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Proposed Date</label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-2 bg-background border border-input text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Proposed Time</label>
                      <input
                        type="time"
                        required
                        className="w-full px-3 py-2 bg-background border border-input text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Notes to Mentor (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly describe what you'd like to achieve in this session..."
                      className="w-full px-3 py-2 bg-background border border-input text-foreground rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={closeBookingModal}
                      className="flex-1 px-4 py-2 border border-input rounded-lg hover:bg-secondary font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium flex justify-center items-center"
                    >
                      {bookingLoading ? "Sending..." : "Send Request"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="my-mentorships" className="mt-0">
        <MyMentorshipsPage />
      </TabsContent>
    </Tabs>
  );
}
