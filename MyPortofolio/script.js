// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active navigation highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';
    // Get the height of the sticky nav to adjust scroll position
    const navHeight = document.querySelector('nav').offsetHeight;

    sections.forEach(section => {
        const sectionTop = section.offsetTop - navHeight - 1; // Adjust for sticky nav, -1 pixel for precision
        const sectionHeight = section.clientHeight;

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        // Ensure to remove the '#' when comparing with current ID
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// Animated number counters
function animateCounter(element, target) {
    let current = 0;
    const duration = 1500; // 1.5 seconds
    const start = performance.now();

    function updateCount(timestamp) {
        const progress = (timestamp - start) / duration;
        if (progress < 1) {
            current = target * progress;
            let displayValue = Math.floor(current);

            // Formatting for K and Juta
            if (target >= 1000000) {
                displayValue = (displayValue / 1000000).toFixed(0) + ' Juta';
            } else if (target >= 1000) {
                displayValue = (displayValue / 1000).toFixed(0) + 'K';
            }
            element.textContent = displayValue;
            requestAnimationFrame(updateCount);
        } else {
            current = target;
            let displayValue = target;
            if (target >= 1000000) {
                displayValue = (target / 1000000).toFixed(0) + ' Juta';
            } else if (target >= 1000) {
                displayValue = (target / 1000).toFixed(0) + 'K';
            }
            element.textContent = displayValue;
        }
    }
    requestAnimationFrame(updateCount);
}

// Trigger counter animation when stats come into view
const hasAnimatedCounters = new Set();

const counterObserverOptions = {
    threshold: 0.5, // Trigger when 50% of the element is visible
    rootMargin: '0px 0px -100px 0px' // Adjust root margin to trigger earlier
};

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimatedCounters.has(entry.target)) {
            const counters = entry.target.querySelectorAll('.stat-number');
            counters.forEach(counter => {
                let target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
                if (counter.textContent.includes('Juta')) {
                    target = target * 1000000;
                } else if (counter.textContent.includes('K')) {
                    target = target * 1000;
                }
                animateCounter(counter, target);
            });
            hasAnimatedCounters.add(entry.target);
        }
    });
}, counterObserverOptions);

const aboutStatsElement = document.querySelector('.about-stats');
if (aboutStatsElement) {
    counterObserver.observe(aboutStatsElement);
}


// NEW: Scroll-triggered Animations for Sections and Cards
// This section handles fade-in, slide-up/left/zoom animations when elements enter the viewport.
document.addEventListener('DOMContentLoaded', () => {
    // Select all elements that should be animated on scroll
    const animateElements = document.querySelectorAll('.animate-on-scroll, .animate-from-left, .animate-zoom-in');

    // Select all lists with staggered animation
    const staggeredLists = document.querySelectorAll('.staggered-list');

    // Select the education grid for the timeline line animation
    const educationTimeline = document.querySelector('.education-grid');

    // Create a new Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');

                // Handle staggered list items
                if (entry.target.classList.contains('staggered-list')) {
                    const listItems = entry.target.querySelectorAll('li');
                    listItems.forEach((item, index) => {
                        item.style.transitionDelay = `${index * 0.15}s`; // Add a delay for each item
                        item.classList.add('is-visible'); // Trigger the individual item animation
                    });
                }

                // Handle education timeline line animation
                if (entry.target === educationTimeline) {
                    educationTimeline.classList.add('is-visible');
                }

                // Uncomment the line below if you want the animation to run only once per page load
                // observer.unobserve(entry.target);
            } else {
                // Optional: remove is-visible class if element scrolls out of view for repeating animation
                // entry.target.classList.remove('is-visible');
                // if (entry.target.classList.contains('staggered-list')) {
                //     entry.target.querySelectorAll('li').forEach(item => {
                //         item.classList.remove('is-visible');
                //     });
                // }
                // if (entry.target === educationTimeline) {
                //     educationTimeline.classList.remove('is-visible');
                // }
            }
        });
    }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

    // Observe all elements that need scroll animation
    animateElements.forEach(element => {
        observer.observe(element);
    });

    // Observe staggered lists separately
    staggeredLists.forEach(list => {
        observer.observe(list);
    });

    // Observe the education timeline grid
    if (educationTimeline) {
        observer.observe(educationTimeline);
    }
});


// Typewriter effect for tagline
const taglineElement = document.querySelector('.tagline');
const textToType = taglineElement ? taglineElement.textContent : '';
let charIndex = 0;
let isDeleting = false; // Not used in current simple version, but kept for full loop option
const typingSpeed = 70;
const deletingSpeed = 40; // Not used in current simple version
const pauseAfterTyping = 1500; // Pause after typing, before potentially deleting

function typeWriter() {
    const currentText = textToType;

    if (!isDeleting && charIndex < currentText.length) {
        // Typing
        taglineElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typeWriter, typingSpeed);
    } else {
        // Paused at end of typing or beginning of deleting cycle
        // For this simple typewriter, we just finish typing and stop.
        if (charIndex === currentText.length && !isDeleting) {
            taglineElement.classList.add('finished-typing'); // Add a class for CSS cursor
        }
    }
}

// Start the typewriter effect and hide loading screen when the page loads
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0'; // Fade out
        setTimeout(() => {
            loadingScreen.style.display = 'none'; // Hide completely after fade
        }, 500); // Durasi fade-out harus sama dengan CSS transition
    }

    if (taglineElement) {
        taglineElement.textContent = ''; // Clear content before typing
        setTimeout(typeWriter, 500); // Start typing after a short delay
    }
});

// Dark Mode Toggle Logic
const themeToggleBtn = document.getElementById('themeToggle');
if (themeToggleBtn) { // Pastikan tombolnya ada
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        // Opsional: Simpan preferensi tema di localStorage agar persisten
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
        // Ganti ikon toggle
        const icon = themeToggleBtn.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });

    // Cek preferensi tema saat halaman dimuat
    document.addEventListener('DOMContentLoaded', () => {
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            // Atur ikon sesuai tema yang dimuat
            const icon = themeToggleBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
    });
}