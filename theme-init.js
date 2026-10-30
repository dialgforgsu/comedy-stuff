// Apply a saved theme before first paint so there's no flash. Kept as a file (not inline) so the CSP can forbid inline scripts.
try { var t = localStorage.getItem("theme"); if (t === "light" || t === "dark") document.documentElement.dataset.theme = t; } catch (e) {}
