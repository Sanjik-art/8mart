/*
  js/quiz.js

  How to add/modify questions:
  - Edit the `questions` array below. Each item is an object with:
    { id: number, question: string, options: [4 strings], correctIndex: 0-based index }
  - Ensure id values are sequential starting at 1 if you want to keep query param navigation simple.
  - The UI navigates using query parameter q (1..N). quiz.html reads q and renders that question.

  This file handles rendering, click handlers, wrong-answer redirect to error.html?q=<current> and
  the final rating UI where the "Ужас" button avoids clicks.
*/

// Single source of quiz data
const questions = [
  {
    id: 1,
    question: '1) Қандай мереке келе жатыр?',
    options: [
      'A) Халықаралық балалар күні',
      'B) Халықаралық әйелдер күні',
      'C) Отан қорғаушылар күні',
      'D) Тәуелсіздік алған күн'
    ],
    correctIndex: 1
  },
  {
    id: 2,
    question: '2)Ең әдемі қыздар қайда?',
    options: [
      'A) балдарменен тойда екен',
      'B) 11"Ә" сыныбында',
      'C) 11"А" сыныбында',
      'D) Алматыда'
    ],
    correctIndex: 1
  },
  {
    id: 3,
    question: '3) Алғаш жылқыны қолға үйреткен қай мәдениет',
    options: [
      'A) Көнешұнқыр',
      'B) Беғазы-Дәндібай',
      'C) Сынтасты',
      'D) Ботай'
    ],
    correctIndex: 3
  },
  {
    id: 4,
    question: '4) Дәулеттің туған күні қашан?',
    options: [
      'A) 22 сәуір',
      'B) 22 мамыр',
      'C) 22 наурыз',
      'D) 22 тамыз'
    ],
    correctIndex: 2
  },
  {
    id: 5,
    question: '5)Жасыл түс қандай?',
    options: [
      'A) Көк',
      'B) Қызыл',
      'C) Жасыл',
      'D) Сары'
    ],
    correctIndex: 2
  }
];

// Utility: read query param 'q'
function getQueryIndex(){
  const params = new URLSearchParams(window.location.search);
  const q = parseInt(params.get('q'));
  if (!q || q < 1) return 1;
  return Math.min(q, questions.length);
}

// Render logic for quiz.html
document.addEventListener('DOMContentLoaded', ()=>{
  const qIndex = getQueryIndex();
  // If not on quiz.html, nothing to do
  const questionEl = document.getElementById('question');
  const optionsEl = document.getElementById('options');
  const currentEl = document.getElementById('current');

  if (!questionEl || !optionsEl) return;

  const currentQuestion = questions.find(x => x.id === qIndex) || questions[0];
  // Fill progress
  currentEl.textContent = currentQuestion.id;

  // Render question
  questionEl.textContent = currentQuestion.question;

  // Clear previous options
  optionsEl.innerHTML = '';

  // Render options as buttons for accessibility and consistent behavior
  currentQuestion.options.forEach((optText, idx)=>{
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.setAttribute('role','listitem');
    btn.setAttribute('aria-label', optText);
    btn.tabIndex = 0;
    btn.innerText = optText;
    // Click handler
    btn.addEventListener('click', ()=>handleAnswer(idx, currentQuestion));
    // keyboard: Enter/Space also activate button by default
    optionsEl.appendChild(btn);
  });

  // Prepare rating overlay handlers
  const ratingOverlay = document.getElementById('ratingOverlay');
  const goodBtn = document.getElementById('goodBtn');
  const badBtn = document.getElementById('badBtn');

  if (goodBtn) {
    goodBtn.addEventListener('click', ()=>{
      // Redirect to external site
      window.location.href = 'https://project22933443.tilda.ws';
    });
  }

  if (badBtn){
    // Make the 'Ужас' button avoid being clicked.
    // For pointer devices, move on pointerenter. For touch, move on touchstart.
    const container = document.getElementById('ratingActions');

    function moveButtonRandomly(){
      // Keep it within the container bounds
      const rect = container.getBoundingClientRect();
      const btnRect = badBtn.getBoundingClientRect();
      const maxX = Math.max(0, rect.width - btnRect.width);
      const maxY = Math.max(0, rect.height - btnRect.height);
      const x = Math.random() * maxX;
      const y = Math.random() * maxY;
      badBtn.style.transform = `translate(${x}px, ${y}px)`;
    }

    badBtn.addEventListener('pointerenter', ()=>{
      moveButtonRandomly();
    });
    // Touch devices
    badBtn.addEventListener('touchstart', (e)=>{
      e.preventDefault(); // prevent immediate click
      moveButtonRandomly();
    }, {passive:false});
    // Also make click try to move away once then prevent actual navigation
    badBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      moveButtonRandomly();
    });
  }

  // If we landed on q > length, just show final screen
  if (currentQuestion.id === questions.length){
    // Do not auto-show rating overlay here; only show after correct answer on last question
  }
});

// Handle answer selection for question
function handleAnswer(selectedIndex, question){
  // Buttons may be multiple; find them to show feedback
  const optionButtons = Array.from(document.querySelectorAll('.option-btn'));
  // If correct
  if (selectedIndex === question.correctIndex){
    // Brief visual success on selected button
    const btn = optionButtons[selectedIndex];
    if (btn){
      btn.classList.add('correct');
      btn.classList.add('flash-success');
    }
    // After a small delay, proceed to next question or show rating
    setTimeout(()=>{
      if (question.id < questions.length){
        const next = question.id + 1;
        // Navigate to next question via query param
        window.location.href = `quiz.html?q=${next}`;
      } else {
        // Last question answered correctly: show rating overlay
        const overlay = document.getElementById('ratingOverlay');
        if (overlay){
          overlay.hidden = false;
          overlay.setAttribute('aria-hidden','false');
        }
      }
    }, 600);
  } else {
    // Wrong answer: show brief red on the selected option then redirect to error.html?q=current
    const btn = optionButtons[selectedIndex];
    if (btn) btn.classList.add('wrong');
    // Redirect immediately (short timeout for visual cue)
    setTimeout(()=>{
      window.location.href = `error.html?q=${question.id}`;
    }, 350);
  }
}
