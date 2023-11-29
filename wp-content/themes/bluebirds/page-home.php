<?php /* Template Name: Home */

get_header();

 ?>
 <!--End Hidden Bar -->

 <!-- Banner Section -->
 <section class="banner-section bannercntpb">
     <div class="bg-video-wrap">
         <video src="<?php echo get_field('banner_video'); ?>" loop muted autoplay playsinline>
         </video>
<!--          <div class="overlay"></div> -->

         <div class="text-animation">

             <h1>
             	<?php echo get_field('banner_heading'); ?>
                </h1>
			 
			 <div class="banner-button">
			 <a href="<?php echo get_field('banner_button_1_link'); ?>"><?php echo get_field('banner_button_1'); ?></a>
			 <a href="<?php echo get_field('banner_button_2_link'); ?>"><?php echo get_field('banner_button_2'); ?></a>
		 </div>
         </div>
		 

         <div class="banner-container ">
             <div class="banner-slider owl-theme owl-carousel d-none">
                 <!--Slide Item-->
                 <div class="slide-item">
                     <div class="image-layer" style="background-image: url(<?php echo get_template_directory_uri(); ?>/images/main-slider/slider-1.jpg);"></div>
                     <div class="auto-container">
                         <div class="content-box">
                             <div class="content">
                                 <div class="clearfix">
                                     <div class="inner">
                                         <div class="bg-image"><img src="<?php echo get_template_directory_uri(); ?>/images/main-slider/banner-icon-1.svg" alt=""
                                                 title=""></div>
                                         <h1><span><i class="bg-vector"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/Sign.png"
                                                         alt=""></i>High-Quality Driving Schools for you.</span></h1>
                                         <div class="text">Driver's Education courses in Castro Valley, San Leandro,
                                             Lorenzo, Dublin, Pleasanton DanvilleSan Lorenzo, Dublin, Pleasanton,
                                             Danville,
                                             San Ramon.</div>
                                         <div class="links-box clearfix">
                                             <div class="link"><a href="#" class="theme-btn btn-style-one"><span>Read
                                                         More</span></a></div>
                                             <div class="link"><a href="#" class="theme-btn btn-style-two"><span>Book
                                                         Now</span></a></div>
                                         </div>
                                     </div>

                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>

                 <!--Slide Item-->
                 <div class="slide-item d-none">
                     <div class="image-layer" style="background-image: url(<?php echo get_template_directory_uri(); ?>/images/main-slider/slider-1.jpg);"></div>
                     <div class="auto-container">
                         <div class="content-box">
                             <div class="content">
                                 <div class="clearfix">
                                     <div class="inner">
                                         <div class="bg-image"><img src="<?php echo get_template_directory_uri(); ?>/images/main-slider/banner-icon-1.svg" alt=""
                                                 title=""></div>
                                         <h1><span><i class="bg-vector"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/Sign.png"
                                                         alt=""></i>High-Quality Driving Schools for you.</span></h1>
                                         <div class="text">Driver's Education courses in Castro Valley, San Leandro,
                                             Lorenzo, Dublin, Pleasanton DanvilleSan Lorenzo, Dublin, Pleasanton,
                                             Danville,
                                             San Ramon.</div>
                                         <div class="links-box clearfix">
                                             <div class="link"><a href="#" class="theme-btn btn-style-one"><span>Read
                                                         More</span></a></div>
                                             <div class="link"><a href="#" class="theme-btn btn-style-two"><span>Book
                                                         Now</span></a></div>
                                         </div>
                                     </div>

                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>

                 <!--Slide Item-->
                 <div class="slide-item">
                     <div class="image-layer" style="background-image: url(<?php echo get_template_directory_uri(); ?>/images/main-slider/slider-1.jpg);"></div>
                     <div class="auto-container">
                         <div class="content-box">
                             <div class="content">
                                 <div class="clearfix">
                                     <div class="inner">
                                         <div class="bg-image"><img src="<?php echo get_template_directory_uri(); ?>/images/main-slider/banner-icon-1.svg" alt=""
                                                 title=""></div>
                                         <h1><span><i class="bg-vector"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/Sign.png"
                                                         alt=""></i>High-Quality Driving Schools for you.</span></h1>
                                         <div class="text">Driver's Education courses in Castro Valley, San Leandro,
                                             Lorenzo, Dublin, Pleasanton DanvilleSan Lorenzo, Dublin, Pleasanton,
                                             Danville,
                                             San Ramon.</div>
                                         <div class="links-box clearfix">
                                             <div class="link"><a href="#" class="theme-btn btn-style-one"><span>Read
                                                         More</span></a></div>
                                             <div class="link"><a href="#" class="theme-btn btn-style-two"><span>Book
                                                         Now</span></a></div>
                                         </div>
                                     </div>

                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>

             </div>
         </div>
         <div class="cursor cursor--large"></div>
         <div class="cursor cursor--small"></div>
 </section>
 <!--End Banner Section -->

 <!--CTA Section-->
 <section class="cta-one">
     <div class="auto-container">
         <div class="inner">
             <div class="content">
				 <div class="row align-items-center content1">
					 <div class="text col-md-4 heading"><h4>
						 <?php the_field('under_banner_title'); ?>
						 </h4></div>
				   <div class="btnprty lesson  col-md-3 ">
                     <a href="<?php the_field('under_banner_button_link'); ?>" class="dstvbtn"><?php the_field('under_banner_button_text'); ?></a>
                 </div>
                 <div class="phone col-md-4 text-right"><a href="tel:<?php echo get_field('phone_number', 49); ?>"><i class="icon far fa-phone"></i><span>
                             <?php echo get_field('phone_number', 49); ?></span></a></div>
				 </div>
                 
             </div>
         </div>
     </div>
     <div class="cursor cursor--large"></div>
     <div class="cursor cursor--small"></div>
 </section>

 <!--Welcome Section-->
 <section class="welcome-section icnsty">
     <div class="bg-left"><i class="icon"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/steering-big.svg" alt=""></i></div>
     <div class="bg-right" style="background-image: url(<?php echo get_template_directory_uri(); ?>/images/background/wheel-image-1.png);"></div>
     <div class="auto-container">
         <div class="row clearfix">
             <!--Text Col-->
             <div class="text-col col-md-12">
                 <div class="inner wow fadeInRight" data-wow-duration="1500ms" data-wow-delay="0ms">
                     <div class="title-box">
                         <div class="dots"><span></span></div>
                         <h2><i class="bg-vector"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/Sign.png"
                                     alt=""></i><span><?php echo get_field('banner_bottom_main_heading'); ?></span></h2>
                     </div>
                     <div class="text-content text"><?php echo get_field('banner_bottom_subheading'); ?></div>
                     <div class="row clearfix">

                     	<?php 

                        $serviceloop = CFS()->get('our_service_loop',13);

                        if(is_array($serviceloop) || is_object($serviceloop)){

                            foreach($serviceloop as $serviceloopitem){



                         ?>

                         <!--Block-->
                         <div class="wel-block col-md-4">
                             <div class="inner-box">
                                 <div class="icon"><img src="<?php echo $serviceloopitem['our_service_icon_image']; ?>" alt=""></div>
                                 <h4><?php echo $serviceloopitem['our_service_icon_title']; ?></h4>
                                 <div class="text"><?php echo $serviceloopitem['our_service_icon_description']; ?></div>
                             </div>
                         </div>
                     <?php } } ?>
                         
                     </div>
                     <!-- <div class="lower-links clearfix">
                            <div class="link"><a href="#" class="theme-btn btn-style-one"><span>DISCOVER MORE</span></a></div>
                            <div class="link">
                                <div class="phone">
                                    <span class="icon fa fa-phone"></span>
                                    <a href="tel:0008887777" class="theme-btn">000 888 7777</a><br>
                                    <span class="subtitle">Phone Line</span>
                                </div>
                            </div>
                        </div> -->
                 </div>
             </div>
             <!--Image Col-->
             <!-- <div class="image-col col-xl-5 col-lg-6 col-md-12 col-sm-12">
                    <div class="inner wow fadeInLeft" data-wow-duration="1500ms" data-wow-delay="0ms">
                        <div class="client-badge wow zoomInStable" data-wow-duration="2500ms" data-wow-delay="500ms"><div class="inner-box"><span class="percent">90%</span>Clients</div></div>
                        <div class="images clearfix">
                            <div class="image"><img src="images/resource/image-9.jpg" alt="" title=""></div>
                            <div class="image-box">
                                <img src="images/resource/image-10.jpg" alt="" title="">
                                <a href="https://www.youtube.com/watch?v=0xhr0j877bI" class="theme-btn lightbox-image vid-btn"><span class="icon fa fa-play"></span></a>
                            </div>
                        </div>
                    </div>
                </div> -->
         </div>
     </div>
 </section>

 <!--Services-->
 <section class="services-one d-none">
     <div class="auto-container">
         <div class="title-box centered">
             <div class="dots"><span></span></div>
             <h2><i class="bg-vector"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/Sign.png" alt=""></i><span>Check out latest
                     <br>Services</span></h2>
         </div>
         <div class="row clearfix">
             <!--Block-->
             <div class="service-block col-md-3">
                 <div class="inner-box wow fadeInUp" data-wow-duration="1500ms" data-wow-delay="0ms">
                     <div class="image-box">
                         <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/image-6.png" alt="" title=""></div>
                         <div class="count"><span>1</span></div>
                     </div>
                     <h4><a href="#">$125</a></h4>
                     <div class="text">1.5 Hours</div>
                 </div>
             </div>
             <!--Block-->
             <div class="service-block col-md-3">
                 <div class="inner-box wow fadeInUp" data-wow-duration="1500ms" data-wow-delay="300ms">
                     <div class="image-box">
                         <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/image-7.png" alt="" title=""></div>
                         <div class="count"><span>2</span></div>
                     </div>
                     <h4><a href="#">$240</a></h4>
                     <div class="text">3 Hours</div>
                 </div>
             </div>
             <!--Block-->
             <div class="service-block col-md-3">
                 <div class="inner-box wow fadeInUp" data-wow-duration="1500ms" data-wow-delay="600ms">
                     <div class="image-box">
                         <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/image-8.png" alt="" title=""></div>
                         <div class="count"><span>3</span></div>
                     </div>
                     <h4><a href="#">$350</a></h4>
                     <div class="text">4.5 Hours</div>
                 </div>
             </div>
             <!--Block-->
             <div class="service-block col-md-3">
                 <div class="inner-box wow fadeInUp" data-wow-duration="1500ms" data-wow-delay="600ms">
                     <div class="image-box">
                         <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/image-6.png" alt="" title=""></div>
                         <div class="count"><span>4</span></div>
                     </div>
                     <h4><a href="#">$575</a></h4>
                     <div class="text">7.5 Hours</div>
                 </div>
             </div>
         </div>
     </div>
 </section>

 <!--Start Class-->
 <!-- <section class="start-class d-none">
        <div class="image-layer" style="background-image: url(images/background/bg-image-1.jpg);"></div>
        <div class="auto-container">
            <div class="row clearfix">
                
                <div class="title-col col-lg-7 col-md-12 col-sm-12">
                    <div class="inner wow fadeInLeft" data-wow-duration="1500ms" data-wow-delay="0ms">
                        <div class="video-link"><a href="https://www.youtube.com/watch?v=0xhr0j877bI" class="theme-btn lightbox-image vid-btn"><span class="icon fa fa-play"></span></a></div>
                        <div class="title-box">
                            <div class="dots"><span></span></div>
                            <h2><i class="bg-vector"><img src="images/resource/title-pattern-1.svg" alt=""></i><span>Start 5 Hours Class Movie Training</span></h2>
                        </div>
                        <i class="arrow-form wow zoomInLeft" data-wow-duration="2500ms" data-wow-delay="0"><img src="images/icons/curve-arrow.svg" alt=""></i>
                    </div>
                </div>

               
                <div class="form-col col-lg-5 col-md-12 col-sm-12">
                    <div class="inner wow fadeInRight" data-wow-duration="1500ms" data-wow-delay="300ms">
                        
                        <div class="form-box">
                            <h3>Get Free Quote</h3>
                            <form method="post" action="https://t.commonsupport.com/driveto/#">
                                <div class="form-group">
                                    <div class="field-inner">
                                        <input type="text" name="field" value="" placeholder="Your Name" required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="field-inner">
                                        <input type="email" name="field" value="" placeholder="Email Adress" required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="field-inner">
                                        <input type="text" name="field" value="" placeholder="Your Phone" required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="field-inner">
                                        <button type="submit" class="theme-btn btn-style-one"><span>SEND MESSAGE</span></button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section> -->

 <!--Why Us Section-->
 <section class="why-us d-none">
     <div class="auto-container">
         <div class="title-box">
             <div class="dots"><span></span></div>
             <h2><i class="bg-vector"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/Sign.png" alt=""></i><span>Why Choose
                     Us</span></h2>
         </div>
         <div class="carousel-box">
             <div class="why-carousel owl-theme owl-carousel">
                 <!--Block-->
                 <div class="why-block">
                     <div class="inner-box">
                         <div class="icon-box"><span class="fal fa-shield-check"></span></div>
                         <h4>Top Safety Measure</h4>
                         <div class="text">We are a certified driving training of center. we will help you.</div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="why-block">
                     <div class="inner-box">
                         <div class="icon-box"><span class="fal fa-clock"></span></div>
                         <h4>Perfect Timing</h4>
                         <div class="text">We are a certified driving training of center. we will help you.</div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="why-block">
                     <div class="inner-box">
                         <div class="icon-box"><span class="fal fa-dollar-circle"></span></div>
                         <h4>Afordable Fee</h4>
                         <div class="text">We are a certified driving training of center. we will help you.</div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="why-block">
                     <div class="inner-box">
                         <div class="icon-box"><span class="fal fa-users"></span></div>
                         <h4>Expert Team</h4>
                         <div class="text">We are a certified driving training of center. we will help you.</div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="why-block">
                     <div class="inner-box">
                         <div class="icon-box"><span class="fal fa-wallet"></span></div>
                         <h4>Payment Plan</h4>
                         <div class="text">We are a certified driving training of center. we will help you.</div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="why-block">
                     <div class="inner-box">
                         <div class="icon-box"><span class="fal fa-shield-check"></span></div>
                         <h4>Top Safety Measure</h4>
                         <div class="text">We are a certified driving training of center. we will help you.</div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="why-block">
                     <div class="inner-box">
                         <div class="icon-box"><span class="fal fa-clock"></span></div>
                         <h4>Perfect Timing</h4>
                         <div class="text">We are a certified driving training of center. we will help you.</div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="why-block">
                     <div class="inner-box">
                         <div class="icon-box"><span class="fal fa-dollar-circle"></span></div>
                         <h4>Afordable Fee</h4>
                         <div class="text">We are a certified driving training of center. we will help you.</div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="why-block">
                     <div class="inner-box">
                         <div class="icon-box"><span class="fal fa-users"></span></div>
                         <h4>Expert Team</h4>
                         <div class="text">We are a certified driving training of center. we will help you.</div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="why-block">
                     <div class="inner-box">
                         <div class="icon-box"><span class="fal fa-wallet"></span></div>
                         <h4>Payment Plan</h4>
                         <div class="text">We are a certified driving training of center. we will help you.</div>
                     </div>
                 </div>
             </div>
         </div>
     </div>
 </section>

 <section class="why-us mb-5">
     <div class="auto-container">
         <div class="title-box">
             <div class="dots"><span></span></div>
             <h2><i class="bg-vector"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/Sign.png" alt=""></i><span><?php echo get_field('step_process_main_heading'); ?></span></h2>
         </div>
         <div class="row clearfix">
         	<?php 

         	$processstep = CFS()->get('process_step_loop');

         	if(is_array($processstep) || is_object($processstep)){
         		foreach($processstep as $processsteps){

         	 ?>
             <div class="col-md-3">
                 <div class="why-block">
                     <div class="inner-box">
                         <div class="icon-box"><?php echo $processsteps['process_step_icon']; ?></div>
                         <h4><?php echo $processsteps['process_step_title']; ?></h4>
                         <div class="text"><?php echo $processsteps['process_step_description']; ?>
                         </div>
                     </div>
                 </div>
             </div>
         <?php } } ?>
