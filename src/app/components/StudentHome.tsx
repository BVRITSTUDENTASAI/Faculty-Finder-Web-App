import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Search, Clock, MapPin, BookOpen } from "lucide-react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { INITIAL_FACULTY } from "../data/facultyData";

export interface Faculty {
  id: string;
  name: string;
  email: string;
  password: string;
  department: string;
  designation: string;
  subjects: string[];
  cabin: string;
  timetable: {
    day: string;
    start: string;
    end: string;
    subject: string;
    location: string;
  }[];
}

function getCurrentStatus(timetable: any): string {
  // Extra defensive checks
  if (!timetable) {
    return "Available";
  }

  if (!Array.isArray(timetable)) {
    console.warn("Timetable is not an array, got:", typeof timetable, timetable);
    return "Available";
  }

  if (timetable.length === 0) {
    return "Available";
  }

  try {
    const now = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = days[now.getDay()];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    // Use regular for loop instead of for...of to be extra safe
    for (let i = 0; i < timetable.length; i++) {
      const slot = timetable[i];
      if (!slot || !slot.day || !slot.start || !slot.end) continue;
      if (slot.day !== currentDay) continue;

      const [startHour, startMin] = slot.start.split(":").map(Number);
      const [endHour, endMin] = slot.end.split(":").map(Number);

      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      if (currentTime >= startTime && currentTime < endTime) {
        const activity = (slot.subject || "").toLowerCase();

        // Available for office hours and consultation
        if (activity.includes("office") || activity.includes("consultation")) {
          return "Available";
        }

        // Busy for meetings, field trips, research, etc.
        if (activity.includes("meeting") || activity.includes("field") ||
            activity.includes("research") || activity.includes("seminar") ||
            activity.includes("workshop") || activity.includes("site visit")) {
          return "Busy";
        }

        // In Class for lectures, labs, tutorials
        return "In Class";
      }
    }
  } catch (error) {
    console.error("Error in getCurrentStatus:", error, "timetable was:", timetable);
    return "Available";
  }

  return "Available";
}

export default function StudentHome() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [search, setSearch] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check version
    const dataVersion = localStorage.getItem("facultyDataVersion");

    if (dataVersion !== "5.0") {
      console.log("Updating to version 5.0 - 30 faculty with Busy status");

      // Clear everything
      localStorage.clear();

      // Set directly from INITIAL_FACULTY
      console.log("INITIAL_FACULTY length:", INITIAL_FACULTY.length);

      // Verify INITIAL_FACULTY structure
      INITIAL_FACULTY.forEach((f, idx) => {
        if (!Array.isArray(f.timetable)) {
          console.error(`Faculty ${idx} (${f.name}) has invalid timetable:`, f.timetable);
        }
        if (!Array.isArray(f.subjects)) {
          console.error(`Faculty ${idx} (${f.name}) has invalid subjects:`, f.subjects);
        }
      });

      // Set state directly
      setFaculty(INITIAL_FACULTY);

      // Now save to localStorage for future edits
      localStorage.setItem("facultyDataVersion", "5.0");
      localStorage.setItem("faculty", JSON.stringify(INITIAL_FACULTY));

      setIsLoading(false);
    } else {
      // Load existing data
      const stored = localStorage.getItem("faculty");
      if (stored) {
        try {
          const parsedFaculty = JSON.parse(stored);
          setFaculty(parsedFaculty);
          setIsLoading(false);
        } catch (error) {
          console.error("Error parsing faculty data:", error);
          setFaculty(INITIAL_FACULTY);
          localStorage.setItem("faculty", JSON.stringify(INITIAL_FACULTY));
          setIsLoading(false);
        }
      } else {
        setFaculty(INITIAL_FACULTY);
        localStorage.setItem("faculty", JSON.stringify(INITIAL_FACULTY));
        setIsLoading(false);
      }
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const filteredFaculty = faculty.filter((f) => {
    if (!f || !f.name || !f.department) {
      console.error("Invalid faculty in filter:", f);
      return false;
    }

    const searchLower = search.toLowerCase();
    const nameMatch = f.name.toLowerCase().includes(searchLower);
    const deptMatch = f.department.toLowerCase().includes(searchLower);
    const subjectMatch = f.subjects && Array.isArray(f.subjects) && f.subjects.some(s => s.toLowerCase().includes(searchLower));

    return nameMatch || deptMatch || subjectMatch;
  });

  const getStatusColor = (status: string) => {
    if (status === "Available") return "bg-emerald-500";
    if (status === "In Class") return "bg-amber-500";
    if (status === "Busy") return "bg-red-500";
    return "bg-slate-500";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-slate-600">Loading faculty data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl mb-2">
                Find any Faculty.
                <br />
                <span className="text-blue-600 italic">Know if they're free.</span>
              </h1>
              <p className="text-slate-600 mt-2">
                Search for faculty by name or department to check their real-time availability
              </p>
            </div>
            <div className="text-right">
              <div className="bg-slate-900 text-white rounded-lg px-6 py-4">
                <div className="text-3xl font-light">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                <div className="text-sm text-slate-400">{currentTime.toLocaleDateString('en-US', { weekday: 'long' })}</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name or department"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 text-lg border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-slate-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-slate-600">In Class</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-slate-600">Busy (Meeting/Research)</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl">Faculty directory</h2>
          <Link
            to="/login"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            Faculty Sign in →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.isArray(filteredFaculty) && filteredFaculty.length > 0 ? (
            filteredFaculty.map((f) => {
              try {
                if (!f || !f.id || !f.name) {
                  console.warn("Invalid faculty object:", f);
                  return null;
                }

                const facultyTimetable = Array.isArray(f.timetable) ? f.timetable : [];
                const status = getCurrentStatus(facultyTimetable);

                return (
                  <Card
                    key={f.id}
                    onClick={() => navigate(`/faculty/${f.id}`)}
                    className="p-6 hover:shadow-lg transition-all duration-200 border-slate-200 cursor-pointer hover:border-blue-300"
                  >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-semibold">
                    {f.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <Badge
                    className={`${getStatusColor(status)} text-white text-xs px-2 py-1`}
                  >
                    {status}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-1">{f.name}</h3>
                <p className="text-sm text-slate-600 mb-4">{f.department}</p>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{(f.subjects || []).join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>Cabin {f.cabin}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </Card>
                );
              } catch (error) {
                console.error("Error rendering faculty card:", error, f);
                return null;
              }
            })
          ) : null}
        </div>

        {Array.isArray(filteredFaculty) && filteredFaculty.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No faculty found matching your search.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export { getCurrentStatus };
