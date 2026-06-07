/* =========================================================
   CINEMA DB — script.js
   Movie Ticket Booking System | BSCS DBMS Project
   WITH AUTHENTICATION AND ROLE-BASED ACCESS CONTROL
   ========================================================= */

/* ===== AUTHENTICATION & AUTHORIZATION ===== */
function checkAuth() {
  const currentUser = JSON.parse(localStorage.getItem('cdb_currentUser'));
  if (!currentUser) {
    window.location.href = 'login.html';
    return null;
  }
  return currentUser;
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('cdb_currentUser')) || null;
}

function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'Administrator';
}

function isUser() {
  const user = getCurrentUser();
  return user && user.role === 'User';
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('cdb_currentUser');
    window.location.href = 'login.html';
  }
}

function renderNavbar() {
  const navMenu = document.getElementById('navbarMenu');
  if (!navMenu) return;

  const currentUser = getCurrentUser();
  if (!currentUser) {
    navMenu.innerHTML = '<li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>';
    return;
  }

  const adminLinks = isAdmin() ? `
    <li class="nav-item"><a class="nav-link" href="customers.html" data-page="customers"><i class="fas fa-users me-1"></i>Customers</a></li>
    <li class="nav-item"><a class="nav-link" href="shows.html" data-page="shows"><i class="fas fa-calendar-alt me-1"></i>Shows</a></li>
  ` : '';

  navMenu.innerHTML = `
    <li class="nav-item"><a class="nav-link" href="Movie%20Ticket%20Booking%20System.html" data-page="home"><i class="fas fa-home me-1"></i>Home</a></li>
    <li class="nav-item"><a class="nav-link" href="movies.html" data-page="movies"><i class="fas fa-film me-1"></i>Movies</a></li>
    ${adminLinks}
    <li class="nav-item"><a class="nav-link" href="bookings.html" data-page="bookings"><i class="fas fa-ticket-alt me-1"></i>Bookings</a></li>
    ${isAdmin() ? '<li class="nav-item"><a class="nav-link" href="reports.html" data-page="reports"><i class="fas fa-chart-bar me-1"></i>Reports</a></li>' : ''}
    <li class="nav-item dropdown">
      <a class="nav-link dropdown-toggle" href="#" id="profileDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
        <i class="fas fa-user-circle me-1"></i>${currentUser.name.split(' ')[0]}
      </a>
      <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="profileDropdown">
        <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user me-2"></i>My Profile</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" onclick="logout()" style="cursor:pointer;"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
      </ul>
    </li>
  `;

  setActiveNav();
}

function hideAdminFeatures() {
  if (isUser()) {
    // Hide add/edit/delete forms and buttons for users
    const formCards = document.querySelectorAll('.form-card');
    formCards.forEach(card => {
      const title = card.querySelector('.form-card-title');
      if (title && (title.textContent.includes('Add') || title.textContent.includes('Edit') || 
                    title.textContent.includes('Register') || title.textContent.includes('Schedule'))) {
        card.style.display = 'none';
      }
    });

    // Hide action buttons
    document.querySelectorAll('.btn-edit, .btn-delete').forEach(btn => btn.style.display = 'none');
    document.querySelectorAll('.action-buttons').forEach(btn => {
      const editBtn = btn.querySelector('.btn-edit');
      const delBtn = btn.querySelector('.btn-delete');
      if (editBtn) editBtn.style.display = 'none';
      if (delBtn) delBtn.style.display = 'none';
    });

    // Hide admin navigation links
    document.querySelectorAll('a[href*="customers.html"], a[href*="shows.html"], a[href*="reports.html"]').forEach(link => {
      if (!link.closest('.nav-link.active')) {
        link.style.display = 'none';
      }
    });
  }
}

function getPersonalCustomer(createIfMissing = false) {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const customers = DB.getCustomers();
  const email = (currentUser.email || '').toLowerCase();
  const name = (currentUser.name || '').toLowerCase();

  let customer = customers.find(c => c.email && c.email.toLowerCase() === email);
  if (!customer) {
    customer = customers.find(c => c.name && c.name.toLowerCase() === name);
  }

  if (!customer && createIfMissing && isUser()) {
    customer = {
      id: DB.nextId('customer'),
      name: currentUser.name || 'User',
      email: currentUser.email || '',
      phone: currentUser.phone || ''
    };
    customers.push(customer);
    DB.setCustomers(customers);
  }

  return customer;
}

function getBookingsForCurrentUser() {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];
  if (isAdmin()) return DB.getBookings();

  const customer = getPersonalCustomer(true);
  if (!customer) return [];

  return DB.getBookings().filter(b => String(b.customerId) === String(customer.id));
}

/* ===== DEFAULT SAMPLE DATA ===== */
const DEFAULT_MOVIES = [
  { id:1, name:"Inception",             genre:"Sci-Fi",   duration:"148 min", releaseDate:"2010-07-16", price:500, poster:"", rating:4.8 },
  { id:2, name:"The Dark Knight",       genre:"Action",   duration:"152 min", releaseDate:"2008-07-18", price:600, poster:"", rating:4.9 },
  { id:3, name:"Interstellar",          genre:"Sci-Fi",   duration:"169 min", releaseDate:"2014-11-07", price:550, poster:"", rating:4.7 },
  { id:4, name:"Avengers: Endgame",     genre:"Action",   duration:"181 min", releaseDate:"2019-04-26", price:700, poster:"", rating:4.8 },
  { id:5, name:"Joker",                 genre:"Drama",    duration:"122 min", releaseDate:"2019-10-04", price:450, poster:"", rating:4.6 },
  { id:6, name:"Spider-Man: No Way Home",genre:"Action",  duration:"148 min", releaseDate:"2021-12-17", price:650, poster:"", rating:4.5 },
  { id:7, name:"Dune: Part Two",         genre:"Adventure",duration:"166 min", releaseDate:"2024-03-01", price:750, poster:"", rating:4.7 },
  { id:8, name:"Oppenheimer",            genre:"Drama",    duration:"180 min", releaseDate:"2023-07-21", price:700, poster:"", rating:4.9 },
];

const DEFAULT_CUSTOMERS = [
  { id:1, name:"Ahmed Ali",    email:"ahmed.ali@gmail.com",    phone:"0300-1234567" },
  { id:2, name:"Sara Khan",    email:"sara.khan@gmail.com",    phone:"0321-2345678" },
  { id:3, name:"Bilal Hassan", email:"bilal.hassan@gmail.com", phone:"0333-3456789" },
  { id:4, name:"Fatima Malik", email:"fatima.malik@gmail.com", phone:"0311-4567890" },
  { id:5, name:"Usman Tariq",  email:"usman.tariq@gmail.com",  phone:"0345-5678901" },
];

