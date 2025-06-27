document.addEventListener("DOMContentLoaded", function () {
  const dropdown = document.querySelector(".dropdown-content");
  const dropbtn = document.querySelector(".dropbtn");

  dropbtn.addEventListener("click", function (e) {
    console.log("some");
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  window.addEventListener("click", function (e) {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
});
