'use strict';

const bgShadow = document.querySelector('.bg-shadow');
const gameBox = document.querySelector('.container');
const gameField = document.querySelector('.main-content');
const button = document.querySelector('.footer__start');
const buttonDescription = button.innerHTML;

let secretCode;
let attemptCount = 0;
let gameStarted = false;

document.addEventListener('keydown', checkKey);
button.addEventListener('click', startGame);

function checkKey(keyboardEvent) {
  if (keyboardEvent.key !== 'Enter') {
    return;
  }

  if (gameStarted) {
    addResult();

    return;
  }

  startGame();
}

function startGame() {
  setTimeout(changeField, 1000);

  gameBox.classList.add('hidden');
  bgShadow.classList.add('hidden');
  document.getElementById('start').play();

  if (document.querySelector('.main-content__notification--success')) {
    document.querySelector('.main-content__notification--success').remove();
  }

  function changeField() {
    secretCode = Math.random().toString().slice(2, 6);

    // eslint-disable-next-line no-console
    console.log(secretCode);

    button.innerHTML = buttonDescription;
    gameField.innerHTML = '';

    gameField.insertAdjacentHTML('afterbegin', `
    <div class="main-content__guess">
      <label>
        Enter your guess here:
        <input type="text" class="main-content__input">
      </label>
      <p>
        Your previous guesses:
      </p>
    </div>
    <div class="main-content__storage">
    </div>
  `);

    gameBox.classList.remove('hidden');
    gameField.querySelector('.main-content__input').focus();

    gameStarted = true;

    button.removeEventListener('click', startGame);
    button.addEventListener('click', addResult);
  }
}

function addResult() {
  const storage = gameField.querySelector('.main-content__storage');
  const input = gameField.querySelector('.main-content__input');

  input.focus();

  if (!validateInput(input.value)) {
    input.value = '';

    return;
  }

  const result = getHint(secretCode, input.value);

  storage.insertAdjacentHTML('beforeend', `
      ${result}
      <br>
    `);

  storage.scrollTop = storage.scrollHeight;
  input.value = '';

  function validateInput(value) {
    switch (true) {
      case !value:
      case isNaN(+value):
      case value.length !== 4:
        pushNotification(
          'Wrong input!',
          'Enter 4 digits',
          'error'
        );

        document.getElementById('error').play();

        return false;

      default:
        return true;
    }
  }

  function getHint(secret, guess) {
    const chars = new Map();
    let bulls = 0;
    let cows = 0;

    attemptCount++;

    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === secret[i]) {
        bulls++;
      } else {
        chars.set(secret[i], chars.get(secret[i]) + 1 || 1);
      }
    }

    for (let i = 0; i < guess.length; i++) {
      if (chars.get(guess[i]) > 0 && secret[i] !== guess[i]) {
        cows++;
        chars.set(guess[i], chars.get(guess[i]) - 1);
      }
    }

    if (bulls === 4) {
      congratulate();
    }

    return `Attempt #<span class="main-content__fail">${attemptCount}</span>:
      <span class="main-content__attempt">${guess}</span>, you guessed
      <span class="main-content__right">${bulls} bulls</span>,
      <span class="main-content__almost">${cows} cows</span>
    `;
  }

  function congratulate() {
    const firstW = (attemptCount === 1) ? 'Amazing' : 'Congrats';
    const lastW = (attemptCount === 1) ? 'try' : 'tries';

    gameField.innerHTML = '';
    bgShadow.classList.remove('hidden');

    pushNotification(
      `You won!`,
      `${firstW}, you guessed all the bulls in ${attemptCount} ${lastW}!`,
      `success`
    );

    document.getElementById('success').play();

    attemptCount = 0;
    gameStarted = false;

    button.innerHTML = 'Play again';
    button.removeEventListener('click', addResult);
    button.addEventListener('click', startGame);
  }
}

function pushNotification(title, description, type) {
  const message = document.createElement('div');

  message.classList.add('main-content__notification');
  message.classList.add(`main-content__notification--${type}`);

  message.insertAdjacentHTML('afterbegin', `
    <h2>
      ${title}
    </h2>
    <p>
      ${description}
    </p>
  `);

  document.body.append(message);

  if (type === 'error') {
    setTimeout(() => message.remove(), 3000);
  }
}