const DEFAULT_SHOWS = [
  { id:1, movieId:1, date:"2025-06-10", time:"14:00", hall:1 },
  { id:2, movieId:2, date:"2025-06-10", time:"17:30", hall:2 },
  { id:3, movieId:3, date:"2025-06-11", time:"20:00", hall:1 },
  { id:4, movieId:4, date:"2025-06-11", time:"15:00", hall:3 },
  { id:5, movieId:5, date:"2025-06-12", time:"21:00", hall:2 },
  { id:6, movieId:1, date:"2025-06-12", time:"10:00", hall:4 },
];

const DEFAULT_BOOKINGS = [
  { id:1, customerId:1, movieId:1, showId:1, tickets:2, status:"Confirmed" },
  { id:2, customerId:2, movieId:2, showId:2, tickets:3, status:"Confirmed" },
  { id:3, customerId:3, movieId:3, showId:3, tickets:1, status:"Pending"   },
  { id:4, customerId:4, movieId:4, showId:4, tickets:4, status:"Cancelled" },
  { id:5, customerId:5, movieId:5, showId:5, tickets:2, status:"Confirmed" },
];

/* ===== localStorage DATABASE ===== */
const DB = {
  init() {
    if (!localStorage.getItem('cdb_movies'))    localStorage.setItem('cdb_movies',    JSON.stringify(DEFAULT_MOVIES));
    if (!localStorage.getItem('cdb_customers')) localStorage.setItem('cdb_customers', JSON.stringify(DEFAULT_CUSTOMERS));
    if (!localStorage.getItem('cdb_shows'))     localStorage.setItem('cdb_shows',     JSON.stringify(DEFAULT_SHOWS));
    if (!localStorage.getItem('cdb_bookings'))  localStorage.setItem('cdb_bookings',  JSON.stringify(DEFAULT_BOOKINGS));
  },
  getMovies()    { return JSON.parse(localStorage.getItem('cdb_movies'))    || []; },
  setMovies(d)   { localStorage.setItem('cdb_movies',    JSON.stringify(d)); },
  getCustomers() { return JSON.parse(localStorage.getItem('cdb_customers')) || []; },
  setCustomers(d){ localStorage.setItem('cdb_customers', JSON.stringify(d)); },
  getShows()     { return JSON.parse(localStorage.getItem('cdb_shows'))     || []; },
  setShows(d)    { localStorage.setItem('cdb_shows',     JSON.stringify(d)); },
  getBookings()  { return JSON.parse(localStorage.getItem('cdb_bookings'))  || []; },
  setBookings(d) { localStorage.setItem('cdb_bookings',  JSON.stringify(d)); },
  nextId(type) {
    const map = { movie:'getMovies', customer:'getCustomers', show:'getShows', booking:'getBookings' };
    const items = this[map[type]]();
    return items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
  }
};

/* ===== UTILITIES ===== */
function showToast(msg, type='success') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const icon = { success:'fa-check-circle', error:'fa-times-circle', info:'fa-info-circle' }[type];
  const color= { success:'#46D369', error:'#E50914', info:'#0094D4' }[type];
  const el = document.createElement('div');
  el.className = `custom-toast ${type}`;
  el.innerHTML = `<i class="fas ${icon}" style="color:${color};font-size:1rem"></i>
    <span>${msg}</span>
    <button class="toast-close" onclick="this.closest('.custom-toast').remove()"><i class="fas fa-times"></i></button>`;
  c.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

function fmt_date(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
}
function fmt_time(t) {
  if (!t) return 'N/A';
  const [h, m] = t.split(':');
  const hr = parseInt(h), ap = hr >= 12 ? 'PM' : 'AM';
  return `${hr % 12 || 12}:${m} ${ap}`;
}
function fmt_cur(n) { return 'Rs. ' + Number(n).toLocaleString(); }

const GENRE_COLORS = {
  'Action':'#E50914','Sci-Fi':'#0094D4','Drama':'#46D369',
  'Comedy':'#F5A623','Horror':'#9B59B6','Romance':'#E91E8C',
  'Thriller':'#FF4500','Adventure':'#20B2AA','Animation':'#9370DB','Fantasy':'#4169E1'
};
function genreColor(g) { return GENRE_COLORS[g] || '#888'; }
function genreBadge(g) {
  const c = genreColor(g);
  return `<span class="genre-badge" style="color:${c};border-color:${c}44;background:${c}18">${g}</span>`;
}

const POSTER_GRADIENTS = [
  'linear-gradient(150deg,#1a1a2e,#16213e)','linear-gradient(150deg,#0d0d0d,#1a2a3a)',
  'linear-gradient(150deg,#000510,#0a1520)','linear-gradient(150deg,#200010,#1a0a1a)',
  'linear-gradient(150deg,#1a0500,#2d0a00)','linear-gradient(150deg,#001030,#002040)',
  'linear-gradient(150deg,#0a1a0a,#001a00)','linear-gradient(150deg,#150020,#200030)',
];
function posterHTML(movie) {
  if (movie.poster) return `<img src="${movie.poster}" alt="${movie.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
    <div class="movie-poster-placeholder" style="background:${POSTER_GRADIENTS[(movie.id-1)%POSTER_GRADIENTS.length]};display:none"><i class="fas fa-film" style="color:rgba(229,9,20,0.4)"></i><span>${movie.name}</span></div>`;
  const g = POSTER_GRADIENTS[(movie.id-1) % POSTER_GRADIENTS.length];
  return `<div class="movie-poster-placeholder" style="background:${g}"><i class="fas fa-film" style="color:rgba(229,9,20,0.4)"></i><span>${movie.name}</span></div>`;
}

function bookingUrlForMovie(movieId) {
  return `bookings.html?movieId=${encodeURIComponent(movieId)}`;
}

function movieRating(movie) {
  const rating = Number(movie.rating);
  if (!Number.isNaN(rating) && rating > 0) return rating.toFixed(1);
  return ((4.1 + ((movie.id || 1) % 6) * 0.1)).toFixed(1);
}

function movieRatingStars(movie) {
  const rating = Number(movieRating(movie));
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i += 1) {
    if (i < fullStars) stars.push('<i class="fas fa-star"></i>');
    else if (i === fullStars && hasHalfStar) stars.push('<i class="fas fa-star-half-alt"></i>');
    else stars.push('<i class="far fa-star"></i>');
  }
  return stars.join('');
}

