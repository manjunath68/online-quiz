let questions = [];
let index = Number(sessionStorage.getItem("index")) || 0;
let time = Number(sessionStorage.getItem("time")) || 1800;
let timerId;
let warnedOnce = false;
let tabSwitchCount = Number(sessionStorage.getItem("tabSwitchCount")) || 0;



const category = sessionStorage.getItem("category");

// 🔥 ALWAYS initialize userAnswers to empty array
let userAnswers = JSON.parse(sessionStorage.getItem("userAnswers")) || [];

// ================= FETCH QUESTIONS =================
fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    questions = data.filter(q => q.category === category);

    // 🔥 Ensure userAnswers length matches questions
    if (userAnswers.length === 0) {
      userAnswers = new Array(questions.length).fill(null);
      sessionStorage.setItem("userAnswers", JSON.stringify(userAnswers));
    }

    loadQuestion();
    startTimer();
  });

// ================= TIMER =================
function startTimer() {
  timerId = setInterval(() => {
    time--;
    sessionStorage.setItem("time", time);

    const min = Math.floor(time / 60);
    const sec = time % 60;

    document.getElementById("timer").innerText =
      `⏱ Time Left: ${min}:${sec < 10 ? "0" : ""}${sec}`;

    if (time <= 0) {
      submitQuiz();
    }
  }, 1000);
}

// ================= LOAD QUESTION =================
function loadQuestion() {
  if (index >= questions.length) {
    submitQuiz();
    return;
  }

  sessionStorage.setItem("index", index);

  const q = questions[index];
  document.getElementById("question").innerText =
    `${index + 1}. ${q.question}`;

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach(opt => {
    const label = document.createElement("label");

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "option";
    radio.value = opt;

    // 🔥 RESTORE PREVIOUS ANSWER
    if (userAnswers[index] === opt) {
      radio.checked = true;
    }

    label.appendChild(radio);
    label.appendChild(document.createTextNode(" " + opt));

    optionsDiv.appendChild(label);
    optionsDiv.appendChild(document.createElement("br"));
  });
}

// function loadQuestion() {
//   if (index >= questions.length) {
//     submitQuiz();
//     return;
//   }

//   sessionStorage.setItem("index", index);

//   const q = questions[index];
//   document.getElementById("question").innerText =
//     `${index + 1}. ${q.question}`;

//   let html = "";
//   q.options.forEach(opt => {
//     html += `
//       <label>
//         <input type="radio" name="option" value="${opt}">
//         ${opt}
//       </label><br>
//     `;
//   });

//   document.getElementById("options").innerHTML = html;
// }

// ================= NEXT QUESTION =================
function nextQuestion() {
  const selected = document.querySelector("input[name='option']:checked");

  userAnswers[index] = selected ? selected.value : null;
  sessionStorage.setItem("userAnswers", JSON.stringify(userAnswers));

  warnedOnce = false; // 🔥 reset warning
  document.getElementById("warning-msg").innerText = "";

  index++;
  loadQuestion();
}

function prevQuestion() {
  if (index > 0) {
    index--;
    sessionStorage.setItem("index", index);
    loadQuestion();
  }
}




// ================= SUBMIT QUIZ =================
function submitQuiz() {
  clearInterval(timerId);

  // 🔥 SAFE FINAL SCORE CALCULATION
  let finalScore = 0;
  for (let i = 0; i < questions.length; i++) {
    if (userAnswers[i] !== null && userAnswers[i] === questions[i].answer) {
      finalScore++;
    }
  }

  sessionStorage.setItem("score", finalScore);
  sessionStorage.setItem("answers", JSON.stringify(questions));

  window.location.href = "result.html";
}

// ================= CONFIRM SUBMIT =================
function confirmSubmit() {
  const unanswered = userAnswers.filter(a => a === null).length;
  const msg = document.getElementById("warning-msg");

  if (unanswered > 0 && !warnedOnce) {
    msg.innerText =
      `⚠️ You have ${unanswered} unanswered question(s). Click Submit again to confirm.`;
    warnedOnce = true;
    return;
  }

  // clear message and submit
  msg.innerText = "";
  submitQuiz();
}

// function confirmSubmit() {
//   if (confirm("Are you sure you want to submit the quiz?")) {
//     submitQuiz();
//   }
// }



document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    tabSwitchCount++;
    sessionStorage.setItem("tabSwitchCount", tabSwitchCount);

    const warning = document.getElementById("tab-warning");

    if (tabSwitchCount < 3) {
      warning.innerText =
        `⚠️ Tab switch detected (${tabSwitchCount}/3). Repeated switching will auto-submit the quiz.`;
    } else {
      warning.innerText =
        "❌ Maximum tab switches reached. Submitting quiz...";
      submitQuiz();
    }
  }
});

