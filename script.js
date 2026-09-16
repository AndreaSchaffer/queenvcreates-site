const steps = [...document.querySelectorAll('.form-step')];
let currentStep = 1;
const form = document.getElementById('bookingForm');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const backBtn = document.getElementById('backBtn');
const stepCircle = document.getElementById('stepCircle');
const stepLabelNumber = document.getElementById('stepLabelNumber');
const stepTitle = document.getElementById('stepTitle');
const titles = ['Choose your service','Choose your add-ons','Choose a date & time','Your details'];

function updateStep(){
  steps.forEach(s => s.classList.toggle('active', Number(s.dataset.step) === currentStep));
  stepCircle.textContent = currentStep;
  stepLabelNumber.textContent = currentStep;
  stepTitle.textContent = titles[currentStep - 1];
  backBtn.disabled = currentStep === 1;
  nextBtn.hidden = currentStep === 4;
  submitBtn.hidden = currentStep !== 4;
  if(currentStep === 4) buildSummary();
  document.getElementById('booking').scrollIntoView({behavior:'smooth', block:'start'});
}

function validateCurrent(){
  const active = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  const fields = [...active.querySelectorAll('input[required], textarea[required]')];
  for(const field of fields){
    if(!field.checkValidity()){
      field.reportValidity();
      return false;
    }
  }
  return true;
}

function goStep(direction){
  if(direction > 0 && !validateCurrent()) return;
  currentStep = Math.min(4, Math.max(1, currentStep + direction));
  updateStep();
}

function buildSummary(){
  const service = document.querySelector('input[name="service"]:checked');
  const addons = [...document.querySelectorAll('input[name="addons"]:checked')].map(x => x.value);
  const date = document.querySelector('input[name="date"]').value;
  const time = document.querySelector('input[name="time"]').value;
  const summary = document.getElementById('selectedSummary');
  const serviceText = service ? service.value.replace('|',' — $') : 'Not selected';
  summary.innerHTML = `<b>${serviceText}</b><br>${addons.length ? addons.join(' · ') : 'No add-ons'}<br>${date || 'No date'} ${time || ''}`;
  document.getElementById('summary').value = `${serviceText}; ${addons.join(', ') || 'No add-ons'}; ${date} ${time}`;
}

document.getElementById('dateInput').min = new Date().toISOString().split('T')[0];

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if(!validateCurrent()) return;
  buildSummary();
  const data = new FormData(form);
  try{
    const response = await fetch('/', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:new URLSearchParams(data).toString()});
    if(!response.ok) throw new Error('Submission failed');
    form.hidden = true;
    document.querySelector('.step-head').hidden = true;
    document.getElementById('successBox').hidden = false;
  }catch(error){
    alert('Your request could not be sent yet. If this is a local preview, deploy the site to Netlify first and try again.');
  }
});

updateStep();
