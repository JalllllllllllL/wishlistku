<script>
  import { goto } from "$app/navigation";

  let name = "";
  let email = "";
  let password = "";
  let errorMessage = "";
  let successMessage = "";
  let isLoading = false;

  async function handleRegister(event) {
    event.preventDefault();
    isLoading = true;
    errorMessage = "";
    successMessage = "";

    try {
      const response = await fetch(
        "https://wishlistku-backend.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        successMessage = "Registrasi berhasil! Mengalihkan ke halaman login...";
        setTimeout(() => {
          goto("/login");
        }, 2000);
      } else {
        errorMessage =
          result.message || "Gagal mendaftar, email mungkin sudah digunakan.";
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
      <h2>Buat Akun Baru 🚀</h2>
      <p>Mulai perjalanan menabung impianmu</p>
    </div>

    {#if errorMessage}
      <div class="alert-error">{errorMessage}</div>
    {/if}

    {#if successMessage}
      <div class="alert-success">{successMessage}</div>
    {/if}

    <form on:submit={handleRegister}>
      <!-- Beberapa backend mungkin meminta input nama, kita siapkan kolomnya -->
      <div class="input-group">
        <label for="name">Nama Lengkap</label>
        <input
          type="text"
          id="name"
          bind:value={name}
          placeholder="Nama Kamu"
          required
        />
      </div>

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
          placeholder="Minimal 6 karakter"
          required
          minlength="6"
        />
      </div>

      <button
        type="submit"
        class="btn-primary"
        disabled={isLoading || successMessage !== ""}
      >
        {isLoading ? "Mendaftar..." : "Daftar Sekarang"}
      </button>
    </form>

    <div class="auth-footer">
      <p>Sudah punya akun? <a href="/login">Masuk di sini</a></p>
    </div>
  </div>
</div>

<style>
  /* Styling ini identik dengan halaman login agar konsisten */
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
    background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
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

  .alert-success {
    background-color: #dcfce7;
    color: #15803d;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 0.9rem;
    text-align: center;
    border: 1px solid #86efac;
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
    transition: all 0.2s;
    outline: none;
  }
  .input-group input:focus {
    border-color: #ec4899;
    box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.2);
  }

  .btn-primary {
    width: 100%;
    padding: 14px;
    background-color: #db2777;
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
    background-color: #be185d;
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
    color: #db2777;
    text-decoration: none;
    font-weight: 600;
  }
  .auth-footer a:hover {
    text-decoration: underline;
  }
</style>
