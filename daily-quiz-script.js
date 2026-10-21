var currentIndex = 0;
var userAnswers = [];
var timerInterval = null;
var totalSecondsRemaining = 0;
var letters = ["A", "B", "C", "D", "E", "F"];

function decodeEntities(str) {
  var txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

function cleanOptionText(str, idx) {
  return str.replace(/^[A-Da-d][\.\,\)\-\s]+/, "").trim();
}

function startTimer() {
  clearInterval(timerInterval);
  var timeInMin = (typeof quizTimeInMinutes !== 'undefined') ? quizTimeInMinutes : 3;
  totalSecondsRemaining = Math.round(timeInMin * 60);
  
  var timerBox = document.getElementById("timerBox");
  if (timerBox) {
    timerBox.className = "g-quiz-timer timer-green";
  }

  updateTimerDisplay();

  timerInterval = setInterval(function() {
    totalSecondsRemaining--;
    updateTimerDisplay();

    if (totalSecondsRemaining <= 0) {
      clearInterval(timerInterval);
      alert("Your Time Is Over");
      showScorecard();
    }
  }, 1000);
}

function updateTimerDisplay() {
  var minutes = Math.floor(totalSecondsRemaining / 60);
  var seconds = totalSecondsRemaining % 60;
  var timerElem = document.getElementById("timeDisplay");
  var timerBox = document.getElementById("timerBox");

  if (minutes < 10) minutes = "0" + minutes;
  if (seconds < 10) seconds = "0" + seconds;

  if (timerElem) timerElem.innerText = minutes + ":" + seconds;

  if (timerBox) {
    if (totalSecondsRemaining <= 60 && totalSecondsRemaining > 0) {
      timerBox.className = "g-quiz-timer timer-warning";
    } else {
      timerBox.className = "g-quiz-timer timer-green";
    }
  }
}

function renderProgressBar() {
  var wrapper = document.getElementById("progressSegments");
  if (!wrapper || !window.quizData) return;
  wrapper.innerHTML = "";
  quizData.forEach(function(_, idx) {
    var seg = document.createElement("div");
    seg.className = "g-progress-segment";

    if (userAnswers[idx] !== null) {
      if (userAnswers[idx] === quizData[idx].correctIndex) {
        seg.classList.add("line-correct");
      } else {
        seg.classList.add("line-wrong");
      }
    } else if (idx === currentIndex) {
      seg.classList.add("active");
    }

    wrapper.appendChild(seg);
  });
}

function loadQuestion(index) {
  if (!window.quizData || !quizData[index]) return;
  var q = quizData[index];
  var counter = document.getElementById("quizCounter");
  var qNumber = document.getElementById("questionNumber");
  var qText = document.getElementById("questionText");
  var hContent = document.getElementById("hintContent");
  var optContainer = document.getElementById("optionsContainer");

  if (counter) counter.innerHTML = (index + 1) + " / " + quizData.length;
  
  if (qNumber) qNumber.innerHTML = "Question : " + (index + 1);
  if (qText) qText.innerHTML = decodeEntities(q.question);
  
  if (hContent) {
    hContent.innerHTML = "<strong style='font-weight: 700; color: #1f1f1f;'>स्पष्टीकरण :</strong> " + decodeEntities(q.hint);
    hContent.style.display = "none";
  }
  
  var icon = document.querySelector(".chevron-icon");
  if (icon) icon.classList.remove("open");

  if (optContainer) {
    optContainer.innerHTML = "";
    var hasAnswered = userAnswers[index] !== null;

    q.options.forEach(function(optText, optIdx) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "g-option-btn";
      
      var prefix = letters[optIdx] || (optIdx + 1);
      var cleanText = cleanOptionText(optText, optIdx);

      btn.innerHTML = "<span class='opt-prefix'>" + prefix + "</span><span>" + decodeEntities(cleanText) + "</span>";

      if (hasAnswered) {
        btn.disabled = true;
        if (optIdx === q.correctIndex) {
          btn.classList.add("selected-correct");
        } else if (optIdx === userAnswers[index]) {
          btn.classList.add("selected-wrong");
        }
      } else {
        btn.onclick = function() { selectOption(optIdx); };
      }

      optContainer.appendChild(btn);
    });
  }

  var backBtn = document.getElementById("backBtn");
  var nextBtn = document.getElementById("nextBtn");
  if (backBtn) backBtn.disabled = (index === 0);
  if (nextBtn) nextBtn.innerHTML = (index === quizData.length - 1) ? "Submit" : "Next";
  renderProgressBar();
}

function selectOption(selectedIdx) {
  userAnswers[currentIndex] = selectedIdx;
  loadQuestion(currentIndex);
}

