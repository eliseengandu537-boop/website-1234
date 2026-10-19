const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  mobileNav.hidden = true;
}
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  mobileNav.hidden = !expanded;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); }
});
window.matchMedia('(min-width: 601px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let heroVisible = false;
  const updateHeroVideo = () => {
    if (reduceMotion.matches || !heroVisible) { heroVideo.pause(); return; }
    heroVideo.play().catch(error => console.error('The hero background video could not start.', error));
  };
  if ('IntersectionObserver' in window) {
    const heroVideoObserver = new IntersectionObserver(entries => {
      heroVisible = entries.some(entry => entry.isIntersecting);
      updateHeroVideo();
    }, { threshold: 0.01 });
    heroVideoObserver.observe(heroVideo);
  } else {
    heroVisible = true;
    updateHeroVideo();
  }
  reduceMotion.addEventListener('change', updateHeroVideo);
  heroVideo.addEventListener('error', () => console.error('The hero background video could not be loaded.', heroVideo.error));
}

const services = [
  { title: 'Back to its best.', kicker: 'A NEW CHAPTER FOR YOUR PUMP', description: 'Complete restoration of worn or damaged pumps, with repairs and replacement components tailored to your equipment’s condition.', image: 'pump-refurbishment.webp', alt: 'Refurbished orange industrial pump in the Fedpump workshop', name: 'Pump refurbishment' },
  { title: 'Start with the right insight.', kicker: 'UNDERSTAND THE CAUSE', description: 'Detailed inspection of casings, impellers, bearings, seals and shafts helps identify the root cause of poor performance or failure.', image: 'pump-components.webp', alt: 'Machined pump component ready for inspection', name: 'Inspection & assessment' },
  { title: 'Every component counts.', kicker: 'PRECISION IN THE DETAILS', description: 'Reconditioning or replacement of shafts, impellers, casings and seals, including shaft reclamation and impeller keyway work.', image: 'pump-assembly.webp', alt: 'Reconditioned orange pump assembly', name: 'Component reconditioning' },
  { title: 'Made to your requirements.', kicker: 'SKILL MEETS CAPABILITY', description: 'CNC and general machining, milling and drilling across cast iron, stainless steel, bronze and specialised alloys for old and new pump components.', image: 'machining.webp', alt: 'Precision machining of a metal component', name: 'Precision machining' }
];
document.querySelectorAll('[data-service]').forEach(button => {
  button.addEventListener('click', () => {
    const index = Number(button.dataset.service);
    const service = services[index];
    document.querySelectorAll('[data-service]').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-expanded', String(active));
    });
    document.querySelector('#service-title').textContent = service.title;
    document.querySelector('#service-kicker').textContent = service.kicker;
    document.querySelector('#service-description').textContent = service.description;
    const image = document.querySelector('#service-image');
    image.src = `assets/${service.image}`;
    image.alt = service.alt;
    document.querySelector('#service-detail').setAttribute('aria-labelledby', button.id);
    document.querySelector('#service-enquiry').dataset.enquiryService = service.name;
  });
});

const enquiryDialog = document.querySelector('#enquiry-dialog');
const galleryDialog = document.querySelector('#gallery-dialog');
function openDialog(dialog) { dialog.showModal(); document.body.classList.add('dialog-open'); }
document.querySelectorAll('[data-enquiry]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.enquiryService) document.querySelector('[name=service]').value = button.dataset.enquiryService;
  openDialog(enquiryDialog);
}));
document.querySelectorAll('[data-gallery]').forEach(button => button.addEventListener('click', () => {
  document.querySelector('#gallery-image').src = button.dataset.gallery;
  document.querySelector('#gallery-image').alt = button.dataset.caption;
  document.querySelector('#gallery-caption').textContent = button.dataset.caption;
  openDialog(galleryDialog);
}));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
});

