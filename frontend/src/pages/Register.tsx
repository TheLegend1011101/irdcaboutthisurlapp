import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.tsx";
import Field from "../components/Field.tsx";
import { loginUser, registerUser, tokenStore } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (tokenStore.get()) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the account.");
      setLoading(false);
      return;
    }

    // Account exists; sign in straight away so there's no second form to fill.
    try {
      const result = await loginUser({ email, password });
      tokenStore.set(result.access_token);
      navigate("/dashboard", { replace: true });
    } catch {
      navigate("/login", { replace: true });
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Make short links and watch the clicks come in."
      footer={
        <>
          Already registered? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Field
          id="register-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          id="register-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Field
          id="register-confirm"
          label="Repeat password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <p className="form-error" role="alert">
          {error}
        </p>

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}