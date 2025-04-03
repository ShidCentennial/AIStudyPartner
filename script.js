const questions = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    answer: 2,
    explanation: "Paris is the capital of France. It is known for landmarks like the Eiffel Tower and the Louvre Museum."
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    answer: 1,
    explanation: "Mars is called the Red Planet because of its reddish appearance due to iron oxide (rust) on its surface."
  },
  {
    question: "Who wrote 'To Kill a Mockingbird'?",
    options: ["Mark Twain", "J.K. Rowling", "Harper Lee", "Charles Dickens"],
    answer: 2,
    explanation: "Harper Lee wrote 'To Kill a Mockingbird,' a novel about racial injustice in the American South."
  },
  {
    question: "What is the chemical symbol for water?",
    options: ["O2", "CO2", "H2O", "NaCl"],
    answer: 2,
    explanation: "The chemical symbol for water is H2O, which means two hydrogen atoms and one oxygen atom."
  },
  {
    question: "Which element has the atomic number 1?",
    options: ["Helium", "Oxygen", "Hydrogen", "Carbon"],
    answer: 2,
    explanation: "Hydrogen has the atomic number 1 because it has only one proton in its nucleus."
  },
  {
    question: "What is the largest mammal in the world?",
    options: ["Elephant", "Blue Whale", "Giraffe", "Orca"],
    answer: 1,
    explanation: "The Blue Whale is the largest mammal, weighing up to 200 tons and reaching lengths of 100 feet."
  },
  {
    question: "What is the square root of 64?",
    options: ["6", "7", "8", "9"],
    answer: 2,
    explanation: "The square root of 64 is 8 because 8 × 8 = 64."
  }
];

let currentQuestionIndex = 0;
let score = 0;

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('next-btn');
const feedbackEl = document.getElementById('feedback');
const resultEl = document.getElementById('result');

function showQuestion() {
  resetState();
  const currentQuestion = questions[currentQuestionIndex];
  questionEl.textContent = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;
  
  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.innerText = option;
    button.classList.add('option-btn');
    button.addEventListener('click', () => handleAnswer(index));
    optionsEl.appendChild(button);
  });
}

function resetState() {
  nextBtn.style.display = 'none';
  feedbackEl.innerText = '';
  optionsEl.innerHTML = '';
}

function handleAnswer(selectedIndex) {
  const currentQuestion = questions[currentQuestionIndex];
  if (selectedIndex === currentQuestion.answer) {
    feedbackEl.textContent = "✅ Correct!";
    feedbackEl.classList.add('correct');
    score++;
  } else {
    feedbackEl.innerHTML = `❌ Incorrect!<br>👉 Explanation: ${currentQuestion.explanation}`;
    feedbackEl.classList.add('incorrect');
  }

  nextBtn.style.display = 'block';
}

nextBtn.addEventListener('click', () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
});

function showResult() {
  resetState();
  questionEl.style.display = 'none';
  optionsEl.style.display = 'none';
  nextBtn.style.display = 'none';
  resultEl.innerHTML = `🎉 You scored ${score} out of ${questions.length}!`;
}

showQuestion();
