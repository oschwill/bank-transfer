'use strict';

const account1 = {
  owner: 'Olli Meisenkaiser',
  movements: [
    {
      value: 200,
      date: '15. Juni 2021, 13:41',
    },
    {
      value: 450,
      date: '17. Juni 2021, 03:49',
    },
    {
      value: -400,
      date: '18. August 2021, 12:12',
    },
    {
      value: 3000,
      date: '10. September 2021, 19:05',
    },
    {
      value: -650,
      date: '25. Oktober 2021, 06:01',
    },
  ],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davidson',
  movements: [
    {
      value: -200,
      date: '15. Juni 2021, 13:41',
    },
    {
      value: 4500,
      date: '17. Juni 2021, 03:49',
    },
    {
      value: -400,
      date: '18. August 2021, 12:12',
    },
    {
      value: 3050,
      date: '10. September 2021, 19:05',
    },
    {
      value: -1650,
      date: '25. Oktober 2021, 06:01',
    },
  ],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Sir Steven Thomas',
  movements: [
    {
      value: -2000,
      date: '15. Juni 2021, 13:41',
    },
    {
      value: 8500,
      date: '17. Juni 2021, 03:49',
    },
    {
      value: -450,
      date: '18. August 2021, 12:12',
    },
    {
      value: 4050,
      date: '10. September 2021, 19:05',
    },
    {
      value: -2650,
      date: '25. Oktober 2021, 06:01',
    },
  ],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Connor',
  movements: [
    {
      value: 250,
      date: '15. Juni 2021, 13:41',
    },
    {
      value: -500,
      date: '17. Juni 2021, 03:49',
    },
    {
      value: -4000,
      date: '18. August 2021, 12:12',
    },
    {
      value: 10000,
      date: '10. September 2021, 19:05',
    },
    {
      value: -2500,
      date: '25. Oktober 2021, 06:01',
    },
  ],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');
const userCredentials = document.querySelector('.user__credentials');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const transferMessage = document.querySelector('.transfer__message');
const loanMessage = document.querySelector('.loan__message');
const closeAccountMessage = document.querySelector('.operation__message');

const eurToUsd = 1.1;
const errorMessage = 'form__message--error';
const successMessage = 'form__message--success';

// time
let countDownTime;
let messageTimer;

/*** FUNCTIONS ***/

const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = ''; // clear den Standard inhalt innerhal von movements

  const movs = sort ? account.movements.slice().sort((a, b) => a - b) : account.movements;

  movs.forEach((mov, i) => {
    const type = mov.value > 0 ? 'IN' : 'OUT';

    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${i + 1}: ${type} </div>
          <div class="movements__date">${mov.date}</div>
          <div class="movements__value">${mov.value.toFixed(2)} €</div>
        </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = (account) => {
  account.balance = account.movements.reduce((acc, mov) => acc + mov.value, 0);
  labelBalance.textContent = `${account.balance} €`;
};

const calcDisplaySummary = (account) => {
  const incomes = account.movements.reduce(
    (acc, val) => (val.value > 0 ? acc + val.value : acc),
    0
  );
  labelSumIn.textContent = `${incomes.toFixed(2)} €`;

  const out = account.movements.reduce((acc, val) => (val.value < 0 ? acc + val.value : acc), 0);
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)} €`;

  const interest = account.movements.reduce(
    (acc, v) =>
      v.value > 0
        ? (v.value * account.interestRate) / 100 >= 1
          ? acc + (v.value * account.interestRate) / 100
          : acc
        : acc,
    0
  );
  labelSumInterest.textContent = `${interest.toFixed(2)} €`;
};

const createUserName = (accs) => {
  accs.forEach((acc) => {
    acc.userName = acc.owner
      .toLocaleLowerCase()
      .split(' ')
      .map((name) => name[0])
      .join('');
  });
};

const createMessage = (onCss, withCss, message) => {
  onCss.innerHTML = ''; // einmal vorher clearen!!
  onCss.insertAdjacentHTML('afterbegin', `<span class="${withCss}">${message}</span>`);

  clearTimeout(messageTimer);

  messageTimer = setTimeout(() => {
    onCss.style.opacity = 0;
    onCss.innerHTML = '';
  }, 5000);
};

const showUserCredentials = () => {
  userCredentials.insertAdjacentHTML(
    'afterbegin',
    `<table>
      <tr>
      <th>Benutzername</th>
      <th>Passwort</th>
      </tr>
      ${accounts
        .map((acc) => {
          return `
          <tr>
            <td>${acc.userName}</td>
            <td>${acc.pin}</td>
          </tr>
        `;
        })
        .join('')}
      </table>`
  );
};

createUserName(accounts);
showUserCredentials();

const updateUi = (acc) => {
  // displayen
  displayMovements(acc);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};

const setCountdown = () => {
  countDownTime = new Date(Date.now() + 5 * 60 * 1000).getTime();
  const countDown = setInterval(() => {
    // Get today's date and time
    const now = new Date().getTime();

    let distance = countDownTime - now;

    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    labelTimer.textContent =
      `${minutes < 10 ? '0' + minutes : minutes}` +
      ':' +
      `${seconds < 10 ? '0' + seconds : seconds}`;

    // If the count down is finished, log User out
    if (distance < 1000) {
      clearInterval(countDown);
      containerApp.style.opacity = 0;
    }
  }, 1000);
};

const formatDate = (date) => {
  return date.toLocaleString('default', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/*** EVENTHANDLERS ***/
let currentAccount;

// LOGIN
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find((acc) => acc.userName === inputLoginUsername.value.trim());

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Willkommen zurück, ${currentAccount.owner}`;

    containerApp.style.opacity = 100;

    inputLoginUsername.value = inputLoginPin.value = ''; // input Felder clearn
    inputLoginPin.blur(); // den Fokus herausnehmen

    updateUi(currentAccount);

    // aktuelles Datum
    const newDate = formatDate(new Date());
    labelDate.textContent = newDate;

    // Set logout Timer
    setCountdown();
  }
});

