(function () {
  var TURNSTILE_SITE_KEY = "0x4AAAAAAFLc1us0UDmm5D7Y";
  var PROXY_URL = "https://bias-ccr-wiki-proxy.netlify.app/.netlify/functions/ask";
  // This script is served from <site>/static/ask-ai.js, so the site root is one level up.
  var SITE_BASE_URL = new URL("../", document.currentScript.src).href;

  if (!document.getElementById("cf-turnstile-script")) {
    var cfScript = document.createElement("script");
    cfScript.id = "cf-turnstile-script";
    cfScript.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    cfScript.async = true;
    cfScript.defer = true;
    document.head.appendChild(cfScript);
  }

  if (!document.getElementById("ask-ai-styles")) {
    var style = document.createElement("style");
    style.id = "ask-ai-styles";
    style.textContent = [
      "#ask-ai-btn { position: fixed; bottom: 24px; right: 24px; background: #2563eb; color: #fff; border: none; border-radius: 9999px; padding: 12px 20px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.25); z-index: 99999; display: flex; align-items: center; gap: 8px; font-family: inherit; }",
      "#ask-ai-btn:hover { background: #1d4ed8; }",
      "#ask-ai-drawer { position: fixed; bottom: 80px; right: 24px; width: 360px; max-width: calc(100vw - 48px); height: 500px; max-height: calc(100vh - 120px); background: #ffffff; color: #111111; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: none; flex-direction: column; z-index: 99999; overflow: hidden; font-family: inherit; }",
      "#ask-ai-drawer.open { display: flex; }",
      ".ask-ai-header { padding: 12px 16px; background: #f3f4f6; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 14px; }",
      ".ask-ai-close { background: none; border: none; font-size: 18px; cursor: pointer; color: inherit; }",
      ".ask-ai-messages { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; font-size: 13px; line-height: 1.5; }",
      ".ask-ai-msg { padding: 8px 12px; border-radius: 8px; max-width: 85%; word-break: break-word; }",
      ".ask-ai-msg.user { background: #2563eb; color: #ffffff; align-self: flex-end; }",
      ".ask-ai-msg.bot { background: #f3f4f6; color: #111111; align-self: flex-start; }",
      ".ask-ai-form { padding: 10px; border-top: 1px solid #e5e7eb; display: flex; flex-direction: column; gap: 8px; }",
      ".ask-ai-form-row { display: flex; gap: 6px; }",
      ".ask-ai-input { flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; background: #ffffff; color: #111111; }",
      ".ask-ai-submit { background: #2563eb; color: #ffffff; border: none; border-radius: 6px; padding: 8px 14px; font-size: 13px; cursor: pointer; font-weight: 500; }",
      ".ask-ai-submit:disabled { background: #93c5fd; cursor: wait; }",
      ".ask-ai-answer { white-space: pre-wrap; }",
      ".ask-ai-sources { margin-top: 8px; padding-top: 6px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #4b5563; }",
      ".ask-ai-sources a { color: #2563eb; text-decoration: none; }",
      ".ask-ai-sources a:hover { text-decoration: underline; }",
      ".ask-ai-turnstile { display: flex; justify-content: center; }"
    ].join("\n");
    document.head.appendChild(style);
  }

  function initWidget() {
    if (document.getElementById("ask-ai-btn")) return;

    var btn = document.createElement("button");
    btn.id = "ask-ai-btn";
    btn.textContent = "BIAS CCR Bot";

    var drawer = document.createElement("div");
    drawer.id = "ask-ai-drawer";

    var header = document.createElement("div");
    header.className = "ask-ai-header";
    var titleSpan = document.createElement("span");
    titleSpan.textContent = "BIAS CCR Bot";
    var closeBtn = document.createElement("button");
    closeBtn.className = "ask-ai-close";
    closeBtn.id = "ask-ai-close";
    closeBtn.textContent = "x";
    header.appendChild(titleSpan);
    header.appendChild(closeBtn);

    var msgs = document.createElement("div");
    msgs.id = "ask-ai-msgs";
    msgs.className = "ask-ai-messages";
    var welcomeMsg = document.createElement("div");
    welcomeMsg.className = "ask-ai-msg bot";
    welcomeMsg.textContent = "BIAS CCR Bot online. Enter query.";
    msgs.appendChild(welcomeMsg);

    var form = document.createElement("form");
    form.id = "ask-ai-form";
    form.className = "ask-ai-form";

    var turnstileSlot = document.createElement("div");
    turnstileSlot.id = "cf-turnstile-slot";
    turnstileSlot.className = "ask-ai-turnstile";

    var formRow = document.createElement("div");
    formRow.className = "ask-ai-form-row";

    var input = document.createElement("input");
    input.id = "ask-ai-input";
    input.className = "ask-ai-input";
    input.placeholder = "Enter query...";
    input.required = true;
    input.autocomplete = "off";

    var submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className = "ask-ai-submit";
    submitBtn.textContent = "Ask";

    formRow.appendChild(input);
    formRow.appendChild(submitBtn);
    form.appendChild(turnstileSlot);
    form.appendChild(formRow);

    drawer.appendChild(header);
    drawer.appendChild(msgs);
    drawer.appendChild(form);

    document.body.appendChild(btn);
    document.body.appendChild(drawer);

    var widgetId = null;
    var renderTurnstile = function () {
      if (window.turnstile && widgetId === null) {
        widgetId = window.turnstile.render("#cf-turnstile-slot", {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "auto",
          size: "compact"
        });
      }
    };

    btn.onclick = function () {
      drawer.classList.toggle("open");
      renderTurnstile();
      if (drawer.classList.contains("open")) {
        input.focus();
      }
    };

    closeBtn.onclick = function () {
      drawer.classList.remove("open");
    };

    // When the Bot rejects a query for a missing or wrong access code, the input box
    // switches to asking for the code, then re-runs the query once the code is entered.
    var awaitingCode = false;
    var pendingQuestion = null;

    function setCodeMode(on) {
      awaitingCode = on;
      input.type = on ? "password" : "text";
      input.placeholder = on ? "Enter access code..." : "Enter query...";
    }

    function addBubble(kind, text) {
      var bubble = document.createElement("div");
      bubble.className = "ask-ai-msg " + kind;
      bubble.textContent = text;
      msgs.appendChild(bubble);
      msgs.scrollTop = msgs.scrollHeight;
      return bubble;
    }

    async function askBot(question) {
      var botBubble = addBubble("bot", "Searching the BIAS CCR files... this can take 10-20 seconds.");
      submitBtn.disabled = true;

      var turnstileToken = "";
      if (window.turnstile && widgetId !== null) {
        turnstileToken = window.turnstile.getResponse(widgetId);
      }

      // The proxy does its own research; it only needs the question.
      try {
        var res = await fetch(PROXY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: question, turnstileToken: turnstileToken, accessCode: loadAccessCode() })
        });
        var data = await res.json();
        if (res.status === 401 && data.code === "access_code") {
          botBubble.textContent = loadAccessCode()
            ? "Access code rejected. Enter the BIAS CCR access code."
            : "Access restricted. Enter the BIAS CCR access code.";
          saveAccessCode("");
          pendingQuestion = question;
          setCodeMode(true);
        } else if (res.ok && data.answer) {
          renderAnswer(botBubble, data.answer, data.sources);
        } else {
          botBubble.textContent = data.error || "Query failed. Please try again.";
        }
      } catch (err) {
        botBubble.textContent = "Connection to the BIAS CCR Bot failed. Please try again.";
      }

      submitBtn.disabled = false;
      if (window.turnstile && widgetId !== null) {
        window.turnstile.reset(widgetId);
      }
      msgs.scrollTop = msgs.scrollHeight;
      input.focus();
    }

    form.onsubmit = async function (e) {
      e.preventDefault();
      var value = input.value.trim();
      if (!value) return;
      input.value = "";

      if (awaitingCode) {
        addBubble("user", "••••••");
        saveAccessCode(value);
        setCodeMode(false);
        var question = pendingQuestion;
        pendingQuestion = null;
        if (question) await askBot(question);
        return;
      }

      addBubble("user", value);
      await askBot(value);
    };
  }

  // The access code is remembered in this browser so players enter it only once.
  // If browser storage is blocked, it lasts until the page is reloaded.
  var ACCESS_CODE_KEY = "biasCcrBotAccessCode";
  var accessCodeInMemory = "";

  function loadAccessCode() {
    try { return window.localStorage.getItem(ACCESS_CODE_KEY) || accessCodeInMemory; } catch (err) { return accessCodeInMemory; }
  }

  function saveAccessCode(code) {
    accessCodeInMemory = code;
    try {
      if (code) window.localStorage.setItem(ACCESS_CODE_KEY, code);
      else window.localStorage.removeItem(ACCESS_CODE_KEY);
    } catch (err) { /* storage unavailable: the in-memory copy is used instead */ }
  }

  function renderAnswer(bubble, answer, sources) {
    bubble.textContent = "";

    var answerEl = document.createElement("div");
    answerEl.className = "ask-ai-answer";
    answerEl.textContent = answer;
    bubble.appendChild(answerEl);

    if (!Array.isArray(sources) || sources.length === 0) return;

    var sourcesEl = document.createElement("div");
    sourcesEl.className = "ask-ai-sources";
    sourcesEl.appendChild(document.createTextNode("Files: "));
    sources.forEach(function (source, index) {
      if (index > 0) sourcesEl.appendChild(document.createTextNode(" · "));
      var link = document.createElement("a");
      link.href = new URL(source.slug, SITE_BASE_URL).href;
      link.textContent = source.title || source.slug;
      sourcesEl.appendChild(link);
    });
    bubble.appendChild(sourcesEl);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidget);
  } else {
    initWidget();
  }
  document.addEventListener("nav", initWidget);
})();
