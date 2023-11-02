(function($) {
	
	"use strict";
	
	
	//Hide Loading Box (Preloader)
	function handlePreloader() {
		if($('.preloader').length){
			$('body').addClass('page-loaded');
			$('.preloader').delay(500).fadeOut(0);
		}
	}
	
	
	//Update Header Style and Scroll to Top
	function headerStyle() {
		if($('.main-header').length){
			var windowpos = $(window).scrollTop();
			var siteHeader = $('.main-header');
			var scrollLink = $('.scroll-to-top');
			if (windowpos >= 1) {
				siteHeader.addClass('fixed-header');
				scrollLink.fadeIn(300);
			} else {
				siteHeader.removeClass('fixed-header');
				scrollLink.fadeOut(300);
			}
		}
	}
	headerStyle();

	//Search Toggle
	if ($('.search-box').length) {
		$('.search-toggle').on('click', function () {
			$('body').toggleClass('visible-search');
		});
		$('.s-close-btn,.search-backdrop').on('click', function () {
			$('body').removeClass('visible-search');
		});
		$(document).keydown(function(e){
	        if(e.keyCode == 27) {
	            $('body').removeClass('visible-search');
	        }
	    });
	}

	//Info Sidebar Toggle
	if($('.main-header .info-toggler .info-btn').length){
		//Show Form
		$('.main-header .info-toggler .info-btn').on('click', function(e) {
			e.preventDefault();
			$('body').addClass('side-content-visible');
		});
		//Hide Form
		$('.info-bar .inner-box .cross-icon,.info-back-drop,.close-menu').on('click', function(e) {
			e.preventDefault();
			$('body').removeClass('side-content-visible');
		});
		$(document).keydown(function(e){
	        if(e.keyCode == 27) {
	            $('body').removeClass('side-content-visible');
	        }
	    });
	}
	
	//Hidden Bar Menu Config
	function hiddenBarMenuConfig() {
		var menuWrap = $('.hidden-bar .side-menu');
		// appending expander button
		menuWrap.find('li.dropdown > a').append(function () {
			return '<button type="button" class="btn-expander"><i class="icon sl-icon-arrow-down"></i></button>';
		});
		// hidding submenu
		menuWrap.find('.dropdown').children('ul').hide();

		$(".hidden-bar .side-menu ul li.dropdown .btn-expander").on('click', function(e) {
			e.preventDefault();
			$(this).parent('a').parent('li').children('ul').slideToggle();
			// toggling arrow of expander
			$(this).find('i').toggleClass('sl-icon-arrow-up');
			return false;
		});
	}

	hiddenBarMenuConfig();


	//Custom Scroll for Hidden Sidebar
	if ($('.hidden-bar-wrapper').length) {
		
		$('.hidden-bar-closer,.menu-backdrop').on('click', function () {
			$('.hidden-bar,body').removeClass('visible-sidebar');
			$('.side-menu ul li.dropdown ul').slideUp();
			$('.side-menu ul li.dropdown > a i').removeClass('sl-icon-arrow-up').addClass('sl-icon-arrow-down');
		});
		$(document).keydown(function(e){
	        if(e.keyCode == 27) {
	            $('.hidden-bar,body').removeClass('visible-sidebar');
	            $('.side-menu ul li.dropdown ul').slideUp();
					$('.side-menu ul li.dropdown > a i').removeClass('sl-icon-arrow-up').addClass('sl-icon-arrow-down');
	        }
	    });
		$('.hidden-bar-opener').on('click', function () {
			$('.hidden-bar,body').addClass('visible-sidebar');
		});
	}
	
	//Banner Slider
	if ($('.banner-slider').length) {
		$('.banner-slider').owlCarousel({
			loop:true,
			animateOut: 'fadeOut',
    		animateIn: 'fadeIn',
			mouseDrag: false,
			touchDrag: false,
			margin:0,
			nav:true,
			smartSpeed: 700,
			autoplay: true,
			autoplayTimeout:7000,
			navText: [ '<span class="icon fa-light fa-long-arrow-left"></span>', '<span class="icon fa-light fa-long-arrow-right"></span>' ],
			responsive:{
				0:{
					items:1
				},
				600:{
					items:1
				},
				800:{
					items:1
				},
				1200:{
					items:1
				}
			}
		});    		
	}

	//Why Carousel
	if ($('.why-carousel').length) {
		$('.why-carousel').owlCarousel({
			loop:false,
			margin:10,
			nav:true,
			smartSpeed: 700,
			autoplay: false,
			autoplayTimeout:7000,
			navText: [ '<span class="prev-btn far fa-angle-left"></span>', '<span class="next-btn far fa-angle-right"></span>' ],
			responsive:{
				0:{
					items:1
				},
				600:{
					items:1
				},
				768:{
					items:2
				},
				992:{
					items:2
				},
				1200:{
					items:4
				},
				1500:{
					items:4
				},
				1920:{
					items:5
				}
			}
		});    		
	}

	//Programs Carousel
	if ($('.programs-carousel').length) {
		$('.programs-carousel').owlCarousel({
			loop:false,
			margin:30,
			nav:true,
			smartSpeed: 700,
			autoplay: true,
			autoplayTimeout:7000,
			navText: [ '<span class="prev-btn far fa-angle-left"></span>', '<span class="next-btn far fa-angle-right"></span>' ],
			responsive:{
				0:{
					items:1
				},
				600:{
					items:1
				},
				768:{
					items:2
				},
				992:{
					items:2
				},
				1200:{
					items:4
				},
				1500:{
					items:4
				}
			}
		});    		
	}

	//Team Carousel
	if ($('.team-carousel').length) {
		$('.team-carousel').owlCarousel({
			loop:false,
			margin:40,
			nav:true,
			smartSpeed: 700,
			autoplay: true,
			autoplayTimeout:7000,
			navText: [ '<span class="icon fa-light fa-long-arrow-left"></span>', '<span class="icon fa-light fa-long-arrow-right"></span>' ],
			responsive:{
				0:{
					items:1
				},
				600:{
					items:1
				},
				768:{
					items:2
				},
				992:{
					items:2
				},
				1200:{
					items:3
				}
			}
		});    		
	}

	//Testimonial Carousel
	if ($('.testi-carousel-one').length) {
		$('.testi-carousel-one').owlCarousel({
			loop:true,
			margin:30,
			animateOut: 'fadeOutUp',
    		animateIn: 'fadeInUp',
			nav:true,
			smartSpeed: 700,
			autoplay: true,
			autoplayTimeout:7000,
			navText: [ '<span class="icon fa-light fa-long-arrow-left"></span>', '<span class="icon fa-light fa-long-arrow-right"></span>' ],
			responsive:{
				0:{
					items:1
				},
				768:{
					items:1
				},
				992:{
					items:1
				},
				1200:{
					items:1
				}
			}
		});    		
	}

	//Testimonial Carousel
	if ($('.testi-carousel-two').length) {
		$('.testi-carousel-two').owlCarousel({
			loop:true,
			margin:30,
			nav:true,
			smartSpeed: 700,
			autoplay: true,
			autoplayTimeout:7000,
			navText: [ '<span class="icon fa-light fa-long-arrow-left"></span>', '<span class="icon fa-light fa-long-arrow-right"></span>' ],
			responsive:{
				0:{
					items:1
				},
				768:{
					items:1
				},
				992:{
					items:1
				},
				1200:{
					items:1
				}
			}
		});    		
	}

	//Testimonial Carousel
	if ($('.testi-carousel-three').length) {
		$('.testi-carousel-three').owlCarousel({
			loop:true,
			margin:30,
			nav:true,
			smartSpeed: 700,
			autoplay: true,
			autoplayTimeout:7000,
			navText: [ '<span class="icon fa-light fa-long-arrow-left"></span>', '<span class="icon fa-light fa-long-arrow-right"></span>' ],
			responsive:{
				0:{
					items:1
				},
				600:{
					items:1
				},
				768:{
					items:2
				},
				992:{
					items:2
				},
				1200:{
					items:3
				}
			}
		});    		
	}

	//Testimonial Carousel
	if ($('.sponsors-carousel').length) {
		$('.sponsors-carousel').owlCarousel({
			loop:true,
			margin:30,
			nav:true,
			smartSpeed: 700,
			autoplay: true,
			autoplayTimeout:7000,
			navText: [ '<span class="icon fa-light fa-long-arrow-left"></span>', '<span class="icon fa-light fa-long-arrow-right"></span>' ],
			responsive:{
				0:{
					items:1
				},
				600:{
					items:2
				},
				768:{
					items:3
				},
				992:{
					items:4
				},
				1200:{
					items:5
				}
			}
		});    		
	}

	//Accordion Box
	if($('.accordion-box').length){
		$(".accordion-box").on('click', '.acc-btn', function() {

			var outerBox = $(this).parents('.accordion-box');
			var target = $(this).parents('.accordion');

			if ($(this).next('.acc-content').is(':visible')){
				//return false;
				$(this).removeClass('active');
				$(this).next('.acc-content').slideUp(300);
				$(outerBox).children('.accordion').removeClass('active-block');
			}else{
				$(outerBox).find('.accordion .acc-btn').removeClass('active');
				$(this).addClass('active');
				$(outerBox).children('.accordion').removeClass('active-block');
				$(outerBox).find('.accordion').children('.acc-content').slideUp(300);
				$(this).next('.acc-content').slideDown(300);
				$(this).parent('.accordion').addClass('active-block');
			}
		});
	}


	//Tabs Box
	if($('.tabs-box').length){
		$('.tabs-box .tab-buttons .tab-btn').on('click', function(e) {
			e.preventDefault();
			var target = $($(this).attr('data-tab'));
			
			if ($(target).is(':visible')){
				return false;
			}else{
				target.parents('.tabs-box').find('.tab-buttons').find('.tab-btn').removeClass('active-btn');
				$(this).addClass('active-btn');
				target.parents('.tabs-box').find('.tabs-content').find('.tab').fadeOut(0);
				target.parents('.tabs-box').find('.tabs-content').find('.tab').removeClass('active-tab');
				$(target).fadeIn(300);
				$(target).addClass('active-tab');
			}
		});
	}

	//LightBox / Fancybox
	if($('.lightbox-image').length) {
		$('.lightbox-image').fancybox({
			openEffect  : 'fade',
			closeEffect : 'fade',
			helpers : {
				media : {}
			}
		});
	}

	//Contact Form Validation
	if($('#contact-form').length){
		$('#contact-form').validate({
			rules: {
				username: {
					required: true
				},
				email: {
					required: true,
					email: true
				},
				address: {
					required: true
				},
				message: {
					required: true
				}
			}
		});
	}
	

	// Scroll to a Specific Div
	if($('.scroll-to-target').length){
		$(".scroll-to-target").on('click', function() {
			var target = $(this).attr('data-target');
		   // animate
		   $('html, body').animate({
			   scrollTop: $(target).offset().top
			 }, 1500);
	
		});
	}
	
	// Elements Animation
	if($('.wow').length){
		var wow = new WOW(
		  {
			boxClass:     'wow',      // animated element css class (default is wow)
			animateClass: 'animated', // animation css class (default is animated)
			offset:       0,          // distance to the element when triggering the animation (default is 0)
			mobile:       false,       // trigger animations on mobile devices (default is true)
			live:         true       // act on asynchronously loaded content (default is true)
		  }
		);
		wow.init();
	}
	
	
/* ==========================================================================
   When document is Scrollig, do
   ========================================================================== */
	
	$(window).on('scroll', function() {
		headerStyle();
	});
	
/* ==========================================================================
   When document is loading, do
   ========================================================================== */
	
	$(window).on('load', function() {
		handlePreloader();
		if($('body.page-loaded').length){
			$('body').addClass('page-done');
		}
	});

/* ==========================================================================
   When document is Resized
   ========================================================================== */
	
	$(window).on('resize', function() {
		
	});
	
	

})(window.jQuery);