// Transfer Button
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find((acc) => acc.userName === inputTransferTo.value);

  transferMessage.style.opacity = 1;

  inputTransferAmount.value = inputTransferTo.value = ''; // Felder clearen

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.userName !== currentAccount.userName
  ) {
    // Sender Konto
    currentAccount.movements.push({
      value: -amount,
      date: formatDate(new Date()),
    });

    // Empfänger Konto
    receiverAcc.movements.push({
      value: amount,
      date: formatDate(new Date()),
    });

    updateUi(currentAccount);

    createMessage(transferMessage, successMessage, 'Überweisung erfolgreich');
  } else {
    createMessage(transferMessage, errorMessage, 'Überweisung fehlgeschlagen');
  }
});

// Darlehen anfordern
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  loanMessage.style.opacity = 1;

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some((mov) => mov.value >= amount * 0.1)) {
    currentAccount.movements.push({
      value: amount,
      date: formatDate(new Date()),
    });

    updateUi(currentAccount);

    createMessage(loanMessage, successMessage, 'Darlehen gewährt!');
  } else {
    createMessage(loanMessage, errorMessage, 'Darlehen verweigert!');
  }

  inputLoanAmount.value = '';
});

// Account schließen
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  closeAccountMessage.style.opacity = 1;

  if (
    inputCloseUsername.value === currentAccount.userName &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex((acc) => acc.userName === currentAccount.userName);
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    userCredentials.innerHTML = '';

    showUserCredentials();
    labelWelcome.textContent = 'Melden Sie sich an, um loszulegen';
  } else {
    createMessage(closeAccountMessage, errorMessage, 'Accountschließung fehlgeschlagen!');
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

// Sortierung
let isSorting = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  isSorting = !isSorting;
  displayMovements(currentAccount.movements, isSorting);
});

// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);
