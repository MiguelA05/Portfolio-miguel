'use strict'

/*jquery es una libreria que se usa para manipular el DOM de manera mas facil, es decir, se usa para seleccionar elementos del DOM y manipularlos*/ 
/*ready es un evento que se ejecuta cuando el documento esta listo*/

$(document).ready(function() {
    // Optimizar el cursor
    let cursor = {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0
    };

    let rafId = null;
    const cursorElement = $('#cursor');

    // Optimizar la actualización del cursor usando requestAnimationFrame
    function updateCursor() {
        cursor.x += (cursor.targetX - cursor.x) * 0.2;
        cursor.y += (cursor.targetY - cursor.y) * 0.2;
        
        cursorElement.css({
            transform: `translate(${cursor.x}px, ${cursor.y}px)`
        });
        
        rafId = requestAnimationFrame(updateCursor);
    }

    // Iniciar la animación del cursor
    updateCursor();

    // Optimizar el evento mousemove usando throttling
    let lastMove = 0;
    $('body').on('mousemove', function(e) {
        const now = Date.now();
        if (now - lastMove > 16) { // 60fps
            cursor.targetX = e.clientX;
            cursor.targetY = e.clientY;
            lastMove = now;
        }
    });

    // Optimizar los efectos hover
    const $interactiveElements = $('a, button, .article');
    $interactiveElements.on({
        mouseenter: function() {
            cursorElement.addClass('mini');
        },
        mouseleave: function() {
            cursorElement.removeClass('mini');
        }
    });

    // Optimizar el scroll suave
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        const target = $(this.hash);
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 80
            }, 800, 'easeInOutQuart');
        }
    });

    // Optimizar el scroll reveal usando Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    $('.seccion').each(function() {
        observer.observe(this);
    });

    // Optimizar el carrusel
    let currentIndex = 0;
    const $carousel = $('.carousel');
    const $articles = $('.carousel .article');
    const totalSlides = $articles.length;
    let isAnimating = false;

    function initializeCarousel() {
        $articles.removeClass('active prev next');
        $articles.eq(currentIndex).addClass('active');
        updateSlides();
    }

    function updateSlides() {
        if (isAnimating) return;
        isAnimating = true;

        $articles.removeClass('active prev next');
        
        $articles.eq(currentIndex).addClass('active');
        
        let prevIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        $articles.eq(prevIndex).addClass('prev');
        
        let nextIndex = (currentIndex + 1) % totalSlides;
        $articles.eq(nextIndex).addClass('next');

        setTimeout(() => {
            isAnimating = false;
        }, 500); // Coincide con la duración de la transición CSS
    }

    function moveCarousel(direction) {
        if (isAnimating) return;
        currentIndex = (currentIndex + direction + totalSlides) % totalSlides;
        updateSlides();
    }

    // Optimizar los controles del carrusel
    $('.carousel-button.prev').on('click', function() {
        moveCarousel(-1);
    });

    $('.carousel-button.next').on('click', function() {
        moveCarousel(1);
    });

    // Optimizar la navegación por teclado
    let lastKeyPress = 0;
    $(document).on('keydown', function(e) {
        const now = Date.now();
        if (now - lastKeyPress < 500) return; // Prevenir múltiples pulsaciones rápidas

        if (e.key === 'ArrowLeft') {
            moveCarousel(-1);
            lastKeyPress = now;
        } else if (e.key === 'ArrowRight') {
            moveCarousel(1);
            lastKeyPress = now;
        }
    });

    // Optimizar el soporte táctil
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;
    let lastTouchMove = 0;

    $('.carousel-container').on('touchstart', function(e) {
        touchStartX = e.originalEvent.touches[0].clientX;
        isDragging = true;
    });

    $('.carousel-container').on('touchmove', function(e) {
        if (!isDragging) return;
        const now = Date.now();
        if (now - lastTouchMove < 16) return; // Limitar a 60fps

        touchEndX = e.originalEvent.touches[0].clientX;
        lastTouchMove = now;
    });

    $('.carousel-container').on('touchend', function(e) {
        if (!isDragging) return;
        isDragging = false;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                moveCarousel(1);
            } else {
                moveCarousel(-1);
            }
        }
    }

    // Prevenir el comportamiento táctil por defecto
    $('.carousel-container').on('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });

    // Limpiar recursos cuando se desmonte el componente
    $(window).on('unload', function() {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        observer.disconnect();
    });

    // Inicializar el carrusel
    initializeCarousel();
});