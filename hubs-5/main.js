const initAOS = () => {
    if (window.AOS) {
        AOS.init({ duration: 1000, once: true, offset: 100 });
    }
};

const closeAllDrawers = () => {
    const drawers = document.querySelectorAll('.side-drawer');
    const overlay = document.getElementById('menuOverlay');

    drawers.forEach(drawer => {
        drawer.classList.remove('active');
        drawer.setAttribute('aria-hidden', 'true');
    });

    if (overlay) {
        overlay.classList.remove('active');
    }

    document.body.style.overflow = '';
    document.querySelectorAll('[data-drawer-target]').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
};

const openDrawer = (drawer, trigger) => {
    if (!drawer) return;
    closeAllDrawers();

    drawer.classList.add('active');
    drawer.setAttribute('aria-hidden', 'false');

    const overlay = document.getElementById('menuOverlay');
    if (overlay) {
        overlay.classList.add('active');
    }

    if (trigger) {
        trigger.setAttribute('aria-expanded', 'true');
    }

    document.body.style.overflow = 'hidden';
};

const initDrawers = () => {
    const drawerButtons = document.querySelectorAll('[data-drawer-target]');
    const overlay = document.getElementById('menuOverlay');
    const closeButtons = document.querySelectorAll('[data-dismiss="overlay"]');

    drawerButtons.forEach(btn => {
        btn.addEventListener('click', event => {
            const targetId = event.currentTarget.dataset.drawerTarget;
            const drawer = document.getElementById(targetId);
            openDrawer(drawer, event.currentTarget);
        });
    });

    closeButtons.forEach(btn => btn.addEventListener('click', closeAllDrawers));
    overlay?.addEventListener('click', closeAllDrawers);

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeAllDrawers();
        }
    });
};

const initDrawerSubmenus = () => {
    const drawer = document.getElementById('sideDrawer');
    if (!drawer) return;

    const submenuItems = drawer.querySelectorAll('.has-submenu');
    submenuItems.forEach(item => item.classList.remove('open'));

    const toggles = drawer.querySelectorAll('.submenu-toggle');
    toggles.forEach(toggle => {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();

            const parent = toggle.closest('.has-submenu');
            if (!parent) return;

            const isOpen = parent.classList.contains('open');
            parent.classList.toggle('open', !isOpen);
            toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        });
    });
};

const setDropdownState = (wrapper, isOpen) => {
    wrapper.dataset.open = isOpen ? 'true' : 'false';
    const trigger = wrapper.querySelector('.product-trigger');
    trigger?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
};

const initDropdowns = () => {
    const dropdownWrappers = document.querySelectorAll('[data-dropdown]');
    if (!dropdownWrappers.length) return;

    dropdownWrappers.forEach(wrapper => {
        const trigger = wrapper.querySelector('.product-trigger');
        if (!trigger) return;

        const toggleDropdown = () => {
            const isOpen = wrapper.dataset.open === 'true';
            setDropdownState(wrapper, !isOpen);
        };

        trigger.addEventListener('click', event => {
            event.stopPropagation();
            toggleDropdown();
        });

        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleDropdown();
            }
        });
    });

    const closeAll = () => {
        dropdownWrappers.forEach(wrapper => setDropdownState(wrapper, false));
    };

    document.addEventListener('click', event => {
        dropdownWrappers.forEach(wrapper => {
            if (!wrapper.contains(event.target)) {
                setDropdownState(wrapper, false);
            }
        });
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeAll();
        }
    });
};

const loadPartial = async (containerId, url, onLoad) => {
    const root = document.getElementById(containerId);
    if (!root) return;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        root.innerHTML = await response.text();
        if (typeof onLoad === 'function') {
            onLoad();
        }
    } catch (error) {
        console.error(error);
    }
};

const loadNavbar = () => {
    loadPartial('navbar-root', 'navbar.html', () => {
        initDrawers();
        initDropdowns();
        initDrawerSubmenus();
    });
};

const loadFooter = () => {
    loadPartial('footer-root', 'footer.html');
};

const initSolutionCardAnimations = () => {
    const cards = document.querySelectorAll('.solution-card');
    if (!cards.length) return;

    cards.forEach((card, index) => {
        card.style.setProperty('--card-index', index.toString());
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
        );

        cards.forEach(card => observer.observe(card));
    } else {
        cards.forEach(card => card.classList.add('is-visible'));
    }

    cards.forEach(card => {
        card.addEventListener('mousemove', event => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const px = (x / rect.width) * 100;
            const py = (y / rect.height) * 100;
            const ry = ((x - rect.width / 2) / rect.width) * 10;
            const rx = -((y - rect.height / 2) / rect.height) * 10;

            card.style.setProperty('--mx', `${px}%`);
            card.style.setProperty('--my', `${py}%`);
            card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
            card.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
            card.classList.add('is-interacting');
        });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
            card.classList.remove('is-interacting');
        });
    });
};

