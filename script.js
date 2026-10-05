/*
  Birthday Gift Prototype
  -----------------------
  EVENT TRACKING:
  Mỗi lần bấm nút sẽ gọi trackEvent().
  Hiện tại TRACKING_URL để trống nên app chỉ ghi log trong trình duyệt.

  Khi có backend, chỉ cần điền:
      const TRACKING_URL = "https://...";

  Backend nhận JSON dạng:
      {
        event: "OPEN_GIFT",
        time: "2026-...",
        session: "...",
        page: 3
      }
*/

const TRACKING_URL = "";

const state = {
  screen: 1,
  session: getSessionId()
};

function getSessionId() {
  let id = localStorage.getItem("birthday_gift_session");
  if (!id) {
    id = "S" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    localStorage.setItem("birthday_gift_session", id);
  }
  return id;
}

async function trackEvent(event) {
  const payload = {
    event,
    time: new Date().toISOString(),
    session: state.session,
    page: state.screen,
    userAgent: navigator.userAgent
  };

  console.log("[TRACK]", payload);

  if (!TRACKING_URL) return;

  try {
    await fetch(TRACKING_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(payload),
      mode: "no-cors",
      keepalive: true
    });
  } catch (err) {
    console.warn("Tracking failed:", err);
  }
}

function showScreen(number) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const next = document.getElementById(`screen-${number}`);
  if (next) {
    next.classList.add("active");
    state.screen = number;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1800);
}

async function handleAction(action) {
  await trackEvent(action);

  switch (action) {
    case "OPEN_INSIDE":
      showScreen(2);
      break;

    case "OPEN_GIFT":
      showScreen(3);
      break;

    case "ACCEPT_GIFT":
      showScreen(4);
      break;

    case "REQUEST_REFUND":
      showScreen(5);

      // Khoảng thời gian này chính là "khoảng vàng" để người tặng
      // nhận được event REQUEST_REFUND và chuyển tiền thủ công.
      setTimeout(() => {
        document.getElementById("refund-loading").classList.add("hidden");
        document.getElementById("refund-done").classList.remove("hidden");
      }, 4500);
      break;

    case "WATCH_ME":
      showScreen(6);
      break;
  }
}

document.addEventListener("click", e => {
  const button = e.target.closest("[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  button.disabled = true;

  handleAction(action).finally(() => {
    setTimeout(() => button.disabled = false, 500);
  });
});

trackEvent("OPEN_PAGE");
