const urlParams = new URLSearchParams(window.location.search);
const redirectPath = urlParams.get('redirect');
if (redirectPath) {
  window.history.replaceState(null, '', redirectPath);
}
