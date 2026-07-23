<script>
</script>

<!-- Navbar Sederhana -->
<nav class="navbar">
  <div class="nav-container">
    <h1 class="logo">Saving & Wishlist Tracker</h1>
    <div class="nav-links">
      <a href="/">Dashboard</a>
      <a href="/login">Login</a>
    </div>
  </div>
</nav>

<main class="container">
  <slot />
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f8fafc; /* Warna latar abu-abu sangat terang */
    color: #333;
  }

  .navbar {
    background-color: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1rem 0;
  }

  .nav-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    margin: 0;
    font-size: 1.2rem;
    color: #10b981;
  }

  .nav-links a {
    margin-left: 15px;
    text-decoration: none;
    color: #64748b;
    font-weight: 500;
  }

  .nav-links a:hover {
    color: #10b981;
  }

  .container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 20px;
  }
</style>
