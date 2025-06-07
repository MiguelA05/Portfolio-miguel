'use strict'

/**
 * Documento listo para manipulación
 * Este evento se ejecuta cuando el DOM está completamente cargado
 */
$(document).ready(function() {
    // =========================================================================
    // Cursor Personalizado
    // =========================================================================
    
    /**
     * Objeto que maneja el estado del cursor personalizado
     * @property {number} x - Posición actual X del cursor
     * @property {number} y - Posición actual Y del cursor
     * @property {number} targetX - Posición objetivo X del cursor
     * @property {number} targetY - Posición objetivo Y del cursor
     */
    let cursor = {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0
    };

    let rafId = null; // ID para cancelar la animación si es necesario
    const cursorElement = $('#cursor'); // Referencia al elemento del cursor

    /**
     * Actualiza la posición del cursor con animación suave
     * Utiliza requestAnimationFrame para mejor rendimiento
     */
    function updateCursor() {
        // Interpolación suave entre la posición actual y la objetivo
        cursor.x += (cursor.targetX - cursor.x) * 0.2;
        cursor.y += (cursor.targetY - cursor.y) * 0.2;
        
        // Actualiza la posición del cursor usando transform para mejor rendimiento
        cursorElement.css({
            transform: `translate(${cursor.x}px, ${cursor.y}px)`
        });
        
        rafId = requestAnimationFrame(updateCursor);
    }

    // Inicia la animación del cursor
    updateCursor();

    /**
     * Maneja el movimiento del mouse con throttling para mejor rendimiento
     * Limita las actualizaciones a 60fps
     */
    let lastMove = 0;
    $('body').on('mousemove', function(e) {
        const now = Date.now();
        if (now - lastMove > 16) { // 60fps
            cursor.targetX = e.clientX;
            cursor.targetY = e.clientY;
            lastMove = now;
        }
    });

    // =========================================================================
    // Efectos de Hover
    // =========================================================================
    
    /**
     * Aplica efectos de hover a elementos interactivos
     * Cambia el tamaño del cursor cuando se pasa sobre elementos interactivos
     */
    const $interactiveElements = $('a, button, .article');
    $interactiveElements.on({
        mouseenter: function() {
            cursorElement.addClass('mini');
        },
        mouseleave: function() {
            cursorElement.removeClass('mini');
        }
    });

    // =========================================================================
    // Navegación Suave
    // =========================================================================
    
    /**
     * Implementa scroll suave para enlaces de navegación
     * Previene el comportamiento por defecto y anima el scroll
     */
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        const target = $(this.hash);
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 80
            }, 800, 'easeInOutQuart');
        }
    });

    // =========================================================================
    // Animación de Scroll
    // =========================================================================
    
    /**
     * Implementa animaciones al hacer scroll usando Intersection Observer
     * Más eficiente que escuchar eventos de scroll
     */
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

    // Observa todas las secciones para animarlas
    $('.seccion').each(function() {
        observer.observe(this);
    });

    // =========================================================================
    // Carrusel 3D
    // =========================================================================
    
    /**
     * Estado del carrusel
     * @property {number} currentIndex - Índice del slide actual
     * @property {number} totalSlides - Número total de slides
     */
    let currentIndex = 0;
    const $carousel = $('.carousel');
    const $articles = $('.carousel .article');
    const totalSlides = $articles.length;
    let isAnimating = false;

    /**
     * Inicializa el carrusel
     * Establece el slide inicial y actualiza las posiciones
     */
    function initializeCarousel() {
        $articles.removeClass('active prev next');
        $articles.eq(currentIndex).addClass('active');
        updateSlides();
    }

    /**
     * Actualiza las posiciones de los slides
     * Maneja las clases y estados de los slides
     */
    function updateSlides() {
        if (isAnimating) return;
        isAnimating = true;

        $articles.removeClass('active prev next');
        
        // Establece el slide activo
        $articles.eq(currentIndex).addClass('active');
        
        // Establece el slide anterior
        let prevIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        $articles.eq(prevIndex).addClass('prev');
        
        // Establece el slide siguiente
        let nextIndex = (currentIndex + 1) % totalSlides;
        $articles.eq(nextIndex).addClass('next');

        // Resetea el estado de animación después de la transición
        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }

    /**
     * Mueve el carrusel en la dirección especificada
     * @param {number} direction - Dirección del movimiento (-1: anterior, 1: siguiente)
     */
    function moveCarousel(direction) {
        if (isAnimating) return;
        currentIndex = (currentIndex + direction + totalSlides) % totalSlides;
        updateSlides();
    }

    // =========================================================================
    // Controles del Carrusel
    // =========================================================================
    
    // Botones de navegación
    $('.carousel-button.prev').on('click', function() {
        moveCarousel(-1);
    });

    $('.carousel-button.next').on('click', function() {
        moveCarousel(1);
    });

    /**
     * Navegación por teclado con throttling
     * Previene múltiples pulsaciones rápidas
     */
    let lastKeyPress = 0;
    $(document).on('keydown', function(e) {
        const now = Date.now();
        if (now - lastKeyPress < 500) return;

        if (e.key === 'ArrowLeft') {
            moveCarousel(-1);
            lastKeyPress = now;
        } else if (e.key === 'ArrowRight') {
            moveCarousel(1);
            lastKeyPress = now;
        }
    });

    // =========================================================================
    // Soporte Táctil
    // =========================================================================
    
    /**
     * Implementa navegación táctil para dispositivos móviles
     * Maneja eventos touch para swipe
     */
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
        if (now - lastTouchMove < 16) return;

        touchEndX = e.originalEvent.touches[0].clientX;
        lastTouchMove = now;
    });

    $('.carousel-container').on('touchend', function(e) {
        if (!isDragging) return;
        isDragging = false;
        handleSwipe();
    });

    /**
     * Maneja el gesto de swipe
     * Determina la dirección y mueve el carrusel
     */
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

    // Previene el comportamiento táctil por defecto
    $('.carousel-container').on('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });

    // =========================================================================
    // Limpieza de Recursos
    // =========================================================================
    
    /**
     * Limpia los recursos cuando se desmonta el componente
     * Cancela animaciones y desconecta observadores
     */
    $(window).on('unload', function() {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        observer.disconnect();
    });

    // Inicializa el carrusel
    initializeCarousel();
});