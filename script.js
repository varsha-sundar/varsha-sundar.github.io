function checkPassword() {
    var password = localStorage.getItem('blogPassword');
    if (password !== '2024wrapped') {
        password = prompt('Please enter the password to view this blog:');
        if (password !== '2024wrapped') {
            alert('Incorrect password. Access denied.');
            checkPassword();
        } else {
            localStorage.setItem('blogPassword', password);
            showContent();
        }
    } else {
        showContent();
    }
}

function showContent() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
}

window.onload = checkPassword;