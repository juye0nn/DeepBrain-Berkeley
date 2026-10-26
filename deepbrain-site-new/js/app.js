/* ==========================================================================
   DeepBrain — site behaviour
   --------------------------------------------------------------------------
   Four things live in here, in this order:
     1. Theme toggle
     2. Router (which of the three views is showing)
     3. Member sign-in
     4. Roster console

   You should not need to touch this file to run the club. Text lives in
   index.html; the roster lives in data/members.js.
   ========================================================================== */

(function () {
  "use strict";

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* Storage that never throws — private windows and blocked site data are normal. */
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { window.localStorage.removeItem(k); } catch (e) {} },
    sGet: function (k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
    sSet: function (k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) {} },
    sDel: function (k) { try { window.sessionStorage.removeItem(k); } catch (e) {} }
  };

  var KEY_THEME  = "deepbrain.theme";
  var KEY_DRAFT  = "deepbrain.roster.draft";
  var KEY_MEMBER = "deepbrain.session";
  var KEY_ADMIN  = "deepbrain.officer";

  var ROSTER = window.DEEPBRAIN_ROSTER || { updated: "", adminKey: "", members: [] };

  /* ======================================================================
     1. THEME
     ====================================================================== */

  var themeBtn = $("#themeToggle");

  function applyTheme(t) {
    if (t === "dark" || t === "light") {
      document.documentElement.setAttribute("data-theme", t);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    if (themeBtn) {
      themeBtn.textContent = t === "dark" ? "☾" : t === "light" ? "☀" : "◐";
      themeBtn.title = "Theme: " + (t || "system") + " — click to change";
    }
  }

  applyTheme(store.get(KEY_THEME) || "");

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var order = ["", "light", "dark"];
      var now = store.get(KEY_THEME) || "";
      var next = order[(order.indexOf(now) + 1) % order.length];
      if (next) { store.set(KEY_THEME, next); } else { store.del(KEY_THEME); }
      applyTheme(next);
    });
  }

  /* ======================================================================
     2. ROUTER
     Hashes beginning "#/" pick a view. Everything else is a normal
     in-page anchor on the home view.
     ====================================================================== */

  var views = {
    home:    $("#view-home"),
    members: $("#view-members"),
    admin:   $("#view-admin")
  };

  function route() {
    var h = window.location.hash || "";
    var name = "home";
    if (h.indexOf("#/") === 0) {
      var seg = h.slice(2).split(/[?#]/)[0];
      if (seg === "members" || seg === "admin") { name = seg; }
    }

    Object.keys(views).forEach(function (k) {
      if (views[k]) { views[k].hidden = (k !== name); }
    });

    $$(".nav a").forEach(function (a) {
      var target = a.getAttribute("href");
      if (target === "#/members" && name === "members") {
        a.setAttribute("aria-current", "page");
      } else {
        a.removeAttribute("aria-current");
      }
    });

    if (name === "members") { renderMemberView(); }
    if (name === "admin")   { renderAdminView(); }

    if (name === "home" && h && h.indexOf("#/") !== 0) {
      var el = document.getElementById(h.slice(1));
      if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    }
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", route);

  /* ======================================================================
     3. SHARED HELPERS
     ====================================================================== */

  function normName(s) {
    return String(s || "")
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[.'`’-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* Word order should not matter: "Jeon Juyeon" === "Juyeon Jeon". */
  function nameKey(s) {
    return normName(s).split(" ").filter(Boolean).sort().join(" ");
  }

  function normEmail(s) { return String(s || "").trim().toLowerCase(); }

  function isBerkeley(email) { return /@berkeley\.edu$/.test(normEmail(email)); }

  function maskEmail(email) {
    var e = normEmail(email);
    var at = e.indexOf("@");
    if (at < 1) { return "•••"; }
    var local = e.slice(0, at), dom = e.slice(at);
    if (local.length <= 2) { return local[0] + "•" + dom; }
    return local[0] + new Array(Math.min(local.length - 1, 7)).join("•") + local[local.length - 1] + dom;
  }

  function sha256(text) {
    if (!window.crypto || !window.crypto.subtle) { return Promise.resolve(null); }
    var bytes = new TextEncoder().encode(text);
    return window.crypto.subtle.digest("SHA-256", bytes).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ("0" + b.toString(16)).slice(-2);
      }).join("");
    }).catch(function () { return null; });
  }

  function say(el, kind, html) {
    if (!el) { return; }
    if (!html) { el.hidden = true; el.innerHTML = ""; return; }
    el.className = "msg msg-" + kind;
    el.innerHTML = html;
    el.hidden = false;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ======================================================================
     4. MEMBER SIGN-IN
     ====================================================================== */

  var loginForm  = $("#loginForm");
  var loginMsg   = $("#loginMsg");
  var loginBlock = $("#loginBlock");
  var memberBlock = $("#memberBlock");

  /* The roster that sign-in checks against is always the published one in
     data/members.js — never an officer's unsaved draft. */
  function publishedMembers() { return ROSTER.members || []; }

  function findByEmail(email) {
    var target = normEmail(email);
    var plain = publishedMembers().filter(function (m) {
      return m.email && normEmail(m.email) === target;
    });
    if (plain.length) { return Promise.resolve(plain[0]); }

    var hashed = publishedMembers().filter(function (m) { return m.emailHash; });
    if (!hashed.length) { return Promise.resolve(null); }

    return sha256(target).then(function (h) {
      if (!h) { return null; }
      for (var i = 0; i < hashed.length; i++) {
        if (String(hashed[i].emailHash).toLowerCase() === h) { return hashed[i]; }
      }
      return null;
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name  = $("#loginName").value;
      var email = $("#loginEmail").value;

      if (!isBerkeley(email)) {
        say(loginMsg, "err", "That is not a Berkeley address. Use the <strong>@berkeley.edu</strong> email an officer has on file.");
        return;
      }

      say(loginMsg, "info", "Checking the roster…");

      findByEmail(email).then(function (member) {
        if (!member) {
          say(loginMsg, "err",
            "That email is not on the roster yet. If you have signed up, an officer still has to add you.");
          return;
        }
        if (nameKey(member.name) !== nameKey(name)) {
          say(loginMsg, "err",
            "We found that email, but the name does not match the roster. Try the name your officer has on file, " +
            "or ask them to correct the spelling.");
          return;
        }
        if ((member.status || "active") !== "active") {
          say(loginMsg, "err",
            "Your roster entry is marked <strong>" + esc(member.status) + "</strong>, so it cannot sign in yet. " +
            "An officer can switch it to active.");
          return;
        }

        store.sSet(KEY_MEMBER, JSON.stringify({
          id: member.id || "",
          name: member.name,
          role: member.role || "member",
          cohort: member.cohort || ""
        }));
        say(loginMsg, "", "");
        loginForm.reset();
        renderMemberView();
      });
    });
  }

  var signOutBtn = $("#signOut");
  if (signOutBtn) {
    signOutBtn.addEventListener("click", function () {
      store.sDel(KEY_MEMBER);
      renderMemberView();
    });
  }

  function currentMember() {
    try { return JSON.parse(store.sGet(KEY_MEMBER) || "null"); } catch (e) { return null; }
  }

  function renderMemberView() {
    var me = currentMember();
    if (!loginBlock || !memberBlock) { return; }
    loginBlock.hidden  = !!me;
    memberBlock.hidden = !me;
    if (!me) { return; }

    $("#whoName").textContent = me.name;
    var bits = [];
    if (me.role)   { bits.push(me.role); }
    if (me.cohort) { bits.push(me.cohort); }
    if (me.id)     { bits.push(me.id); }
    $("#whoMeta").textContent = bits.length ? "· " + bits.join(" · ") : "";
    var adminLink = $("#whoAdmin");
    if (adminLink) { adminLink.hidden = (me.role !== "officer" && me.role !== "lead"); }
  }

  /* ======================================================================
     5. ROSTER CONSOLE
     ====================================================================== */

  var adminGate  = $("#adminGate");
  var adminPanel = $("#adminPanel");
  var adminForm  = $("#adminForm");
  var adminMsg   = $("#adminMsg");
  var rosterBody = $("#rosterBody");
  var draftFlag  = $("#draftFlag");

  var working = null;   /* the editable copy */
  var editingId = null;

  function loadWorking() {
    var draft = store.get(KEY_DRAFT);
    if (draft) {
      try {
        var parsed = JSON.parse(draft);
        if (parsed && Array.isArray(parsed.members)) { return parsed; }
      } catch (e) {}
    }
    return JSON.parse(JSON.stringify({
      updated: ROSTER.updated || "",
      adminKey: ROSTER.adminKey || "",
      members: publishedMembers()
    }));
  }

  function saveWorking() {
    working.updated = new Date().toISOString().slice(0, 10);
    store.set(KEY_DRAFT, JSON.stringify(working));
    renderRoster();
  }

  function isDirty() {
    return JSON.stringify(working.members) !== JSON.stringify(publishedMembers());
  }

  function nextId() {
    var max = 0;
    working.members.forEach(function (m) {
      var n = parseInt(String(m.id || "").replace(/\D+/g, ""), 10);
      if (n > max) { max = n; }
    });
    return "db-" + ("000" + (max + 1)).slice(-4);
  }

  if (adminForm) {
    adminForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var key = $("#adminKey").value;
      if (!ROSTER.adminKey) {
        say(adminMsg, "err", "No <code>adminKey</code> is set in data/members.js, so the console cannot open.");
        return;
      }
      if (key !== ROSTER.adminKey) {
        say(adminMsg, "err", "That key does not match.");
        return;
      }
      store.sSet(KEY_ADMIN, "1");
      say(adminMsg, "", "");
      adminForm.reset();
      renderAdminView();
    });
  }

  function renderAdminView() {
    if (!adminGate || !adminPanel) { return; }
    var open = store.sGet(KEY_ADMIN) === "1";
    adminGate.hidden = open;
    adminPanel.hidden = !open;
    if (!open) { return; }
    if (!working) { working = loadWorking(); }
    renderRoster();
  }

  function renderRoster() {
    if (!rosterBody) { return; }

    var q = normName($("#rosterSearch") ? $("#rosterSearch").value : "");
    var rows = working.members.filter(function (m) {
      if (!q) { return true; }
      return normName([m.name, m.email, m.emailMasked, m.role, m.cohort, m.status, m.notes, m.id].join(" ")).indexOf(q) !== -1;
    });

    /* stats */
    var byStatus = { active: 0, pending: 0, alumni: 0 };
    working.members.forEach(function (m) {
      var s = m.status || "active";
      if (byStatus[s] === undefined) { byStatus[s] = 0; }
      byStatus[s]++;
    });
    var officers = working.members.filter(function (m) { return m.role === "officer" || m.role === "lead"; }).length;

    $("#adminStats").innerHTML =
      stat(working.members.length, "on roster") +
      stat(byStatus.active, "active") +
      stat(byStatus.pending, "pending") +
      stat(byStatus.alumni, "alumni") +
      stat(officers, "officers / leads") +
      stat(working.updated || "—", "list updated");

    /* dirty banner */
    if (draftFlag) {
      if (isDirty()) {
        say(draftFlag, "info",
          "You have unsaved changes. They live in <strong>this browser only</strong> until you " +
          "<strong>Export</strong> and paste the result into <code>data/members.js</code>.");
      } else {
        say(draftFlag, "", "");
      }
    }

    /* table */
    if (!rows.length) {
      rosterBody.innerHTML = '<tr class="empty-row"><td colspan="7">' +
        (working.members.length ? "Nothing matches that search." : "The roster is empty. Add your first member.") +
        "</td></tr>";
      return;
    }

    rosterBody.innerHTML = rows.map(function (m) {
      var status = m.status || "active";
      var email = m.email ? esc(m.email) : (m.emailMasked ? esc(m.emailMasked) + " <span class=\"chip\">hashed</span>" : "—");
      return "<tr>" +
        '<td><strong>' + esc(m.name || "—") + "</strong><br>" +
          '<span class="c-mono">' + esc(m.id || "") + "</span></td>" +
        '<td class="c-mono">' + email + "</td>" +
        "<td>" + esc(m.role || "member") + "</td>" +
        '<td class="c-mono">' + esc(m.cohort || "—") + "</td>" +
        '<td><span class="dot dot-' + esc(status) + '"></span>' + esc(status) + "</td>" +
        '<td class="c-mono">' + esc(m.joined || "—") + "</td>" +
        '<td class="c-act">' +
          '<button class="btn btn-sm" type="button" data-edit="' + esc(m.id) + '">Edit</button> ' +
          '<button class="btn btn-sm btn-danger" type="button" data-del="' + esc(m.id) + '">Remove</button>' +
        "</td></tr>";
    }).join("");
  }

  function stat(value, label) {
    return '<div class="stat"><b>' + esc(value) + "</b><span>" + esc(label) + "</span></div>";
  }

  /* --- table actions --- */

  if (rosterBody) {
    rosterBody.addEventListener("click", function (ev) {
      var edit = ev.target.getAttribute && ev.target.getAttribute("data-edit");
      var del  = ev.target.getAttribute && ev.target.getAttribute("data-del");
      if (edit) { openEditor(edit); }
      if (del) {
        var m = working.members.filter(function (x) { return x.id === del; })[0];
        if (!m) { return; }
        ask("Remove " + (m.name || "this member") + " from the roster? This only changes your draft until you export.", "Remove", function () {
          working.members = working.members.filter(function (x) { return x.id !== del; });
          if (editingId === del) { closeEditor(); }
          saveWorking();
          toast("Removed from draft");
        });
      }
    });
  }

  var searchBox = $("#rosterSearch");
  if (searchBox) { searchBox.addEventListener("input", renderRoster); }

  var addBtn = $("#addMember");
  if (addBtn) {
    addBtn.addEventListener("click", function () {
      working.members.push({
        id: nextId(),
        name: "",
        email: "",
        role: "member",
        cohort: ROSTER.members && ROSTER.members[0] ? (ROSTER.members[0].cohort || "") : "",
        status: "active",
        joined: new Date().toISOString().slice(0, 10),
        notes: ""
      });
      var created = working.members[working.members.length - 1].id;
      saveWorking();
      openEditor(created);
    });
  }

  /* --- editor --- */

  var editorPanel = $("#editorPanel");
  var editorForm  = $("#editorForm");

  function openEditor(id) {
    var m = working.members.filter(function (x) { return x.id === id; })[0];
    if (!m || !editorPanel) { return; }
    editingId = id;
    $("#editorTitle").textContent = m.name ? "Edit member" : "New member";
    $("#editorId").textContent = m.id;
    $("#fName").value   = m.name || "";
    $("#fEmail").value  = m.email || "";
    $("#fRole").value   = m.role || "member";
    $("#fCohort").value = m.cohort || "";
    $("#fStatus").value = m.status || "active";
    $("#fJoined").value = m.joined || "";
    $("#fNotes").value  = m.notes || "";
    editorPanel.hidden = false;
    editorPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    $("#fName").focus();
  }

  function closeEditor() {
    editingId = null;
    if (editorPanel) { editorPanel.hidden = true; }
  }

  if (editorForm) {
    editorForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var m = working.members.filter(function (x) { return x.id === editingId; })[0];
      if (!m) { return; }
      m.name   = $("#fName").value.trim();
      m.email  = normEmail($("#fEmail").value);
      m.role   = $("#fRole").value;
      m.cohort = $("#fCohort").value.trim();
      m.status = $("#fStatus").value;
      m.joined = $("#fJoined").value;
      m.notes  = $("#fNotes").value.trim();
      /* an edited address replaces any old hash */
      delete m.emailHash;
      delete m.emailMasked;
      closeEditor();
      saveWorking();
    });
  }

  var editorCancel = $("#editorCancel");
  if (editorCancel) {
    editorCancel.addEventListener("click", function () {
      var m = working.members.filter(function (x) { return x.id === editingId; })[0];
      /* a brand-new row that was never filled in should not linger */
      if (m && !m.name && !m.email) {
        working.members = working.members.filter(function (x) { return x.id !== editingId; });
        closeEditor();
        saveWorking();
        return;
      }
      closeEditor();
    });
  }

  /* --- protect emails --- */

  var protectBtn = $("#protectEmails");
  if (protectBtn) {
    protectBtn.addEventListener("click", function () {
      var plain = working.members.filter(function (m) { return m.email; });
      if (!plain.length) {
        toast("Every address on the roster is already protected");
        return;
      }
      if (!window.crypto || !window.crypto.subtle) {
        toast("Hashing needs a secure page (https:// or localhost)");
        return;
      }
      ask("Replace " + plain.length + " email address(es) with a one-way hash? Sign-in keeps working the same, " +
          "but you will no longer be able to read the addresses back out of the file. Keep your own copy somewhere private first.",
          "Protect emails", function () {
        Promise.all(plain.map(function (m) {
          return sha256(normEmail(m.email)).then(function (h) {
            if (!h) { return; }
            m.emailHash = h;
            m.emailMasked = maskEmail(m.email);
            delete m.email;
          });
        })).then(function () {
          saveWorking();
          toast("Emails protected. Export and publish to make it live");
        });
      });
    });
  }

  /* --- discard --- */

  var revertBtn = $("#revertRoster");
  if (revertBtn) {
    revertBtn.addEventListener("click", function () {
      if (!isDirty()) { toast("Nothing to discard: your draft matches the published roster"); return; }
      ask("Throw away every change since the last export?", "Discard changes", function () {
        store.del(KEY_DRAFT);
        working = loadWorking();
        closeEditor();
        renderRoster();
        toast("Changes discarded");
      });
    });
  }

  /* --- export --- */

  var exportPanel = $("#exportPanel");

  function buildFile() {
    var head = [
      "/* ==========================================================================",
      "   DeepBrain — member database",
      "   Generated by the roster console on " + new Date().toISOString().slice(0, 10) + ".",
      "   Paste this over the whole contents of data/members.js and publish.",
      "   ========================================================================== */",
      "",
      "window.DEEPBRAIN_ROSTER = {"
    ].join("\n");

    var body = [
      '  updated: ' + JSON.stringify(working.updated || new Date().toISOString().slice(0, 10)) + ",",
      '  adminKey: ' + JSON.stringify(working.adminKey || ROSTER.adminKey || "") + ",",
      "  members: [",
      working.members.map(function (m) {
        var keys = ["id", "name", "email", "emailHash", "emailMasked", "role", "cohort", "status", "joined", "notes"];
        var lines = keys.filter(function (k) { return m[k] !== undefined && m[k] !== ""; })
          .map(function (k) { return "      " + k + ": " + JSON.stringify(m[k]); });
        return "    {\n" + lines.join(",\n") + "\n    }";
      }).join(",\n"),
      "  ]"
    ].join("\n");

    return head + "\n" + body + "\n};\n";
  }

  /* The Claude-artifact viewer blocks downloads a page starts itself, so on
     that host the download link is dead — hide it and lean on Copy instead.
     On your own hosting (GitHub Pages, Netlify, localhost) it works normally. */
  var inArtifactViewer = !!(window.claude && typeof window.claude.use === "function");
  if (inArtifactViewer) {
    var dlEl = $("#downloadExport");
    if (dlEl) { dlEl.hidden = true; }
  }

  var exportBtn = $("#exportRoster");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      var text = buildFile();
      $("#exportText").value = text;
      var dl = $("#downloadExport");
      if (dl && !inArtifactViewer) { dl.href = "data:text/javascript;charset=utf-8," + encodeURIComponent(text); }
      exportPanel.hidden = false;
      exportPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      $("#exportText").focus();
      $("#exportText").select();
    });
  }

  var copyBtn = $("#copyExport");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var ta = $("#exportText");
      ta.focus(); ta.select();
      var done = function () { copyBtn.textContent = "Copied"; setTimeout(function () { copyBtn.textContent = "Copy to clipboard"; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ta.value).then(done, function () { try { document.execCommand("copy"); done(); } catch (e) {} });
      } else {
        try { document.execCommand("copy"); done(); } catch (e) {}
      }
    });
  }

  var closeExportBtn = $("#closeExport");
  if (closeExportBtn) { closeExportBtn.addEventListener("click", function () { exportPanel.hidden = true; }); }

  /* ======================================================================
     5b. PAGE CONTENT — fills the home page from data/content.js.
     To change text, edit data/content.js, not this function.
     ====================================================================== */

  function renderContent() {
    var C = window.DEEPBRAIN_CONTENT;
    if (!C) { return; }
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var set = function (id, html) { var el = document.getElementById(id); if (el) { el.innerHTML = html; } };

    set("facts", (C.facts || []).map(function (f) {
      return "<div><dt>" + esc(f.label) + "</dt><dd>" + esc(f.value) + "</dd></div>";
    }).join(""));

    var P = C.projects || [];
    set("projHeading", esc(C.projectsHeading || "Projects"));
    set("projNote", esc(C.projectsNote || ""));
    set("projIndex", P.map(function (p, i) {
      return '<a href="#p' + (i + 1) + '"><b>' + pad(i + 1) + "</b>" + esc(p.area) + "</a>";
    }).join(""));
    set("projGrid", P.map(function (p, i) {
      return '<article class="proj' + (p.tag ? " proj-open" : "") + '" id="p' + (i + 1) + '">' +
        '<header class="proj-top"><span class="proj-n">' + pad(i + 1) + '</span><span class="proj-area">' + esc(p.area) + "</span>" +
          (p.tag ? '<span class="chip chip-accent">' + esc(p.tag) + "</span>" : "") + "</header>" +
        "<h3>" + esc(p.title) + "</h3>" +
        '<p class="proj-idea">' + (p.ideaBold ? "<strong>" + esc(p.ideaBold) + "</strong> " : "") + esc(p.idea || "") + "</p>" +
        '<dl class="proj-meta">' +
          (p.project ? "<div><dt>The project</dt><dd>" + esc(p.project) + "</dd></div>" : "") +
          (p.start ? "<div><dt>Where to start</dt><dd>" + esc(p.start) + "</dd></div>" : "") +
        "</dl>" +
        (p.linkUrl ? '<a class="proj-link" href="' + esc(p.linkUrl) + '" target="_blank" rel="noopener">' + esc(p.linkText || "Link") + ' <span aria-hidden="true">↗</span></a>' : "") +
        "</article>";
    }).join(""));

    set("phases", (C.phases || []).map(function (ph) {
      return '<li class="phase" data-start="' + esc(ph.start) + '" data-end="' + esc(ph.end) + '">' +
        '<span class="phase-when">' + esc(ph.when) + "</span><h3>" + esc(ph.title) + "</h3><p>" + esc(ph.text) + "</p></li>";
    }).join(""));
    var note = document.getElementById("phasesNote");
    if (note) { note.textContent = C.phasesNote || ""; note.hidden = !C.phasesNote; }

    set("sched", (C.schedule || []).map(function (r) {
      return '<li><span class="sched-when">' + esc(r.when) + "</span><div><h3>" + esc(r.title) + "</h3><p>" + esc(r.text) + "</p></div></li>";
    }).join(""));

    var S = C.signup || {}, open = !!S.open;
    set("signupBox",
      '<div class="closed-copy">' +
        '<p class="label label-accent"><span class="node"></span>' + esc(open ? S.openLabel : S.closedLabel) + "</p>" +
        "<h2>" + esc(open ? S.openTitle : S.closedTitle) + "</h2>" +
        "<p>" + esc(open ? S.openText : S.closedText) + "</p>" +
        (open && S.signupUrl ? '<div class="actions"><a class="btn btn-primary" href="' + esc(S.signupUrl) + '" target="_blank" rel="noopener">' + esc(S.signupButton || "Sign up") + ' <span aria-hidden="true">↗</span></a></div>' : "") +
      "</div>" +
      (C.contact ? '<p class="note"><strong>Questions?</strong> ' + esc(C.contact) + "</p>" : ""));
    var box = document.getElementById("signupBox");
    if (box) { box.classList.toggle("is-open", open); }
    $$('a[href="#involved"]').forEach(function (a) { a.textContent = open ? "Join" : "Next semester"; });
  }

  /* ======================================================================
     6. TIMELINE — highlights the current phase and closes past deadlines.
     Phase dates live on each <li class="phase"> as data-start / data-end;
     deadlines on <li data-deadline="YYYY-MM-DD">. EDIT them in index.html.
     ====================================================================== */

  function day(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }

  function renderTimeline() {
    var now = new Date(); now.setHours(0, 0, 0, 0);
    var label = $("#phaseNow"), current = null;

    $$(".phase").forEach(function (li) {
      var s = day(li.getAttribute("data-start")), e = day(li.getAttribute("data-end"));
      li.classList.remove("is-past", "is-now");
      if (now > e) { li.classList.add("is-past"); }
      else if (now >= s) { li.classList.add("is-now"); current = li; }
      var bar = li.querySelector(".phase-bar") || document.createElement("span");
      bar.className = "phase-bar";
      var f = now < s ? 0 : now > e ? 100 : Math.round((now - s) / (e - s + 864e5) * 100);
      bar.style.setProperty("--fill", f + "%");
      if (!bar.parentNode) { li.insertBefore(bar, li.firstChild); }
    });

    if (label) {
      var phases = $$(".phase");
      if (current) { label.textContent = "Now: " + current.querySelector("h3").textContent; }
      else if (phases.length && now < day(phases[0].getAttribute("data-start"))) { label.textContent = "Starts in October"; }
      else { label.textContent = "Semester complete"; }
    }

    $$("[data-deadline]").forEach(function (li) {
      var d = day(li.getAttribute("data-deadline"));
      var tag = li.querySelector(".deadline");
      var closed = now > d;
      li.classList.toggle("is-closed", closed);
      if (tag && closed && !tag.getAttribute("data-orig")) {
        tag.setAttribute("data-orig", tag.textContent);
        tag.textContent = tag.textContent.replace(/^(Closes|Due)/, "Closed");
      }
    });
  }

  /* ======================================================================
     7. SMALL UI: toast, in-page confirm, copy buttons
     Browser alert()/confirm() do not show inside the Claude viewer, so
     confirmations live on the page.
     ====================================================================== */

  var toastTimer = null;
  function toast(text) {
    var el = $("#toast");
    if (!el) { return; }
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2600);
  }

  var pendingYes = null;
  function ask(text, yesLabel, onYes) {
    var bar = $("#confirmBar");
    if (!bar) { onYes(); return; }
    $("#confirmText").textContent = text;
    $("#confirmYes").textContent = yesLabel || "Confirm";
    pendingYes = onYes;
    bar.hidden = false;
    bar.scrollIntoView({ behavior: "smooth", block: "nearest" });
    $("#confirmYes").focus();
  }
  var yesBtn = $("#confirmYes"), noBtn = $("#confirmNo");
  if (yesBtn) { yesBtn.addEventListener("click", function () { $("#confirmBar").hidden = true; var f = pendingYes; pendingYes = null; if (f) { f(); } }); }
  if (noBtn)  { noBtn.addEventListener("click", function () { $("#confirmBar").hidden = true; pendingYes = null; }); }

  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest && ev.target.closest("[data-copy]");
    if (!btn) { return; }
    var text = btn.getAttribute("data-copy");
    var ok = function () { toast("Copied " + text); };
    var fallback = function () { toast("Copy failed. The address is " + text); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, fallback);
    } else { fallback(); }
  });

  /* ======================================================================
     GO
     ====================================================================== */

  renderContent();
  renderTimeline();
  route();
})();
