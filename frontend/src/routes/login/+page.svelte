<script>
  import { goto } from "$app/navigation";

  let email = "";
  let password = "";
  let errorMessage = "";
  let isLoading = false;

  async function handleLogin(event) {
    event.preventDefault();
    isLoading = true;
    errorMessage = "";

    try {
      const response = await fetch("https://wishlistku-backend.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        // 1. Simpan Token
        localStorage.setItem("token", result.token);

        // 2. Simpan Nama & Email User
        const userName =
          result.name ||
          (result.user && result.user.name) ||
          email.split("@")[0];
        const userEmail =
          result.email || (result.user && result.user.email) || email;

        localStorage.setItem("userName", userName);
        localStorage.setItem("userEmail", userEmail);

        // Arahkan ke halaman utama (Dashboard)
        goto("/");
      } else {
        errorMessage = result.message || "Email atau password salah!";
      }
    } catch (error) {
      errorMessage = "Tidak dapat terhubung ke server.";
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="auth-container">
  <div class="auth-card">
    <div class="auth-header">
      <h2>Selamat Datang! 👋</h2>
      <p>Silakan masuk ke akun Wishlist-mu</p>
    </div>

    {#if errorMessage}
      <div class="alert-error">{errorMessage}</div>
    {/if}

    <form on:submit={handleLogin}>
      <div class="input-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          bind:value={email}
          placeholder="contoh@email.com"
          required
        />
      </div>

      <div class="input-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          bind:value={password}
          placeholder="••••••••"
          required
        />
      </div>

      <button type="submit" class="btn-primary" disabled={isLoading}>
        {isLoading ? "Memproses..." : "Masuk Sekarang"}
      </button>
    </form>

    <div class="auth-footer">
      <p>Belum punya akun? <a href="/register">Daftar di sini</a></p>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    background-color: #f8fafc;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  }

  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
    background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  }

  .auth-card {
    background: white;
    width: 100%;
    max-width: 400px;
    padding: 40px 30px;
    border-radius: 20px;
    box-shadow:
      0 10px 25px -5px rgba(0, 0, 0, 0.1),
      0 8px 10px -6px rgba(0, 0, 0, 0.1);
  }

  .auth-header {
    text-align: center;
    margin-bottom: 30px;
  }
  .auth-header h2 {
    margin: 0;
    color: #0f172a;
    font-size: 1.8rem;
  }
  .auth-header p {
    color: #64748b;
    margin-top: 8px;
    font-size: 0.95rem;
  }

  .alert-error {
    background-color: #fee2e2;
    color: #b91c1c;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 0.9rem;
    text-align: center;
    border: 1px solid #fca5a5;
  }

  .input-group {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .input-group label {
    font-weight: 600;
    color: #334155;
    font-size: 0.9rem;
  }
  .input-group input {
    padding: 12px 16px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    font-size: 1rem;
    outline: none;
    transition: all 0.2s;
  }
  .input-group input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }

  .btn-primary {
    width: 100%;
    padding: 14px;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition:
      background-color 0.2s,
      transform 0.1s;
    margin-top: 10px;
  }
  .btn-primary:hover:not(:disabled) {
    background-color: #2563eb;
  }
  .btn-primary:active:not(:disabled) {
    transform: scale(0.98);
  }
  .btn-primary:disabled {
    background-color: #94a3b8;
    cursor: not-allowed;
  }

  .auth-footer {
    margin-top: 24px;
    text-align: center;
    font-size: 0.9rem;
    color: #64748b;
  }
  .auth-footer a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 600;
  }
  .auth-footer a:hover {
    text-decoration: underline;
  }
</style>
