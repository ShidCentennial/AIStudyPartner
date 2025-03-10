const questions = [
  {
    question: "What is the capital of France?",
    options: ["Paris", "London", "Rome", "Berlin"],
    answer: "Paris"
  },
  {
    question: "What is 5 + 3?",
    options: ["5", "8", "10", "12"],
    answer: "8"
  },
  {
    question: "Who wrote 'To Kill a Mockingbird'?",
    options: ["Harper Lee", "George Orwell", "Mark Twain", "J.K. Rowling"],
    answer: "Harper Lee"
  }
];

let currentQuestionIndex = 0;
let score = 0;

const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const feedbackElement = document.getElementById("feedback");
const scoreElement = document.getElementById("score");

function loadQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
  questionElement.innerText = currentQuestion.question;
  optionsElement.innerHTML = "";

  currentQuestion.options.forEach(option => {
    const button = document.createElement("button");
    
    button.classList.add("option");
    button.innerText = option;
    button.onclick = () => handleAnswer(option);
    optionsElement.appendChild(button);
  });

  feedbackElement.innerText = "";
}

function handleAnswer(selectedOption) {
  const currentQuestion = questions[currentQuestionIndex];

  if (selectedOption === currentQuestion.answer) {
    score++;
    feedbackElement.innerText = "✅ Correct!";
    feedbackElement.style.color = "green";
  } else {
    feedbackElement.innerText = `❌ Wrong! The correct answer is: ${currentQuestion.answer}`;
    feedbackElement.style.color = "red";
  }

  currentQuestionIndex++;

  setTimeout(() => {
    if (currentQuestionIndex < questions.length) {
      loadQuestion();
    } else {
      showScore();
    }
  }, 1000);
}

function showScore() {
  questionElement.innerText = "Quiz Completed!";
  optionsElement.innerHTML = "";
  feedbackElement.innerText = "";
  scoreElement.innerText = `Your score: ${score} out of ${questions.length}`;
}

loadQuestion();
