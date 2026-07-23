<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import WishlistCard from "$lib/components/WishlistCard.svelte";

  let wishlists = [];
  let isLoading = true;

  // State Profil
  let userName = "Pengguna";
  let userEmail = "email@domain.com";

  // State Edit Profil
  let isEditingProfile = false;
  let editName = "";
  let editEmail = "";
  let isSavingProfile = false;

  // State Form Tambah Wishlist
  let showForm = false;
  let newItemName = "";
  let newTargetPrice = "";
  let isSubmitting = false;

  // ==========================================
  // PERHITUNGAN RINGKASAN STATISTIK (REAKTIF)
  // ==========================================
  $: totalTarget = wishlists.reduce((sum, item) => sum + item.targetPrice, 0);
  $: totalSaved = wishlists.reduce((sum, item) => sum + item.savedAmount, 0);
  $: totalRemaining = wishlists.reduce((sum, item) => {
    const sisa = item.targetPrice - item.savedAmount;
    return sum + (sisa > 0 ? sisa : 0);
  }, 0);

  function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  }

  // Parser JWT Token
  function parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  onMount(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      goto("/login");
      return;
    }

    const savedName = localStorage.getItem("userName");
    const savedEmail = localStorage.getItem("userEmail");

    if (savedName && savedEmail) {
      userName = savedName;
      userEmail = savedEmail;
    } else {
      const userData = parseJwt(token);
      if (userData) {
        userName = userData.name || "Pengguna";
        userEmail = userData.email || "Email tidak tersedia";
      }
    }

    fetchWishlists(token);
  });

  function openEditProfile() {
    editName = userName;
    editEmail = userEmail;
    isEditingProfile = true;
  }

  async function handleSaveProfile(event) {
    event.preventDefault();
    if (!editName || !editEmail)
      return alert("Nama dan email tidak boleh kosong!");
    isSavingProfile = true;
    try {
      localStorage.setItem("userName", editName);
      localStorage.setItem("userEmail", editEmail);
      userName = editName;
      userEmail = editEmail;
      isEditingProfile = false;
    } catch (error) {
      console.error(error);
    } finally {
      isSavingProfile = false;
    }
  }

  async function fetchWishlists(token) {
    try {
      const response = await fetch("http://localhost:5000/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        wishlists = result.data;
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        goto("/login");
      }
    } catch (error) {
      console.error("Error koneksi:", error);
    } finally {
      isLoading = false;
    }
  }

  async function handleCreateWishlist(event) {
    event.preventDefault();
    if (!newItemName || !newTargetPrice) return alert("Wajib diisi!");
    const token = localStorage.getItem("token");
    isSubmitting = true;

    try {
      const response = await fetch("http://localhost:5000/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemName: newItemName,
          targetPrice: parseFloat(newTargetPrice),
        }),
      });

      if (response.ok) {
        newItemName = "";
        newTargetPrice = "";
        showForm = false;
        fetchWishlists(token);
      } else {
        const err = await response.json();
        alert(err.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      isSubmitting = false;
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    goto("/login");
  }

  function handleRefresh() {
    const token = localStorage.getItem("token");
    if (token) fetchWishlists(token);
  }
</script>

<div class="dashboard-container">
  <!-- 1. KARTU PROFIL USER -->
  <div class="profile-card premium-shadow">
    <div class="profile-left">
      <div class="avatar-gradient">{userName.charAt(0).toUpperCase()}</div>
      {#if !isEditingProfile}
        <div class="profile-info">
          <h2>Hai, <span>{userName}</span>! 👋</h2>
          <p>{userEmail}</p>
        </div>
      {:else}
        <form class="profile-edit-inline" on:submit={handleSaveProfile}>
          <input
            type="text"
            bind:value={editName}
            placeholder="Nama Lengkap"
            required
          />
          <input
            type="email"
            bind:value={editEmail}
            placeholder="Alamat Email"
            required
          />
          <div class="edit-buttons">
            <button
              type="submit"
              class="btn-primary-small"
              disabled={isSavingProfile}>Simpan</button
            >
            <button
              type="button"
              class="btn-secondary-small"
              on:click={() => (isEditingProfile = false)}>Batal</button
            >
          </div>
        </form>
      {/if}
    </div>

    <div class="profile-actions">
      {#if !isEditingProfile}
        <button class="btn-icon" on:click={openEditProfile} title="Edit Profil"
          >⚙️</button
        >
      {/if}
      <button class="btn-logout" on:click={handleLogout}>Keluar</button>
    </div>
  </div>

  <!-- 2. KARTU RINGKASAN STATISTIK TABUNGAN -->
  <div class="summary-container">
    <div class="summary-box premium-shadow">
      <div class="summary-icon icon-target">🎯</div>
      <div class="summary-text">
        <p>Total Target</p>
        <h4>{formatRupiah(totalTarget)}</h4>
      </div>
    </div>

    <div class="summary-box premium-shadow">
      <div class="summary-icon icon-saved">💰</div>
      <div class="summary-text">
        <p>Uang Terkumpul</p>
        <h4 class="text-saved">{formatRupiah(totalSaved)}</h4>
      </div>
    </div>

    <div class="summary-box premium-shadow">
      <div class="summary-icon icon-remaining">🚀</div>
      <div class="summary-text">
        <p>Sisa Kekurangan</p>
        <h4 class="text-remaining">{formatRupiah(totalRemaining)}</h4>
      </div>
    </div>
  </div>

  <!-- 3. HEADER SECTION WISHLIST -->
  <div class="dashboard-header">
    <div class="header-title-group">
      <h3 class="section-title">Target Tabungan</h3>
      <p class="section-subtitle">Wujudkan impianmu satu per satu</p>
    </div>
    <button class="btn-gradient" on:click={() => (showForm = !showForm)}>
      {showForm ? "✕ Batal" : "+ Target Baru"}
    </button>
  </div>

  <!-- 4. FORM TAMBAH BARANG IMPAN -->
  {#if showForm}
    <form class="add-form premium-shadow" on:submit={handleCreateWishlist}>
      <h4>🎯 Tambah Impian Baru</h4>
      <div class="form-row">
        <div class="form-group">
          <label for="itemNameInput">Nama Barang</label>
          <input
            id="itemNameInput"
            type="text"
            bind:value={newItemName}
            placeholder="Cth: Sepeda Lipat"
            required
          />
        </div>
        <div class="form-group">
          <label for="targetPriceInput">Target Harga (Rp)</label>
          <input
            id="targetPriceInput"
            type="number"
            bind:value={newTargetPrice}
            placeholder="Cth: 3500000"
            required
          />
        </div>
      </div>
      <button type="submit" class="btn-primary-large" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : "Mulai Menabung!"}
      </button>
    </form>
  {/if}

  <!-- 5. DAFTAR KARTU WISHLIST -->
  {#if isLoading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Memuat mimpimu...</p>
    </div>
  {:else if wishlists.length === 0}
    <div class="empty-state premium-shadow">
      <div class="empty-icon">🎒</div>
      <h4>Belum ada target impian</h4>
      <p>Mulai rencanakan apa yang ingin kamu beli di masa depan.</p>
    </div>
  {:else}
    <div class="wishlist-grid">
      {#each wishlists as item (item.id)}
        <WishlistCard
          id={item.id}
          itemName={item.itemName}
          targetPrice={item.targetPrice}
          savedAmount={item.savedAmount}
          on:updated={handleRefresh}
          on:deleted={handleRefresh}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap");

  :global(body) {
    background-color: #f8fafc;
    font-family: "Poppins", sans-serif;
    margin: 0;
    color: #1e293b;
  }

  .dashboard-container {
    max-width: 900px;
    margin: 40px auto;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .premium-shadow {
    box-shadow:
      0 10px 25px -5px rgba(0, 0, 0, 0.05),
      0 8px 10px -6px rgba(0, 0, 0, 0.01);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  /* KARTU PROFIL */
  .profile-card {
    background: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 30px;
    border-radius: 24px;
    margin-bottom: 24px;
    border: 1px solid #f1f5f9;
    flex-wrap: wrap;
    gap: 20px;
  }

  .profile-left {
    display: flex;
    align-items: center;
    gap: 20px;
    flex: 1;
    min-width: 240px;
  }

  .avatar-gradient {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
    color: white;
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.8rem;
    font-weight: 700;
    flex-shrink: 0;
    box-shadow: 0 8px 16px rgba(168, 85, 247, 0.25);
  }

  .profile-info h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #0f172a;
    word-break: break-word;
  }
  .profile-info h2 span {
    color: #060606;
  }
  .profile-info p {
    margin: 4px 0 0 0;
    color: #64748b;
    font-size: 0.95rem;
    word-break: break-all;
  }

  /* FORM EDIT PROFIL */
  .profile-edit-inline {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    width: 100%;
  }
  .profile-edit-inline input {
    padding: 10px 14px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-family: "Poppins";
    outline: none;
    transition: border 0.3s;
    font-size: 0.95rem;
  }
  .profile-edit-inline input:focus {
    border-color: #6366f1;
  }
  .edit-buttons {
    display: flex;
    gap: 8px;
  }

  .btn-primary-small {
    background: #6366f1;
    color: white;
    border: none;
    padding: 8px 18px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-secondary-small {
    background: #f1f5f9;
    color: #475569;
    border: none;
    padding: 8px 18px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  .profile-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .btn-icon {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    width: 44px;
    height: 44px;
    font-size: 1.2rem;
    cursor: pointer;
    transition: 0.2s;
  }
  .btn-icon:hover {
    background: #e2e8f0;
  }
  .btn-logout {
    background: #fff1f2;
    color: #e11d48;
    border: none;
    padding: 10px 20px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;
  }
  .btn-logout:hover {
    background: #ffe4e6;
  }

  /* RINGKASAN STATISTIK TABUNGAN */
  .summary-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }

  .summary-box {
    background: white;
    padding: 20px 24px;
    border-radius: 20px;
    border: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .summary-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.6rem;
    flex-shrink: 0;
  }

  .icon-target {
    background: #eff6ff;
    color: #3b82f6;
  }
  .icon-saved {
    background: #dcfce7;
    color: #10b981;
  }
  .icon-remaining {
    background: #ffe4e6;
    color: #f43f5e;
  }

  .summary-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .summary-text p {
    margin: 0 0 4px 0;
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 500;
  }
  .summary-text h4 {
    margin: 0;
    font-size: 1.2rem;
    color: #0f172a;
    font-weight: 700;
    word-break: break-all;
  }
  .text-saved {
    color: #10b981 !important;
  }
  .text-remaining {
    color: #f43f5e !important;
  }

  /* HEADER WISHLIST */
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
  }
  .section-title {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: #0f172a;
  }
  .section-subtitle {
    margin: 4px 0 0 0;
    color: #64748b;
    font-size: 0.95rem;
  }

  .btn-gradient {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    font-family: "Poppins";
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: 0.3s;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  .btn-gradient:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  }

  /* FORM TAMBAH BARU */
  .add-form {
    background: white;
    padding: 24px;
    border-radius: 20px;
    margin-bottom: 30px;
    border: 1px solid #f1f5f9;
    animation: fadeDown 0.4s ease-out;
  }
  @keyframes fadeDown {
    from {
      opacity: 0;
      transform: translateY(-15px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .add-form h4 {
    margin: 0 0 20px 0;
    font-size: 1.15rem;
    color: #0f172a;
  }

  .form-row {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .form-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 220px;
  }
  .form-group label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #475569;
  }
  .form-group input {
    padding: 12px 16px;
    border: 2px solid #f1f5f9;
    background: #f8fafc;
    border-radius: 12px;
    font-family: "Poppins";
    font-size: 0.95rem;
    outline: none;
    transition: 0.3s;
  }
  .form-group input:focus {
    border-color: #10b981;
    background: white;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
  }

  .btn-primary-large {
    background: #0f172a;
    color: white;
    border: none;
    padding: 14px;
    border-radius: 12px;
    font-family: "Poppins";
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    width: 100%;
    transition: 0.3s;
  }
  .btn-primary-large:hover {
    background: #334155;
  }

  /* GRID & STATE */
  .wishlist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .empty-state {
    text-align: center;
    background: white;
    padding: 50px 20px;
    border-radius: 24px;
    margin-top: 20px;
  }
  .empty-icon {
    font-size: 3.5rem;
    margin-bottom: 12px;
  }
  .empty-state h4 {
    margin: 0 0 8px 0;
    font-size: 1.15rem;
    color: #0f172a;
  }
  .empty-state p {
    margin: 0;
    color: #64748b;
    font-size: 0.9rem;
  }

  .loading-state {
    text-align: center;
    margin-top: 60px;
    color: #64748b;
  }
  .spinner {
    width: 36px;
    height: 36px;
    border: 4px solid #e2e8f0;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px auto;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* =================================================== */
  /* MEDIA QUERIES (SMARTPHONE) */
  /* =================================================== */

  /* Layar Tablet & Smartphone (< 768px) */
  @media (max-width: 768px) {
    .dashboard-container {
      margin: 20px auto;
      padding: 0 16px;
    }

    .profile-card {
      padding: 20px;
      gap: 16px;
    }

    .profile-left {
      gap: 14px;
    }

    .avatar-gradient {
      width: 52px;
      height: 52px;
      font-size: 1.4rem;
      border-radius: 16px;
    }

    .profile-info h2 {
      font-size: 1.25rem;
    }

    .summary-container {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .summary-box {
      padding: 16px;
      gap: 12px;
    }

    .summary-icon {
      width: 44px;
      height: 44px;
      font-size: 1.3rem;
      border-radius: 12px;
    }

    .summary-text h4 {
      font-size: 1.05rem;
    }
  }

  /* Layar hp Kecil (< 576px) */
  @media (max-width: 576px) {
    .profile-card {
      flex-direction: column;
      align-items: stretch;
    }

    .profile-actions {
      width: 100%;
      justify-content: space-between;
      border-top: 1px solid #f1f5f9;
      padding-top: 12px;
    }

    .btn-logout {
      flex: 1;
      text-align: center;
    }

    .summary-container {
      grid-template-columns: 1fr; /* 1 Kolom Penuh di HP */
    }

    .dashboard-header {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .btn-gradient {
      width: 100%;
      text-align: center;
    }

    .form-row {
      flex-direction: column;
      gap: 12px;
    }

    .form-group {
      min-width: 100%;
    }

    .wishlist-grid {
      grid-template-columns: 1fr; /* Kartu wishlist tampil 1 kolom penuh di HP */
    }
  }
</style>
