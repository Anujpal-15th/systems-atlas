// Runs before paint so the saved theme never flashes.
try { const t = localStorage.getItem('sa:theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