/* ==========================================================================
   Text typewriter
   ========================================================================== */


const textDisplay = document.getElementById('text')
const phrases = ['Experience safe & enjoyable lessons with <span>Blue Bird Driving School!</span> Personalized driving lessons for all levels, empowering you to learn at your own pace. Drive with confidence today!']
let i = 0
let j = 0 
let currentPhrase = []
let isDeleting = false
let isEnd = false

function loop () {
  isEnd = false
  textDisplay.innerHTML = currentPhrase.join('')

  if (i < phrases.length) {

    if (!isDeleting && j <= phrases[i].length) {
      currentPhrase.push(phrases[i][j])
      j++
      textDisplay.innerHTML = currentPhrase.join('')
    }

    if(isDeleting && j <= phrases[i].length) {
      currentPhrase.pop(phrases[i][j])
      j--
      textDisplay.innerHTML = currentPhrase.join('')
    }

    if (j == phrases[i].length) {
      isEnd = true
      isDeleting = true
    }

    if (isDeleting && j === 0) {
      currentPhrase = []
      isDeleting = false
      i++
      if (i === phrases.length) {
        i = 0
      }
    }
  }
  const spedUp = Math.random() * (80 -50) + 50
  const normalSpeed = Math.random() * (200 -100) + 100
  const time = isEnd ? 2000 : isDeleting ? spedUp : normalSpeed
  setTimeout(loop, time)
}

loop()