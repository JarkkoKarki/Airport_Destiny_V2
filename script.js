document.getElementById("redirectForm").addEventListener("submit", function(event) {
    event.preventDefault();
    let username = document.getElementById("type").value;
    window.location.href = "page.html?username=" + username;
});