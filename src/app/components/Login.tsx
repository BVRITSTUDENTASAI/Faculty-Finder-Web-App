import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const faculty = JSON.parse(localStorage.getItem("faculty") || "[]");
      const user = faculty.find(
        (f: any) => f.email === email && f.password === password
      );

      if (user) {
        // Ensure user has proper data structure before saving
        const validUser = {
          ...user,
          timetable: Array.isArray(user.timetable) ? [...user.timetable] : [],
          subjects: Array.isArray(user.subjects) ? [...user.subjects] : []
        };

        console.log("Login: User found:", validUser.name);
        console.log("Login: Timetable is array:", Array.isArray(validUser.timetable));
        console.log("Login: Timetable length:", validUser.timetable.length);
        console.log("Login: Subjects is array:", Array.isArray(validUser.subjects));

        localStorage.setItem("currentUser", JSON.stringify(validUser));
        navigate("/dashboard");
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      console.error("Login: Error during login:", error);
      setError("An error occurred during login");
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 bg-slate-900 text-white p-12 flex items-center justify-center">
        <div className="max-w-md">
          <div className="mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">FF</span>
            </div>
            <h1 className="text-4xl mb-4">
              Welcome back,
              <br />
              <span className="text-blue-400 italic">professor.</span>
            </h1>
          </div>

          <div className="space-y-4 text-slate-300">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">✓</span>
              </div>
              <span>Edit weekly timetable</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">✓</span>
              </div>
              <span>Manage your cabin number, timings, to maintain your availability</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">✓</span>
              </div>
              <span>Update status in real-time directly</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white p-12 flex items-center justify-center">
        <Card className="w-full max-w-md p-8 shadow-lg border-slate-200">
          <div className="mb-8">
            <Link to="/" className="text-sm text-blue-600 hover:underline mb-4 block">
              ← Back to student page
            </Link>
            <h2 className="text-3xl mb-2">Faculty Sign in</h2>
            <p className="text-slate-600">Manage your profile and availability</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@college.edu"
                className="mt-2 h-11"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-2 h-11"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white">
              Sign in →
            </Button>
          </form>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600 font-semibold mb-2">Demo credentials:</p>
            <div className="space-y-1 text-xs text-slate-600">
              <p>email: anjali@college.edu</p>
              <p>email: ravi@college.edu</p>
              <p>email: priya@college.edu</p>
              <p className="mt-2">password: faculty123</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
