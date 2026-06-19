// Snowkap auth — stores JWT on successful sign-in, posts token to parent frame
(function () {
  "use strict";

  var PARENT_ORIGIN = window.PARENT_ORIGIN || "";

  function postToParent(msg) {
    if (!PARENT_ORIGIN) return;
    window.parent.postMessage(msg, PARENT_ORIGIN);
  }

  var form = document.getElementById("signin-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = form.email.value.trim();
    var password = form.password.value;

    fetch("/api/v1/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password }),
    })
      .then(function (res) {
        if (!res.ok) return res.json().then(function (d) { throw new Error(d.detail || "Sign in failed"); });
        return res.json();
      })
      .then(function (data) {
        localStorage.setItem("access_token", data.access_token);
        postToParent({ type: "AUTH_SUCCESS", token: data.access_token });
        window.location.href = "/dashboard";
      })
      .catch(function (err) {
        var alert = document.querySelector(".alert--error");
        if (!alert) {
          alert = document.createElement("div");
          alert.className = "alert alert--error";
          form.parentNode.insertBefore(alert, form);
        }
        alert.textContent = err.message;
      });
  });
})();
