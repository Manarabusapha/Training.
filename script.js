function openPaymentImage() {
  const lightbox = document.getElementById('payment-image-lightbox');
  lightbox.classList.add('is-visible');
  lightbox.setAttribute('aria-hidden', 'false');
}

function closePaymentImage(event) {
  if (event.target !== event.currentTarget && !event.target.classList.contains('lightbox-close')) {
    return;
  }

  const lightbox = document.getElementById('payment-image-lightbox');
  lightbox.classList.remove('is-visible');
  lightbox.setAttribute('aria-hidden', 'true');
}

window.addEventListener('DOMContentLoaded', function() {
  if (location.hash && [
    '#home',
    '#services',
    '#services/subscription',
    '#services/request',
    '#services/complaint',
    '#services/theft',
    '#about',
    '#contact'
  ].includes(location.hash)) {
    renderRoute(location.hash);
  } else {
    document.getElementById('welcome').style.display = 'flex';
    document.getElementById('home').style.display = 'none';
  }

  window.addEventListener('popstate', function() {
    if (location.hash) {
      renderRoute(location.hash);
    } else {
      document.getElementById('welcome').style.display = 'flex';
      document.getElementById('home').style.display = 'none';
    }
  });
  
  setupFormHandlers();
});

// دالة حفظ الطلب في LocalStorage
function saveRequest(formData, formType) {
  let requests = JSON.parse(localStorage.getItem('requests')) || [];
  
  const request = {
    id: Date.now(),
    type: formType,
    timestamp: new Date().toLocaleString('ar-PS'),
    timestampISO: new Date().toISOString(),
    status: 'pending', // الحالة الافتراضية: قيد المراجعة
    data: formData
  };
  
  requests.push(request);
  localStorage.setItem('requests', JSON.stringify(requests));
  
}

function setupFormHandlers() {
  const subForm = document.getElementById('sub-form');
  const reqForm = document.getElementById('req-form');
  const compForm = document.getElementById('comp-form');
  const theftForm = document.getElementById('theft-form-element');
  
  if (subForm) {
    subForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitForm(this, 'subscription');
    });
  }
  
  if (reqForm) {
    reqForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitForm(this, 'request');
    });
  }
  
  if (compForm) {
    compForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitForm(this, 'complaint');
    });
  }
  
  if (theftForm) {
    theftForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitForm(this, 'theft');
    });
  }
  
  // معالجات الملاحة
  const navLinks = document.querySelectorAll('.nav-links li');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navigateToSection(this.getAttribute('data-section'));
    });
  });
}

// Function to submit form data (محدث لاستخدام LocalStorage)
function submitForm(form, formType) {
  const formData = new FormData(form);
  const data = {};

  formData.forEach((value, key) => {
    // If the field is a file, store the filename instead of the File object
    if (value instanceof File) {
      data[key] = value.name || '(مرفق)';
    } else {
      data[key] = value;
    }
  });
  
  // حفظ الطلب في LocalStorage
  saveRequest(data, formType);
  
  // عرض رسالة نجاح
  let message = '';
  if (formType === 'subscription' || formType === 'request' || formType === 'complaint') {
    message = 'تم تاكيد طلبك وسيتم التواصل معك قريبا';
  } else if (formType === 'theft') {
    message = 'تم تقديم البلاغ وسيتم التعامل مع البلاغ بسرية تامة';
  }
  alert(message);
  form.reset();
  
  // إخفاء النموذج
  const formContainer = form.closest('.form-container');
  if (formContainer) {
    formContainer.style.display = 'none';
  }
  history.replaceState({ route: '#services' }, '', '#services');
  renderRoute('#services');
}

// Function to go to the next page (from welcome to home)
function goNext() {
  history.pushState({ route: '#home' }, '', '#home');
  renderRoute('#home');
}

// دالة الانتقال بين الأقسام المختلفة
function navigateToSection(sectionName) {
  pushRoute(`#${sectionName}`);
}

// Function to show the selected form
function showForm(formType) {
  pushRoute(`#services/${formType}`);
}

function showServicesList() {
  pushRoute('#services');
}

function pushRoute(hash) {
  if (location.hash !== hash) {
    history.pushState({ route: hash }, '', hash);
  }
  renderRoute(hash);
}

function renderRoute(hash) {
  const routes = {
    '#home': { section: 'home-section', nav: 'home' },
    '#services': { section: 'services-section', nav: 'services' },
    '#services/subscription': { section: 'services-section', nav: 'services', form: 'subscription-form' },
    '#services/request': { section: 'services-section', nav: 'services', form: 'request-form' },
    '#services/complaint': { section: 'services-section', nav: 'services', form: 'complaint-form' },
    '#services/theft': { section: 'services-section', nav: 'services', form: 'theft-form' },
    '#about': { section: 'about-section', nav: 'about' },
    '#contact': { section: 'contact-section', nav: 'contact' }
  };
  const route = routes[hash] || routes['#home'];

  document.getElementById('welcome').style.display = 'none';
  document.getElementById('home').style.display = 'block';
  document.querySelectorAll('section').forEach(section => {
    section.style.display = 'none';
  });
  ['subscription-form', 'request-form', 'complaint-form', 'theft-form'].forEach(formId => {
    document.getElementById(formId).style.display = 'none';
  });

  const activeSection = document.getElementById(route.section);
  activeSection.style.display = 'block';
  document.querySelectorAll('#home-section .home-static-section').forEach(section => {
    section.style.display = section.dataset.homeDisplay || 'block';
  });

  const servicesList = document.getElementById('services-list');
  if (route.section === 'services-section') {
    servicesList.style.display = route.form ? 'none' : 'block';
  }
  if (route.form) {
    document.getElementById(route.form).style.display = 'block';
  }

  document.querySelectorAll('.nav-links li').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-section') === route.nav);
  });

  const footer = document.querySelector('.site-footer');
  if (footer) {
    footer.style.display = route.nav === 'home' ? '' : 'none';
  }
  window.scrollTo(0, 0);
}
