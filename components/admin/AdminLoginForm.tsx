import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminLoginFormProps {
  email: string;
  password: string;
  loading: boolean;
  loginError: string | null;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  handleLogin: (e: React.FormEvent) => void;
}

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({
  email,
  password,
  loading,
  loginError,
  setEmail,
  setPassword,
  handleLogin,
}) => (
  <div className="flex items-center justify-center min-h-screen bg-belfx_navy-DEFAULT">
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center text-belfx_gold-DEFAULT">Admin Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {loginError && <div className="text-red-500 text-sm">{loginError}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
);

export default AdminLoginForm;
