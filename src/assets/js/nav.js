(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  function close() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      close();
      toggle.focus();
    }
  });

  document.addEventListener("click", function (e) {
    if (
      nav.classList.contains("is-open") &&
      !nav.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      close();
    }
  });

  var mq = window.matchMedia("(min-width: 64em)");
  if (mq.addEventListener) mq.addEventListener("change", close);
})();
