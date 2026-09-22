/* JaniCrew forms: Formspree when an endpoint is configured, a readable mailto: otherwise.
   Also prefills the industry radio from ?industry=<slug>. */
(function () {
  var LABELS = {
    purpose: "Request",
    "areas[]": "Areas to cover",
    industry: "Industry",
    industry_other: "Industry (other)",
    additional_specs: "Regulations / special specs",
    "additional_services[]": "Additional services",
    additional_other: "Additional (other)",
    schedule: "Schedule",
    schedule_other: "Schedule (other)",
    facility_address: "Building address",
    facility_size: "Approximate size",
    best_time: "Best time to visit",
    name: "Name",
    company: "Company",
    email: "Email",
    phone: "Phone",
    preferred_contact: "Preferred contact",
    notes: "Notes",
    territory: "Territory",
    experience: "Experience",
    message: "Message"
  };
  var SKIP = { _gotcha: 1, _subject: 1, form_type: 1 };

  function prefillIndustry() {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get("industry");
    if (!slug) return;
    var radio = document.querySelector('input[name="industry"][data-slug="' + slug + '"]');
    if (radio) radio.checked = true;
  }

  function summarise(form) {
    var data = new FormData(form);
    var lines = [];
    var seen = {};
    data.forEach(function (value, key) {
      if (SKIP[key] || !String(value).trim()) return;
      if (seen[key]) {
        seen[key].push(value);
      } else {
        seen[key] = [value];
        lines.push(key);
      }
    });
    return lines
      .map(function (key) {
        return (LABELS[key] || key) + ": " + seen[key].join(", ");
      })
      .join("\n");
  }

  function setBusy(form, busy) {
    var btn = form.querySelector("[data-submit]");
    if (!btn) return;
    btn.disabled = busy;
    if (busy) {
      btn.dataset.label = btn.textContent;
      btn.textContent = "Sending…";
    } else if (btn.dataset.label) {
      btn.textContent = btn.dataset.label;
    }
  }

  function showError(form, show) {
    var box = form.querySelector("[data-form-error]");
    if (!box) return;
    box.hidden = !show;
    if (show) box.scrollIntoView({ block: "center" });
  }

  function wire(form) {
    var endpoint = form.dataset.endpoint;
    var thanks = form.dataset.thanks;
    var email = form.dataset.email;

    form.addEventListener("submit", function (e) {
      if (!form.checkValidity()) return; // let the browser show its validation UI
      var gotcha = form.querySelector('[name="_gotcha"]');
      if (gotcha && gotcha.value) {
        e.preventDefault();
        return;
      }

      if (!endpoint) {
        // Draft mode: compose a readable email instead of the browser's text/plain dump.
        e.preventDefault();
        var subject = (form.querySelector('[name="_subject"]') || {}).value || "JaniCrew website enquiry";
        var body = summarise(form);
        window.location.href =
          "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        return;
      }

      if (!window.fetch) return; // native POST to Formspree
      e.preventDefault();
      showError(form, false);
      setBusy(form, true);
      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Form service returned " + res.status);
          window.location.assign(thanks);
        })
        .catch(function () {
          setBusy(form, false);
          showError(form, true);
        });
    });
  }

  prefillIndustry();
  document.querySelectorAll("form[data-endpoint]").forEach(wire);
})();
