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
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Animated number counters
function animateCounter(element, target) {
    let current = 0;
    const duration = 1500; // milliseconds
    const start = performance.now();

    function updateCount(timestamp) {
        const progress = (timestamp - start) / duration;
        if (progress < 1) {
            current = target * progress;
            let displayValue = Math.floor(current);
            if (target >= 1000000) {
                displayValue = (displayValue / 1000000).toFixed(0) + ' Juta'; // Updated for IDR context
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
const hasAnimatedCounters = new Set(); // To prevent re-animation on scroll up/down

const counterObserverOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
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
            hasAnimatedCounters.add(entry.target); // Mark as animated
        }
    });
}, counterObserverOptions);

counterObserver.observe(document.querySelector('.about-stats'));


// NEW: Scroll-triggered Animations for Sections and Cards
const animateSections = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // INI BAGIAN YANG DITAMBAHIN / DIPERBAIKI
            // Cek apakah section itu sendiri punya kelas animate-on-scroll
            if (entry.target.classList.contains('animate-on-scroll')) {
                entry.target.classList.add('is-visible'); // Jika ya, tambahkan kelas is-visible ke section itu sendiri
            }

            // Apply animation to child elements within the section with staggered delay
            // Kita pakai querySelectorAll untuk mencari semua elemen dengan .animate-on-scroll di dalam section yang sedang berinteraksi
            const animatedChildren = entry.target.querySelectorAll('.animate-on-scroll');
            animatedChildren.forEach((child, index) => {
                // Hindari menambahkan is-visible dua kali ke section itu sendiri jika sudah ditambahkan di atas
                if (child === entry.target && child.classList.contains('is-visible')) {
                    return; 
                }
                child.classList.remove('delay-1', 'delay-2', 'delay-3', 'delay-4', 'delay-5'); 
                child.classList.add('is-visible', `delay-${Math.min(index + 1, 5)}`); 
            });
            observer.unobserve(entry.target); // Stop observing once animated
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }); // Adjust threshold as needed

// Observe each section
document.querySelectorAll('section').forEach(section => {
    animateSections.observe(section);
});
// NEW: Typewriter Effect for Tagline
const taglineElement = document.querySelector('.tagline');
const originalTaglineText = taglineElement.textContent; // Simpan teks aslinya
taglineElement.textContent = ''; // Kosongkan teks awalnya

let charIndex = 0;
let isDeleting = false;
const typingSpeed = 100; // milliseconds per character
const deletingSpeed = 50; // milliseconds per character for deleting (if we want to delete)
const pauseBeforeTyping = 1000; // Pause before typing starts
const pauseAfterTyping = 1500; // Pause after typing finishes before potentially restarting or deleting

function typeWriter() {
    const currentText = originalTaglineText;

    if (!isDeleting && charIndex < currentText.length) {
        // Typing
        taglineElement.textContent += currentText.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, typingSpeed);
    } else if (isDeleting && charIndex > 0) {
        // Deleting (optional, uncomment if you want the text to delete and retype)
        // taglineElement.textContent = currentText.substring(0, charIndex - 1);
        // charIndex--;
        // setTimeout(typeWriter, deletingSpeed);
    } else {
        // Paused at end of typing or beginning of deleting cycle
        // For this simple typewriter, we just finish typing and stop.
        // If you want it to loop (delete and retype), you'd uncomment the deleting part
        // and adjust the logic here to switch isDeleting.
        if (charIndex === currentText.length && !isDeleting) {
            // Finished typing, just stop here or add a blinking cursor
            taglineElement.classList.add('finished-typing'); // Add a class for CSS cursor
        }
        // If you want it to loop:
        // if (charIndex === currentText.length && !isDeleting) {
        //     isDeleting = true;
        //     setTimeout(typeWriter, pauseAfterTyping);
        // } else if (charIndex === 0 && isDeleting) {
        //     isDeleting = false;
        //     setTimeout(typeWriter, pauseBeforeTyping);
        // } else {
        //     setTimeout(typeWriter, typingSpeed); // Continue typing/deleting
        // }
    }
}

// Start the typewriter effect when the page loads
window.addEventListener('load', () => {
    if (taglineElement) {
        setTimeout(typeWriter, pauseBeforeTyping); // Start after a small delay
    }
});