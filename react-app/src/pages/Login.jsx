import { Link } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthField from "../components/auth/AuthField";
import { useAuthForm } from "../hooks/useAuthForm";

const Login = () => {
  const { values, updateField, submit, message, isError } = useAuthForm({ mode: "login" });

  return (
    <AuthLayout
      title="Passenger Login"
      description="Sign in to manage complaints, track food orders, request support, and stay informed."
      message={message}
      isError={isError}
      footer={
        <p className="form-meta">
          New to the platform? <Link to="/register">Create a passenger account</Link>
        </p>
      }
    >
      <form className="form-grid" onSubmit={submit}>
        <AuthField
          id="username"
          label="Username"
          placeholder="Enter your username"
          required
          value={values.username}
          onChange={(val) => updateField("username", val)}
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          required
          value={values.password}
          onChange={(val) => updateField("password", val)}
        />
        <button className="btn" type="submit">
          Login
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
