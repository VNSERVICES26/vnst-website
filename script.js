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
    const buyVNSTBtn = document.getElementById('buyVNST');
    if(buyVNSTBtn) {
        buyVNSTBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loadVNSTWidget();
        });
    }

    const mainBuyBtn = document.getElementById('mainBuyBtn');
    if(mainBuyBtn) {
        mainBuyBtn.addEventListener('click', function() {
            loadVNSTWidget();
        });
    }

    // Smooth scrolling for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if(anchor.getAttribute('href') !== '#') { // Skip empty hash links
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if(target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        }
    });

    // Image animations
    animateImages();
});

function loadVNSTWidget() {
    // Scroll to swap widget section if exists
    const swapSection = document.querySelector('.swap-widget');
    if(swapSection) {
        swapSection.scrollIntoView({ behavior: 'smooth' });
        
        // Optional: Highlight the widget
        swapSection.style.animation = 'highlight 2s';
        setTimeout(() => {
            swapSection.style.animation = '';
        }, 2000);
    } else {
        // Fallback for pages without swap widget
        alert('VNST purchase functionality will be available soon!');
    }
}

function animateImages() {
    // Animate all images with the 'animated-image' class
    const images = document.querySelectorAll('.animated-image');
    
    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transform = 'translateY(20px)';
        img.style.transition = 'all 0.8s ease-out';
        
        // Intersection Observer for lazy loading animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(img);
    });
}