let enquiryText = '';
const enquiryForm = document.querySelector('#enquiry-form');
enquiryForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!enquiryForm.reportValidity()) return;
  const values = new FormData(enquiryForm);
  const subject = `Fedpump enquiry: ${values.get('service')}`;
  enquiryText = `Hello Fedpump team,\n\nI would like to discuss ${values.get('service').toLowerCase()}.\n\nName: ${values.get('name')}\nCompany: ${values.get('company') || 'Not provided'}\nEmail: ${values.get('email')}\n\nProject details:\n${values.get('details')}\n\nKind regards,\n${values.get('name')}`;
  document.querySelector('#enquiry-result').hidden = false;
  document.querySelector('#copy-enquiry').textContent = 'Copy enquiry';
  window.location.href = `mailto:Sonia.dacunha@yahoo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(enquiryText)}`;
});
document.querySelector('#copy-enquiry').addEventListener('click', async event => {
  const button = event.currentTarget;
  try { await navigator.clipboard.writeText(enquiryText); button.textContent = 'Enquiry copied ✓'; }
  catch {
    let fallback = document.querySelector('#enquiry-copy-fallback');
    if (!fallback) { fallback = document.createElement('textarea'); fallback.id = 'enquiry-copy-fallback'; fallback.setAttribute('aria-label', 'Enquiry text to copy'); fallback.readOnly = true; button.after(fallback); }
    fallback.value = enquiryText; fallback.focus(); fallback.select(); button.textContent = 'Select and copy the enquiry below';
  }
});
enquiryForm.addEventListener('input', () => { document.querySelector('#enquiry-result').hidden = true; });

// Scroll behaviour lives in motion.js; enquiry and gallery interactions remain independent.
document.querySelector('#copyright-year').textContent = new Date().getFullYear();

const assistantLauncher = document.querySelector('#lead-assistant-launcher');
const assistantPanel = document.querySelector('#lead-assistant-panel');
const assistantClose = assistantPanel.querySelector('.lead-assistant-close');
const assistantMessages = document.querySelector('#lead-assistant-messages');
const assistantOptions = document.querySelector('#lead-assistant-options');
const assistantForm = document.querySelector('#lead-assistant-form');
const assistantInput = document.querySelector('#lead-assistant-input');
const assistantLead = {};
let assistantStep = 'service';

function addAssistantMessage(text, sender = 'assistant') {
  const message = document.createElement('div');
  message.className = `lead-assistant-message ${sender}`;
  message.textContent = text;
  assistantMessages.append(message);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

function setAssistantPrompt(step, prompt, placeholder, inputType = 'text') {
  assistantStep = step;
  addAssistantMessage(prompt);
  assistantInput.type = inputType;
  assistantInput.placeholder = placeholder;
  assistantInput.autocomplete = step === 'email' ? 'email' : step === 'name' ? 'name' : 'off';
  assistantInput.value = '';
  assistantInput.focus();
}

function setAssistantOptions(options) {
  assistantOptions.replaceChildren();
  options.forEach(({ label, value, action }) => {
    const button = document.createElement('button');
    button.className = 'lead-assistant-option';
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => action ? action() : submitAssistantAnswer(value));
    assistantOptions.append(button);
  });
}

function chooseAssistantService(label, service) {
  assistantLead.service = service;
  addAssistantMessage(label, 'user');
  askForProjectDetails();
}

function startAssistant() {
  assistantMessages.replaceChildren();
  assistantLead.service = '';
  assistantLead.details = '';
  assistantLead.name = '';
  assistantLead.company = '';
  assistantLead.email = '';
  assistantLead.phone = '';
  assistantForm.hidden = false;
  assistantOptions.replaceChildren();
  assistantInput.type = 'text';
  assistantInput.maxLength = 800;
  assistantInput.placeholder = 'Or briefly describe the job…';
  assistantInput.autocomplete = 'off';
  assistantStep = 'service';
  addAssistantMessage('Hi, I’m the Fedpump project assistant. I can help you prepare an enquiry for our engineering team. What can we help with?');
  setAssistantOptions([
    { label: 'Pump refurbishment', value: 'Pump refurbishment', action: () => chooseAssistantService('Pump refurbishment', 'Pump refurbishment') },
    { label: 'Inspection or assessment', value: 'Inspection & assessment', action: () => chooseAssistantService('Inspection or assessment', 'Inspection & assessment') },
    { label: 'Components or machining', value: 'Component reconditioning / precision machining', action: () => chooseAssistantService('Components or machining', 'Component reconditioning / precision machining') },
    { label: 'Something else', value: 'General enquiry', action: () => chooseAssistantService('Something else', 'General enquiry') }
  ]);
}

