/* =========================================================
   物理互動學習站：共用程式
   一般維護不需要改這個檔案；內容請改 data/course.js、
   data/questions.js 與 lessons/ 裡的單元頁。
   ========================================================= */
(function () {
  "use strict";
  const COURSE = window.COURSE || { courses: [] };
  const QUESTIONS = window.QUESTIONS || [];
  const body = document.body;
  const ROOT = body.dataset.root || ".";
  const PAGE = body.dataset.page || "";
  const link = p => ROOT + "/" + p;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const h = (tag, attrs, html) => {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) { if (k === "class") e.className = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (html != null) e.innerHTML = html;
    return e;
  };
  const LEVEL = { 1: "基礎", 2: "進階", 3: "挑戰" };

  /* ---------- 學習紀錄（只存在這台裝置的瀏覽器） ---------- */
  const KEY = "physics-site-progress-v1";
  function loadP() {
    try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.answers) return Object.assign({ done: {} }, d); } catch (e) {}
    return { answers: {}, done: {} };
  }
  let P = loadP();
  function saveP() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }

  /* ---------- 把課程目錄攤平，方便查找 ---------- */
  const LESSONS = [];
  COURSE.courses.forEach(c => (c.chapters || []).forEach((ch, ci) => (ch.lessons || []).forEach((l, li) => {
    LESSONS.push({ course: c, chapter: ch, lesson: l, ci, li, num: (ci + 1) + "-" + (li + 1) });
  })));
  const findLesson = id => LESSONS.find(x => x.lesson.id === id);
  const qOf = lessonId => QUESTIONS.filter(q => q.lesson === lessonId);

  /* ---------- 頁首、頁尾 ---------- */
  function renderChrome() {
    const nav = [["home", "index.html", "課程首頁"], ["practice", "practice.html", "題庫練習"], ["progress", "progress.html", "我的學習紀錄"]];
    const header = h("header", { class: "site-header" },
      '<div class="wrap"><a class="site-title" href="' + link("index.html") + '"><span class="logo">Φ</span>' + (COURSE.siteTitle || "物理互動學習站") + "</a>" +
      '<nav class="site-nav">' + nav.map(n => '<a href="' + link(n[1]) + '"' + (PAGE === n[0] ? ' class="on"' : "") + ">" + n[2] + "</a>").join("") + "</nav></div>");
    body.insertBefore(header, body.firstChild);
    body.appendChild(h("footer", { class: "site-footer" }, (COURSE.footer || "") + "　｜　作答紀錄只保存在你這台裝置的瀏覽器"));
    body.appendChild(h("div", { class: "toast", id: "toast" }));
    body.appendChild(h("div", { class: "modal-bg", id: "modal" }, '<div class="modal"><p id="modalMsg"></p><div class="btn-row" style="justify-content:flex-end"><button class="btn" id="modalNo">取消</button><button class="btn primary" id="modalYes">確定</button></div></div>'));
  }
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 1800);
  }
  function confirmBox(msg) {
    return new Promise(res => {
      const m = $("#modal"); $("#modalMsg").textContent = msg; m.classList.add("show");
      const done = v => { m.classList.remove("show"); $("#modalYes").onclick = $("#modalNo").onclick = null; res(v); };
      $("#modalYes").onclick = () => done(true); $("#modalNo").onclick = () => done(false);
    });
  }
  function copyText(text) {
    const fallback = () => {
      const ta = h("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
      ta.remove(); return ok;
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(() => true, () => fallback());
    }
    return Promise.resolve(fallback());
  }

  /* ---------- 測驗引擎 ---------- */
  function isCorrect(q, val) {
    if (q.type === "mc") return val === q.answer;
    if (q.type === "multi") { const a = [...q.answer].sort().join(","), b = [...val].sort().join(","); return a === b; }
    if (q.type === "num") {
      if (val === null || isNaN(val)) return false;
      const tol = q.tol != null ? q.tol : 0.02;
      return Math.abs(val - q.answer) <= Math.max(Math.abs(q.answer) * tol, 1e-9);
    }
    return false;
  }
  function renderQuestion(q, no, opts) {
    opts = opts || {};
    const box = h("div", { class: "quiz-q", "data-qid": q.id });
    const rec = P.answers[q.id];
    let head = '<span class="qno">第 ' + no + " 題</span>" +
      '<span class="pill l' + q.level + '">' + (LEVEL[q.level] || "") + "</span>" +
      (q.type === "multi" ? '<span class="pill">多選</span>' : q.type === "num" ? '<span class="pill">填數值</span>' : "");
    if (opts.showSource) {
      const L = findLesson(q.lesson);
      if (L) head += '<span class="small muted">｜' + (L.lesson.file ? '<a href="' + link(L.lesson.file) + '">' : "") + L.course.title + " " + L.num + " " + L.lesson.title + (L.lesson.file ? "</a>" : "") + "</span>";
    }
    if (rec) head += '<span class="pill ' + (rec.ok ? "ok" : "") + '" style="margin-left:auto">' + (rec.ok ? "上次答對" : "上次答錯") + "</span>";
    box.appendChild(h("div", { class: "qhead" }, head));
    box.appendChild(h("p", { class: "stem" }, q.stem));
    const name = "q_" + q.id + "_" + Math.random().toString(36).slice(2, 7);
    if (q.type === "mc" || q.type === "multi") {
      const opsEl = h("div", { class: "opts" });
      q.options.forEach((o, i) => {
        const lab = h("label", { class: "opt" }, '<input type="' + (q.type === "mc" ? "radio" : "checkbox") + '" name="' + name + '" value="' + i + '"><span>(' + "ABCDEFGH"[i] + ") " + o + "</span>");
        opsEl.appendChild(lab);
      });
      box.appendChild(opsEl);
    } else {
      box.appendChild(h("div", { class: "numrow" }, '<input type="text" inputmode="decimal" placeholder="輸入數值" aria-label="答案"><span>' + (q.unit || "") + "</span>"));
    }
    const actions = h("div", { class: "actions" }, '<button class="btn primary" data-act="check">送出答案</button><button class="btn" data-act="retry" style="display:none">再試一次</button><button class="btn" data-act="show" style="display:none">看解析</button>');
    box.appendChild(actions);
    const fb = h("div", { class: "feedback" });
    box.appendChild(fb);

    const read = () => {
      if (q.type === "mc") { const c = box.querySelector("input:checked"); return c ? +c.value : null; }
      if (q.type === "multi") return [...box.querySelectorAll("input:checked")].map(x => +x.value);
      const raw = box.querySelector(".numrow input").value.trim().replace(/，/g, ".").replace(/[０-９．－]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));
      return raw === "" ? null : parseFloat(raw);
    };
    const correctText = () => q.type === "num" ? q.answer + " " + (q.unit || "") :
      (Array.isArray(q.answer) ? q.answer : [q.answer]).map(i => "(" + "ABCDEFGH"[i] + ")").join("");
    const btn = a => actions.querySelector('[data-act="' + a + '"]');

    btn("check").onclick = () => {
      const v = read();
      if (v === null || (Array.isArray(v) && !v.length)) { toast("請先作答"); return; }
      const ok = isCorrect(q, v);
      const prev = P.answers[q.id] || { tries: 0 };
      P.answers[q.id] = { ok, tries: prev.tries + 1, t: Date.now() };
      saveP();
      box.querySelectorAll("input").forEach(x => x.disabled = true);
      if (q.type !== "num") {
        const ans = Array.isArray(q.answer) ? q.answer : [q.answer];
        box.querySelectorAll(".opt").forEach((lab, i) => {
          const checked = lab.querySelector("input").checked;
          if (ok && ans.includes(i)) lab.classList.add("correct");
          else if (!ok && checked) lab.classList.add("wrong");
        });
      }
      if (ok) { fb.className = "feedback ok"; fb.innerHTML = "<b>答對了！</b><div class='exp'>" + q.explain + "</div>"; }
      else { fb.className = "feedback bad"; fb.innerHTML = "<b>還不對，再想想。</b>"; btn("show").style.display = ""; }
      btn("check").style.display = "none"; btn("retry").style.display = "";
      if (opts.onAnswer) opts.onAnswer();
    };
    btn("retry").onclick = () => {
      box.querySelectorAll("input").forEach(x => { x.disabled = false; if (x.type !== "text") x.checked = false; else x.value = ""; });
      box.querySelectorAll(".opt").forEach(l => l.classList.remove("correct", "wrong"));
      fb.className = "feedback"; fb.innerHTML = "";
      btn("check").style.display = ""; btn("retry").style.display = "none"; btn("show").style.display = "none";
    };
    btn("show").onclick = () => {
      fb.innerHTML = "<b>還不對。</b>正確答案：" + correctText() + "<div class='exp'>" + q.explain + "</div>";
      btn("show").style.display = "none";
    };
    return box;
  }
  function lessonStats(id) {
    const qs = qOf(id);
    const answered = qs.filter(q => P.answers[q.id]);
    return { total: qs.length, answered: answered.length, correct: answered.filter(q => P.answers[q.id].ok).length, qs };
  }

  /* ---------- 首頁：課程地圖 ---------- */
  function renderHome() {
    const map = $("#courseMap"); if (!map) return;
    const t = $("#heroTitle"); if (t) t.textContent = COURSE.siteTitle || "";
    const s = $("#heroSub"); if (s) s.textContent = COURSE.siteSubtitle || "";
    let openState = {};
    try { openState = JSON.parse(localStorage.getItem(KEY + "-open")) || {}; } catch (e) {}
    COURSE.courses.forEach(c => {
      const ready = LESSONS.filter(x => x.course === c && x.lesson.file);
      const done = ready.filter(x => P.done[x.lesson.id]).length;
      const open = openState[c.id] != null ? openState[c.id] : ready.length > 0;
      const el = h("section", { class: "course" + (open ? " open" : "") });
      el.appendChild(h("div", { class: "course-head", role: "button", tabindex: "0" },
        '<span class="bar" style="background:' + (c.color || "#0f7c8c") + '"></span><div><h2>' + c.title + '</h2><div class="sub">' + (c.subtitle || "") + "</div></div>" +
        '<div class="meta">' + (ready.length ? '<span class="small muted">已理解 ' + done + " / " + ready.length + ' 節</span><div class="progressbar"><span style="width:' + (done / ready.length * 100) + '%"></span></div>' : '<span class="pill soon">準備中</span>') +
        '<span class="chev">▶</span></div>'));
      const bodyEl = h("div", { class: "course-body" });
      if (!(c.chapters || []).length) bodyEl.appendChild(h("div", { class: "empty" }, "章節尚未建立"));
      (c.chapters || []).forEach((ch, ci) => {
        const chEl = h("div", { class: "chapter" }, "<h3>第 " + (ci + 1) + " 章　" + ch.title + "</h3>");
        if (!(ch.lessons || []).length) chEl.appendChild(h("div", { class: "empty" }, "小節準備中"));
        else {
          const ul = h("ul", { class: "lesson-list" });
          ch.lessons.forEach((l, li) => {
            const num = (ci + 1) + "-" + (li + 1);
            const st = lessonStats(l.id);
            let pill = !l.file ? '<span class="pill soon">準備中</span>' :
              P.done[l.id] ? '<span class="pill ok">✓ 已理解</span>' :
              st.answered ? '<span class="pill">檢核 ' + st.correct + "/" + st.total + "</span>" : "";
            ul.appendChild(h("li", null, l.file
              ? '<a href="' + link(l.file) + '"><span class="num">' + num + "</span><span>" + l.title + "</span>" + pill + "</a>"
              : '<span class="nolink"><span class="num">' + num + "</span><span>" + l.title + "</span>" + pill + "</span>"));
          });
          chEl.appendChild(ul);
        }
        bodyEl.appendChild(chEl);
      });
      el.appendChild(bodyEl);
      const toggle = () => {
        el.classList.toggle("open"); openState[c.id] = el.classList.contains("open");
        try { localStorage.setItem(KEY + "-open", JSON.stringify(openState)); } catch (e) {}
      };
      const head = el.querySelector(".course-head");
      head.onclick = toggle;
      head.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } };
      map.appendChild(el);
    });
    const first = LESSONS.find(x => x.lesson.file && !P.done[x.lesson.id]) || LESSONS.find(x => x.lesson.file);
    const go = $("#heroGo");
    if (go && first) { go.href = link(first.lesson.file); go.textContent = "▶ 繼續學習：" + first.lesson.title; }
    else if (go) go.style.display = "none";
  }

  /* ---------- 單元頁 ---------- */
  function renderLesson() {
    const id = body.dataset.lesson;
    const L = findLesson(id);
    const bc = $("#breadcrumb");
    if (bc && L) bc.innerHTML = '<a href="' + link("index.html") + '">課程首頁</a> ／ ' + L.course.title + "（" + (L.course.subtitle || "") + "）／ 第 " + (L.ci + 1) + " 章 " + L.chapter.title + " ／ " + L.num;
    if (L && !document.title.includes(L.lesson.title)) document.title = L.num + " " + L.lesson.title + "｜" + (COURSE.siteTitle || "");

    // 檢核題
    document.querySelectorAll("[data-quiz]").forEach(box => {
      const lid = box.dataset.quiz || id;
      const qs = qOf(lid);
      if (!qs.length) { box.innerHTML = '<p class="muted">本節尚無檢核題。</p>'; return; }
      const sum = h("div", { class: "quiz-summary" });
      const upd = () => {
        const s = lessonStats(lid);
        sum.innerHTML = "已作答 <b>" + s.answered + " / " + s.total + "</b> 題，答對 <b>" + s.correct + "</b> 題" +
          (s.answered === s.total && s.correct === s.total ? "　🎉 全部答對！記得按下方「我理解了」。" : "");
      };
      qs.forEach((q, i) => box.appendChild(renderQuestion(q, i + 1, { onAnswer: upd })));
      box.appendChild(sum); upd();
    });

    // 我理解了
    const u = $("#understood");
    if (u) {
      const draw = () => {
        const done = !!P.done[id];
        u.innerHTML = done
          ? '<span class="pill ok" style="font-size:.9rem">✓ 已標記為理解</span><button class="btn" id="undoDone">取消標記</button>'
          : '<span class="muted">讀完、操作過、檢核也做完了嗎？</span><button class="btn primary" id="markDone">我理解了 ✓</button>';
        const b1 = $("#markDone"), b2 = $("#undoDone");
        if (b1) b1.onclick = () => { P.done[id] = Date.now(); saveP(); draw(); toast("已標記本節為理解"); };
        if (b2) b2.onclick = () => { delete P.done[id]; saveP(); draw(); };
      };
      draw();
    }

    // 作業繳交（course.js 裡有填 form 才會出現）
    const a = $("#assignment");
    if (a) {
      if (!L || !L.lesson.form) a.style.display = "none";
      else {
        a.innerHTML = "<h2>📮 繳交作業</h2><p>先完成上面的檢核題，再按「複製作答摘要」，到表單貼上並填寫其他題目後送出。</p>" +
          '<div class="btn-row"><button class="btn" id="copySummary">① 複製作答摘要</button><a class="btn accent" href="' + L.lesson.form + '" target="_blank" rel="noopener">② 開啟作業表單 ↗</a></div>';
        $("#copySummary").onclick = () => {
          const s = lessonStats(id);
          const marks = s.qs.map((q, i) => (i + 1) + (P.answers[q.id] ? (P.answers[q.id].ok ? "✔" : "✘") : "－")).join(" ");
          const d = new Date();
          const text = "【" + (COURSE.siteTitle || "") + "】作答摘要\n單元：" + L.num + " " + L.lesson.title + "\n時間：" + d.toLocaleString("zh-TW") +
            "\n檢核題：答對 " + s.correct + " / " + s.total + "（已作答 " + s.answered + "）\n各題：" + marks + "\n標記理解：" + (P.done[id] ? "是" : "否");
          copyText(text).then(ok => toast(ok ? "已複製，可到表單貼上" : "無法自動複製，請手動選取"));
        };
      }
    }

    // 上一節／下一節（只算已完成頁面的小節）
    const pg = $("#pager");
    if (pg) {
      const ready = LESSONS.filter(x => x.lesson.file);
      const i = ready.findIndex(x => x.lesson.id === id);
      const prev = ready[i - 1], next = ready[i + 1];
      pg.innerHTML = (prev ? '<a href="' + link(prev.lesson.file) + '"><div class="dir">← 上一節</div>' + prev.num + " " + prev.lesson.title + "</a>" : "<span></span>") +
        (next ? '<a class="next" href="' + link(next.lesson.file) + '"><div class="dir">下一節 →</div>' + next.num + " " + next.lesson.title + "</a>" : '<a class="next" href="' + link("index.html") + '"><div class="dir">回到</div>課程首頁</a>');
    }
  }

  /* ---------- 嵌入的模擬：自動調整高度 ---------- */
  window.addEventListener("message", e => {
    if (!e.data || e.data.type !== "sim-height") return;
    document.querySelectorAll("iframe.sim-frame").forEach(f => {
      if (f.contentWindow === e.source) f.style.height = Math.ceil(e.data.h + 4) + "px";
    });
  });

  /* ---------- 題庫頁 ---------- */
  function renderPractice() {
    const list = $("#qList"); if (!list) return;
    const fc = $("#fCourse"), fch = $("#fChapter"), fl = $("#fLevel"), fs = $("#fState");
    COURSE.courses.forEach(c => { if (LESSONS.some(x => x.course === c && qOf(x.lesson.id).length)) fc.appendChild(h("option", { value: c.id }, c.title + " " + (c.subtitle || ""))); });
    const fillCh = () => {
      fch.innerHTML = '<option value="">全部章節</option>';
      const c = COURSE.courses.find(x => x.id === fc.value);
      if (c) (c.chapters || []).forEach((ch, ci) => fch.appendChild(h("option", { value: ch.id }, "第 " + (ci + 1) + " 章 " + ch.title)));
    };
    if (location.hash === "#wrong") fs.value = "wrong";
    let page = 0; const PER = 5;
    const draw = () => {
      const qs = QUESTIONS.filter(q => {
        const L = findLesson(q.lesson); if (!L) return false;
        if (fc.value && L.course.id !== fc.value) return false;
        if (fch.value && L.chapter.id !== fch.value) return false;
        if (fl.value && String(q.level) !== fl.value) return false;
        const r = P.answers[q.id];
        if (fs.value === "wrong" && !(r && !r.ok)) return false;
        if (fs.value === "new" && r) return false;
        return true;
      });
      const pages = Math.max(1, Math.ceil(qs.length / PER)); if (page >= pages) page = pages - 1;
      $("#qCount").textContent = "共 " + qs.length + " 題";
      list.innerHTML = "";
      if (!qs.length) list.innerHTML = '<div class="card muted">' + (fs.value === "wrong" ? "目前沒有錯題，很棒！" : "沒有符合條件的題目。") + "</div>";
      qs.slice(page * PER, page * PER + PER).forEach((q, i) => list.appendChild(renderQuestion(q, page * PER + i + 1, { showSource: true })));
      const pn = $("#qPages"); pn.innerHTML = "";
      if (pages > 1) for (let p = 0; p < pages; p++) {
        const b = h("button", { class: "btn" + (p === page ? " primary" : "") }, String(p + 1));
        b.onclick = () => { page = p; draw(); window.scrollTo({ top: 0 }); };
        pn.appendChild(b);
      }
    };
    fc.onchange = () => { fillCh(); page = 0; draw(); };
    [fch, fl, fs].forEach(x => x.onchange = () => { page = 0; draw(); });
    fillCh(); draw();
  }

  /* ---------- 我的學習紀錄 ---------- */
  function renderProgress() {
    const box = $("#progressBox"); if (!box) return;
    const draw = () => {
      box.innerHTML = "";
      const totalReady = LESSONS.filter(x => x.lesson.file).length;
      const doneN = LESSONS.filter(x => x.lesson.file && P.done[x.lesson.id]).length;
      const ans = QUESTIONS.filter(q => P.answers[q.id]);
      const ok = ans.filter(q => P.answers[q.id].ok).length;
      box.appendChild(h("div", { class: "card" },
        "<h2>總覽</h2><p>已理解 <b>" + doneN + " / " + totalReady + "</b> 節　｜　題目已作答 <b>" + ans.length + " / " + QUESTIONS.length + "</b>，目前答對 <b>" + ok + "</b> 題</p>" +
        '<p class="small muted">紀錄只保存在這台裝置、這個瀏覽器。換裝置、換瀏覽器或清除瀏覽資料後就看不到了。</p>'));
      COURSE.courses.forEach(c => {
        const rows = LESSONS.filter(x => x.course === c && x.lesson.file);
        if (!rows.length) return;
        const card = h("div", { class: "card" }, "<h2>" + c.title + "（" + (c.subtitle || "") + "）</h2>");
        const t = h("table", { class: "compare" }, "<tr><th>小節</th><th>檢核題</th><th>狀態</th></tr>");
        rows.forEach(x => {
          const s = lessonStats(x.lesson.id);
          t.appendChild(h("tr", null, '<td><a href="' + link(x.lesson.file) + '">' + x.num + " " + x.lesson.title + "</a></td><td>" + (s.total ? s.correct + " / " + s.total + (s.answered < s.total ? "（未完成）" : "") : "—") + "</td><td>" + (P.done[x.lesson.id] ? '<span class="pill ok">✓ 已理解</span>' : '<span class="pill">學習中</span>') + "</td>"));
        });
        card.appendChild(t); box.appendChild(card);
      });
      const wrong = QUESTIONS.filter(q => P.answers[q.id] && !P.answers[q.id].ok);
      const wcard = h("div", { class: "card" }, "<h2>錯題本</h2>");
      if (!wrong.length) wcard.appendChild(h("p", { class: "muted" }, "目前沒有錯題。"));
      else {
        wcard.appendChild(h("p", null, "共 " + wrong.length + ' 題最近一次答錯。<a class="btn primary" href="' + link("practice.html#wrong") + '">到題庫重新練習錯題</a>'));
        const ul = h("ul");
        wrong.forEach(q => { const L = findLesson(q.lesson); ul.appendChild(h("li", null, (L ? L.num + " " + L.lesson.title + "：" : "") + q.stem.replace(/<[^>]+>/g, "").slice(0, 48) + "…")); });
        wcard.appendChild(ul);
      }
      box.appendChild(wcard);
      const reset = h("div", { class: "card" }, '<h2>清除紀錄</h2><p class="small muted">會刪除這台裝置上所有作答與「已理解」標記。</p><button class="btn" id="resetAll">清除所有紀錄</button>');
      box.appendChild(reset);
      $("#resetAll").onclick = () => confirmBox("確定要清除所有學習紀錄嗎？清除後無法復原。").then(y => {
        if (!y) return; P = { answers: {}, done: {} }; saveP(); draw(); toast("已清除");
      });
    };
    draw();
  }

  /* ---------- 啟動 ---------- */
  renderChrome();
  if (PAGE === "home") renderHome();
  if (PAGE === "lesson") renderLesson();
  if (PAGE === "practice") renderPractice();
  if (PAGE === "progress") renderProgress();
})();
