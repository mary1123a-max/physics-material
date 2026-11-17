/* =========================================================
   課程目錄（整個網站的「地圖」）
   ---------------------------------------------------------
   ★ 新增一節：在對應章節的 lessons 裡加一行，例如
       { id: "p3-1-2", title: "週期波：波長、頻率與波速", file: "lessons/p3-1-2-periodic-wave.html" },
     沒有 file 的小節會顯示「準備中」，不能點。
   ★ form：該節的 Google 表單網址（作業繳交用），不需要就留空 ""。
   ★ 課程與章節名稱都可以自由修改、增刪、調整順序。
   ========================================================= */
window.COURSE = {
  siteTitle: "物理互動學習站",
  siteSubtitle: "觀察現象 → 理解關係 → 動手檢核。課堂用、回家也能自己操作複習。",
  footer: "物理課自編教材",

  courses: [
    {
      id: "basic", title: "必修物理", subtitle: "高一", color: "#2a8f5b",
      chapters: [
        // { id: "b-1", title: "章節名稱", lessons: [] },
      ]
    },
    {
      id: "p1", title: "選修物理 I", subtitle: "力學一", color: "#2a5fa8",
      chapters: [
        { id: "p1-1", title: "直線運動", lessons: [] },
        { id: "p1-2", title: "平面運動", lessons: [] },
        { id: "p1-3", title: "牛頓運動定律", lessons: [] }
      ]
    },
    {
      id: "p2", title: "選修物理 II", subtitle: "力學二與熱學", color: "#7a4fc4",
      chapters: [
        { id: "p2-1", title: "功與能量", lessons: [] },
        { id: "p2-2", title: "熱學", lessons: [] }
      ]
    },
    {
      id: "p3", title: "選修物理 III", subtitle: "波動、光及聲音", color: "#0f7c8c",
      chapters: [
        {
          id: "p3-1", title: "波動",
          lessons: [
            { id: "p3-1-1", title: "行進波與介質質點的振動", file: "lessons/p3-1-1-traveling-wave.html", form: "" },
            { id: "p3-1-2", title: "週期波：波長、頻率與波速", file: "lessons/p3-1-2-periodic-wave.html", form: "" },
            { id: "p3-1-3", title: "波的反射與透射" },
            { id: "p3-1-4", title: "波的疊加與駐波" },
            { id: "p3-1-5", title: "惠更斯原理與繞射" },
            { id: "p3-1-6", title: "水波的干涉" }
          ]
        },
        { id: "p3-2", title: "聲波", lessons: [] },
        { id: "p3-3", title: "幾何光學", lessons: [] },
        { id: "p3-4", title: "物理光學", lessons: [] }
      ]
    },
    {
      id: "p4", title: "選修物理 IV", subtitle: "電磁現象一", color: "#c2552b",
      chapters: [
        { id: "p4-1", title: "靜電學", lessons: [] },
        { id: "p4-2", title: "電流", lessons: [] },
        { id: "p4-3", title: "電流的磁效應", lessons: [] }
      ]
    },
    {
      id: "p5", title: "選修物理 V", subtitle: "電磁現象二與量子現象", color: "#a8326b",
      chapters: [
        { id: "p5-1", title: "電磁感應", lessons: [] },
        { id: "p5-2", title: "量子現象", lessons: [] }
      ]
    }
  ]
};
