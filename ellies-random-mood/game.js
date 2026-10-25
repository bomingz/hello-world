"use strict";

const moods = [
  { id: "sunny", name: "Tiny sunshine", caption: "Everything is wonderful. Especially me.", alt: "An abstract Ellie-inspired emoji with a big happy smile." },
  { id: "cheeky", name: "Up to something", caption: "That innocent face? Absolutely intentional.", alt: "An abstract Ellie-inspired emoji with a mischievous grin." },
  { id: "sleepy", name: "Five more minutes", caption: "Big feelings. Very small battery.", alt: "An abstract Ellie-inspired emoji looking drowsy and cozy." },
  { id: "grumpy", name: "Very unimpressed", caption: "I have a complaint. It’s mostly everything.", alt: "An abstract Ellie-inspired emoji with a playful grumpy pout." }
];

const card = document.querySelector("#mood-card");
const image = document.querySelector("#mood-image");
const mystery = document.querySelector("#mystery");
const button = document.querySelector("#generate");
const buttonLabel = document.querySelector("#button-label");
const name = document.querySelector("#mood-name");
const caption = document.querySelector("#mood-caption");
const kicker = document.querySelector("#result-kicker");
const number = document.querySelector("#draw-number");
let lastMood = null;
let draws = 0;

// Load every sticker before the first reveal so the result appears in one piece.
const loadAssets = () => Promise.all(moods.map(mood => new Promise(resolve => {
  const sticker = new Image();
  sticker.onload = () => resolve(true);
  sticker.onerror = () => resolve(false);
  sticker.src = `assets/${mood.id}.png?v=2`;
})));
let assetsReady = loadAssets();

button.addEventListener("click", async () => {
  if (button.disabled) return;
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  buttonLabel.textContent = "Finding a feeling…";
  card.classList.remove("revealed");
  card.classList.add("rolling");
  image.hidden = true;
  mystery.hidden = false;

  const delay = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650;
  const [loaded] = await Promise.all([assetsReady, new Promise(resolve => setTimeout(resolve, delay))]);
  if (loaded.some(ready => !ready)) {
    card.classList.remove("rolling");
    name.textContent = "A little hiccup.";
    caption.textContent = "The stickers are taking a moment. Give it another tap.";
    assetsReady = loadAssets();
    kicker.textContent = "The stickers couldn’t load";
    buttonLabel.textContent = "Try again";
    button.disabled = false;
    button.removeAttribute("aria-busy");
    return;
  }

  const choices = moods.filter(mood => mood.id !== lastMood);
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  const mood = choices[Math.floor(random[0] / 2 ** 32 * choices.length)];
  lastMood = mood.id;
  draws += 1;
  card.dataset.mood = mood.id;
  number.textContent = String(draws).padStart(2, "0");
  image.src = `assets/${mood.id}.png?v=2`;
  // The nearby live text describes the mood; the sticker is decorative.
  image.alt = "";
  name.textContent = mood.name;
  caption.textContent = mood.caption;
  kicker.textContent = "The mood has spoken";
  mystery.hidden = true;
  image.hidden = false;
  card.classList.remove("rolling");
  card.classList.add("revealed");
  buttonLabel.textContent = "Generate mood";
  button.disabled = false;
  button.removeAttribute("aria-busy");
});
