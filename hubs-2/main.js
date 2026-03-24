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

window.addEventListener('DOMContentLoaded', () => {
    initAOS();
    loadNavbar();
    loadFooter();
});
