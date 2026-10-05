/*
  Birthday Gift
  -------------
  TRACKING:
  Ghi từng thao tác vào Supabase.

  Không dùng Secret key.
  Chỉ sử dụng Publishable key ở phía trình duyệt.
*/

// ======================================================
// 1. SUPABASE CONFIG
// ======================================================

const SUPABASE_URL = "https://vuxadgebzknfzkdydehl.supabase.co";
const SUPABASE_KEY = "sb_publishable_HPqDcs3hviis4-w3Q8tjaA_WjnhlSTI";

const SUPABASE_TABLE = "gift_events";


// ======================================================
// 2. STATE
// ======================================================

const state = {
  screen: 1,
  session: getSessionId()
};


// ======================================================
// 3. SESSION ID
// ======================================================

function getSessionId() {
  let id = localStorage.getItem("birthday_gift_session");

  if (!id) {
    id =
      "S" +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8);

    localStorage.setItem("birthday_gift_session", id);
  }

  return id;
}


// ======================================================
// 4. TRACK EVENT
// ======================================================

async function trackEvent(event) {

  const payload = {
    event: event,
    visitor_id: state.session,
    page: state.screen,
    user_agent: navigator.userAgent
  };

  console.log("[TRACK]", payload);

  // Kiểm tra config
  if (
    !SUPABASE_URL ||
    SUPABASE_URL.includes("DÁN_PROJECT") ||
    !SUPABASE_KEY ||
    SUPABASE_KEY.includes("DÁN_PUBLISHABLE")
  ) {
    console.warn("[TRACK] Chưa cấu hình Supabase.");
    return;
  }

  try {

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Prefer": "return=minimal"
        },

        body: JSON.stringify(payload),

        keepalive: true
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "[TRACK] Supabase error:",
        response.status,
        errorText
      );

      return;
    }

    console.log("[TRACK] Saved to Supabase");

  } catch (err) {

    console.error("[TRACK] Network error:", err);

  }
}


// ======================================================
// 5. SHOW SCREEN
// ======================================================

function showScreen(number) {

  document
    .querySelectorAll(".screen")
    .forEach(s => s.classList.remove("active"));

  const next = document.getElementById(`screen-${number}`);

  if (next) {

    next.classList.add("active");

    state.screen = number;

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
}


// ======================================================
// 6. TOAST
// ======================================================

function toast(message) {

  const el = document.getElementById("toast");

  if (!el) return;

  el.textContent = message;

  el.classList.add("show");

  setTimeout(
    () => el.classList.remove("show"),
    1800
  );
}


// ======================================================
// 7. HANDLE ACTION
// ======================================================

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

      // Khoảng thời gian "khoảng vàng"
      // để người tặng nhận được event REQUEST_REFUND
      // và xử lý chuyển tiền thủ công.

      setTimeout(() => {

        const loading =
          document.getElementById("refund-loading");

        const done =
          document.getElementById("refund-done");

        if (loading) {
          loading.classList.add("hidden");
        }

        if (done) {
          done.classList.remove("hidden");
        }

      }, 15000);

      break;


    case "WATCH_ME":

      showScreen(6);

      break;
  }
}


// ======================================================
// 8. BUTTON CLICK HANDLER
// ======================================================

document.addEventListener("click", e => {

  const button =
    e.target.closest("[data-action]");

  if (!button) return;

  const action =
    button.dataset.action;

  button.disabled = true;

  handleAction(action).finally(() => {

    setTimeout(
      () => button.disabled = false,
      500
    );

  });

});


// ======================================================
// 9. OPEN WEBSITE
// ======================================================

trackEvent("OPEN_PAGE");
