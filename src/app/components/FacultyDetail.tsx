import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Faculty, getCurrentStatus } from "./StudentHome";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function FacultyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Faculty | null>(null);

  useEffect(() => {
    try {
      const allFaculty = JSON.parse(localStorage.getItem("faculty") || "[]");
      const found = allFaculty.find((f: Faculty) => f.id === id);

      if (found) {
        console.log("FacultyDetail: Found faculty", found.name);
        console.log("FacultyDetail: Timetable is array?", Array.isArray(found.timetable));

        // Ensure timetable and subjects are arrays
        const validFaculty = {
          ...found,
          timetable: Array.isArray(found.timetable) ? [...found.timetable] : [],
          subjects: Array.isArray(found.subjects) ? [...found.subjects] : []
        };

        setFaculty(validFaculty);
      }

      const user = localStorage.getItem("currentUser");
      if (user) {
        const userData = JSON.parse(user);
        console.log("FacultyDetail: Current user timetable is array?", Array.isArray(userData.timetable));

        // Ensure timetable and subjects are arrays
        const validUser = {
          ...userData,
          timetable: Array.isArray(userData.timetable) ? [...userData.timetable] : [],
          subjects: Array.isArray(userData.subjects) ? [...userData.subjects] : []
        };

        setCurrentUser(validUser);
      }
    } catch (error) {
      console.error("FacultyDetail: Error loading faculty:", error);
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [id]);

  if (!faculty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Faculty not found</p>
      </div>
    );
  }

  const status = getCurrentStatus(faculty.timetable || []);
  const statusColor =
    status === "Available"
      ? "bg-emerald-500"
      : status === "In Class"
      ? "bg-amber-500"
      : status === "Busy"
      ? "bg-red-500"
      : "bg-slate-500";

  const canEdit = currentUser && currentUser.id === faculty.id;

  const addSlot = () => {
    if (!faculty) return;
    setFaculty({
      ...faculty,
      timetable: [
        ...(faculty.timetable || []),
        { day: "Monday", start: "09:00", end: "10:00", subject: "", location: "" },
      ],
    });
  };

  const removeSlot = (index: number) => {
    if (!faculty) return;
    setFaculty({
      ...faculty,
      timetable: (faculty.timetable || []).filter((_, i) => i !== index),
    });
  };

  const updateSlot = (index: number, field: string, value: string) => {
    if (!faculty) return;
    const updated = [...(faculty.timetable || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFaculty({ ...faculty, timetable: updated });
  };

  const saveTimetable = () => {
    const allFaculty = JSON.parse(localStorage.getItem("faculty") || "[]");
    const updated = allFaculty.map((f: Faculty) =>
      f.id === faculty.id ? faculty : f
    );
    localStorage.setItem("faculty", JSON.stringify(updated));

    if (currentUser && currentUser.id === faculty.id) {
      localStorage.setItem("currentUser", JSON.stringify(faculty));
    }

    alert("Timetable saved successfully!");
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="h-8 w-px bg-slate-200"></div>
              <h1 className="text-xl font-semibold">Faculty Finder</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-sm hover:underline">
                Search
              </Link>
              {currentUser ? (
                <Link to="/dashboard" className="text-sm hover:underline">
                  Dashboard
                </Link>
              ) : (
                <Link to="/login" className="text-sm hover:underline">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 p-8">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-semibold flex-shrink-0">
                  {faculty.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-semibold mb-2">{faculty.name}</h2>
                  <p className="text-slate-600 mb-1">{faculty.designation} · {faculty.department}</p>
                  <p className="text-sm text-slate-500">{faculty.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm text-slate-600 mb-2 block">CABIN</Label>
                  <p className="text-slate-900">{faculty.cabin}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm text-slate-600 mb-2 block">DEPARTMENT</Label>
                  <p className="text-slate-900">{faculty.department}</p>
                </div>
              </div>

              <div className="mt-6">
                <Label className="text-sm text-slate-600 mb-2 block">
                  SUBJECTS (COMMA SEPARATED)
                </Label>
                <p className="text-slate-900">{(faculty.subjects || []).join(", ")}</p>
              </div>
            </div>
          </div>

          <div>
            <Card className="p-6 bg-white">
              <Label className="text-sm text-slate-600 mb-3 block">CURRENT STATUS</Label>
              <Badge
                className={`${statusColor} text-white text-base px-4 py-2 mb-2`}
              >
                {status}
              </Badge>
              <p className="text-xs text-slate-500">
                Real-time status updates based on timetable
              </p>
            </Card>
          </div>
        </div>

        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Weekly timetable</h3>
            {canEdit && (
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={saveTimetable} className="gap-2 bg-slate-900 hover:bg-slate-800">
                      <Save className="w-4 h-4" />
                      Save Timetable
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    Edit Timetable
                  </Button>
                )}
              </div>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-3">
              {(faculty.timetable || []).map((slot, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div>
                    <Label className="text-xs text-slate-500">DAY</Label>
                    <p className="text-sm font-medium text-slate-900">{slot.day}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">START</Label>
                    <p className="text-sm text-slate-900">{slot.start}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">END</Label>
                    <p className="text-sm text-slate-900">{slot.end}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">SUBJECT</Label>
                    <p className="text-sm text-slate-900">{slot.subject}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">LOCATION</Label>
                    <p className="text-sm text-slate-900">{slot.location}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {(faculty.timetable || []).map((slot, index) => (
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
                      placeholder="Room"
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

              <Button onClick={addSlot} variant="outline" className="gap-2 w-full">
                <Plus className="w-4 h-4" />
                Add Slot
              </Button>
            </div>
          )}

          {(!faculty.timetable || faculty.timetable.length === 0) && (
            <div className="text-center py-8 text-slate-500">
              <p>No timetable slots available</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
