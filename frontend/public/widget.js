/**
 * Respondiq Embeddable Chat Widget
 * ================================
 * Usage: <script src="https://respondiq.web.app/widget.js" data-key="YOUR_API_KEY" async></script>
 *
 * No framework dependencies — vanilla JS + CSS.
 */
(function () {
  "use strict";

  // Find our script tag and get the API key
  var scripts = document.querySelectorAll('script[data-key]');
  var script = scripts[scripts.length - 1];
  var API_KEY = script && script.getAttribute("data-key");
  if (!API_KEY) {
    console.error("[Respondiq] Missing data-key attribute on script tag.");
    return;
  }

  var API_BASE = script.getAttribute("data-api") || script.src.replace("/widget.js", "").replace(/\/+$/, "");
  // If API_BASE looks like a CDN/hosting URL, use the backend URL instead
  if (API_BASE.includes("web.app") || API_BASE.includes("firebaseapp")) {
    API_BASE = "https://respondiq-api-171849161041.us-central1.run.app"; // Cloud Run backend
  }

  var config = null;
  var conversationId = null;
  var messages = [];
  var isOpen = false;
  var isStreaming = false;

  // ── Styles ──
  var STYLES = `
    #riq-widget * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #riq-bubble { position: fixed; bottom: 20px; right: 20px; width: 56px; height: 56px; border-radius: 50%; border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; z-index: 99999; transition: transform 0.2s; }
    #riq-bubble:hover { transform: scale(1.1); }
    #riq-bubble svg { width: 24px; height: 24px; fill: white; }
    #riq-chat { position: fixed; bottom: 20px; right: 20px; width: 380px; height: 520px; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.15); display: none; flex-direction: column; overflow: hidden; z-index: 99999; border: 1px solid #e5e7eb; }
    #riq-chat.open { display: flex; }
    #riq-header { padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }
    #riq-header-left { display: flex; align-items: center; gap: 8px; }
    #riq-header-avatar { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; }
    #riq-header-avatar svg { width: 16px; height: 16px; fill: white; }
    #riq-header-name { color: white; font-weight: 600; font-size: 14px; }
    #riq-close { background: none; border: none; color: rgba(255,255,255,0.8); cursor: pointer; padding: 4px; }
    #riq-close:hover { color: white; }
    #riq-close svg { width: 20px; height: 20px; }
    #riq-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .riq-msg { max-width: 75%; padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5; word-wrap: break-word; white-space: pre-wrap; }
    .riq-msg-user { align-self: flex-end; color: white; border-bottom-right-radius: 4px; }
    .riq-msg-bot { align-self: flex-start; background: #f3f4f6; color: #1f2937; border-bottom-left-radius: 4px; }
    .riq-welcome { text-align: center; color: #9ca3af; font-size: 14px; margin-top: 32px; }
    .riq-typing { display: flex; gap: 4px; padding: 10px 14px; }
    .riq-typing span { width: 8px; height: 8px; background: #d1d5db; border-radius: 50%; animation: riq-bounce 1.4s infinite; }
    .riq-typing span:nth-child(2) { animation-delay: 0.1s; }
    .riq-typing span:nth-child(3) { animation-delay: 0.2s; }
    @keyframes riq-bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
    #riq-input-area { padding: 12px; border-top: 1px solid #e5e7eb; }
    #riq-form { display: flex; gap: 8px; }
    #riq-input { flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; }
    #riq-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.2); }
    #riq-send { padding: 8px; border-radius: 8px; border: none; cursor: pointer; color: white; display: flex; align-items: center; justify-content: center; }
    #riq-send:disabled { opacity: 0.5; cursor: not-allowed; }
    #riq-send svg { width: 16px; height: 16px; fill: white; }
    #riq-powered { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 6px; }
    #riq-powered a { color: #9ca3af; text-decoration: none; }
    @media (max-width: 480px) {
      #riq-chat { width: 100vw; height: 100vh; bottom: 0; right: 0; border-radius: 0; }
    }
  `;

  // ── Icons ──
  var CHAT_ICON = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
  var CLOSE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var SEND_ICON = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';

  // ── Build DOM ──
  function init() {
    // Inject styles
    var style = document.createElement("style");
    style.textContent = STYLES;
    document.head.appendChild(style);

    // Container
    var widget = document.createElement("div");
    widget.id = "riq-widget";
    document.body.appendChild(widget);

    // Bubble
    var bubble = document.createElement("button");
    bubble.id = "riq-bubble";
    bubble.innerHTML = CHAT_ICON;
    bubble.onclick = function () { toggleChat(); };
    widget.appendChild(bubble);

    // Chat window
    var chat = document.createElement("div");
    chat.id = "riq-chat";
    chat.innerHTML = [
      '<div id="riq-header">',
      '  <div id="riq-header-left">',
      '    <div id="riq-header-avatar">' + CHAT_ICON + '</div>',
      '    <span id="riq-header-name">Assistant</span>',
      '  </div>',
      '  <button id="riq-close">' + CLOSE_ICON + '</button>',
      '</div>',
      '<div id="riq-messages"><div class="riq-welcome">Hi! How can I help you today?</div></div>',
      '<div id="riq-input-area">',
      '  <form id="riq-form">',
      '    <input id="riq-input" type="text" placeholder="Type your message..." autocomplete="off" />',
      '    <button id="riq-send" type="submit">' + SEND_ICON + '</button>',
      '  </form>',
      '  <div id="riq-powered">Powered by <a href="https://respondiq.web.app" target="_blank">Respondiq</a></div>',
      '</div>',
    ].join("\n");
    widget.appendChild(chat);

    // Events
    document.getElementById("riq-close").onclick = function () { toggleChat(); };
    document.getElementById("riq-form").onsubmit = function (e) {
      e.preventDefault();
      sendMessage();
    };

    // Load config
    loadConfig();
  }

  function toggleChat() {
    isOpen = !isOpen;
    var chat = document.getElementById("riq-chat");
    var bubble = document.getElementById("riq-bubble");
    if (isOpen) {
      chat.classList.add("open");
      bubble.style.display = "none";
      document.getElementById("riq-input").focus();
    } else {
      chat.classList.remove("open");
      bubble.style.display = "flex";
    }
  }

  function loadConfig() {
    fetch(API_BASE + "/api/chat/" + API_KEY + "/config")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        config = data;
        applyTheme(data.theme || {});
        if (data.name) {
          document.getElementById("riq-header-name").textContent = data.name;
        }
        if (data.theme && data.theme.welcome_message) {
          var welcome = document.querySelector(".riq-welcome");
          if (welcome) welcome.textContent = data.theme.welcome_message;
        }
      })
      .catch(function (err) {
        console.error("[Respondiq] Failed to load config:", err);
      });
  }

  function applyTheme(theme) {
    var primary = theme.primary_color || "#1e40af";
    var bg = theme.bg_color || "#ffffff";
    var text = theme.text_color || "#1f2937";
    var position = theme.position || "bottom-right";

    var bubble = document.getElementById("riq-bubble");
    var chat = document.getElementById("riq-chat");
    var header = document.getElementById("riq-header");
    var send = document.getElementById("riq-send");

    bubble.style.backgroundColor = primary;
    header.style.backgroundColor = primary;
    chat.style.backgroundColor = bg;
    send.style.backgroundColor = primary;

    if (position === "bottom-left") {
      bubble.style.right = "auto";
      bubble.style.left = "20px";
      chat.style.right = "auto";
      chat.style.left = "20px";
    }
  }

  function addMessage(role, content) {
    var container = document.getElementById("riq-messages");
    // Remove welcome message
    var welcome = container.querySelector(".riq-welcome");
    if (welcome) welcome.remove();

    var div = document.createElement("div");
    div.className = "riq-msg riq-msg-" + (role === "user" ? "user" : "bot");
    if (role === "user") {
      var primary = (config && config.theme && config.theme.primary_color) || "#1e40af";
      div.style.backgroundColor = primary;
    }
    div.textContent = content;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  }

  function showTyping() {
    var container = document.getElementById("riq-messages");
    var div = document.createElement("div");
    div.className = "riq-typing";
    div.id = "riq-typing";
    div.innerHTML = "<span></span><span></span><span></span>";
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById("riq-typing");
    if (el) el.remove();
  }

  function sendMessage() {
    var input = document.getElementById("riq-input");
    var text = input.value.trim();
    if (!text || isStreaming) return;

    input.value = "";
    addMessage("user", text);
    isStreaming = true;
    showTyping();

    fetch(API_BASE + "/api/chat/" + API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        conversation_id: conversationId,
      }),
    })
      .then(function (response) {
        hideTyping();
        var botDiv = addMessage("bot", "");
        var reader = response.body.getReader();
        var decoder = new TextDecoder();
        var botText = "";

        function read() {
          reader.read().then(function (result) {
            if (result.done) {
              isStreaming = false;
              return;
            }
            var chunk = decoder.decode(result.value);
            var lines = chunk.split("\n");
            for (var i = 0; i < lines.length; i++) {
              var line = lines[i];
              if (line.indexOf("data: ") !== 0) continue;
              try {
                var data = JSON.parse(line.substring(6));
                if (data.type === "meta") {
                  conversationId = data.conversation_id;
                } else if (data.type === "token") {
                  botText += data.content;
                  botDiv.textContent = botText;
                } else if (data.type === "done") {
                  isStreaming = false;
                }
              } catch (e) { /* skip */ }
            }
            var container = document.getElementById("riq-messages");
            container.scrollTop = container.scrollHeight;
            read();
          });
        }
        read();
      })
      .catch(function (err) {
        hideTyping();
        addMessage("bot", "Sorry, something went wrong. Please try again.");
        isStreaming = false;
        console.error("[Respondiq]", err);
      });
  }

  // ── Start ──
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