function toggleHint() {
  var hintBox = document.getElementById("hintContent");
  var icon = document.querySelector(".chevron-icon");
  if (hintBox) {
    if (hintBox.style.display === "block") {
      hintBox.style.display = "none";
      if (icon) icon.classList.remove("open");
    } else {
      hintBox.style.display = "block";
      if (icon) icon.classList.add("open");
    }
  }
}

function nextQuestion() {
  if (currentIndex < quizData.length - 1) {
    currentIndex++;
    loadQuestion(currentIndex);
  } else {
    showScorecard();
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    loadQuestion(currentIndex);
  }
}

function showScorecard() {
  clearInterval(timerInterval);

  var correct = 0;
  var wrong = 0;
  var skipped = 0;

  userAnswers.forEach(function(ans, idx) {
    if (ans === null) {
      skipped++;
    } else if (ans === quizData[idx].correctIndex) {
      correct++;
    } else {
      wrong++;
    }
  });

  var percent = Math.round((correct / quizData.length) * 100);

  document.getElementById("totalQuestions").innerHTML = quizData.length;
  document.getElementById("correctCount").innerHTML = correct;
  document.getElementById("wrongCount").innerHTML = wrong;
  document.getElementById("skippedCount").innerHTML = skipped;
  document.getElementById("scorePercent").innerHTML = percent + "%";

  var reviewContainer = document.getElementById("allQuestionsReviewList");
  reviewContainer.innerHTML = "";

  quizData.forEach(function(item, idx) {
    var card = document.createElement("div");
    card.className = "review-card";

    var qBadge = document.createElement("div");
    qBadge.className = "review-q-badge";
    qBadge.innerHTML = "Question : " + (idx + 1);
    card.appendChild(qBadge);

    var qTitle = document.createElement("div");
    qTitle.className = "review-q-text";
    qTitle.innerHTML = decodeEntities(item.question);
    card.appendChild(qTitle);

    var uAns = userAnswers[idx];

    if (uAns === null) {
      var notAttemptedDiv = document.createElement("div");
      notAttemptedDiv.className = "review-not-attempted-badge";
      notAttemptedDiv.innerHTML = "तुम्ही हा प्रश्न सोडवला नाही ";
      card.appendChild(notAttemptedDiv);
    }

    var optsBox = document.createElement("div");
    optsBox.className = "review-options";

    item.options.forEach(function(optText, optIdx) {
      var optDiv = document.createElement("div");
      optDiv.className = "review-opt";

      var prefix = letters[optIdx] || (optIdx + 1);
      var cleanText = cleanOptionText(optText, optIdx);

      if (optIdx === item.correctIndex) {
        optDiv.classList.add("opt-correct");
        optDiv.innerHTML = "<span class='opt-prefix'>" + prefix + "</span><span>" + decodeEntities(cleanText) + "</span>";
      } else if (optIdx === uAns) {
        optDiv.classList.add("opt-wrong");
        optDiv.innerHTML = "<span class='opt-prefix'>" + prefix + "</span><span>" + decodeEntities(cleanText) + "</span>";
      } else {
        optDiv.innerHTML = "<span class='opt-prefix'>" + prefix + "</span><span>" + decodeEntities(cleanText) + "</span>";
      }

      optsBox.appendChild(optDiv);
    });
    card.appendChild(optsBox);

    if (item.hint) {
      var hintDiv = document.createElement("div");
      hintDiv.className = "review-hint";
      hintDiv.innerHTML = " <strong style='font-weight: 700; color: #1f1f1f;'>स्पष्टीकरण :</strong> " + decodeEntities(item.hint);
      card.appendChild(hintDiv);
    }

    reviewContainer.appendChild(card);
  });

  var nextTestBox = document.getElementById("nextTestContainer");
  var nextTestA = document.getElementById("nextTestLink");
  if (typeof nextTestURL !== 'undefined' && nextTestURL && nextTestURL.trim() !== "") {
    nextTestA.href = nextTestURL;
    nextTestBox.style.display = "block";
  } else {
    nextTestBox.style.display = "none";
  }

  document.getElementById("quizMainBox").style.display = "none";
  document.getElementById("scorecardBox").style.display = "block";
}

function restartQuiz() {
  if (!window.quizData) return;
  currentIndex = 0;
  userAnswers = new Array(quizData.length).fill(null);
  document.getElementById("scorecardBox").style.display = "none";
  document.getElementById("quizMainBox").style.display = "block";
  startTimer();
  loadQuestion(currentIndex);
}

function initQuiz() {
  restartQuiz();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initQuiz);
} else {
  initQuiz();
}
