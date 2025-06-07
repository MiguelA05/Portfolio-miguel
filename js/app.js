'use strict'

/*jquery es una libreria que se usa para manipular el DOM de manera mas facil, es decir, se usa para seleccionar elementos del DOM y manipularlos*/ 
/*ready es un evento que se ejecuta cuando el documento esta listo*/

$(document).ready(function() {
    // Smooth cursor movement
    let cursor = {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0
    };

    // Update cursor position with smooth animation
    function updateCursor() {
        cursor.x += (cursor.targetX - cursor.x) * 0.2;
        cursor.y += (cursor.targetY - cursor.y) * 0.2;
        
        $('#cursor').css({
            left: cursor.x + 'px',
            top: cursor.y + 'px'
        });
        
        requestAnimationFrame(updateCursor);
    }

    // Start the animation loop
    updateCursor();

    // Update target position on mouse move
    $('body').on('mousemove', function(e) {
        cursor.targetX = e.clientX;
        cursor.targetY = e.clientY;
    });

    // Add hover effects for interactive elements
    $('a, button, .article').on({
        mouseenter: function() {
            $('#cursor').addClass('mini');
        },
        mouseleave: function() {
            $('#cursor').removeClass('mini');
        }
    });

    // Smooth scroll for navigation links
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        const target = $(this.hash);
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 80
            }, 800, 'easeInOutQuart');
        }
    });

    // Add scroll reveal animation
    $(window).on('scroll', function() {
        $('.seccion').each(function() {
            const elementTop = $(this).offset().top;
            const elementBottom = elementTop + $(this).outerHeight();
            const viewportTop = $(window).scrollTop();
            const viewportBottom = viewportTop + $(window).height();

            if (elementBottom > viewportTop && elementTop < viewportBottom) {
                $(this).addClass('visible');
            }
        });
    });
});