<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let id;
  export let itemName;
  export let targetPrice;
  export let savedAmount;

  let addAmountInput = "";
  let isUpdating = false;
  let isDeleting = false;

  $: remaining = targetPrice - savedAmount;
  $: progress =
    targetPrice > 0
      ? Math.min(Math.round((savedAmount / targetPrice) * 100), 100)
      : 0;
  $: isCompleted = progress >= 100; // Mendeteksi apakah tabungan sudah lunas

  function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  }

  async function handleAddSaving() {
    const amount = parseFloat(addAmountInput);
    if (!amount || amount <= 0) return alert("Masukkan nominal yang valid!");

    const token = localStorage.getItem("token");
    isUpdating = true;
    try {
      const response = await fetch(
        `http://localhost:5000/api/wishlist/${id}/save`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount }),
        },
      );
      if (response.ok) {
        const result = await response.json();
        savedAmount = result.data.savedAmount;
        addAmountInput = "";
        dispatch("updated");
      } else {
        const err = await response.json();
        alert(err.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      isUpdating = false;
    }
  }

  async function handleDelete() {
    if (!confirm(`Hapus "${itemName}" dari impianmu?`)) return;
    const token = localStorage.getItem("token");
    isDeleting = true;
    try {
      const response = await fetch(`http://localhost:5000/api/wishlist/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        dispatch("deleted");
      } else {
        const err = await response.json();
        alert(err.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      isDeleting = false;
    }
  }
</script>

<div class="card {isCompleted ? 'card-completed' : ''}">
  <div class="card-header">
    <div class="title-area">
      <h3 class="title">{itemName}</h3>
      {#if isCompleted}
        <span class="badge-lunas">🎉 TERCAPAI</span>
      {/if}
    </div>
    <div class="header-actions">
      <span
        class="badge-progress"
        style={isCompleted ? "background:#dcfce7; color:#166534;" : ""}
      >
        {progress}%
      </span>
      <button
        class="btn-delete"
        on:click={handleDelete}
        disabled={isDeleting}
        title="Hapus Impian">✕</button
      >
    </div>
  </div>

  <div class="card-body">
    <div class="price-info">
      <div class="price-row">
        <span class="label">Terkumpul</span>
        <strong class="value saved">{formatRupiah(savedAmount)}</strong>
      </div>
      <div class="price-row">
        <span class="label">Target Harga</span>
        <strong class="value target">{formatRupiah(targetPrice)}</strong>
      </div>
      {#if !isCompleted}
        <div class="price-row dashed-top">
          <span class="label">Kekurangan</span>
          <strong class="value remaining">{formatRupiah(remaining)}</strong>
        </div>
      {/if}
    </div>

    <div class="progress-container">
      <div class="progress-bar-bg">
        <div
          class="progress-bar-fill {isCompleted ? 'fill-completed' : ''}"
          style="width: {progress}%"
        ></div>
      </div>
    </div>

    {#if !isCompleted}
      <div class="action-area">
        <div class="input-wrapper">
          <span class="currency-symbol">Rp</span>
          <input
            type="number"
            bind:value={addAmountInput}
            placeholder="Nominal nabung..."
            class="saving-input"
            disabled={isUpdating}
          />
        </div>
        <button
          on:click={handleAddSaving}
          class="btn-save"
          disabled={isUpdating || !addAmountInput}
        >
          {isUpdating ? "..." : "Nabung"}
        </button>
      </div>
    {:else}
      <div class="completed-message">
        <p>Selamat! Uangnya sudah cukup untuk membeli ini.</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .card {
    background: white;
    border-radius: 24px;
    padding: 24px;
    border: 1px solid #f1f5f9;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease,
      border-color 0.3s ease;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    border-color: #e2e8f0;
  }

  /* Styling Khusus Jika Lunas */
  .card-completed {
    border: 2px solid #10b981;
    background: #f0fdf4;
    box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.15);
  }
  .card-completed:hover {
    border-color: #059669;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    gap: 10px;
  }
  .title-area {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.3;
  }

  .badge-lunas {
    background: #10b981;
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 8px;
    width: fit-content;
    letter-spacing: 0.5px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .badge-progress {
    background-color: #e0e7ff;
    color: #4f46e5;
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 700;
  }

  .btn-delete {
    background: #f1f5f9;
    border: none;
    color: #94a3b8;
    font-size: 1.1rem;
    width: 32px;
    height: 32px;
    border-radius: 10px;
    cursor: pointer;
    transition: 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .btn-delete:hover {
    color: #ef4444;
    background-color: #fee2e2;
    transform: scale(1.1);
  }

  .price-info {
    background: #f8fafc;
    padding: 16px;
    border-radius: 16px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .card-completed .price-info {
    background: white;
  } /* Beda warna kalau lunas */

  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.95rem;
  }
  .label {
    color: #64748b;
    font-weight: 500;
  }
  .value {
    font-weight: 700;
    font-size: 1.05rem;
  }

  .saved {
    color: #10b981;
    font-size: 1.15rem;
  }
  .target {
    color: #0f172a;
  }
  .dashed-top {
    border-top: 2px dashed #cbd5e1;
    padding-top: 10px;
    margin-top: 2px;
  }
  .remaining {
    color: #f43f5e;
  }

  .progress-container {
    margin-bottom: 20px;
  }
  .progress-bar-bg {
    width: 100%;
    height: 12px;
    background-color: #e2e8f0;
    border-radius: 99px;
    overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    border-radius: 99px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .fill-completed {
    background: linear-gradient(90deg, #10b981, #059669) !important;
  }

  /* Input Menabung Area */
  .action-area {
    display: flex;
    gap: 10px;
    align-items: stretch;
  }

  .input-wrapper {
    position: relative;
    flex: 1;
  }
  .currency-symbol {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .saving-input {
    width: 100%;
    padding: 12px 14px 12px 40px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-family: "Poppins";
    font-size: 0.95rem;
    font-weight: 600;
    outline: none;
    transition: 0.3s;
    box-sizing: border-box;
  }
  .saving-input:focus {
    border-color: #6366f1;
    background: white;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }

  .btn-save {
    background: #6366f1;
    color: white;
    border: none;
    padding: 0 20px;
    border-radius: 12px;
    font-family: "Poppins";
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: 0.3s;
    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
  }
  .btn-save:hover:not(:disabled) {
    background-color: #4f46e5;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(99, 102, 241, 0.4);
  }
  .btn-save:disabled {
    background: #cbd5e1;
    color: #94a3b8;
    box-shadow: none;
    cursor: not-allowed;
  }

  .completed-message {
    text-align: center;
    color: #059669;
    font-weight: 600;
    padding: 12px;
    background: #dcfce7;
    border-radius: 12px;
    font-size: 0.95rem;
  }
  .completed-message p {
    margin: 0;
  }
</style>