function renderMovieLibrary() {
  const grid = document.getElementById('movieGalleryGrid');
  if (!grid) return;

  const search = (document.getElementById('movieLibrarySearch')?.value || '').trim().toLowerCase();
  const genre = document.getElementById('movieGenreFilter')?.value || 'All';

  const movies = DB.getMovies().filter(movie => {
    const matchesSearch = !search || [movie.name, movie.genre, movie.duration]
      .join(' ')
      .toLowerCase()
      .includes(search);
    const matchesGenre = genre === 'All' || movie.genre === genre;
    return matchesSearch && matchesGenre;
  });

  const count = document.getElementById('movieLibraryCount');
  if (count) count.textContent = `${movies.length} Movie${movies.length !== 1 ? 's' : ''}`;

  if (!movies.length) {
    grid.innerHTML = `
      <div class="movie-library-empty">
        <div class="empty-state"><i class="fas fa-film"></i><p>No movies match your filter</p><small>Try a different search term or genre.</small></div>
      </div>`;
    return;
  }

  grid.innerHTML = movies.map((movie, index) => `
    <a href="${bookingUrlForMovie(movie.id)}" class="movie-card animate-up delay-${(index % 4) + 1}" style="text-decoration:none">
      <div class="movie-poster-wrap">${posterHTML(movie)}</div>
      <div class="movie-card-overlay">
        <div class="movie-card-rating"><span>${movieRating(movie)}</span><i class="fas fa-star"></i></div>
        <div class="movie-card-title">${movie.name}</div>
        <div class="movie-card-meta">${genreBadge(movie.genre)} <span class="duration-text"><i class="fas fa-clock me-1"></i>${movie.duration}</span></div>
      </div>
      <div class="movie-card-info">
        <div class="movie-card-title">${movie.name}</div>
        <div class="movie-card-meta mt-1">${genreBadge(movie.genre)}</div>
        <div class="movie-card-rating movie-card-rating-inline"><span>${movieRating(movie)}</span>${movieRatingStars(movie)}</div>
      </div>
    </a>`).join('');
}

function animCount(el, target, dur=1400) {
  if (!el) return;
  const step = target / (dur / 16);
  let cur = 0;
  const t = setInterval(() => {
    cur += step;
    if (cur >= target) { el.textContent = Number(target).toLocaleString(); clearInterval(t); }
    else el.textContent = Math.floor(cur).toLocaleString();
  }, 16);
}

