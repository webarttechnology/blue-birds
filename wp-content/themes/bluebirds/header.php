<?php
/**
 * The header.
 *
 * This is the template that displays all of the <head> section and everything up until main.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package WordPress
 * @subpackage Twenty_Twenty_One
 * @since Twenty Twenty-One 1.0
 */

?>
<!doctype html>
<html <?php language_attributes(); ?> <?php twentytwentyone_the_html_classes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link href="<?php echo get_template_directory_uri(); ?>/css/bootstrap.css" rel="stylesheet">
<link href="<?php echo get_template_directory_uri(); ?>/css/style.css" rel="stylesheet">
<link rel="shortcut icon" href="<?php echo get_template_directory_uri(); ?>/images/imgg.png">
<link rel="icon" href="<?php echo get_template_directory_uri(); ?>/images/imgg.png">
<!-- Responsive -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
<link href="<?php echo get_template_directory_uri(); ?>/css/responsive.css" rel="stylesheet">
<!--[if lt IE 9]><script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.js"></script><![endif]--> 
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<div class="page-wrapper"> 
  
    <!-- Preloader -->
    <!-- <div class="preloader"></div> -->

    <div class="search-backdrop"></div>
    <!-- Main Header-->
    <header class="main-header">
        <div class="header-top">
            <div class="auto-container">
                <div class="inner clearfix">
                    <div class="top-left clearfix">
                        <ul class="social clearfix">
                            <!-- <li>Subscribe For Latest Update</li> -->
                            <?php 
                            $socialmedia = CFS()->get('social_media_loop',49);
                            if(is_array($socialmedia) || is_object($socialmedia)){
                                foreach($socialmedia as $socialmediaitem){

                             ?>
                            <li><a href="<?php echo $socialmediaitem['social_media_link']; ?>" target="_blank"><?php echo $socialmediaitem['social_media_icon']; ?></a></li>
                        <?php } } ?>
                            <!-- <li><a href="#"><i class="fab fa-instagram"></i></a></li>
                            <li><a href="#"><i class="fab fa-linkedin-in"></i></a></li> -->
                        </ul>
                    </div>
                    <div class="top-right clearfix">
                        <div class="cont-us">
                            <li><i class="icon fa fa-phone"></i><a href="tel:<?php echo get_field('phone_number', 49); ?>"><?php echo get_field('phone_number', 49); ?></a></li>
                            <li><i class="icon fa fa-envelope"></i><a href="mailto:<?php echo get_field('email', 49); ?>"><?php echo get_field('email', 49); ?></a></li>
                            <li><a href="#" class="bntbtn">Book Now</a></li>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Header Upper -->
        <div class="header-upper">        
            <div class="auto-container">
                <!-- Main Box -->
                <div class="main-box clearfix">
                    <!--Logo-->
                    <div class="logo-box">
                         <div class="logo"><a href="<?php echo get_site_url(); ?>" title="Driving School"><img src="<?php echo get_field('logo', 49); ?>" alt="" title="Driving School"></a></div>
                    </div>

                    <div class="nav-box clearfix">
                        <!--Nav Outer-->
                        <div class="nav-outer clearfix">         
                            <nav class="main-menu">
                            	<?php wp_nav_menu( array('menu' => 'Header Menu', 'container' => '', 'items_wrap' => '<ul class="navigation clearfix">%3$s</ul>' )); ?>
                                <!-- <ul class="navigation clearfix">
                                    <li class="current"><a href="index.php">Home</a>
                                    </li>
                                    <li><a href="about.php">About Us</a></li>
                                    <li><a href="services.php">Services</a></li>
                                    <li><a href="contact.php">Contact Us</a></li>
                                </ul> -->
                            </nav>
                            
                        </div>
                       

                        <div class="links-box clearfix">
                            <!-- <div class="link search-btn search-toggle"><span class="icon far fa-search"></span></div> -->
                            <!-- Hidden Nav Toggler -->
                            <div class="link info-toggler">
                                <button class="info-btn"><span class="icon"><img src="<?php echo get_template_directory_uri(); ?>/images/icons/nav-icon-1.svg" alt=""></span></button>
                            </div>
                        </div>

                        <!-- Hidden Nav Toggler -->
                        <div class="nav-toggler">
                            <button class="hidden-bar-opener"><span class="icon"><img src="images/icons/menu-icon.png" alt=""></span></button>
                        </div>

                    </div>

                    <!-- End Header Upper -->
                    <div class="search-box">
                        <div class="outer-container">
                            <div class="inner-box">
                                <div class="form-box">
                                    <div class="s-close-btn"><span class="icon far fa-times"></span></div>
                                    <span class="s-icon fa fa-search"></span>
                                    <form method="post" action="https://t.commonsupport.com/driveto/index.html">
                                        <div class="form-group">
                                            <input type="search" name="search" value="" placeholder="Search Here" required="">
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </header>
    <!--End Main Header -->

    <!--Search Backdrop-->
    <div class="search-backdrop"></div>

    
    <!--Menu Backdrop-->
    <div class="menu-backdrop"></div>

    <!-- Hidden Navigation Bar -->
    <section class="hidden-bar">
        <!-- Hidden Bar Wrapper -->
        <div class="hidden-bar-wrapper">
            <div class="hidden-bar-closer"><span class="icon"><svg class="icon-close" role="presentation" viewBox="0 0 16 14"><path d="M15 0L1 14m14 0L1 0" stroke="currentColor" fill="none" fill-rule="evenodd"></path></svg></span></div>
            <div class="nav-logo-box">
                <div class="logo"><a href="index.html" title="Driving School HTML Template"><img src="images/logo-2.svg" alt="" title="Driving School HTML Template"></a></div>
            </div>
            <!-- .Side-menu -->
            <div class="side-menu">
                 <ul class="navigation clearfix">
                    <li class="current dropdown"><a href="index.html">Home</a>
                        <ul>
                            <li><a href="index.html">Home 01</a></li>
                            <li><a href="index-2.html">Home 02</a></li>
                            <li><a href="index-3.html">Home 03</a></li>
                            <li class="dropdown"><a href="#">Header Styles</a>
                                <ul>
                                    <li><a href="index.html">Header Type 01</a></li>
                                    <li><a href="index-2.html">Header Type 02</a></li>
                                    <li><a href="index-3.html">Header Type 03</a></li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    <li><a href="#">About Us</a></li>
                    <li class="dropdown"><a href="#">Programs</a>
                        <ul>
                            <li><a href="#">Highway Driving training</a></li>
                            <li><a href="#">Highway Driving Lesson</a></li>
                            <li><a href="#">Pre-Licensing Course</a></li>
                            <li><a href="#">Highway Driving training</a></li>
                            <li><a href="#">Highway Driving Lesson</a></li>
                        </ul>
                    </li>
                    <li class="dropdown"><a href="#">Pages</a>
                        <ul>
                            <li><a href="#">Our Team</a></li>
                            <li><a href="#">Our Pricing</a></li>
                            <li><a href="#">FAQs</a></li>
                            <li><a href="#">404 Page</a></li>
                        </ul>
                    </li>
                    <li class="dropdown"><a href="#">Blog</a>
                        <ul>
                            <li><a href="#">Our Blog</a></li>
                            <li><a href="#">Blog Details</a></li>
                        </ul>
                    </li>
                    <li><a href="#">Contact</a></li>
                </ul>
            </div><!-- /.Side-menu -->
            
            <div class="links-box clearfix">
                <div class="clearfix">
                    <div class="link"><a href="#" class="theme-btn btn-style-one"><span>About Us</span></a></div>
                    <div class="link"><a href="#" class="theme-btn btn-style-two"><span>Contact Us</span></a></div>
                </div>
            </div>
        
        </div><!-- / Hidden Bar Wrapper -->
    </section>
    <!-- / Hidden Bar -->

    <!--Info Back Drop-->
    <div class="info-back-drop"></div>
    
    <!-- Hidden Bar -->
    <section class="info-bar">
        <div class="inner-box">
            <div class="cross-icon"><span class="far fa-close"></span></div>
            <div class="title">
                <h2>Get Appointment</h2>
            </div>
            
            <!--Appointment Form-->
            <div class="appointment-form">
                <form method="post" action="https://t.commonsupport.com/driveto/#">
                    <div class="form-group">
                        <input type="text" name="text" value="" placeholder="Name" required>
                    </div>
                    <div class="form-group">
                        <input type="email" name="email" value="" placeholder="Email Address" required>
                    </div>
                    <div class="form-group">
                        <input type="text" name="phone" value="" placeholder="Phone no." required>
                    </div>
                    <div class="form-group">
                        <textarea placeholder="Message"></textarea>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="theme-btn btn-style-one">Send Message</button>
                    </div>
                </form>
            </div>
            
            <!--Contact Info Box-->
            <div class="contact-info-box">
                <ul class="info-list">
                    <li><a href="mailto:<?php echo get_field('email', 49); ?>"><?php echo get_field('email', 49); ?></a></li>
                    <li><a href="tel:<?php echo get_field('phone_number', 49); ?>"><?php echo get_field('phone_number', 49); ?></a></li>
                </ul>
                <ul class="social-list clearfix">
                    <li><a href="https://www.facebook.com/p/Blue-Bird-Driving-School-Calgary-100063759630061/">Facebook</a></li>
                    <li><a href="#">Linkedin</a></li>
                    <li><a href="#">Instagram</a></li>
                </ul>
            </div>
        </div>
    </section>
