document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    const header = document.querySelector('header .container');
    header.prepend(menuToggle);
    
    const nav = document.querySelector('nav');
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
    });

    // Buy VNST Button Functionality
    document.getElementById('buyVNST').addEventListener('click', function(e) {
        e.preventDefault();
        loadVNSTWidget();
    });

    document.getElementById('mainBuyBtn').addEventListener('click', function() {
        loadVNSTWidget();
    });

    // Smooth scrolling for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

function loadVNSTWidget() {
    // Scroll to swap widget section
    const swapSection = document.querySelector('.swap-widget');
    swapSection.scrollIntoView({ behavior: 'smooth' });
    
    // Optional: Highlight the widget
    swapSection.style.animation = 'highlight 2s';
    setTimeout(() => {
        swapSection.style.animation = '';
    }, 2000);
}