function askForProjectDetails() {
  setAssistantOptions([]);
  setAssistantPrompt('details', 'Tell us a little about the pump, component or work you need. Include any model or urgency details that might help.', 'Describe your project…');
}

function askForName() {
  setAssistantOptions([]);
  setAssistantPrompt('name', 'What name should we use when we reply?', 'Your name');
  assistantInput.maxLength = 100;
}

function askForCompany() {
  setAssistantPrompt('company', 'What company are you with? (Optional)', 'Company name (optional)');
  assistantInput.maxLength = 120;
  setAssistantOptions([{ label: 'Skip', action: () => submitAssistantAnswer('') }]);
}

function askForEmail() {
  setAssistantOptions([]);
  setAssistantPrompt('email', 'What email address can the Fedpump team reply to?', 'you@company.co.za', 'email');
  assistantInput.maxLength = 254;
}

function askForPhone() {
  setAssistantPrompt('phone', 'Would you like to include a phone number? (Optional)', 'Phone number (optional)', 'tel');
  assistantInput.maxLength = 40;
  setAssistantOptions([{ label: 'Skip', action: () => submitAssistantAnswer('') }]);
}

function finishAssistant() {
  assistantStep = 'complete';
  assistantForm.hidden = true;
  assistantOptions.replaceChildren();
  const subject = `Fedpump project enquiry: ${assistantLead.service}`;
  const body = [
    'Hello Fedpump team,',
    '',
    `Service: ${assistantLead.service}`,
    `Project details: ${assistantLead.details}`,
    '',
    `Name: ${assistantLead.name}`,
    `Company: ${assistantLead.company || 'Not provided'}`,
    `Email: ${assistantLead.email}`,
    `Phone: ${assistantLead.phone || 'Not provided'}`
  ].join('\n');
  addAssistantMessage(`Thanks, ${assistantLead.name}. Your enquiry is ready. Select below to open it in your email app, review the details and send it to our team.`);
  const link = document.createElement('a');
  link.href = `mailto:Sonia.dacunha@yahoo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  link.innerHTML = 'Open email draft <svg aria-hidden="true"><use href="#arrow-up"></use></svg>';
  assistantMessages.lastElementChild.append(link);
  setAssistantOptions([{ label: 'Start another enquiry', action: startAssistant }]);
}

function submitAssistantAnswer(value) {
  const answer = value.trim();
  if (!answer && assistantStep !== 'company' && assistantStep !== 'phone') {
    assistantInput.setCustomValidity('Please enter a reply, or choose Skip if that option is available.');
    assistantInput.reportValidity();
    assistantInput.setCustomValidity('');
    return;
  }
  addAssistantMessage(answer || 'Skipped', 'user');
  if (assistantStep === 'service') {
    assistantLead.service = 'General enquiry';
    assistantLead.details = answer;
    askForName();
  } else if (assistantStep === 'details') {
    assistantLead.details = answer;
    askForName();
  } else if (assistantStep === 'name') {
    assistantLead.name = answer;
    askForCompany();
  } else if (assistantStep === 'company') {
    assistantLead.company = answer;
    askForEmail();
  } else if (assistantStep === 'email') {
    assistantLead.email = answer;
    askForPhone();
  } else if (assistantStep === 'phone') {
    assistantLead.phone = answer;
    finishAssistant();
  }
}

assistantLauncher.addEventListener('click', () => {
  const opening = assistantPanel.hidden;
  assistantPanel.hidden = !opening;
  assistantLauncher.setAttribute('aria-expanded', String(opening));
  if (opening) {
    if (!assistantMessages.childElementCount) startAssistant();
    assistantInput.focus();
  }
});
assistantClose.addEventListener('click', () => {
  assistantPanel.hidden = true;
  assistantLauncher.setAttribute('aria-expanded', 'false');
  assistantLauncher.focus();
});
assistantForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!assistantForm.reportValidity()) return;
  if (assistantStep === 'email' && !assistantInput.checkValidity()) {
    assistantInput.reportValidity();
    return;
  }
  submitAssistantAnswer(assistantInput.value.trim());
});
assistantInput.addEventListener('input', () => assistantInput.setCustomValidity(''));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !assistantPanel.hidden) {
    assistantPanel.hidden = true;
    assistantLauncher.setAttribute('aria-expanded', 'false');
    assistantLauncher.focus();
  }
});
startAssistant();
