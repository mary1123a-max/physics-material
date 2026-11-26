# 物理互動學習站：教師維護手冊

這是一個不需要安裝、不需要建置的純網頁教材。上課可以投影使用，學生回家也能自己操作模擬、做檢核題、看錯題本。指定作業則用 Google 表單收。

---

## 一、資料夾結構

```
index.html            課程首頁（課程 → 章 → 節，自動產生）
practice.html         題庫練習（依課程、章節、難度篩選）
progress.html         我的學習紀錄（進度、錯題本）
data/
  course.js           ★ 課程目錄：新增課程、章節、小節都在這裡登記
  questions.js        ★ 題庫：所有檢核題
lessons/
  template.html       ★ 新增小節時複製這個範本
  p3-1-0-shm.html              1-0 暖身：簡諧運動是波嗎？
  p3-1-1-traveling-wave.html   1-1 行進波與介質質點的振動
  p3-1-2-periodic-wave.html    1-2 週期波：波長、頻率與波速
  p3-1-3-superposition.html    1-3 波的重疊原理與干涉
sims/
  shm.html            模擬：簡諧運動與 y–t 圖（可切換成一排質點）
  traveling-wave.html 模擬：行進波與介質質點（可單獨開啟，也可嵌入單元頁）
  wave-speed.html     模擬：為什麼 v = fλ（1 秒送出 f 個波、火車比喻、數據紀錄）
  superposition.html  模擬：波的重疊原理與干涉（兩脈波相遇，Enter 播放、空白鍵逐格）
assets/
  css/site.css        共用外觀
  js/site.js          共用程式（一般不用改）
.nojekyll             讓 GitHub Pages 原樣發布檔案，請保留
```

平常會動到的只有標 ★ 的檔案和 `lessons/`、`sims/` 兩個資料夾。

---

## 二、本機預覽

直接用瀏覽器打開 `index.html` 就可以看。

---

## 三、上線到 GitHub Pages（第一次設定）

1. 登入 GitHub，按右上角「＋」→「New repository」。名稱例如 `physics`，選 **Public**，按「Create repository」。
2. 在新 repo 頁面按「uploading an existing file」，把這個資料夾**裡面的所有檔案和資料夾**拖進去（不是拖整個外層資料夾），按「Commit changes」。
   - `.nojekyll` 是隱藏檔，若拖不進去，可在 repo 頁面按「Add file → Create new file」，檔名打 `.nojekyll`，內容留空，直接 Commit。
3. 到 repo 的「Settings」→ 左側「Pages」→「Build and deployment」：Source 選「Deploy from a branch」，Branch 選 `main`、資料夾選 `/ (root)`，按「Save」。
4. 等 1～2 分鐘，網址會是：`https://你的帳號.github.io/physics/`

### 放進 Google 協作平台（Google Sites）

- 編輯網站 →「插入」→「嵌入」→ 貼上上面的網址；或
- 插入一個「按鈕」連到網址（在 iPad 上通常比嵌入好用，畫面比較大）。

---

## 四、常見修改

改完後只要在 GitHub 上 Commit，網站約 1～2 分鐘後自動更新（學生端如果沒變，請重新整理頁面）。

### A. 修改網頁上的敘述

1. 在 GitHub repo 裡點進 `lessons/`，打開要改的檔案（例如 `p3-1-1-traveling-wave.html`）。
2. 按右上角的鉛筆圖示（Edit）。
3. 直接修改中文字。只改標籤中間的文字，例如 `<p>這裡的字</p>`，不要刪掉 `<`、`>` 包起來的部分。
4. 按「Commit changes」。

常用標籤：`<b>粗體</b>`、`<sub>下標</sub>`、`<sup>上標</sup>`、`<br>` 換行。

### B. 新增一個小節