function setupSearch(inputId, tbodyId) {
  const inp = document.getElementById(inputId);
  const tb  = document.getElementById(tbodyId);
  if (!inp || !tb) return;
  inp.addEventListener('input', () => {
    const q = inp.value.toLowerCase();
    tb.querySelectorAll('tr').forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

function fillSelect(selId, items, labelKey, placeholder='-- Select --') {
  const sel = document.getElementById(selId);
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = `<option value="">${placeholder}</option>` +
    items.map(i => `<option value="${i.id}" ${String(i.id)===String(prev)?'selected':''}>${i[labelKey]}</option>`).join('');
}

function setActiveNav() {
  const page = decodeURIComponent(location.pathname.split('/').pop() || 'Movie Ticket Booking System.html');
  document.querySelectorAll('.nav-link[data-page]').forEach(a => {
    const p = a.dataset.page;
    a.classList.toggle('active',
      (p==='home' && (page==='' || page==='Movie Ticket Booking System.html')) ||
      (p!=='home' && page.includes(p))
    );
  });
}

function currentPage() {
  const p = decodeURIComponent(location.pathname.split('/').pop() || 'Movie Ticket Booking System.html');
  if (p === 'Movie Ticket Booking System.html' || p === '') return 'home';
  if (p.includes('movies'))    return 'movies';
  if (p.includes('customers')) return 'customers';
  if (p.includes('shows'))     return 'shows';
  if (p.includes('bookings'))  return 'bookings';
  if (p.includes('reports'))   return 'reports';
  return 'home';
}

function pad(n) { return String(n).padStart(3, '0'); }

function emptyRow(cols, icon, title, subtitle) {
  return `<tr><td colspan="${cols}"><div class="empty-state"><i class="fas fa-${icon}"></i><p>${title}</p><small>${subtitle}</small></div></td></tr>`;
}

/* ========================================================
   HOME PAGE
   ======================================================== */
function initHome() {
  const movies    = DB.getMovies();
  const customers = DB.getCustomers();
  const shows     = DB.getShows();
  const bookings  = DB.getBookings();

  animCount(document.getElementById('hMovies'),    movies.length);
  animCount(document.getElementById('hCustomers'), customers.length);
  animCount(document.getElementById('hShows'),     shows.length);
  animCount(document.getElementById('hBookings'),  bookings.length);
  animCount(document.getElementById('dMovies'),    movies.length);
  animCount(document.getElementById('dCustomers'), customers.length);
  animCount(document.getElementById('dShows'),     shows.length);
  animCount(document.getElementById('dBookings'),  bookings.length);

  const quickAccessGrid = document.getElementById('quickAccessGrid');
  if (quickAccessGrid) {
    if (isUser()) {
      quickAccessGrid.innerHTML = `
        <div class="col-12">
          <a href="bookings.html" class="quick-card quick-card-featured" style="min-height:180px;padding:28px;display:flex;align-items:center;justify-content:space-between;gap:20px;">
            <div style="display:flex;align-items:center;gap:18px;min-width:0;">
              <span class="quick-icon" style="color:#F5A623;font-size:1.9rem"><i class="fas fa-ticket-alt"></i></span>
              <div style="min-width:0;">
                <div class="quick-card-title" style="font-size:1.3rem">Bookings</div>
                <div class="quick-card-subtitle" style="font-size:0.95rem">Create and review your own bookings from one place</div>
              </div>
            </div>
            <span class="quick-arrow" style="font-size:1.15rem"><i class="fas fa-arrow-right"></i></span>
          </a>
        </div>`;
    } else {
      quickAccessGrid.innerHTML = `
        <div class="col-6 col-md-3">
          <a href="movies.html" class="quick-card">
            <span class="quick-icon" style="color:#E50914"><i class="fas fa-film"></i></span>
            <div class="quick-card-title">Movies</div>
            <div class="quick-card-subtitle">Add &amp; manage films</div>
            <span class="quick-arrow"><i class="fas fa-arrow-right"></i></span>
          </a>
        </div>
        <div class="col-6 col-md-3">
          <a href="customers.html" class="quick-card">
            <span class="quick-icon" style="color:#0094D4"><i class="fas fa-users"></i></span>
            <div class="quick-card-title">Customers</div>
            <div class="quick-card-subtitle">Manage customer records</div>
            <span class="quick-arrow"><i class="fas fa-arrow-right"></i></span>
          </a>
        </div>
        <div class="col-6 col-md-3">
          <a href="shows.html" class="quick-card">
            <span class="quick-icon" style="color:#46D369"><i class="fas fa-calendar-alt"></i></span>
            <div class="quick-card-title">Shows</div>
            <div class="quick-card-subtitle">Schedule screenings</div>
            <span class="quick-arrow"><i class="fas fa-arrow-right"></i></span>
          </a>
        </div>
        <div class="col-6 col-md-3">
          <a href="bookings.html" class="quick-card">
            <span class="quick-icon" style="color:#F5A623"><i class="fas fa-ticket-alt"></i></span>
            <div class="quick-card-title">Bookings</div>
            <div class="quick-card-subtitle">Create &amp; manage bookings</div>
            <span class="quick-arrow"><i class="fas fa-arrow-right"></i></span>
          </a>
        </div>`;
    }
  }

  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  grid.innerHTML = movies.slice(0,6).map((m,i) => `
    <a href="${bookingUrlForMovie(m.id)}" class="movie-card animate-up delay-${i+1}" style="text-decoration:none">
      <div class="movie-poster-wrap">${posterHTML(m)}</div>
      <div class="movie-card-overlay">
        <div class="movie-card-rating"><span>${movieRating(m)}</span><i class="fas fa-star"></i></div>
        <div class="movie-card-title">${m.name}</div>
        <div class="movie-card-meta">${genreBadge(m.genre)} <span class="duration-text"><i class="fas fa-clock me-1"></i>${m.duration}</span></div>
      </div>
      <div class="movie-card-info">
        <div class="movie-card-title">${m.name}</div>
        <div class="movie-card-meta mt-1">${genreBadge(m.genre)}</div>
        <div class="movie-card-rating movie-card-rating-inline"><span>${movieRating(m)}</span>${movieRatingStars(m)}</div>
      </div>
    </a>`).join('');
}

/* ========================================================
   MOVIES PAGE (ADMIN ONLY)
   ======================================================== */
function initMovies() {
  const adminForm = document.getElementById('addMovieForm')?.closest('.form-card');
  const moviesTable = document.querySelector('.table-card');
  const userSection = document.getElementById('moviesUserSection');
  const pageTitle = document.querySelector('.page-header-title');
  const pageSubtitle = document.querySelector('.page-header-subtitle');

  if (isAdmin()) {
    if (userSection) userSection.style.display = 'none';
    if (adminForm) adminForm.style.display = '';
    if (moviesTable) moviesTable.style.display = '';
    if (pageTitle) pageTitle.textContent = 'Movie Management';
    if (pageSubtitle) pageSubtitle.textContent = 'Add, edit and manage movies in your cinema library';

    renderMovies();
    setupSearch('movieSearch','moviesBody');

    document.getElementById('addMovieForm')?.addEventListener('submit', e => {
      e.preventDefault();
      if (!isAdmin()) {
        showToast('You do not have permission to add movies', 'error');
        return;
      }
      const m = {
        id: DB.nextId('movie'),
        name:        document.getElementById('mName').value.trim(),
        genre:       document.getElementById('mGenre').value,
        duration:    document.getElementById('mDuration').value.trim(),
        releaseDate: document.getElementById('mRelease').value,
        price:       parseFloat(document.getElementById('mPrice').value),
        poster:      document.getElementById('mPoster').value.trim(),
      };
      const arr = DB.getMovies(); arr.push(m); DB.setMovies(arr);
      e.target.reset(); renderMovies();
      showToast(`"${m.name}" added successfully!`);
    });
    return;
  }

  if (adminForm) adminForm.style.display = 'none';
  if (moviesTable) moviesTable.style.display = 'none';
  if (userSection) userSection.style.display = '';
  if (pageTitle) pageTitle.textContent = 'Movie Library';
  if (pageSubtitle) pageSubtitle.textContent = 'Browse movies, filter by genre, and book faster';

  renderMovieLibrary();
  setupSearch('movieLibrarySearch','movieGalleryGrid');

  document.getElementById('movieLibrarySearch')?.addEventListener('input', renderMovieLibrary);
  document.getElementById('movieGenreFilter')?.addEventListener('change', renderMovieLibrary);
}

function renderMovies() {
  const tb = document.getElementById('moviesBody');
  if (!tb) return;
  const movies = DB.getMovies();
  const cnt = document.getElementById('movieCount');
  if (cnt) cnt.textContent = `${movies.length} Movie${movies.length!==1?'s':''}`;
  if (!movies.length) { tb.innerHTML = emptyRow(6,'film','No Movies Yet','Add your first movie above.'); return; }
  tb.innerHTML = movies.map(m => `
    <tr>
      <td><span class="id-badge">#${pad(m.id)}</span></td>
      <td><strong style="color:#fff">${m.name}</strong></td>
      <td>${genreBadge(m.genre)}</td>
      <td><i class="fas fa-clock me-1" style="color:#555"></i>${m.duration}</td>
      <td><strong style="color:#46D369">${fmt_cur(m.price)}</strong></td>
      <td><div class="action-buttons">
        <button class="btn-action btn-view"   onclick="viewMovie(${m.id})"><i class="fas fa-eye"></i> View</button>
        <button class="btn-action btn-edit"   onclick="editMovie(${m.id})" ${isAdmin() ? '' : 'style="display:none"'}><i class="fas fa-edit"></i> Edit</button>
        <button class="btn-action btn-delete" onclick="delMovie(${m.id})" ${isAdmin() ? '' : 'style="display:none"'}><i class="fas fa-trash"></i> Delete</button>
      </div></td>
    </tr>`).join('');
}

function viewMovie(id) {
  const m = DB.getMovies().find(x=>x.id===id); if (!m) return;
  document.getElementById('viewMovieBody').innerHTML = `
    <div style="display:flex;gap:20px;flex-wrap:wrap">
      <div style="flex:1;min-width:150px">${posterHTML(m)}</div>
      <div style="flex:2;min-width:250px">
        <div style="margin-bottom:16px"><strong style="font-size:1.2rem;color:#fff">${m.name}</strong></div>
        <div style="margin-bottom:12px"><strong>Genre:</strong> ${genreBadge(m.genre)}</div>
        <div style="margin-bottom:12px"><strong>Duration:</strong> <i class="fas fa-clock me-1"></i>${m.duration}</div>
        <div style="margin-bottom:12px"><strong>Release Date:</strong> ${fmt_date(m.releaseDate)}</div>
        <div style="margin-bottom:12px"><strong>Ticket Price:</strong> <strong style="color:#46D369">${fmt_cur(m.price)}</strong></div>
      </div>
    </div>`;
  new bootstrap.Modal(document.getElementById('viewMovieModal')).show();
}

function editMovie(id) {
  if (!isAdmin()) {
    showToast('You do not have permission to edit movies', 'error');
    return;
  }
  const m = DB.getMovies().find(x=>x.id===id); if (!m) return;
  document.getElementById('eMvId').value = m.id;
  document.getElementById('eMvName').value = m.name;
  document.getElementById('eMvGenre').value = m.genre;
  document.getElementById('eMvDuration').value = m.duration;
  document.getElementById('eMvRelease').value = m.releaseDate;
  document.getElementById('eMvPrice').value = m.price;
  document.getElementById('eMvPoster').value = m.poster;
  new bootstrap.Modal(document.getElementById('editMovieModal')).show();
}

function saveMovie() {
  if (!isAdmin()) {
    showToast('You do not have permission to edit movies', 'error');
    return;
  }
  const id = parseInt(document.getElementById('eMvId').value);
  const arr = DB.getMovies();
  const m = arr.find(x=>x.id===id); if (!m) return;
  m.name = document.getElementById('eMvName').value.trim();
  m.genre = document.getElementById('eMvGenre').value;
  m.duration = document.getElementById('eMvDuration').value.trim();
  m.releaseDate = document.getElementById('eMvRelease').value;
  m.price = parseFloat(document.getElementById('eMvPrice').value);
  m.poster = document.getElementById('eMvPoster').value.trim();
  DB.setMovies(arr);
  bootstrap.Modal.getInstance(document.getElementById('editMovieModal')).hide();
  renderMovies();
  showToast(`"${m.name}" updated successfully!`);
}

function delMovie(id) {
  if (!isAdmin()) {
    showToast('You do not have permission to delete movies', 'error');
    return;
  }
  if (!confirm('Delete this movie?')) return;
  const m = DB.getMovies().find(x=>x.id===id);
  const arr = DB.getMovies().filter(x=>x.id!==id); DB.setMovies(arr);
  renderMovies();
  showToast(`"${m.name}" deleted!`);
}

/* ========================================================
   CUSTOMERS PAGE (ADMIN ONLY)
   ======================================================== */
function initCustomers() {
  if (!isAdmin()) {
    showToast('Only administrators can access this page', 'error');
    setTimeout(() => window.location.href = 'Movie%20Ticket%20Booking%20System.html', 2000);
    return;
  }

  renderCustomers();
  setupSearch('customerSearch','customersBody');

  document.getElementById('addCustomerForm')?.addEventListener('submit', e => {
    e.preventDefault();
    if (!isAdmin()) {
      showToast('You do not have permission to add customers', 'error');
      return;
    }
    const c = {
      id: DB.nextId('customer'),
      name:  document.getElementById('cName').value.trim(),
      email: document.getElementById('cEmail').value.trim(),
      phone: document.getElementById('cPhone').value.trim(),
    };
    const arr = DB.getCustomers(); arr.push(c); DB.setCustomers(arr);
    e.target.reset(); renderCustomers();
    showToast(`Customer "${c.name}" added successfully!`);
  });
}

function renderCustomers() {
  const tb = document.getElementById('customersBody');
  if (!tb) return;
  const customers = DB.getCustomers();
  const cnt = document.getElementById('customerCount');
  if (cnt) cnt.textContent = `${customers.length} Customer${customers.length!==1?'s':''}`;
  if (!customers.length) { tb.innerHTML = emptyRow(5,'users','No Customers Yet','Register your first customer above.'); return; }
  tb.innerHTML = customers.map(c => `
    <tr>
      <td><span class="id-badge">#${pad(c.id)}</span></td>
      <td><strong style="color:#fff">${c.name}</strong></td>
      <td style="color:#0094D4"><i class="fas fa-envelope me-1"></i>${c.email}</td>
      <td style="color:#888"><i class="fas fa-phone me-1"></i>${c.phone}</td>
      <td><div class="action-buttons">
        <button class="btn-action btn-view"   onclick="viewCustomer(${c.id})"><i class="fas fa-eye"></i> View</button>
        <button class="btn-action btn-edit"   onclick="editCustomer(${c.id})" ${isAdmin() ? '' : 'style="display:none"'}><i class="fas fa-edit"></i> Edit</button>
        <button class="btn-action btn-delete" onclick="delCustomer(${c.id})" ${isAdmin() ? '' : 'style="display:none"'}><i class="fas fa-trash"></i> Delete</button>
      </div></td>
    </tr>`).join('');
}

function viewCustomer(id) {
  const c = DB.getCustomers().find(x=>x.id===id); if (!c) return;
  document.getElementById('viewCustomerBody').innerHTML = `
    <div style="margin-bottom:16px"><strong>ID:</strong> <span class="id-badge">#${pad(c.id)}</span></div>
    <div style="margin-bottom:12px"><strong>Name:</strong> ${c.name}</div>
    <div style="margin-bottom:12px"><strong>Email:</strong> <a href="mailto:${c.email}" style="color:#0094D4;text-decoration:none">${c.email}</a></div>
    <div style="margin-bottom:12px"><strong>Phone:</strong> ${c.phone}</div>`;
  new bootstrap.Modal(document.getElementById('viewCustomerModal')).show();
}

function editCustomer(id) {
  if (!isAdmin()) {
    showToast('You do not have permission to edit customers', 'error');
    return;
  }
  const c = DB.getCustomers().find(x=>x.id===id); if (!c) return;
  document.getElementById('eCuId').value = c.id;
  document.getElementById('eCuName').value = c.name;
  document.getElementById('eCuEmail').value = c.email;
  document.getElementById('eCuPhone').value = c.phone;
  new bootstrap.Modal(document.getElementById('editCustomerModal')).show();
}

function saveCustomer() {
  if (!isAdmin()) {
    showToast('You do not have permission to edit customers', 'error');
    return;
  }
  const id = parseInt(document.getElementById('eCuId').value);
  const arr = DB.getCustomers();
  const c = arr.find(x=>x.id===id); if (!c) return;
  c.name  = document.getElementById('eCuName').value.trim();
  c.email = document.getElementById('eCuEmail').value.trim();
  c.phone = document.getElementById('eCuPhone').value.trim();
  DB.setCustomers(arr);
  bootstrap.Modal.getInstance(document.getElementById('editCustomerModal')).hide();
  renderCustomers();
  showToast(`Customer "${c.name}" updated successfully!`);
}

function delCustomer(id) {
  if (!isAdmin()) {
    showToast('You do not have permission to delete customers', 'error');
    return;
  }
  if (!confirm('Delete this customer?')) return;
  const c = DB.getCustomers().find(x=>x.id===id);
  const arr = DB.getCustomers().filter(x=>x.id!==id); DB.setCustomers(arr);
  renderCustomers();
  showToast(`Customer "${c.name}" deleted!`);
}

/* ========================================================
   SHOWS PAGE (ADMIN ONLY)
   ======================================================== */
function initShows() {
  if (!isAdmin()) {
    showToast('Only administrators can access this page', 'error');
    setTimeout(() => window.location.href = 'Movie%20Ticket%20Booking%20System.html', 2000);
    return;
  }

  fillSelect('sMovieId', DB.getMovies(), 'name');
  fillSelect('eSMovieId', DB.getMovies(), 'name');
  renderShows();
  setupSearch('showSearch','showsBody');

  document.getElementById('sMovieId')?.addEventListener('change', () => {
    const movieId = parseInt(document.getElementById('sMovieId').value);
    if (!movieId) document.getElementById('sDate').value = '';
  });

  document.getElementById('addShowForm')?.addEventListener('submit', e => {
    e.preventDefault();
    if (!isAdmin()) {
      showToast('You do not have permission to add shows', 'error');
      return;
    }
    const s = {
      id: DB.nextId('show'),
      movieId: parseInt(document.getElementById('sMovieId').value),
      date: document.getElementById('sDate').value,
      time: document.getElementById('sTime').value,
      hall: parseInt(document.getElementById('sHall').value),
    };
    const arr = DB.getShows(); arr.push(s); DB.setShows(arr);
    e.target.reset();
    fillSelect('sMovieId', DB.getMovies(), 'name');
    renderShows();
    showToast('Show scheduled successfully!');
  });
}

function renderShows() {
  const tb = document.getElementById('showsBody');
  if (!tb) return;
  const shows = DB.getShows();
  const movies = DB.getMovies();
  const cnt = document.getElementById('showCount');
  if (cnt) cnt.textContent = `${shows.length} Show${shows.length!==1?'s':''}`;
  if (!shows.length) { tb.innerHTML = emptyRow(6,'calendar','No Shows Yet','Schedule your first show above.'); return; }
  tb.innerHTML = shows.map(s => {
    const m = movies.find(x=>x.id===s.movieId);
    return `<tr>
      <td><span class="id-badge">#${pad(s.id)}</span></td>
      <td><strong style="color:#fff">${m?.name || 'Unknown'}</strong></td>
      <td><i class="fas fa-calendar me-1" style="color:#46D369"></i>${fmt_date(s.date)}</td>
      <td><i class="fas fa-clock me-1" style="color:#0094D4"></i>${fmt_time(s.time)}</td>
      <td><span style="background:#2E2E2E;padding:4px 10px;border-radius:4px;font-size:0.85rem">Hall ${s.hall}</span></td>
      <td><div class="action-buttons">
        <button class="btn-action btn-view"   onclick="viewShow(${s.id})"><i class="fas fa-eye"></i> View</button>
        <button class="btn-action btn-edit"   onclick="editShow(${s.id})" ${isAdmin() ? '' : 'style="display:none"'}><i class="fas fa-edit"></i> Edit</button>
        <button class="btn-action btn-delete" onclick="delShow(${s.id})" ${isAdmin() ? '' : 'style="display:none"'}><i class="fas fa-trash"></i> Delete</button>
      </div></td>
    </tr>`;
  }).join('');
}

function viewShow(id) {
  const s = DB.getShows().find(x=>x.id===id); if (!s) return;
  const m = DB.getMovies().find(x=>x.id===s.movieId);
  document.getElementById('viewShowBody').innerHTML = `
    <div style="margin-bottom:16px"><strong>ID:</strong> <span class="id-badge">#${pad(s.id)}</span></div>
    <div style="margin-bottom:12px"><strong>Movie:</strong> ${m?.name || 'Unknown'}</div>
    <div style="margin-bottom:12px"><strong>Date:</strong> <i class="fas fa-calendar me-1" style="color:#46D369"></i>${fmt_date(s.date)}</div>
    <div style="margin-bottom:12px"><strong>Time:</strong> <i class="fas fa-clock me-1" style="color:#0094D4"></i>${fmt_time(s.time)}</div>
    <div style="margin-bottom:12px"><strong>Hall:</strong> <span style="background:#2E2E2E;padding:4px 10px;border-radius:4px;font-size:0.85rem">Hall ${s.hall}</span></div>`;
  new bootstrap.Modal(document.getElementById('viewShowModal')).show();
}

function editShow(id) {
  if (!isAdmin()) {
    showToast('You do not have permission to edit shows', 'error');
    return;
  }
  const s = DB.getShows().find(x=>x.id===id); if (!s) return;
  document.getElementById('eSId').value = s.id;
  document.getElementById('eSMovieId').value = s.movieId;
  document.getElementById('eSDate').value = s.date;
  document.getElementById('eSTime').value = s.time;
  document.getElementById('eSHall').value = s.hall;
  new bootstrap.Modal(document.getElementById('editShowModal')).show();
}

function saveShow() {
  if (!isAdmin()) {
    showToast('You do not have permission to edit shows', 'error');
    return;
  }
  const id = parseInt(document.getElementById('eSId').value);
  const arr = DB.getShows();
  const s = arr.find(x=>x.id===id); if (!s) return;
  s.movieId = parseInt(document.getElementById('eSMovieId').value);
  s.date    = document.getElementById('eSDate').value;
  s.time    = document.getElementById('eSTime').value;
  s.hall    = parseInt(document.getElementById('eSHall').value);
  DB.setShows(arr);
  bootstrap.Modal.getInstance(document.getElementById('editShowModal')).hide();
  renderShows();
  showToast('Show updated successfully!');
}

function delShow(id) {
  if (!isAdmin()) {
    showToast('You do not have permission to delete shows', 'error');
    return;
  }
  if (!confirm('Delete this show?')) return;
  const arr = DB.getShows().filter(x=>x.id!==id); DB.setShows(arr);
  renderShows();
  showToast('Show deleted!');
}

/* ========================================================
   BOOKINGS PAGE
   ======================================================== */
function initBookings() {
  const customerWrap = document.getElementById('customerFieldWrap');
  const customerSelect = document.getElementById('bCustId');
  const personalCustomer = getPersonalCustomer(true);
  const params = new URLSearchParams(window.location.search);
  const preselectedMovieId = parseInt(params.get('movieId'));
  const refreshShowsForSelectedMovie = () => {
    const movieId = parseInt(document.getElementById('bMovieId').value);
    const shows = DB.getShows().filter(s => s.movieId === movieId);
    fillSelect('bShowId', shows, 'id', '-- Select Show --');
    document.getElementById('bShowId').innerHTML = shows.length 
      ? shows.map(s => `<option value="${s.id}">Hall ${s.hall} - ${fmt_date(s.date)} ${fmt_time(s.time)}</option>`).join('')
      : '<option value="">-- No Shows Available --</option>';
    updateTotal();
  };

  if (isAdmin()) {
    if (customerWrap) customerWrap.style.display = '';
    fillSelect('bCustId', DB.getCustomers(), 'name', '-- Select Customer --');
  } else if (customerSelect && personalCustomer) {
    if (customerWrap) customerWrap.style.display = 'none';
    customerSelect.innerHTML = `<option value="${personalCustomer.id}" selected>${personalCustomer.name}</option>`;
    customerSelect.value = personalCustomer.id;
  }

  fillSelect('bMovieId', DB.getMovies(), 'name', '-- Select Movie --');
  renderBookings();
  setupSearch('bookingSearch','bookingsBody');

  document.getElementById('bMovieId')?.addEventListener('change', () => {
    refreshShowsForSelectedMovie();
  });

  if (preselectedMovieId) {
    const movieSelect = document.getElementById('bMovieId');
    if (movieSelect) {
      movieSelect.value = String(preselectedMovieId);
      refreshShowsForSelectedMovie();
    }
  }

  document.getElementById('bShowId')?.addEventListener('change', updateTotal);
  document.getElementById('bTickets')?.addEventListener('change', updateTotal);

  document.getElementById('addBookingForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const custId  = isAdmin()
      ? parseInt(document.getElementById('bCustId').value)
      : (getPersonalCustomer(true)?.id || 0);
    const movieId = parseInt(document.getElementById('bMovieId').value);
    const showId  = parseInt(document.getElementById('bShowId').value);
    const tickets = parseInt(document.getElementById('bTickets').value);
    if (!custId || !movieId || !showId || !tickets) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    const b = {
      id: DB.nextId('booking'),
      customerId: custId,
      movieId: movieId,
      showId: showId,
      tickets: tickets,
      status: 'Confirmed'
    };
    const arr = DB.getBookings(); arr.push(b); DB.setBookings(arr);
    e.target.reset();
    if (isAdmin()) {
      fillSelect('bCustId', DB.getCustomers(), 'name', '-- Select Customer --');
    } else {
      const customer = getPersonalCustomer(true);
      if (customer) {
        const select = document.getElementById('bCustId');
        if (select) {
          select.innerHTML = `<option value="${customer.id}" selected>${customer.name}</option>`;
          select.value = customer.id;
        }
      }
    }
    fillSelect('bMovieId', DB.getMovies(), 'name', '-- Select Movie --');
    renderBookings();
    showToast(`Booking #${pad(b.id)} confirmed!`);
  });
}

function updateTotal() {
  const showId  = parseInt(document.getElementById('bShowId')?.value);
  const tickets = parseInt(document.getElementById('bTickets')?.value) || 0;
  const show = DB.getShows().find(s => s.id === showId);
  const movie = show ? DB.getMovies().find(m => m.id === show.movieId) : null;
  if (movie && tickets > 0) {
    const total = movie.price * tickets;
    document.getElementById('totalBox').innerHTML = `
      <div style="padding:15px;background:var(--bg-secondary);border-radius:8px;border-left:4px solid var(--primary)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:0.85rem;color:var(--text-muted);text-transform:uppercase">Total Amount</div>
            <div style="font-size:1.8rem;font-weight:700;color:var(--primary);">${fmt_cur(total)}</div>
          </div>
          <div style="text-align:right;color:var(--text-secondary)">
            <div>${tickets} Ticket${tickets!==1?'s':''}</div>
            <div>@ ${fmt_cur(movie.price)} each</div>
          </div>
        </div>
      </div>`;
  } else {
    document.getElementById('totalBox').innerHTML = '';
  }
}

function renderBookings() {
  const tb = document.getElementById('bookingsBody');
  if (!tb) return;
  const bookings = getBookingsForCurrentUser();
  const movies = DB.getMovies();
  const customers = DB.getCustomers();
  const cnt = document.getElementById('bookingCount');
  if (cnt) cnt.textContent = `${bookings.length} Booking${bookings.length!==1?'s':''}`;
  if (!bookings.length) { tb.innerHTML = emptyRow(8,'ticket','No Bookings Yet','Create your first booking above.'); return; }
  tb.innerHTML = bookings.map(b => {
    const m = movies.find(x=>x.id===b.movieId);
    const c = customers.find(x=>x.id===b.customerId);
    const total = m ? m.price * b.tickets : 0;
    const statusColor = { 'Confirmed':'#46D369', 'Pending':'#F5A623', 'Cancelled':'#E50914' }[b.status];
    return `<tr>
      <td><span class="id-badge">#${pad(b.id)}</span></td>
      <td><strong style="color:#fff">${c?.name || 'Unknown'}</strong></td>
      <td>${m?.name || 'Unknown'}</td>
      <td><i class="fas fa-calendar me-1" style="color:#888"></i>Show ${pad(b.showId)}</td>
      <td><span style="background:var(--bg-secondary);padding:4px 8px;border-radius:4px;font-size:0.85rem">${b.tickets} Ticket${b.tickets!==1?'s':''}</span></td>
      <td><strong style="color:#46D369">${fmt_cur(total)}</strong></td>
      <td><span style="color:${statusColor};font-weight:600;text-transform:uppercase;font-size:0.8rem">${b.status}</span></td>
      <td><div class="action-buttons">
        <button class="btn-action btn-view" onclick="viewBooking(${b.id})"><i class="fas fa-eye"></i> View</button>
      </div></td>
    </tr>`;
  }).join('');
}

function viewBooking(id) {
  const b = DB.getBookings().find(x=>x.id===id); if (!b) return;
  if (!isAdmin()) {
    const visibleBookings = new Set(getBookingsForCurrentUser().map(item => item.id));
    if (!visibleBookings.has(id)) return;
  }
  const m = DB.getMovies().find(x=>x.id===b.movieId);
  const c = DB.getCustomers().find(x=>x.id===b.customerId);
  const s = DB.getShows().find(x=>x.id===b.showId);
  const total = m ? m.price * b.tickets : 0;
  const statusColor = { 'Confirmed':'#46D369', 'Pending':'#F5A623', 'Cancelled':'#E50914' }[b.status];
  document.getElementById('viewBookingBody').innerHTML = `
    <div style="margin-bottom:16px"><strong>Booking ID:</strong> <span class="id-badge">#${pad(b.id)}</span></div>
    <div style="margin-bottom:12px"><strong>Customer:</strong> ${c?.name || 'Unknown'}</div>
    <div style="margin-bottom:12px"><strong>Movie:</strong> ${m?.name || 'Unknown'}</div>
    <div style="margin-bottom:12px"><strong>Show:</strong> Hall ${s?.hall || 'N/A'} - ${fmt_date(s?.date)} ${fmt_time(s?.time)}</div>
    <div style="margin-bottom:12px"><strong>Tickets:</strong> ${b.tickets}</div>
    <div style="margin-bottom:12px"><strong>Total Amount:</strong> <strong style="color:#46D369">${fmt_cur(total)}</strong></div>
    <div style="margin-bottom:12px"><strong>Status:</strong> <span style="color:${statusColor};font-weight:600;text-transform:uppercase;font-size:0.85rem">${b.status}</span></div>`;
  new bootstrap.Modal(document.getElementById('viewBookingModal')).show();
}

/* ========================================================
   REPORTS PAGE (ADMIN ONLY)
   ======================================================== */
function initReports() {
  if (!isAdmin()) {
    showToast('Only administrators can access this page', 'error');
    setTimeout(() => window.location.href = 'Movie%20Ticket%20Booking%20System.html', 2000);
    return;
  }

  const movies = DB.getMovies();
  const bookings = DB.getBookings();
  const customers = DB.getCustomers();
  const shows = DB.getShows();

  animCount(document.getElementById('rMovies'), movies.length);
  animCount(document.getElementById('rCustomers'), customers.length);
  animCount(document.getElementById('rShows'), shows.length);
  animCount(document.getElementById('rBookings'), bookings.length);

  const totalRevenue = bookings.reduce((sum, b) => {
    const movie = movies.find(m => m.id === b.movieId);
    return sum + (movie ? movie.price * b.tickets : 0);
  }, 0);
  animCount(document.getElementById('rRevenue'), totalRevenue);
  document.getElementById('totalRevDisp').innerHTML = `<strong style="color:var(--primary);font-size:1.5rem">${fmt_cur(totalRevenue)}</strong>`;

  renderRecentBookings();
  renderTopMovies();
  renderCharts();
}

function renderRecentBookings() {
  const tb = document.getElementById('recentBody');
  if (!tb) return;
  const bookings = DB.getBookings().slice(-5).reverse();
  const movies = DB.getMovies();
  const customers = DB.getCustomers();
  if (!bookings.length) { tb.innerHTML = emptyRow(6,'clock','No Recent Bookings','Bookings will appear here.'); return; }
  tb.innerHTML = bookings.map(b => {
    const m = movies.find(x=>x.id===b.movieId);
    const c = customers.find(x=>x.id===b.customerId);
    const total = m ? m.price * b.tickets : 0;
    const statusColor = { 'Confirmed':'#46D369', 'Pending':'#F5A623', 'Cancelled':'#E50914' }[b.status];
    return `<tr>
      <td><span class="id-badge">#${pad(b.id)}</span></td>
      <td>${c?.name || 'Unknown'}</td>
      <td>${m?.name || 'Unknown'}</td>
      <td>${b.tickets}</td>
      <td><strong>${fmt_cur(total)}</strong></td>
      <td><span style="color:${statusColor};font-weight:600;font-size:0.85rem">${b.status}</span></td>
    </tr>`;
  }).join('');
}

function renderTopMovies() {
  const tb = document.getElementById('topMoviesBody');
  if (!tb) return;
  const bookings = DB.getBookings();
  const movies = DB.getMovies();
  const movieStats = {};

  movies.forEach(m => {
    const tickets = bookings
      .filter(b => b.movieId === m.id)
      .reduce((sum, b) => sum + b.tickets, 0);
    const revenue = tickets * m.price;
    movieStats[m.id] = { movie: m, tickets, revenue };
  });

  const sorted = Object.values(movieStats)
    .sort((a, b) => b.tickets - a.tickets)
    .slice(0, 5);

  if (!sorted.length) { tb.innerHTML = emptyRow(6,'trophy','No Data','No bookings available.'); return; }
  
  tb.innerHTML = sorted.map((stat, idx) => `<tr>
    <td><strong style="font-size:1.2rem;color:var(--primary)">#${idx+1}</strong></td>
    <td><strong style="color:#fff">${stat.movie.name}</strong></td>
    <td>${genreBadge(stat.movie.genre)}</td>
    <td><strong>${stat.tickets}</strong></td>
    <td><div style="width:80px;height:20px;background:var(--primary);border-radius:3px;opacity:0.6"></div></td>
    <td><strong style="color:#46D369">${fmt_cur(stat.revenue)}</strong></td>
  </tr>`).join('');
}

function renderCharts() {
  const bookings = DB.getBookings();
  const movies = DB.getMovies();

  const movieStats = {};
  movies.forEach(m => {
    const count = bookings.filter(b => b.movieId === m.id).reduce((sum, b) => sum + b.tickets, 0);
    movieStats[m.id] = count;
  });

  const chartCanvas = document.getElementById('bookingsChart');
  const revenueCanvas = document.getElementById('revenueChart');

  if (chartCanvas && window.Chart) {
    const chartData = movies
      .map(m => ({name: m.name, value: movieStats[m.id] || 0}))
      .filter(item => item.value > 0);
    new Chart(chartCanvas, {
      type: 'bar',
      data: {
        labels: chartData.map(d => d.name),
        datasets: [{
          label: 'Tickets Sold',
          data: chartData.map(d => d.value),
          backgroundColor: 'rgba(229, 9, 20, 0.7)',
          borderColor: 'rgba(229, 9, 20, 1)',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#aaa' }, grid: { color: '#2E2E2E' } },
          x: { ticks: { color: '#aaa', maxRotation: 25, minRotation: 0, autoSkip: false }, grid: { color: '#2E2E2E' } }
        }
      }
    });
  }

  if (revenueCanvas && window.Chart) {
    const revenueData = movies.map(m => ({
      name: m.name,
      value: bookings.filter(b => b.movieId === m.id).reduce((sum, b) => sum + (m.price * b.tickets), 0)
    })).filter(item => item.value > 0);
    new Chart(revenueCanvas, {
      type: 'doughnut',
      data: {
        labels: revenueData.map(d => d.name),
        datasets: [{
          data: revenueData.map(d => d.value),
          backgroundColor: ['#E50914', '#0094D4', '#46D369', '#F5A623', '#9B59B6', '#20B2AA']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#aaa', boxWidth: 12, boxHeight: 12, padding: 12, font: { size: 11 } }
          }
        }
      }
    });
  }
}

/* ========================================================
   INITIALIZATION
   ======================================================== */
document.addEventListener('DOMContentLoaded', () => {
  DB.init();
  checkAuth();
  renderNavbar();
  hideAdminFeatures();

  const page = currentPage();
  if (page === 'home')      initHome();
  else if (page === 'movies')    initMovies();
  else if (page === 'customers') initCustomers();
  else if (page === 'shows')     initShows();
  else if (page === 'bookings')  initBookings();
  else if (page === 'reports')   initReports();

  setActiveNav();
});