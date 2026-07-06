import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { LogOut, Save, Clock, Plus, Trash2 } from "lucide-react";
import { Faculty, getCurrentStatus } from "./StudentHome";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export default function Dashboard() {
  const [user, setUser] = useState<Faculty | null>(null);
  const [cabin, setCabin] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [timetable, setTimetable] = useState<Faculty["timetable"]>([]);
  const [currentime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      const userData = JSON.parse(currentUser);
      console.log("Dashboard: Loading user", userData.name);
      console.log("Dashboard: User timetable is array?", Array.isArray(userData.timetable));

      setUser(userData);
      setCabin(userData.cabin || "");
      setSubjects(Array.isArray(userData.subjects) ? userData.subjects : []);

      // Ensure timetable is an array
      const userTimetable = userData.timetable;
      if (!Array.isArray(userTimetable)) {
        console.warn("Dashboard: User timetable is not an array, resetting to empty");
        setTimetable([]);
      } else {
        console.log("Dashboard: Setting timetable with", userTimetable.length, "slots");
        setTimetable([...userTimetable]); // Create a copy
      }
    } catch (error) {
      console.error("Dashboard: Error loading user data:", error);
      navigate("/login");
      return;
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [navigate]);

  const handleSave = () => {
    if (!user) return;

    const faculty = JSON.parse(localStorage.getItem("faculty") || "[]");
    const updatedFaculty = faculty.map((f: Faculty) =>
      f.id === user.id
        ? { ...f, cabin, subjects, timetable }
        : f
    );

    localStorage.setItem("faculty", JSON.stringify(updatedFaculty));

    const updatedUser = { ...user, cabin, subjects, timetable };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setUser(updatedUser);

    alert("Changes saved successfully!");
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const addSlot = () => {
    setTimetable([
      ...timetable,
      { day: "Monday", start: "09:00", end: "10:00", subject: "", location: "" },
    ]);
  };

  const removeSlot = (index: number) => {
    setTimetable(timetable.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: string, value: string) => {
    const updated = [...timetable];
    updated[index] = { ...updated[index], [field]: value };
    setTimetable(updated);
  };

  if (!user) return null;

  const status = getCurrentStatus(timetable || []);
  const statusColor =
    status === "Available"
      ? "bg-emerald-500"
      : status === "In Class"
      ? "bg-amber-500"
      : status === "Busy"
      ? "bg-red-500"
      : "bg-slate-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-semibold">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <h1 className="text-2xl">
                  Hello, <span className="text-blue-600 italic">{user.name.split(" ")[1]}</span>
                </h1>
                <p className="text-sm text-slate-600">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-3xl font-light text-slate-900">
                  {currentime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
                <div className="text-sm text-slate-600">{currentime.toLocaleDateString('en-US', { weekday: 'long' })}</div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-slate-600">Name</Label>
                <p className="mt-1 text-slate-900">{user.name}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">Employee ID</Label>
                <p className="mt-1 text-slate-900">{user.id.padStart(10, '0')}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">Department</Label>
                <p className="mt-1 text-slate-900">{user.department}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">Designation</Label>
                <p className="mt-1 text-slate-900">{user.designation}</p>
              </div>
              <div>
                <Label htmlFor="cabin" className="text-sm text-slate-600">Cabin number</Label>
                <Input
                  id="cabin"
                  value={cabin}
                  onChange={(e) => setCabin(e.target.value)}
                  placeholder="e.g., Block A, Room 204"
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Availability status</h3>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Real-time</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-sm text-slate-600 mb-3">
                Your current status is automatically determined by your timetable:
              </p>
              <div className="flex items-center gap-4">
                <Badge className={`${statusColor} text-white px-4 py-2 text-base`}>
                  {status}
                </Badge>
                <p className="text-sm text-slate-600">
                  {status === "Available"
                    ? "You are currently available for students"
                    : status === "In Class"
                    ? "You are currently in a scheduled class"
                    : "You are currently busy (meeting/research)"}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                * Status updates automatically based on the current time and your weekly timetable below
              </p>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Weekly timetable</h3>
            <Button onClick={handleSave} className="gap-2 bg-slate-900 hover:bg-slate-800">
              <Save className="w-4 h-4" />
              Save all changes
            </Button>
          </div>

          <div className="space-y-4 mb-4">
            {timetable.map((slot, index) => (
              <div
                key={index}
                className="grid grid-cols-6 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 items-end"
              >
                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">Day</Label>
                  <Select
                    value={slot.day}
                    onValueChange={(value) => updateSlot(index, "day", value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">Start</Label>
                  <Input
                    type="time"
                    value={slot.start}
                    onChange={(e) => updateSlot(index, "start", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">End</Label>
                  <Input
                    type="time"
                    value={slot.end}
                    onChange={(e) => updateSlot(index, "end", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">Subject</Label>
                  <Input
                    value={slot.subject}
                    onChange={(e) => updateSlot(index, "subject", e.target.value)}
                    placeholder="Class name"
                    className="h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600 mb-2 block">Location</Label>
                  <Input
                    value={slot.location}
                    onChange={(e) => updateSlot(index, "location", e.target.value)}
                    placeholder="Room number"
                    className="h-9"
                  />
                </div>
                <Button
                  onClick={() => removeSlot(index)}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button onClick={addSlot} variant="outline" className="gap-2 w-full">
            <Plus className="w-4 h-4" />
            Add Slot
          </Button>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> Enter your class names, lab sessions, or "Office Hours" / "Consultation" for times when you're available to meet students.
              Your status will automatically update based on the current time.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}