<!--              <div class="col-md-12">
                 <div class="btnprty mt-5">
                     <a href="<?php //echo get_field('process_step_section_button_link'); ?>" class="dstvbtn"><?php //echo get_field('process_step_section_button_text'); ?></a>
                 </div>
             </div> -->
         </div>
     </div>
 </section>

 <!--TEam-->
 <section class="team-section d-none">
     <div class="image-layer" style="background-image: url(<?php echo get_template_directory_uri(); ?>/images/background/bg-team.png);"></div>
     <div class="auto-container">
         <div class="title-box centered">
             <div class="dots"><span></span></div>
             <h2><i class="bg-vector"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/Sign.png" alt=""></i><span>Meet Our Expert
                     <br>Instructors</span></h2>
         </div>
         <div class="carousel-box">
             <div class="team-carousel owl-theme owl-carousel">
                 <!--Block-->
                 <div class="team-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/team-1.jpg" alt="" title=""></div>
                         </div>
                         <div class="lower">
                             <h4><a href="#">Devid Mular</a></h4>
                             <div class="designation">Lead Instructor</div>
                             <div class="social">
                                 <ul class="social-links clearfix">
                                     <li><a href="#"><i class="fab fa-facebook-f"></i></a></li>
                                     <li><a href="#"><i class="fab fa-twitter"></i></a></li>
                                     <li><a href="#"><i class="fab fa-pinterest-p"></i></a></li>
                                 </ul>
                             </div>
                         </div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="team-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/team-2.jpg" alt="" title=""></div>
                         </div>
                         <div class="lower">
                             <h4><a href="#">Tomas Latham</a></h4>
                             <div class="designation">Owner</div>
                             <div class="social">
                                 <ul class="social-links clearfix">
                                     <li><a href="#"><i class="fab fa-facebook-f"></i></a></li>
                                     <li><a href="#"><i class="fab fa-twitter"></i></a></li>
                                     <li><a href="#"><i class="fab fa-pinterest-p"></i></a></li>
                                 </ul>
                             </div>
                         </div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="team-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/team-3.jpg" alt="" title=""></div>
                         </div>
                         <div class="lower">
                             <h4><a href="#">Tom Rony</a></h4>
                             <div class="designation">Instructor</div>
                             <div class="social">
                                 <ul class="social-links clearfix">
                                     <li><a href="#"><i class="fab fa-facebook-f"></i></a></li>
                                     <li><a href="#"><i class="fab fa-twitter"></i></a></li>
                                     <li><a href="#"><i class="fab fa-pinterest-p"></i></a></li>
                                 </ul>
                             </div>
                         </div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="team-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/team-1.jpg" alt="" title=""></div>
                         </div>
                         <div class="lower">
                             <h4><a href="#">Devid Mular</a></h4>
                             <div class="designation">Lead Instructor</div>
                             <div class="social">
                                 <ul class="social-links clearfix">
                                     <li><a href="#"><i class="fab fa-facebook-f"></i></a></li>
                                     <li><a href="#"><i class="fab fa-twitter"></i></a></li>
                                     <li><a href="#"><i class="fab fa-pinterest-p"></i></a></li>
                                 </ul>
                             </div>
                         </div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="team-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/team-2.jpg" alt="" title=""></div>
                         </div>
                         <div class="lower">
                             <h4><a href="#">Tomas Latham</a></h4>
                             <div class="designation">Owner</div>
                             <div class="social">
                                 <ul class="social-links clearfix">
                                     <li><a href="#"><i class="fab fa-facebook-f"></i></a></li>
                                     <li><a href="#"><i class="fab fa-twitter"></i></a></li>
                                     <li><a href="#"><i class="fab fa-pinterest-p"></i></a></li>
                                 </ul>
                             </div>
                         </div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="team-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/team-3.jpg" alt="" title=""></div>
                         </div>
                         <div class="lower">
                             <h4><a href="#">Tom Rony</a></h4>
                             <div class="designation">Instructor</div>
                             <div class="social">
                                 <ul class="social-links clearfix">
                                     <li><a href="#"><i class="fab fa-facebook-f"></i></a></li>
                                     <li><a href="#"><i class="fab fa-twitter"></i></a></li>
                                     <li><a href="#"><i class="fab fa-pinterest-p"></i></a></li>
                                 </ul>
                             </div>
                         </div>
                     </div>
                 </div>

             </div>
         </div>
     </div>
 </section>

 <!--Programs Section-->
 <section class="programs-section d-none">
     <div class="auto-container">
         <div class="title-box">
             <div class="dots"><span></span></div>
             <h2><i class="bg-vector"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/Sign.png" alt=""></i><span>Latest
                     Resources</span></h2>
         </div>
         <div class="carousel-box">
             <div class="programs-carousel owl-theme owl-carousel">
                 <!--Block-->
                 <div class="program-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/image-1.jpg" alt="" title=""></div>
                         </div>
                         <div class="hvr-box">
                             <div class="hvr-content">
                                 <div class="link"><a href="#"><span class="fa-light fa-long-arrow-right"></span></a>
                                 </div>
                                 <div class="cat">Education / Seasonal</div>
                                 <h4><a href="#">Winter Education</a></h4>
                             </div>
                         </div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="program-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/image-2.jpg" alt="" title=""></div>
                         </div>
                         <div class="hvr-box">
                             <div class="hvr-content">
                                 <div class="link"><a href="#"><span class="fa-light fa-long-arrow-right"></span></a>
                                 </div>
                                 <div class="cat">Education / Seasonal</div>
                                 <h4><a href="#">Winter Education</a></h4>
                             </div>
                         </div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="program-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/image-3.jpg" alt="" title=""></div>
                         </div>
                         <div class="hvr-box">
                             <div class="hvr-content">
                                 <div class="link"><a href="#"><span class="fa-light fa-long-arrow-right"></span></a>
                                 </div>
                                 <div class="cat">Education / Seasonal</div>
                                 <h4><a href="#">Winter Education</a></h4>
                             </div>
                         </div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="program-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/image-4.jpg" alt="" title=""></div>
                         </div>
                         <div class="hvr-box">
                             <div class="hvr-content">
                                 <div class="link"><a href="#"><span class="fa-light fa-long-arrow-right"></span></a>
                                 </div>
                                 <div class="cat">Education / Seasonal</div>
                                 <h4><a href="#">Winter Education</a></h4>
                             </div>
                         </div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="program-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/image-1.jpg" alt="" title=""></div>
                         </div>
                         <div class="hvr-box">
                             <div class="hvr-content">
                                 <div class="link"><a href="#"><span class="fa-light fa-long-arrow-right"></span></a>
                                 </div>
                                 <div class="cat">Education / Seasonal</div>
                                 <h4><a href="#">Winter Education</a></h4>
                             </div>
                         </div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="program-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/image-2.jpg" alt="" title=""></div>
                         </div>
                         <div class="hvr-box">
                             <div class="hvr-content">
                                 <div class="link"><a href="#"><span class="fa-light fa-long-arrow-right"></span></a>
                                 </div>
                                 <div class="cat">Education / Seasonal</div>
                                 <h4><a href="#">Winter Education</a></h4>
                             </div>
                         </div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="program-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/image-3.jpg" alt="" title=""></div>
                         </div>
                         <div class="hvr-box">
                             <div class="hvr-content">
                                 <div class="link"><a href="#"><span class="fa-light fa-long-arrow-right"></span></a>
                                 </div>
                                 <div class="cat">Education / Seasonal</div>
                                 <h4><a href="#">Winter Education</a></h4>
                             </div>
                         </div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="program-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/image-4.jpg" alt="" title=""></div>
                         </div>
                         <div class="hvr-box">
                             <div class="hvr-content">
                                 <div class="link"><a href="#"><span class="fa-light fa-long-arrow-right"></span></a>
                                 </div>
                                 <div class="cat">Education / Seasonal</div>
                                 <h4><a href="#">Winter Education</a></h4>
                             </div>
                         </div>
                     </div>
                 </div>

             </div>
         </div>
     </div>
 </section>

 <section class="programs-section">
     <div class="auto-container">
         <div class="title-box">
             <div class="dots"><span></span></div>
             <h2><i class="bg-vector"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/Sign.png" alt=""></i><span><?php echo get_field('resources_main_heading'); ?></span></h2>
         </div>
         <div class="carousel-box">
             <div class="programs-carousel program-block-two owl-theme owl-carousel">
                 
				 
				 <?php
      $args = array(
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'orderby' => 'id',
        'order' => 'ASC',
      );

      $loop = new WP_Query($args);
