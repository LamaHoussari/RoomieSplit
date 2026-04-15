(function () {
  const startButton = document.getElementById("get-started-btn");

  if (!startButton) {
    return;
  }

  startButton.addEventListener("click", function () {
    window.location.href = "app.html";
  });
})();
