(() => {
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".nav");
  const navToggle = document.querySelector(".nav-toggle");

  window.addEventListener("scroll", () => {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  });

  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ========== Simulasi mekanisme ========== */
  const simStage = document.getElementById("sim-stage");
  const simCaption = document.getElementById("sim-caption");
  const btnSim = document.getElementById("btn-sim");
  const btnReset = document.getElementById("btn-reset");
  const stepItems = [...document.querySelectorAll("#step-list li")];

  const simSteps = [
    {
      className: "is-step-1",
      text: "Lempeng saling bergesekan. Tekanan mulai meningkat.",
    },
    {
      className: "is-step-2",
      text: "Energi elastis menumpuk di zona sesar (bagian yang menyala).",
    },
    {
      className: "is-step-3",
      text: "Batuan patah! Energi dilepaskan secara mendadak.",
    },
    {
      className: "is-step-4",
      text: "Gelombang seismik menjalar — permukaan ikut berguncang.",
    },
  ];

  let simTimer = null;
  let running = false;

  function clearSimClasses() {
    simStage.classList.remove("is-step-1", "is-step-2", "is-step-3", "is-step-4");
    stepItems.forEach((item) => item.classList.remove("is-active"));
  }

  function resetSim() {
    clearTimeout(simTimer);
    running = false;
    clearSimClasses();
    simCaption.textContent = "Siap memulai. Tekan “Jalankan Simulasi”.";
    btnSim.disabled = false;
    btnSim.textContent = "Jalankan Simulasi";
  }

  function runSim() {
    if (running) return;
    running = true;
    btnSim.disabled = true;
    btnSim.textContent = "Berjalan...";
    clearSimClasses();

    let i = 0;
    const tick = () => {
      if (i >= simSteps.length) {
        running = false;
        btnSim.disabled = false;
        btnSim.textContent = "Jalankan Lagi";
        simCaption.textContent = "Selesai. Kamu bisa ulangi simulasi kapan saja.";
        return;
      }

      clearSimClasses();
      const step = simSteps[i];
      simStage.classList.add(step.className);
      stepItems[i].classList.add("is-active");
      simCaption.textContent = `Langkah ${i + 1}: ${step.text}`;
      i += 1;
      simTimer = setTimeout(tick, 1800);
    };

    tick();
  }

  btnSim.addEventListener("click", runSim);
  btnReset.addEventListener("click", resetSim);

  /* ========== Animasi batas lempeng ========== */
  const plateData = {
    konvergen: {
      title: "Batas Konvergen",
      desc: "Dua lempeng saling mendekat dan bertabrakan. Salah satu lempeng dapat menyusup (subduksi) dan memicu gempa kuat serta gunung api.",
      points: [
        "Contoh: zona subduksi di sekitar Indonesia",
        "Sering menghasilkan gempa dalam dan dangkal",
        "Berpotensi memicu tsunami jika terjadi di laut",
      ],
    },
    divergen: {
      title: "Batas Divergen",
      desc: "Dua lempeng saling menjauh. Magma naik mengisi celah dan membentuk kerak baru, biasanya di punggungan tengah samudra.",
      points: [
        "Contoh: Mid-Atlantic Ridge",
        "Gempa biasanya dangkal dan lebih ringan",
        "Membentuk lembah retakan (rift valley)",
      ],
    },
    transform: {
      title: "Batas Transform",
      desc: "Dua lempeng bergeser sejajar berlawanan arah. Gesekan di sesar menyimpan energi hingga akhirnya terlepas sebagai gempa.",
      points: [
        "Contoh: Sesar San Andreas",
        "Tidak menciptakan atau menghancurkan kerak",
        "Gempa dangkal bisa sangat merusak",
      ],
    },
  };

  const canvas = document.getElementById("plate-canvas");
  const ctx = canvas.getContext("2d");
  const plateTitle = document.getElementById("plate-title");
  const plateDesc = document.getElementById("plate-desc");
  const platePoints = document.getElementById("plate-points");
  const tabs = [...document.querySelectorAll(".tab")];

  let plateMode = "konvergen";
  let animT = 0;

  function setPlateContent(mode) {
    const data = plateData[mode];
    plateTitle.textContent = data.title;
    plateDesc.textContent = data.desc;
    platePoints.innerHTML = data.points.map((p) => `<li>${p}</li>`).join("");
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      plateMode = tab.dataset.plate;
      setPlateContent(plateMode);
    });
  });

  function drawPlates() {
    const w = canvas.width;
    const h = canvas.height;
    animT += 0.016;

    ctx.clearRect(0, 0, w, h);

    // laut / latar
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#1a4a52");
    bg.addColorStop(1, "#0c2428");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const offset = Math.sin(animT) * 10;
    const leftX = w * 0.08;
    const rightX = w * 0.52;
    const plateW = w * 0.4;
    const plateH = h * 0.42;
    const y = h * 0.32;

    ctx.fillStyle = "#c9a06a";

    if (plateMode === "konvergen") {
      roundRect(ctx, leftX + offset, y, plateW, plateH, 10);
      ctx.fill();
      roundRect(ctx, rightX - offset, y, plateW, plateH, 10);
      ctx.fill();

      // panah saling mendekat
      drawArrow(ctx, w * 0.28, h * 0.18, 1);
      drawArrow(ctx, w * 0.72, h * 0.18, -1);

      // subduksi hint
      ctx.fillStyle = "rgba(194, 65, 12, 0.85)";
      ctx.beginPath();
      ctx.arc(w * 0.5, y + plateH * 0.55, 8 + Math.abs(Math.sin(animT * 2)) * 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (plateMode === "divergen") {
      roundRect(ctx, leftX - offset, y, plateW * 0.9, plateH, 10);
      ctx.fill();
      roundRect(ctx, rightX + offset + 20, y, plateW * 0.9, plateH, 10);
      ctx.fill();

      drawArrow(ctx, w * 0.22, h * 0.18, -1);
      drawArrow(ctx, w * 0.78, h * 0.18, 1);

      // magma naik
      ctx.fillStyle = "#e85d04";
      const gapX = w * 0.5;
      const rise = (Math.sin(animT * 2) + 1) * 12;
      ctx.beginPath();
      ctx.moveTo(gapX - 14, y + plateH);
      ctx.lineTo(gapX, y + plateH * 0.35 - rise);
      ctx.lineTo(gapX + 14, y + plateH);
      ctx.closePath();
      ctx.fill();
    } else {
      // transform — geser sejajar
      roundRect(ctx, leftX, y - offset * 0.8, plateW, plateH, 10);
      ctx.fill();
      roundRect(ctx, rightX, y + offset * 0.8, plateW, plateH, 10);
      ctx.fill();

      drawArrow(ctx, w * 0.28, h * 0.18, 0, -1);
      drawArrow(ctx, w * 0.72, h * 0.18, 0, 1);

      ctx.strokeStyle = "rgba(255, 210, 160, 0.9)";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(w * 0.5, y - 20);
      ctx.lineTo(w * 0.5, y + plateH + 20);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.fillStyle = "rgba(232, 242, 243, 0.85)";
    ctx.font = "600 16px 'Source Sans 3', sans-serif";
    ctx.fillText("Lempeng A", leftX + 18, y + 32);
    ctx.fillText("Lempeng B", rightX + 18, y + 32);

    requestAnimationFrame(drawPlates);
  }

  function roundRect(context, x, y, w, h, r) {
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + w, y, x + w, y + h, r);
    context.arcTo(x + w, y + h, x, y + h, r);
    context.arcTo(x, y + h, x, y, r);
    context.arcTo(x, y, x + w, y, r);
    context.closePath();
  }

  function drawArrow(context, x, y, dirX = 0, dirY = 0) {
    context.fillStyle = "rgba(255, 255, 255, 0.85)";
    context.beginPath();
    if (dirX !== 0) {
      const s = dirX > 0 ? 1 : -1;
      context.moveTo(x - 18 * s, y - 8);
      context.lineTo(x + 10 * s, y);
      context.lineTo(x - 18 * s, y + 8);
    } else {
      const s = dirY > 0 ? 1 : -1;
      context.moveTo(x - 8, y - 18 * s);
      context.lineTo(x, y + 10 * s);
      context.lineTo(x + 8, y - 18 * s);
    }
    context.closePath();
    context.fill();
  }

  setPlateContent(plateMode);
  drawPlates();

  /* ========== Seismograf ========== */
  const seismo = document.getElementById("seismo-canvas");
  const sctx = seismo.getContext("2d");
  let seismoX = 0;
  const seismoPoints = [];

  function drawSeismo() {
    const w = seismo.width;
    const h = seismo.height;
    sctx.fillStyle = "#10262b";
    sctx.fillRect(0, 0, w, h);

    sctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    sctx.lineWidth = 1;
    for (let y = 20; y < h; y += 20) {
      sctx.beginPath();
      sctx.moveTo(0, y);
      sctx.lineTo(w, y);
      sctx.stroke();
    }

    const t = performance.now() / 1000;
    const burst = Math.sin(t * 0.7) > 0.92 ? 1 : 0;
    const amp =
      8 +
      Math.sin(t * 12) * 4 +
      Math.sin(t * 3.2) * 6 +
      burst * (Math.random() * 48);

    seismoPoints.push(amp);
    if (seismoPoints.length > w) seismoPoints.shift();

    sctx.beginPath();
    sctx.strokeStyle = "#5fd0c8";
    sctx.lineWidth = 2;
    seismoPoints.forEach((val, i) => {
      const y = h / 2 + Math.sin(i * 0.15 + t * 8) * val * 0.35;
      if (i === 0) sctx.moveTo(i, y);
      else sctx.lineTo(i, y);
    });
    sctx.stroke();

    seismoX = (seismoX + 1) % w;
    requestAnimationFrame(drawSeismo);
  }

  drawSeismo();

  /* ========== Kuis ========== */
  const questions = [
    {
      q: "Apa penyebab utama sebagian besar gempa bumi?",
      options: [
        "Angin kencang di atmosfer",
        "Pelepasan energi di batas lempeng tektonik",
        "Pasang surut air laut",
        "Perubahan cuaca ekstrem",
      ],
      answer: 1,
    },
    {
      q: "Titik di dalam bumi tempat energi gempa dilepaskan disebut…",
      options: ["Episentrum", "Hiposentrum", "Stratovulkan", "Litosfer"],
      answer: 1,
    },
    {
      q: "Batas lempeng yang saling menjauh disebut…",
      options: ["Konvergen", "Transform", "Divergen", "Subduksi"],
      answer: 2,
    },
    {
      q: "Gelombang seismik mana yang biasanya tiba paling awal?",
      options: ["Gelombang S", "Gelombang permukaan", "Gelombang P", "Gelombang tsunami"],
      answer: 2,
    },
    {
      q: "Titik di permukaan bumi tepat di atas sumber gempa disebut…",
      options: ["Hiposentrum", "Episentrum", "Sesar", "Magnitudo"],
      answer: 1,
    },
    {
      q: "Saat gempa terjadi di dalam ruangan, tindakan yang paling tepat adalah…",
      options: [
        "Langsung naik lift ke atap",
        "Berlari ke luar tanpa melihat kondisi",
        "Berlindung di bawah meja kuat, tutupi kepala",
        "Berdiri di dekat jendela kaca",
      ],
      answer: 2,
    },
  ];

  /* ========== Mitigasi ========== */
  const mitigasiData = {
    sebelum: {
      title: "Sebelum gempa",
      items: [
        "Kenali jalur evakuasi di rumah, sekolah, dan tempat kerja.",
        "Siapkan tas siaga: air, obat, senter, dokumen penting.",
        "Amankan furnitur berat agar tidak mudah jatuh.",
        "Ikuti latihan gempa secara rutin.",
      ],
    },
    saat: {
      title: "Saat gempa terjadi",
      items: [
        "Tetap tenang. Jangan panik.",
        "Drop, Cover, Hold On: tiarap, berlindung, pegang erat.",
        "Jauhi kaca, lemari, dan benda yang mudah jatuh.",
        "Jika di luar, menjauh dari bangunan dan tiang listrik.",
      ],
    },
    sesudah: {
      title: "Sesudah gempa",
      items: [
        "Periksa kondisi diri dan orang di sekitar.",
        "Matikan listrik/gas jika ada kerusakan atau bau gas.",
        "Waspadai gempa susulan.",
        "Ikuti arahan petugas dan jangan langsung kembali ke bangunan rusak.",
      ],
    },
  };

  const mitigasiTabs = [...document.querySelectorAll("[data-mitigasi]")];
  const mitigasiTitle = document.getElementById("mitigasi-title");
  const mitigasiList = document.getElementById("mitigasi-list");

  mitigasiTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      mitigasiTabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      const data = mitigasiData[tab.dataset.mitigasi];
      mitigasiTitle.textContent = data.title;
      mitigasiList.innerHTML = data.items.map((item) => `<li>${item}</li>`).join("");
    });
  });

  const quizQuestion = document.getElementById("quiz-question");
  const quizOptions = document.getElementById("quiz-options");
  const quizFeedback = document.getElementById("quiz-feedback");
  const quizNext = document.getElementById("quiz-next");
  const quizCount = document.getElementById("quiz-count");
  const quizBar = document.getElementById("quiz-bar");
  const quizResult = document.getElementById("quiz-result");
  const quizScore = document.getElementById("quiz-score");
  const quizRestart = document.getElementById("quiz-restart");

  let qIndex = 0;
  let score = 0;
  let answered = false;

  function renderQuestion() {
    answered = false;
    const item = questions[qIndex];
    quizQuestion.textContent = item.q;
    quizCount.textContent = `Soal ${qIndex + 1} dari ${questions.length}`;
    quizBar.style.width = `${((qIndex + 1) / questions.length) * 100}%`;
    quizFeedback.hidden = true;
    quizNext.hidden = true;
    quizResult.hidden = true;
    quizOptions.hidden = false;
    quizQuestion.hidden = false;
    quizCount.hidden = false;

    quizOptions.innerHTML = "";
    item.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-option";
      btn.textContent = opt;
      btn.addEventListener("click", () => chooseAnswer(idx, btn));
      quizOptions.appendChild(btn);
    });
  }

  function chooseAnswer(idx, btn) {
    if (answered) return;
    answered = true;
    const item = questions[qIndex];
    const buttons = [...quizOptions.querySelectorAll(".quiz-option")];

    buttons.forEach((b) => {
      b.disabled = true;
    });

    if (idx === item.answer) {
      score += 1;
      btn.classList.add("is-correct");
      quizFeedback.textContent = "Benar! Pemahamanmu sudah tepat.";
      quizFeedback.className = "quiz-feedback is-ok";
    } else {
      btn.classList.add("is-wrong");
      buttons[item.answer].classList.add("is-correct");
      quizFeedback.textContent = "Belum tepat. Perhatikan jawaban yang ditandai hijau.";
      quizFeedback.className = "quiz-feedback is-bad";
    }

    quizFeedback.hidden = false;
    quizNext.hidden = false;
    quizNext.textContent = qIndex === questions.length - 1 ? "Lihat hasil" : "Soal berikutnya";
  }

  quizNext.addEventListener("click", () => {
    if (qIndex < questions.length - 1) {
      qIndex += 1;
      renderQuestion();
    } else {
      quizOptions.hidden = true;
      quizQuestion.hidden = true;
      quizCount.hidden = true;
      quizFeedback.hidden = true;
      quizNext.hidden = true;
      quizResult.hidden = false;
      quizScore.textContent = `Skor kamu: ${score} dari ${questions.length}`;
    }
  });

  quizRestart.addEventListener("click", () => {
    qIndex = 0;
    score = 0;
    renderQuestion();
  });

  renderQuestion();
})();