const initAchievementsAnimations = () => {
    const section = document.querySelector('.achievements-section');
    if (!section) return;

    const blocks = section.querySelectorAll('.journey-block');
    const items = section.querySelectorAll('.journey-item');
    const timelines = section.querySelectorAll('.journey-timeline');
    const transition = section.querySelector('.journey-transition');

    section.classList.add('is-animated');

    if ('IntersectionObserver' in window) {
        const itemObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    entry.target.classList.toggle('is-visible', entry.isIntersecting);
                });
            },
            { threshold: 0.24, rootMargin: '0px 0px -8% 0px' }
        );

        items.forEach(item => itemObserver.observe(item));

        const blockObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    entry.target.classList.toggle('is-visible', entry.isIntersecting);
                    entry.target.classList.toggle('is-active', entry.intersectionRatio >= 0.45);
                });
            },
            { threshold: [0.18, 0.45, 0.7], rootMargin: '-8% 0px -12% 0px' }
        );

        blocks.forEach(block => blockObserver.observe(block));

        if (transition) {
            const transitionObserver = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        entry.target.classList.toggle('is-visible', entry.isIntersecting);
                    });
                },
                { threshold: 0.2 }
            );

            transitionObserver.observe(transition);
        }
    } else {
        items.forEach(item => item.classList.add('is-visible'));
        blocks.forEach(block => {
            block.classList.add('is-visible');
            block.classList.add('is-active');
        });
        transition?.classList.add('is-visible');
    }

    const clamp = value => Math.max(0, Math.min(1, value));

    const updateTimelineProgress = () => {
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        timelines.forEach(timeline => {
            const rect = timeline.getBoundingClientRect();
            const distance = viewportHeight * 0.82 - rect.top;
            const total = rect.height + viewportHeight * 0.25;
            const progress = clamp(distance / total);
            timeline.style.setProperty('--timeline-progress', progress.toFixed(3));
        });
    };

    let ticking = false;
    const requestTick = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
            updateTimelineProgress();
            ticking = false;
        });
    };

    updateTimelineProgress();
    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);
};

const initProductDetailBackLink = () => {
    const detailSection = document.querySelector('.product-detail');
    if (!detailSection) return;

    const categoryLabels = {
        'racking-solutions': 'Racking Solutions',
        'shelving-solutions': 'Shelving Solutions',
        'automated-solutions': 'Automated Solutions',
        warehouse: 'Warehouse Storage Solutions',
        retail: 'Retail Solutions',
        furniture: 'Furniture Solutions',
        'office-storage': 'Office Storage Solutions',
        'data-center': 'Data Center Racks',
        'material-handling': 'Material Handling Trolleys'
    };

    const categoryByProductSlug = {
        'racking-solutions': 'warehouse',
        'shelving-solutions': 'warehouse',
        'automated-solutions': 'warehouse',
        'selective-pallet-racking': 'racking-solutions',
        'drive-in-racking': 'racking-solutions',
        'pallet-flow-racking': 'racking-solutions',
        'multi-tier-racking': 'racking-solutions',
        'mezzanine-racking': 'racking-solutions',
        'cantilever-racking': 'racking-solutions',
        'slotted-angle-racks': 'shelving-solutions',
        'boltless-shelving': 'shelving-solutions',
        'longspan-shelving': 'shelving-solutions',
        'carton-live-shelving': 'shelving-solutions',
        'mobile-motorized-racking': 'automated-solutions',
        'pallet-shuttle-racking-system': 'automated-solutions',
        asrs: 'automated-solutions',
        gondala: 'retail',
        'checkout-counter': 'retail',
        rack: 'retail',
        'stall-bin': 'retail',
        cages: 'retail',
        'football-fixtures': 'retail',
        'nesting-table': 'retail',
        'vegetable-fruit-racks': 'retail',
        'display-fixtures': 'retail',
        'two-three-seater-benches': 'furniture',
        'locker-cabinets': 'furniture',
        'computer-tables': 'furniture',
        'director-tables': 'furniture',
        'meeting-tables': 'furniture',
        'study-table-chairs': 'furniture',
        'teacher-tables': 'furniture',
        pedestals: 'furniture',
        'filling-cabinets': 'office-storage',
        'locker-cabinats': 'office-storage',
        'mobile-compactor': 'office-storage',
        'office-aimirah': 'office-storage',
        'wall-mounts': 'data-center',
        'open-racks': 'data-center',
        'outdoor-racks': 'data-center',
        'floor-standing-server-networking-racks': 'data-center',
        'customized-racks-consoles': 'data-center',
        'european-shopping-trolley': 'material-handling',
        'asian-shopping-trolley': 'material-handling',
        'german-shopping-trolley': 'material-handling',
        'american-shopping-trolley': 'material-handling',
        'plastic-shopping-trolley': 'material-handling',
        'hand-basket-trolley': 'material-handling',
        'warehouse-trolley': 'material-handling',
        'other-trolley': 'material-handling'
    };

    const getSlug = value => value.split('/').pop().replace('.html', '').toLowerCase();

    const pageSlug = getSlug(window.location.pathname);
    let categorySlug = categoryByProductSlug[pageSlug];

    if (document.referrer.startsWith(window.location.origin)) {
        const refSlug = getSlug(new URL(document.referrer).pathname);
        if (categoryLabels[refSlug]) {
            categorySlug = refSlug;
        }
    }

    if (!categorySlug || !categoryLabels[categorySlug]) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'product-back-wrap';

    const backLink = document.createElement('a');
    backLink.className = 'product-back-link';
    backLink.href = `${categorySlug}.html`;
    backLink.textContent = `← Back to ${categoryLabels[categorySlug]}`;

    wrapper.appendChild(backLink);
    detailSection.before(wrapper);
};

window.addEventListener('DOMContentLoaded', () => {
    initAOS();
    loadNavbar();
    loadFooter();
    initSolutionCardAnimations();
    initAchievementsAnimations();
    initProductDetailBackLink();
});



// ------------------------------------- Home Page baeer--------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    const slideInterval = 5000; // 5 seconds

    function showSlide(index) {
        // Remove active class from all
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Add active class to current
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        
        // Trigger AOS animation again for the new slide content
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Auto-play
    let autoSlide = setInterval(nextSlide, slideInterval);

    // Click on dots to change slide
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
            // Reset timer after manual click
            clearInterval(autoSlide);
            autoSlide = setInterval(nextSlide, slideInterval);
        });
    });
});
