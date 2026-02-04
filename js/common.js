function updateNavbar() {
  const el = document.getElementById('navAuthContainer');
  if (!el) return;

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  if (currentUser) {
    const initial = (currentUser.name || 'U').charAt(0).toUpperCase();
    const avatar = currentUser.profilePic
      ? `<img src="${currentUser.profilePic}" alt="Profile">`
      : initial;

    el.innerHTML = `
      <div class="profile-avatar" onclick="location.href='profile.html'">
        ${avatar}
      </div>
    `;
  } else {
    el.innerHTML = `<a href="auth.html">Login</a>`;
  }
}

document.addEventListener('DOMContentLoaded', updateNavbar);
