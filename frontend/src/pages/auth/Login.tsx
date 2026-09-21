import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Mail, LockKeyhole } from "lucide-react";

import { useAuth } from "@/context/useAuth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    console.log("=================================");
    console.log("LOGIN: FORM SUBMITTED");
    console.log("Email:", email);
    console.log("Password length:", password.length);
    console.log("=================================");

    setError("");
    setLoading(true);

    try {
      console.log("LOGIN: Calling AuthContext.login()...");

      const loggedInUser = await login({
        email: email.trim(),
        password,
      });

      console.log("LOGIN: Authentication successful");
      console.log("LOGIN: User returned:", loggedInUser);

      console.log(
        "LOGIN: Token exists:",
        localStorage.getItem("token") ? "YES" : "NO"
      );

      console.log("LOGIN: Navigating to /dashboard...");

      navigate("/dashboard");

      console.log("LOGIN: Navigation executed");
    } catch (error: any) {
      console.error("=================================");
      console.error("LOGIN: Authentication failed");
      console.error("LOGIN ERROR:", error);
      console.error("LOGIN RESPONSE:", error?.response);
      console.error(
        "LOGIN RESPONSE DATA:",
        error?.response?.data
      );
      console.error(
        "LOGIN STATUS:",
        error?.response?.status
      );
      console.error("=================================");

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid email or password.";

      setError(message);
    } finally {
      setLoading(false);

      console.log("LOGIN: Loading finished");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] lg:grid lg:grid-cols-2">

      {/* =========================================
          LEFT PANEL
      ========================================== */}
      <section className="relative hidden min-h-screen overflow-hidden bg-[#1d140f] lg:block">

        {/* Top orange line */}
        <div className="absolute left-0 right-0 top-0 h-[4px] bg-[#e87500]" />

        {/* Branding */}
        <div className="absolute left-[50px] top-[68px]">

          <Link to="/" className="block">
            <div className="text-[25px] font-bold tracking-tight text-white">
              S.B.A.
            </div>

            <div className="mt-1 text-[13px] font-medium tracking-wide text-[#b7aaa1]">
              SHREE BALAJI ASSOCIATES
            </div>
          </Link>

        </div>

        {/* Main left content */}
        <div className="absolute left-[50px] top-1/2 max-w-[610px] -translate-y-1/2">

          {/* Icon */}
          <div className="mb-7 flex h-[54px] w-[54px] items-center justify-center rounded-md bg-[#4b290d]">
            <Building2
              size={27}
              strokeWidth={2}
              className="text-[#e87500]"
            />
          </div>

          {/* Label */}
          <div className="mb-4 text-[15px] font-semibold uppercase tracking-wide text-[#e87500]">
            PROJECT MANAGEMENT PORTAL
          </div>

          {/* Heading */}
          <h1 className="max-w-[620px] text-[38px] font-semibold leading-[1.18] tracking-[-0.02em] text-white">
            Welcome back to your
            <br />
            project management
            <br />
            portal.
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-[520px] text-[16px] leading-7 text-[#b7aaa1]">
            Access project requirements, material information
            and supply operations through the centralized
            portal.
          </p>

        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-[#342720] px-[50px] py-8">
          <p className="text-[13px] text-[#b7aaa1]">
            Shree Balaji Associates
          </p>
        </div>

      </section>

      {/* =========================================
          RIGHT PANEL
      ========================================== */}
      <section className="flex min-h-screen items-center justify-center bg-[#faf9f6] px-5 py-10 sm:px-8">

        <div className="w-full max-w-[555px]">

          {/* Login Card */}
          <Card className="rounded-[15px] border-[#dcd7cf] bg-white shadow-[0_2px_7px_rgba(0,0,0,0.12)]">

            <CardHeader className="px-5 pb-4 pt-6 sm:px-6">

              {/* Portal label */}
              <div className="mb-3 text-[14px] font-semibold uppercase tracking-wide text-[#e87500]">
                PROJECT PORTAL
              </div>

              <CardTitle className="text-[25px] font-semibold tracking-tight text-[#111111]">
                Sign in to your account
              </CardTitle>

              <CardDescription className="mt-1 text-[16px] text-[#66615c]">
                Sign in to access the project management portal.
              </CardDescription>

            </CardHeader>

            <CardContent className="px-5 pb-7 pt-5 sm:px-6">

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Email */}
                <div className="space-y-2">

                  <Label
                    htmlFor="email"
                    className="text-[15px] font-semibold text-[#111111]"
                  >
                    Email address
                  </Label>

                  <div className="relative">

                    <Mail
                      size={19}
                      strokeWidth={1.8}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c756e]"
                    />

                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      autoComplete="email"
                      required
                      className="h-[40px] rounded-[9px] border-[#ddd7ce] pl-11 text-[16px] shadow-none placeholder:text-[#88817a] focus-visible:border-[#e87500] focus-visible:ring-1 focus-visible:ring-[#e87500]/20"
                    />

                  </div>

                </div>

                {/* Password */}
                <div className="space-y-2">

                  <Label
                    htmlFor="password"
                    className="text-[15px] font-semibold text-[#111111]"
                  >
                    Password
                  </Label>

                  <div className="relative">

                    <LockKeyhole
                      size={19}
                      strokeWidth={1.8}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c756e]"
                    />

                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      autoComplete="current-password"
                      required
                      className="h-[40px] rounded-[9px] border-[#ddd7ce] pl-11 text-[16px] shadow-none placeholder:text-[#88817a] focus-visible:border-[#e87500] focus-visible:ring-1 focus-visible:ring-[#e87500]/20"
                    />

                  </div>

                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-[8px] border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">
                    {error}
                  </div>
                )}

                {/* Login button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-[40px] w-full rounded-[8px] bg-[#e87500] text-[16px] font-semibold text-white shadow-none hover:bg-[#d96b00] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

              </form>

              {/* Divider */}
              <div className="my-7 border-t border-[#e1dcd4]" />

              {/* Register */}
              <div className="text-center text-[14px] text-[#66615c]">

                Already have an account?{" "}

                <Link
                  to="/register"
                  className="font-semibold text-[#e87500] hover:underline"
                >
                  Create account
                </Link>

              </div>

            </CardContent>

          </Card>

          {/* Return to website */}
          <div className="mt-7 text-center">

            <Link
              to="/"
              className="text-[14px] text-[#66615c] transition-colors hover:text-[#e87500]"
            >
              ← Return to website
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;