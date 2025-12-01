import { Link } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthField from "../components/auth/AuthField";
import { useAuthForm } from "../hooks/useAuthForm";

const Register = () => {
  const { values, updateField, submit, message, isError } = useAuthForm({
    mode: "register",
  });

  return (
    <AuthLayout
      title="Create Passenger Account"
      description="Join Rail Madad to submit complaints, track food orders, request emergency support, and more."
      message={message}
      isError={isError}
      footer={
        <p className="form-meta">
          Already registered? <Link to="/login">Sign in to your account</Link>
        </p>
      }
    >
      <form className="form-grid" onSubmit={submit}>
        <AuthField
          id="username"
          label="Username"
          placeholder="Choose a username"
          required
          value={values.username}
          onChange={(val) => updateField("username", val)}
        />
        <AuthField
          id="email"
          label="Email"
          type="email"
          placeholder="name@example.com"
          required
          value={values.email}
          onChange={(val) => updateField("email", val)}
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          placeholder="Create a secure password"
          required
          value={values.password}
          onChange={(val) => updateField("password", val)}
        />
        <button className="btn" type="submit">
          Register
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
