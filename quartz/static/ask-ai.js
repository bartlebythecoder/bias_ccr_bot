(function () {
  var TURNSTILE_SITE_KEY = "0x4AAAAAAFLc1us0UDmm5D7Y";
  var PROXY_URL = "https://bias-ccr-wiki-proxy.netlify.app/.netlify/functions/ask";
  var CONTENT_INDEX_URL = new URL("contentIndex.json", document.currentScript.src).href;

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
    titleSpan.textContent = "BIAS CCR Wiki AI";
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
    welcomeMsg.textContent = "Hi! Ask me anything grounded in this wiki.";
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
    input.placeholder = "Type a question...";
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

    form.onsubmit = async function (e) {
      e.preventDefault();
      var question = input.value.trim();
      if (!question) return;

      var userBubble = document.createElement("div");
      userBubble.className = "ask-ai-msg user";
      userBubble.textContent = question;
      msgs.appendChild(userBubble);
      input.value = "";

      var botBubble = document.createElement("div");
      botBubble.className = "ask-ai-msg bot";
      botBubble.textContent = "Searching wiki and generating answer...";
      msgs.appendChild(botBubble);
      msgs.scrollTop = msgs.scrollHeight;

      var turnstileToken = "";
      if (window.turnstile && widgetId !== null) {
        turnstileToken = window.turnstile.getResponse(widgetId);
      }

      var contextSnippets = [];
      try {
        var indexRes = await fetch(CONTENT_INDEX_URL);
        if (indexRes.ok) {
          var indexData = await indexRes.json();
          var terms = question.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 2; });
          var scored = [];
          for (var key in indexData) {
            var item = indexData[key];
            var content = item.content || item.description || "";
            var title = item.title || key;
            var combined = (title + " " + content).toLowerCase();
            var score = 0;
            for (var i = 0; i < terms.length; i++) {
              if (combined.indexOf(terms[i]) !== -1) score++;
            }
            if (score > 0) {
              scored.push({ title: title, text: content.slice(0, 1000), score: score });
            }
          }
          scored.sort(function (a, b) { return b.score - a.score; });
          contextSnippets = scored.slice(0, 3).map(function (s) {
            return { title: s.title, text: s.text };
          });
        }
      } catch (err) {
        console.warn("Could not load local contentIndex:", err);
      }

      try {
        var res = await fetch(PROXY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: question, contextSnippets: contextSnippets, turnstileToken: turnstileToken })
        });
        var data = await res.json();
        if (res.ok && data.answer) {
          botBubble.textContent = data.answer;
        } else {
          botBubble.textContent = data.error || data.detail || "Error retrieving response.";
        }
      } catch (err) {
        botBubble.textContent = "Failed to communicate with proxy service.";
      }

      if (window.turnstile && widgetId !== null) {
        window.turnstile.reset(widgetId);
      }
      msgs.scrollTop = msgs.scrollHeight;
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidget);
  } else {
    initWidget();
  }
  document.addEventListener("nav", initWidget);
})();
