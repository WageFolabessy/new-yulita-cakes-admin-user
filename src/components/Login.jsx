import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const Login = () => {
  const { token, setToken, setUser } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Yulita Cakes | Masuk";
    if (token) {
      navigate("/admin/dashboard");
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user); // Simpan data user (pastikan response memiliki properti "user")
        toast.success(data.message || "Login berhasil");
        navigate("/");
      } else {
        toast.error(data.message || "Login gagal");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-pink-50 px-4">
  <div className="bg-white border border-pink-300 shadow-lg rounded-xl px-6 py-8 w-full max-w-sm md:max-w-md lg:max-w-lg">
    <h1 className="text-3xl font-semibold text-pink-700 text-center mb-6">Admin Panel <br /> Yulita Cakes</h1>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Alamat Email</label>
        <input
          type="email"
          placeholder="Masukkan email anda"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-pink-400 transition"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Kata Sandi</label>
        <input
          type="password"
          placeholder="Masukkan password anda"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-pink-400 transition"
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 text-white bg-pink-600 rounded-lg hover:bg-pink-700 transition font-medium"
      >
        Masuk
      </button>
    </form>
  </div>
</div>

  );
};

export default Login;