while ($loop->have_posts()) : $loop->the_post();
        $image = wp_get_attachment_url(get_post_thumbnail_id($post->ID) );
        $content = get_the_content();
        $strpcnt = wp_strip_all_tags($content);
      ?>
                 <div class="program-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><a href="<?php echo get_field('resource_link'); ?>" target="_blank"><img src="<?php echo $image; ?>" alt="" title=""></a>
                             </div>
                             <div class="icon-box"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/Steering.png" alt="" title=""></div>
                         </div>
                         <div class="mid-box">
                             <h4><a href="<?php echo get_field('resource_link'); ?>" target="_blank"><?php the_title(); ?></a></h4>
                             <div class="text"><?php //echo substr($strpcnt,0,70); ?></div>
                         </div>
                         <!-- <div class="link-box"><a href="#">READ MORE <i class="fa-light fa-angle-right"></i></a></div> -->
                     </div>
                 </div>
				    <?php endwhile;
            wp_reset_postdata(); ?>
                 <!--Block-->
<!--                  <div class="program-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><a href="#"><img src="<?php echo get_template_directory_uri(); ?>/images/alberta_drivers- guide-min.png" alt=""
                                         title=""></a></div>
                             <div class="icon-box"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/steering-icon.svg" alt="" title=""></div>
                         </div>
                         <div class="mid-box">
                             <h4><a href="#">Alberta Drivers Guide (2023)</a></h4>
                             <div class="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                 tempor.</div>
                         </div>
                        
                     </div>
                 </div>
                 
                 <div class="program-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><a href="#"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/image-13.jpg" alt="" title=""></a>
                             </div>
                             <div class="icon-box"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/steering-icon.svg" alt="" title=""></div>
                         </div>
                         <div class="mid-box">
                             <h4><a href="#">Class 7 Practice Test</a></h4>
                             <div class="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                 tempor.</div>
                         </div>
                         
                     </div>
                 </div>
               
                 <div class="program-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><a href="#"><img src="<?php echo get_template_directory_uri(); ?>/images/alberta_transportation-min.jpg" alt=""
                                         title=""></a></div>
                             <div class="icon-box"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/steering-icon.svg" alt="" title=""></div>
                         </div>
                         <div class="mid-box">
                             <h4><a href="#">Alberta Transportation</a></h4>
                             <div class="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                 tempor.</div>
                         </div>
                         
                     </div>
                 </div>
                 <div class="program-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><a href="#"><img src="<?php echo get_template_directory_uri(); ?>/images/traffic_ safety programs-min.jpg" alt=""
                                         title=""></a></div>
                             <div class="icon-box"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/steering-icon.svg" alt="" title=""></div>
                         </div>
                         <div class="mid-box">
                             <h4><a href="#">Traffic Safety Programs</a></h4>
                             <div class="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                 tempor.</div>
                         </div>
                        
                     </div>
                 </div> -->
             </div>
         </div>
     </div>
 </section>



 <section class="testimonial-section mb-5">
     <div class="container-fluid p-0">
         <div class="title-box centered">
             <div class="dots"><span></span></div>
             <h2><i class="bg-vector"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/Sign.png" alt=""></i><span>Testimonials</span></h2>
         </div>
         <div class="elfsight-app-115ef680-4585-4caf-bd6d-17bb29f08b39" data-elfsight-app-lazy>
		 	<?php echo do_shortcode('[trustindex no-registration=google]'); ?>
		 </div>
     </div>
 </section>

 <!--Testimonials Section-->
 <section class="testimonial-section d-none">
     <div class="auto-container">
         <div class="title-box centered">
             <div class="dots"><span></span></div>
             <h2><i class="bg-vector"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/Sign.png" alt=""></i><span>Check what
                     <br>people say about.</span></h2>
         </div>
         <div class="carousel-box">
             <div class="def-images">
                 <div class="inner clearfix">
                     <div class="image image-1"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/testi-1.png" alt="" title=""></div>
                     <div class="image image-2"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/testi-2.png" alt="" title=""></div>
                     <div class="image image-3"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/testi-4.png" alt="" title=""></div>
                     <div class="image image-4"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/testi-3.png" alt="" title=""></div>
                     <div class="image image-5"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/testi-5.png" alt="" title=""></div>
                 </div>
             </div>
             <div class="testi-carousel-one owl-theme owl-carousel">
                 <!--Block-->
                 <div class="testi-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/testi-1.png" alt="" title=""></div>
                         </div>
                         <div class="text-content">
                             <div class="text">Ipsum dolor sit amet, consectetur adipisicing elit sed do eiusmod tempor
                                 incididunt labore etuy dolore magna aduras minim veniam, quis nostrud exercitation
                                 ullamco enim ad minim veniam quis nostrud exercitation ullamco duis autey irure dolor
                                 in reprehenderit in voluptate velit esse cillum dolore.</div>
                         </div>
                         <div class="info">
                             <h4 class="name">Elle Gold</h4>
                             <div class="designation">CEO & CO FOUNDER</div>
                         </div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="testi-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/testi-2.png" alt="" title=""></div>
                         </div>
                         <div class="text-content">
                             <div class="text">Ipsum dolor sit amet, consectetur adipisicing elit sed do eiusmod tempor
                                 incididunt labore etuy dolore magna aduras minim veniam, quis nostrud exercitation
                                 ullamco enim ad minim veniam quis nostrud exercitation ullamco duis autey irure dolor
                                 in reprehenderit in voluptate velit esse cillum dolore.</div>
                         </div>
                         <div class="info">
                             <h4 class="name">Elle Gold</h4>
                             <div class="designation">CEO & CO FOUNDER</div>
                         </div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="testi-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/testi-3.png" alt="" title=""></div>
                         </div>
                         <div class="text-content">
                             <div class="text">Ipsum dolor sit amet, consectetur adipisicing elit sed do eiusmod tempor
                                 incididunt labore etuy dolore magna aduras minim veniam, quis nostrud exercitation
                                 ullamco enim ad minim veniam quis nostrud exercitation ullamco duis autey irure dolor
                                 in reprehenderit in voluptate velit esse cillum dolore.</div>
                         </div>
                         <div class="info">
                             <h4 class="name">Elle Gold</h4>
                             <div class="designation">CEO & CO FOUNDER</div>
                         </div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="testi-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/testi-4.png" alt="" title=""></div>
                         </div>
                         <div class="text-content">
                             <div class="text">Ipsum dolor sit amet, consectetur adipisicing elit sed do eiusmod tempor
                                 incididunt labore etuy dolore magna aduras minim veniam, quis nostrud exercitation
                                 ullamco enim ad minim veniam quis nostrud exercitation ullamco duis autey irure dolor
                                 in reprehenderit in voluptate velit esse cillum dolore.</div>
                         </div>
                         <div class="info">
                             <h4 class="name">Elle Gold</h4>
                             <div class="designation">CEO & CO FOUNDER</div>
                         </div>
                     </div>
                 </div>
                 <!--Block-->
                 <div class="testi-block">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/testi-5.png" alt="" title=""></div>
                         </div>
                         <div class="text-content">
                             <div class="text">Ipsum dolor sit amet, consectetur adipisicing elit sed do eiusmod tempor
                                 incididunt labore etuy dolore magna aduras minim veniam, quis nostrud exercitation
                                 ullamco enim ad minim veniam quis nostrud exercitation ullamco duis autey irure dolor
                                 in reprehenderit in voluptate velit esse cillum dolore.</div>
                         </div>
                         <div class="info">
                             <h4 class="name">Elle Gold</h4>
                             <div class="designation">CEO & CO FOUNDER</div>
                         </div>
                     </div>
                 </div>
             </div>

         </div>
     </div>
 </section>



 <!--News Section-->
 <section class="news-section d-none">
     <div class="auto-container">
         <div class="title-box centered">
             <div class="dots"><span></span></div>
             <h2><i class="bg-vector"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/Sign.png" alt=""></i><span>Latest news &
                     <br>update</span></h2>
         </div>
         <div class="news-box">
             <div class="row clearfix">
                 <!--News Block-->
                 <div class="news-block col-xl-4 col-lg-6 col-md-6 col-sm-12">
                     <div class="inner-box wow fadeInUp" data-wow-duration="1500ms" data-wow-delay="0ms">
                         <div class="image-box">
                             <div class="image"><a href="#"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/news-1.jpg" alt="" title=""></a>
                             </div>
                         </div>
                         <div class="lower-box">
                             <div class="info">Personal / June 13, 2022</div>
                             <h4><a href="#">How to become a best driver Marketer in a year!</a></h4>
                             <div class="link-box"><a href="#" class="theme-btn">More Details <span
                                         class="icon far fa-long-arrow-right"></span></a></div>
                         </div>
                     </div>
                 </div>
                 <!--News Block-->
                 <div class="news-block col-xl-4 col-lg-6 col-md-6 col-sm-12">
                     <div class="inner-box wow fadeInUp" data-wow-duration="1500ms" data-wow-delay="300ms">
                         <div class="image-box">
                             <div class="image"><a href="#"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/news-2.jpg" alt="" title=""></a>
                             </div>
                         </div>
                         <div class="lower-box">
                             <div class="info">Personal / June 13, 2022</div>
                             <h4><a href="#">How to become a best driver Marketer in a year!</a></h4>
                             <div class="link-box"><a href="#" class="theme-btn">More Details <span
                                         class="icon far fa-long-arrow-right"></span></a></div>
                         </div>
                     </div>
                 </div>
                 <!--News Block-->
                 <div class="news-block col-xl-4 col-lg-6 col-md-6 col-sm-12">
                     <div class="inner-box wow fadeInUp" data-wow-duration="1500ms" data-wow-delay="600ms">
                         <div class="image-box">
                             <div class="image"><a href="#"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/news-3.jpg" alt="" title=""></a>
                             </div>
                         </div>
                         <div class="lower-box">
                             <div class="info">Personal / June 13, 2022</div>
                             <h4><a href="#">How to become a best driver Marketer in a year!</a></h4>
                             <div class="link-box"><a href="#" class="theme-btn">More Details <span
                                         class="icon far fa-long-arrow-right"></span></a></div>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
     </div>
 </section>

 <!--Subscribe Section-->
 <section class="subscribe-section">
     <div class="bg-layer" style="background-image: url(<?php echo get_template_directory_uri(); ?>/images/background/subscribe-bg.png);"></div>
     <div class="auto-container">
         <div class="row clearfix">
             <div class="title-col col-md-12">
                 <div class="inner">
                     <h2 class="text-center"><?php echo get_field('home_page_last_orange_section_title'); ?></h2>
                     <div class="link text-center mt-4"><a href="<?php echo get_field('home_page_last_orange_section_button_link'); ?>" class="theme-btn btn-style-one"><span><?php echo get_field('home_page_last_orange_section_button_text'); ?></span></a></div>
                 </div>
             </div>

             <!-- <div class="form-col col-xl-6 col-lg-6 col-md-12 col-sm-12">
                    <div class="inner">
                        <div class="form-box subscribe-form">
                            <form method="post" action="https://t.commonsupport.com/driveto/#">
                                <div class="form-group">
                                    <div class="field-inner">
                                        <input type="email" name="email" value="" placeholder="Your email address.." required>
                                    </div>
                                    <button type="submit" class="theme-btn"><i class="icon fa fa-envelope"></i></button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div> -->
         </div>
     </div>
 </section>

 <?php get_footer(); ?>