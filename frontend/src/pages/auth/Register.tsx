import { useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/useAuth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<
    "PROJECT_MANAGER" | "SUPPLY_MANAGER"
  >("PROJECT_MANAGER");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        role,
      });

      navigate("/dashboard");
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top accent */}
      <div className="h-1 bg-primary" />

      <div className="grid min-h-[calc(100vh-4px)] lg:grid-cols-2">
        {/* Left panel */}
        <div className="hidden border-r bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="p-10">
            {/* Brand */}
            <Link to="/" className="inline-block">
              <div className="text-xl font-bold tracking-tight">
                S.B.A.
              </div>

              <div className="mt-0.5 text-[11px] font-medium tracking-wider text-sidebar-foreground/60">
                SHREE BALAJI ASSOCIATES
              </div>
            </Link>

            {/* Introduction */}
            <div className="mt-28 max-w-lg">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Building2 className="h-5 w-5" />
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Project Management Portal
              </p>

              <h1 className="mt-3 text-3xl font-semibold leading-tight">
                Create your project management account.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-sidebar-foreground/65">
                Access project requirements, material information and
                supply operations through the centralized portal.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-sidebar-border px-10 py-6">
            <p className="text-xs text-sidebar-foreground/60">
              Shree Balaji Associates
            </p>
          </div>
        </div>

        {/* Register panel */}
        <div className="flex items-center justify-center px-5 py-12">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-8 lg:hidden">
              <Link to="/" className="inline-block">
                <div className="text-lg font-bold">
                  S.B.A.
                </div>

                <div className="text-[10px] font-medium tracking-wider text-muted-foreground">
                  SHREE BALAJI ASSOCIATES
                </div>
              </Link>
            </div>

            <Card className="border shadow-sm">
              <CardHeader className="space-y-1 pb-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Project Portal
                </p>

                <h2 className="text-xl font-semibold">
                  Create your account
                </h2>

                <p className="text-sm text-muted-foreground">
                  Register to access the project management portal.
                </p>
              </CardHeader>

              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full name
                    </Label>

                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-9"
                        value={name}
                        onChange={(e) =>
                          setName(e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email address
                    </Label>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        className="pl-9"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <Label htmlFor="role">
                      Role
                    </Label>

                    <div className="relative">
                      <BriefcaseBusiness className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <select
                        id="role"
                        value={role}
                        onChange={(e) =>
                          setRole(
                            e.target.value as
                              | "PROJECT_MANAGER"
                              | "SUPPLY_MANAGER"
                          )
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-9 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        required
                      >
                        <option value="PROJECT_MANAGER">
                          Project Manager
                        </option>

                        <option value="SUPPLY_MANAGER">
                          Supply Manager
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password
                    </Label>

                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a password"
                        className="pl-9"
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2">
                      <p className="text-sm text-destructive">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading
                      ? "Creating account..."
                      : "Create Account"}
                  </Button>
                </form>

                {/* Login */}
                <div className="mt-6 border-t pt-5 text-center">
                  <p className="text-xs text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-medium text-primary hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Return */}
            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                ← Return to website
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;