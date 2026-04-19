(function () {
  const landingSeenKey = "roomiesplit:landing-seen";

  try {
    if (window.sessionStorage.getItem(landingSeenKey) === "true") {
      window.location.replace("/app.html");
      return;
    }

    window.sessionStorage.setItem(landingSeenKey, "true");
  } catch {
    // Storage can be unavailable in strict privacy modes; keep the landing usable.
  }

  const startButton = document.getElementById("get-started-btn");

  if (!startButton) {
    return;
  }

  startButton.addEventListener("click", function () {
    window.location.href = "/app.html";
  });
})();
