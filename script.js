document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    const header = document.querySelector('header .container');
    if(header) {
        header.prepend(menuToggle);
    }
    
    const nav = document.querySelector('nav');
    if(nav) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-times');
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function() {
            if(nav.classList.contains('active')) {
                nav.classList.remove('active');
                menuToggle.querySelector('i').classList.remove('fa-times');
            }
        });
    });

    // Image animations
    animateImages();
});

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
