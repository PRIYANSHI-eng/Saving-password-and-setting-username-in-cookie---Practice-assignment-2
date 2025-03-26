const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');

// Store data in local storage
function store(key, value) {
  localStorage.setItem(key, value);
}

// Retrieve data from local storage
function retrieve(key) {
  return localStorage.getItem(key);
}

// Generate a random 3-digit number
function getRandom3DigitNumber() {
  const randomNum = Math.floor(Math.random() * (MAX - MIN + 1) + MIN);
  store('originalNumber', randomNum); // Save the original number for verification
  return randomNum;
}

// Clear all data from local storage
function clearStorage() {
  localStorage.clear();
}

// Generate SHA256 hash using SubtleCrypto
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Generate and display the hash
async function getSHA256Hash() {
  let cachedHash = retrieve('sha256');
  
  if (!cachedHash) {
    const randomNum = getRandom3DigitNumber();
    cachedHash = await sha256(randomNum.toString());
    store('sha256', cachedHash);
  }
  
  sha256HashView.innerHTML = cachedHash;
}

// Validate the user's guess
async function test() {
  const pin = pinInput.value;

  if (pin.length !== 3) {
    resultView.innerHTML = '💡 Please enter a valid 3-digit number!';
    resultView.classList.remove('hidden');
    return;
  }

  const hashedPin = await sha256(pin);
  const storedHash = retrieve('sha256');

  if (hashedPin === storedHash) {
    resultView.innerHTML = `🎉 Correct! The number was ${pin}`;
    resultView.classList.add('success');
  } else {
    const originalNumber = retrieve('originalNumber');
    resultView.innerHTML = `❌ Wrong! The correct number was ${originalNumber}`;
  }
  
  resultView.classList.remove('hidden');
}

// Ensure only numeric input and limit to 3 digits
pinInput.addEventListener('input', (e) => {
  const { value } = e.target;
  pinInput.value = value.replace(/\D/g, '').slice(0, 3);
});

// Attach test function to button
document.getElementById('check').addEventListener('click', test);

// Initialize the hash display
getSHA256Hash();
