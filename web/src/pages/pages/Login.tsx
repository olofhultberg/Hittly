import { useNavigate } from "react-router-dom";
import { LoginCard } from "../../components/components/LoginCard";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const { login, register, loading, error, errorMessages } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      // Error is handled by AuthContext
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      await register(email, password);
      navigate("/dashboard");
    } catch (err) {
      // Error is handled by AuthContext
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50">
      <LoginCard 
        onSubmit={handleLogin}
        onRegister={handleRegister}
        loading={loading}
        error={error}
        errorMessages={errorMessages}
      />
    </div>
  );
}