1. 複製 `lessons/template.html`，改名，例如 `p3-1-2-periodic-wave.html`（檔名請用英文小寫、數字、連字號）。
2. 打開新檔案，把 `data-lesson="…"` 和 `data-quiz="…"` 都改成這一節的代號，例如 `p3-1-2`，再把「（請填入…）」換成內容。用不到的區塊可以整段刪掉。
3. 打開 `data/course.js`，在對應章節找到那一行，補上 `file`：

   ```js
   { id: "p3-1-2", title: "週期波：波長、頻率與波速", file: "lessons/p3-1-2-periodic-wave.html", form: "" },
   ```

   首頁、上一節／下一節按鈕會自動接上。還沒寫好的小節不填 `file`，首頁會顯示「準備中」。

### C. 新增檢核題

打開 `data/questions.js`，照下面的格式加在 `[` 和 `]` 之間（每題之間用逗號隔開）：

```js
// 單選
{ id: "p3-1-2-q1", lesson: "p3-1-2", level: 1, type: "mc",
  stem: "題目文字",
  options: ["選項A", "選項B", "選項C", "選項D"],
  answer: 1,                       // 正確選項的序號，從 0 開始（0=A、1=B…）
  explain: "解析文字" },

// 多選
{ id: "p3-1-2-q2", lesson: "p3-1-2", level: 2, type: "multi",
  stem: "…（多選）", options: ["…", "…", "…", "…"],
  answer: [0, 2], explain: "…" },

// 填數值
{ id: "p3-1-2-q3", lesson: "p3-1-2", level: 2, type: "num",
  stem: "…為多少 cm？", answer: 9.0, tol: 0.02, unit: "cm",   // tol 0.02 = 容許 2% 誤差
  explain: "…" },
```

- `level`：1 基礎、2 進階、3 挑戰
- `lesson` 填哪一節，題目就會自動出現在那一節的「檢核練習」和題庫頁。
- `id` 不能重複。

### D. 新增互動模擬

1. 把模擬的 HTML 檔放進 `sims/`，例如 `sims/standing-wave.html`。
2. 在單元頁加入（範本裡已經有這段）：

   ```html
   <iframe class="sim-frame" src="../sims/standing-wave.html" title="駐波模擬" loading="lazy"></iframe>
   ```

3. （建議）要讓嵌入框自動配合模擬高度、不出現捲軸，在模擬檔的 `<script>` 最前面加入：

   ```js
   if (window.parent !== window) {
     const send = () => parent.postMessage({ type: "sim-height", h: document.documentElement.scrollHeight }, "*");
     addEventListener("load", send);
     if (window.ResizeObserver) new ResizeObserver(send).observe(document.body);
   }
   ```

   沒加的話嵌入框會是固定高度，仍可使用。

### E. 設定作業表單（老師收作答紀錄）

1. 建立一份 Google 表單，建議欄位：班級座號、姓名、**作答摘要（段落）**，再加上你想問的申論題或計算題。
2. 複製表單的分享連結，貼到 `data/course.js` 那一節的 `form` 欄位：

   ```js
   { id: "p3-1-1", title: "…", file: "…", form: "https://forms.gle/xxxxxxxx" },
   ```

3. 該節頁面底部會出現「繳交作業」區塊。學生按「複製作答摘要」，到表單貼上後送出，你就能在表單回覆裡看到每位學生的檢核題對錯。
   `form` 留空 `""` 時，這個區塊不會出現。

### F. 新增或修改課程、章節

都在 `data/course.js`。課程名稱、副標、顏色、章節名稱都可以改，也可以增刪或調整順序。章節的 `lessons: []` 留空時，首頁顯示「小節準備中」。

> 目前的章節是草稿：選修物理 III、IV 的章名參考一般課程計畫，其他課程只先放了幾個常見章名，請依你的教學進度調整。

---

## 五、學生作答紀錄的說明

- 檢核題的對錯、「我理解了」標記都只存在**學生自己那台裝置的瀏覽器**，老師看不到，也不會上傳。
- 換裝置、換瀏覽器、使用無痕模式或清除瀏覽資料，紀錄就會不見。
- 需要老師看到的部分，請用上面 E 的作業表單收。

---

## 六、請 Claude 幫忙修改

把 GitHub repo 的網址（或整包檔案）給 Claude，說明要改哪一節、加什麼內容或模擬即可。
