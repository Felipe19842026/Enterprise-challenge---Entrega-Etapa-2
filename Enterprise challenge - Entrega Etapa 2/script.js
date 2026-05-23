const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#menu-principal');
const credentialForm = document.querySelector('#leadForm');
const demoForm = document.querySelector('#demoForm');
const feedback = document.querySelector('#formFeedback');
const demoFeedback = document.querySelector('#demoFeedback');
const progressFill = document.querySelector('#progressFill');
const progressValue = document.querySelector('#progressValue');
const statusTitle = document.querySelector('#statusTitle');
const statusText = document.querySelector('#statusText');

function closeMenu(){
  if(!nav || !menuToggle) return;
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded','false');
}

if(menuToggle && nav){
  menuToggle.addEventListener('click',()=>{
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded',String(isOpen));
  });
  document.addEventListener('keydown',(event)=>{ if(event.key === 'Escape') closeMenu(); });
  nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
}

function createProtocol(prefix){
  const date = new Date().toISOString().slice(0,10).replaceAll('-','');
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${date}-${number}`;
}

function saveRecord(key, record){
  try{
    const records = JSON.parse(localStorage.getItem(key) || '[]');
    records.unshift(record);
    localStorage.setItem(key, JSON.stringify(records));
  }catch{
    localStorage.setItem(key, JSON.stringify([record]));
  }
}

function setFeedback(element, message, type='success'){
  if(!element) return;
  element.textContent = message;
  element.classList.toggle('error', type === 'error');
}

function markInvalidFields(form){
  form.querySelectorAll('input, select, textarea').forEach(field=>{
    field.classList.toggle('invalid', !field.checkValidity());
  });
}

function prepareValidation(form){
  form.querySelectorAll('input, select, textarea').forEach(field=>{
    const update = () => field.classList.toggle('invalid', !field.checkValidity());
    field.addEventListener('input', update);
    field.addEventListener('blur', update);
  });
}

function updateProgress(percent, title, text){
  if(progressFill) progressFill.style.width = `${percent}%`;
  if(progressValue) progressValue.textContent = `${percent}%`;
  if(statusTitle) statusTitle.textContent = title;
  if(statusText) statusText.textContent = text;
}

if(credentialForm){
  updateProgress(0, 'Início do processo', 'A esteira começa em 0% e avança somente após o envio correto da solicitação.');
  prepareValidation(credentialForm);

  credentialForm.addEventListener('submit',(event)=>{
    event.preventDefault();

    if(!credentialForm.checkValidity()){
      markInvalidFields(credentialForm);
      setFeedback(feedback, 'Confira os campos obrigatórios antes de enviar.', 'error');
      credentialForm.reportValidity();
      updateProgress(0, 'Cadastro incompleto', 'Preencha os campos obrigatórios para avançar na esteira.');
      return;
    }

    const formData = new FormData(credentialForm);
    const documentos = formData.getAll('documentos');
    const protocol = createProtocol('HSS-CRED');
    const percent = documentos.length >= 4 ? 72 : documentos.length >= 2 ? 48 : 28;

    saveRecord('hss_credenciamentos', {
      protocolo: protocol,
      nome: formData.get('nome').trim(),
      email: formData.get('email').trim(),
      telefone: formData.get('telefone').trim(),
      profissao: formData.get('profissao'),
      registro: formData.get('registro').trim(),
      instituicao: formData.get('instituicao').trim(),
      documentos,
      mensagem: formData.get('mensagem').trim(),
      dataEnvio: new Date().toLocaleString('pt-BR')
    });

    credentialForm.reset();
    credentialForm.querySelectorAll('.invalid').forEach(field=>field.classList.remove('invalid'));
    setFeedback(feedback, `Pré-credenciamento enviado com sucesso. Protocolo: ${protocol}`);
    updateProgress(percent, 'Solicitação recebida', 'O pré-credenciamento foi registrado e está pronto para conferência administrativa.');
  });
}

if(demoForm){
  prepareValidation(demoForm);

  demoForm.addEventListener('submit',(event)=>{
    event.preventDefault();

    if(!demoForm.checkValidity()){
      markInvalidFields(demoForm);
      setFeedback(demoFeedback, 'Preencha os campos obrigatórios para solicitar a demonstração.', 'error');
      demoForm.reportValidity();
      return;
    }

    const formData = new FormData(demoForm);
    const protocol = createProtocol('HSS-DEMO');

    saveRecord('hss_demonstracoes', {
      protocolo: protocol,
      nome: formData.get('nome').trim(),
      email: formData.get('email').trim(),
      telefone: formData.get('telefone').trim(),
      instituicao: formData.get('instituicao').trim(),
      perfil: formData.get('perfil'),
      volume: formData.get('volume'),
      mensagem: formData.get('mensagem').trim(),
      dataEnvio: new Date().toLocaleString('pt-BR')
    });

    demoForm.reset();
    demoForm.querySelectorAll('.invalid').forEach(field=>field.classList.remove('invalid'));
    setFeedback(demoFeedback, `Demonstração solicitada com sucesso. Protocolo: ${protocol}`);
  });
}
