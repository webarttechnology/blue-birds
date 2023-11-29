<?php /* Template Name: Service */

get_header();
 ?>

<!-- Banner Section -->
<section class="inner-banner">
    <div class="image-layer" style="background-image: url(<?php echo get_template_directory_uri(); ?>/images/background/banner-image-1.jpg);"></div>
    <div class="auto-container">
        <div class="content-box">
            <div class="bread-crumb">
                <ul class="clearfix">
                    <li><a href="index.php">Home</a></li>
                    <li class="current">Services</li>
                </ul>
            </div>
            <h1>Services</h1>
        </div>
    </div>
</section>

<!--Welcome Section-->
<section class="welcome-section d-none">
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
                                    alt=""></i><span><?php echo get_field('banner_bottom_main_heading',5); ?> </span></h2>
                    </div>
                    <div class="text-content text"><?php echo get_field('banner_bottom_subheading',5); ?></div>
                    <div class="row clearfix">
                        <!--Block-->

                        <?php 

                        $serviceloop = CFS()->get('our_service_loop');

                        if(is_array($serviceloop) || is_object($serviceloop)){

                            foreach($serviceloop as $serviceloopitem){



                         ?>
                        <div class="wel-block col-md-4">
                            <div class="inner-box">
                                <div class="icon"><img src="<?php echo $serviceloopitem['our_service_icon_image']; ?>" alt=""></div>
                                <h4><?php echo $serviceloopitem['our_service_icon_title']; ?></h4>
                                <div class="text"><?php echo $serviceloopitem['our_service_icon_description']; ?></div>
                            </div>
                        </div>
                    <?php } } ?>
                        <!--Block-->
                        <!-- <div class="wel-block col-md-4">
                            <div class="inner-box">
                                <div class="icon"><img src="<?php echo get_template_directory_uri(); ?>/images/icons/check-1.svg" alt=""></div>
                                <h4>Car Rentals</h4>
                                <div class="text">Car Rentals: Enjoy the convenience of hassle-free car rentals for your
                                    driving lessons, ensuring a seamless learning experience.</div>
                            </div>
                        </div>
                       
                        <div class="wel-block col-md-4">
                            <div class="inner-box">
                                <div class="icon"><img src="<?php echo get_template_directory_uri(); ?>/images/icons/check-1.svg" alt=""></div>
                                <h4>Insurance Reduction Courses</h4>
                                <div class="text">Enroll in our specialized courses to reduce
                                    insurance premiums while enhancing your driving skills.</div>
                            </div>
                        </div>
                        
                        <div class="wel-block col-md-4">
                            <div class="inner-box">
                                <div class="icon"><img src="<?php echo get_template_directory_uri(); ?>/images/icons/check-1.svg" alt=""></div>
                                <h4>Personalized Lessons</h4>
                                <div class="text">Tailored lessons designed to meet your specific needs,
                                    providing focused and effective learning.</div>
                            </div>
                        </div>
                        <div class="wel-block col-md-4">
                            <div class="inner-box">
                                <div class="icon"><img src="<?php echo get_template_directory_uri(); ?>/images/icons/check-1.svg" alt=""></div>
                                <h4>Self Paced Learning</h4>
                                <div class="text">Progress at your own speed with our flexible self-paced learning
                                    options,
                                    empowering you to learn comfortably.</div>
                            </div>
                        </div>
                        <div class="wel-block col-md-4">
                            <div class="inner-box">
                                <div class="icon"><img src="<?php echo get_template_directory_uri(); ?>/images/icons/check-1.svg" alt=""></div>
                                <h4>Top-Rated School</h4>
                                <div class="text">Choose the top-rated driving school in town, where quality education
                                    and
                                    excellent service are our top priorities.</div>
                            </div>
                        </div> -->
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
        </div>
    </div>
</section>


<section class="programs-section mt-5 d-none">
    <div class="auto-container">
        <div class="title-box">
            <div class="dots"><span></span></div>
            <h2><i class="bg-vector"><img src="images/resource/Sign.png" alt=""></i><span> Latest Resources
                </span></h2>
        </div>
        <div class="carousel-box">
            <div class="programs-carousel program-block-two owl-theme owl-carousel">
                <!--Block-->
                <div class="program-block">
                    <div class="inner-box">
                        <div class="image-box">
                            <div class="image"><a href="#"><img src="images/resource/image-11.jpg" alt="" title=""></a>
                            </div>
                            <div class="icon-box"><img src="images/resource/Steering.png" alt="" title=""></div>
                        </div>
                        <div class="mid-box">
                            <h4><a href="#">Alberta Road Test Booking</a></h4>
                            <div class="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                tempor.</div>
                        </div>
                        <div class="link-box"><a href="#">READ MORE <i class="fa-light fa-angle-right"></i></a></div>
                    </div>
                </div>
                <!--Block-->
                <div class="program-block">
                    <div class="inner-box">
                        <div class="image-box">
                            <div class="image"><a href="#"><img src="images/alberta_drivers- guide-min.png"></a></div>
                            <div class="icon-box"><img src="images/resource/Steering.png" alt="" title=""></div>
                        </div>
                        <div class="mid-box">
                            <h4><a href="#">Alberta Drivers Guide (2023)</a></h4>
                            <div class="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                tempor.</div>
                        </div>
                        <div class="link-box"><a href="#">READ MORE <i class="fa-light fa-angle-right"></i></a></div>
                    </div>
                </div>
                <!--Block-->
                <div class="program-block">
                    <div class="inner-box">
                        <div class="image-box">
                            <div class="image"><a href="#"><img src="images/resource/image-13.jpg"></a></div>
                            <div class="icon-box"><img src="images/resource/Steering.png" alt="" title=""></div>
                        </div>
                        <div class="mid-box">
                            <h4><a href="#">Class 7 Practice Test</a></h4>
                            <div class="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                tempor.</div>
                        </div>
                        <div class="link-box"><a href="#">READ MORE <i class="fa-light fa-angle-right"></i></a></div>
                    </div>
                </div>
                <!--Block-->
                <div class="program-block">
                    <div class="inner-box">
                        <div class="image-box">
                            <div class="image"><a href="#"><img src="images/alberta_transportation-min.jpg"></a></div>
                            <div class="icon-box"><img src="images/resource/Steering.png" alt="" title=""></div>
                        </div>
                        <div class="mid-box">
                            <h4><a href="#">Alberta Transportation</a></h4>
                            <div class="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                tempor.</div>
                        </div>
                        <div class="link-box"><a href="#">READ MORE <i class="fa-light fa-angle-right"></i></a></div>
                    </div>
                </div>
                <div class="program-block">
                    <div class="inner-box">
                        <div class="image-box">
                            <div class="image"><a href="#"><img src="images/traffic_ safety programs-min.jpg"></a></div>
                            <div class="icon-box"><img src="images/resource/Steering.png" alt="" title=""></div>
                        </div>
                        <div class="mid-box">
                            <h4><a href="#">Traffic Safety Programs</a></h4>
                            <div class="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                tempor.</div>
                        </div>
                        <div class="link-box"><a href="#">READ MORE <i class="fa-light fa-angle-right"></i></a></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Package -->

<section class="packege-section">
    <div class="auto-container">
        <div class="row clearfix">
            <div class="col-md-7" data-aos="fade-up" data-aos-duration="3000">
                <div class="packege-text">
                    <h3><?php echo get_field('service_page_second_section_heading'); ?></h3>
					<?php echo get_field('service_page_second_section_description'); ?>
<!--                     <p>Elevate your driving skills with our best-in-class lessons!
                        Our All-In-One Training Package offers top-notch on-road training
                        and expert theory sessions, ensuring you excel. Plus, enjoy reduced
                        insurance costs as a result. Don't just learn to drive, learn to drive
                        confidently and save on insurance!</p>

                    <div class="packege-right">
                        <p><span><i class="bi bi-check-all"></i></span>&nbsp;This all-inclusive training package
                            includes<span class="orange"> 10 hours </span>of practical on-road training</p>
                        <p><span><i class="bi bi-check-all"></i></span>&nbsp;substituted by <span class="orange"> 15
                                hours</span> of in-class or online training for insurance reduction</p>
                    </div> -->
                </div>

            </div>
            <div class="col-md-5">
                <div class="packege-image">
                    <img src="<?php echo get_field('service_page_second_section_image'); ?>">
                </div>
            </div>

        </div>
    </div>
</section>

<!-- brush up -->
<section>
    <div class="auto-container">
        <div class="row clearfix">
            <div class="col-md-12">
                <div class="brushup">
                    <div class="brushup-packege">
                        <h3><?php echo get_field('brushup_package_main_heading'); ?></h3>
                        <p><?php echo get_field('brushup_package_main_subheading'); ?></p>
                    </div>

                    <div class="row">
						
						<?php 

                        $brushuppackge = CFS()->get('brushup_package_loop');

                        if(is_array($brushuppackge) || is_object($brushuppackge)){

                            foreach($brushuppackge as $brushuppackgeitem){

                         ?>

                        <div class="packege-box col-md-6 py-2" data-aos="fade-up">
                            <div class="packegebox-inner">
                                <div class="packege-number"><?php echo $brushuppackgeitem['brushup_package_price']; ?></div>
                                <div class="packege-text">
                                    <h4><?php echo $brushuppackgeitem['brushup_package_time']; ?></h4>
									
									<?php echo $brushuppackgeitem['brushup_package_lesson_details']; ?>
<!--                                     <p><span><i class="bi bi-check2-circle"></i></span>&nbsp;1.5 Hours of hands-on
                                        practical lessons</p>
                                    <p><span><i class="bi bi-check2-circle"></i></span>&nbsp;Free Pick Up / Drop Off
                                        Service*</p> -->
                                </div>
                            </div>
                        </div>
						
						  <?php } } ?>


<!--                         <div class="packege-box col-md-6 py-2" data-aos="fade-down">
                            <div class="packegebox-inner">
                                <div class="packege-number">$240</div>
                                <div class="packege-text">
                                    <h4>3 Hourss</h4>
                                    <p><span><i class="bi bi-check2-circle"></i></span>&nbsp;3 Hours of hands-on
                                        practical lessons</p>
                                    <p><span><i class="bi bi-check2-circle"></i></span>&nbsp;Free Pick Up / Drop Off
                                        Service*</p>
                                </div>
                            </div>
                        </div>

                        <div class="packege-box col-md-6 py-2" data-aos="fade-down">
                            <div class="packegebox-inner">
                                <div class="packege-number">$350</div>
                                <div class="packege-text">
                                    <h4>4.5 Hours</h4>
                                    <p><span><i class="bi bi-check2-circle"></i></span>&nbsp;4.5 Hours of hands-on
                                        practical lessons</p>
                                    <p><span><i class="bi bi-check2-circle"></i></span>&nbsp;Free Pick Up / Drop Off
                                        Service*</p>
                                </div>
                            </div>
                        </div>

                        <div class="packege-box col-md-6 py-2" data-aos="fade-up">
                            <div class="packegebox-inner">
                                <div class="packege-number">$575</div>
                                <div class="packege-text">
                                    <h4>7.5 Hours</h4>
                                    <p><span><i class="bi bi-check2-circle"></i></span>&nbsp;7.5 Hours of hands-on
                                        practical lessons</p>
                                    <p><span><i class="bi bi-check2-circle"></i></span>&nbsp;Free Pick Up / Drop Off
                                        Service*</p>
                                </div>
                            </div>
                        </div> -->
                    </div>

                </div>
            </div>
        </div>
</section>

<!-- car rental -->
	
	<?php 

$carrental = get_field('extra_other_category_service_group');

if($carrental){

 ?>
<section class="packege-rent">
    <div class="container">
        <div class="packege-pickup">
            <div class="row">

                <div class="col-md-6">
                    <div class="rent">
                        <h3><?php echo $carrental['extra_category_1st_heading']; ?></h3>
                        <p><?php echo $carrental['extra_category_1st_description']; ?></p>
                    </div>
                </div>
                <div class="col-md-6 pick-part">
                    <h3><?php echo $carrental['extra_category_2nd_heading']; ?></h3>
                    <p><?php echo $carrental['extra_category_2nd_description']; ?></p>
                </div>
            </div>
        </div>
    </div>
</section>
	
	<?php } ?>
	
	<section class="programs-section mt-5 d-none">
    <div class="auto-container">
        <div class="title-box">
            <div class="dots"><span></span></div>
            <h2><i class="bg-vector"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/Sign.png" alt=""></i><span> <?php echo get_field('resources_main_heading',5); ?>
                </span></h2>
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
                <!--Block-->
                <div class="program-block">
                    <div class="inner-box">
                        <div class="image-box">
                            <div class="image"><a href="<?php the_permalink(); ?>"><img src="<?php echo $image; ?>" alt="" title=""></a>
                            </div>
                            <div class="icon-box"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/Steering.png" alt="" title=""></div>
                        </div>
                        <div class="mid-box">
                            <h4><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h4>
                            <div class="text"><?php echo substr($strpcnt,0,70); ?></div>
                        </div>
                        <div class="link-box"><a href="<?php the_permalink(); ?>">READ MORE <i class="fa-light fa-angle-right"></i></a></div>
                    </div>
                </div>
				<?php endwhile;
            wp_reset_postdata(); ?>
                <!--Block-->
<!--                 <div class="program-block">
                    <div class="inner-box">
                        <div class="image-box">
                            <div class="image"><a href="#"><img src="<?php echo get_template_directory_uri(); ?>/images/alberta_drivers- guide-min.png"></a></div>
                            <div class="icon-box"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/steering-icon.svg" alt="" title=""></div>
                        </div>
                        <div class="mid-box">
                            <h4><a href="#">Alberta Drivers Guide (2023)</a></h4>
                            <div class="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                tempor.</div>
                        </div>
                        <div class="link-box"><a href="#">READ MORE <i class="fa-light fa-angle-right"></i></a></div>
                    </div>
                </div>
              
                <div class="program-block">
                    <div class="inner-box">
                        <div class="image-box">
                            <div class="image"><a href="#"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/image-13.jpg"></a></div>
                            <div class="icon-box"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/steering-icon.svg" alt="" title=""></div>
                        </div>
                        <div class="mid-box">
                            <h4><a href="#">Class 7 Practice Test</a></h4>
                            <div class="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                tempor.</div>
                        </div>
                        <div class="link-box"><a href="#">READ MORE <i class="fa-light fa-angle-right"></i></a></div>
                    </div>
                </div>
               
                <div class="program-block">
                    <div class="inner-box">
                        <div class="image-box">
                            <div class="image"><a href="#"><img src="<?php echo get_template_directory_uri(); ?>/images/alberta_transportation-min.jpg"></a></div>
                            <div class="icon-box"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/steering-icon.svg" alt="" title=""></div>
                        </div>
                        <div class="mid-box">
                            <h4><a href="#">Alberta Transportation</a></h4>
                            <div class="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                tempor.</div>
                        </div>
                        <div class="link-box"><a href="#">READ MORE <i class="fa-light fa-angle-right"></i></a></div>
                    </div>
                </div>
                <div class="program-block">
                    <div class="inner-box">
                        <div class="image-box">
                            <div class="image"><a href="#"><img src="<?php echo get_template_directory_uri(); ?>/images/traffic_ safety programs-min.jpg"></a></div>
                            <div class="icon-box"><img src="images/resource/steering-icon.svg" alt="" title=""></div>
                        </div>
                        <div class="mid-box">
                            <h4><a href="#">Traffic Safety Programs</a></h4>
                            <div class="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                tempor.</div>
                        </div>
                        <div class="link-box"><a href="#">READ MORE <i class="fa-light fa-angle-right"></i></a></div>
                    </div>
                </div> -->
            </div>
        </div>
    </div>
</section>
	
	
	
	
	

<!-- map -->

<section class="packege-map">
    <div class="map" data-aos="zoom-in">
        <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3511.83997306206!2d-114.10434730164826!3d51.06660847569058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x53716f964625057f%3A0xc5aa81ec86f68d05!2sLions%20Park!5e0!3m2!1sen!2sca!4v1697672780512!5m2!1sen!2sca"
            width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
</section>
	
	
	
	<section class="welcome-section">
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
                                    alt=""></i><span><?php echo get_field('banner_bottom_main_heading',5); ?> </span></h2>
                    </div>
                    <div class="text-content text"><?php echo get_field('banner_bottom_subheading',5); ?></div>
                    <div class="row clearfix">
                        <!--Block-->

                        <?php 

                        $serviceloop = CFS()->get('our_service_loop');

                        if(is_array($serviceloop) || is_object($serviceloop)){

                            foreach($serviceloop as $serviceloopitem){



                         ?>
                        <div class="wel-block col-md-4">
                            <div class="inner-box">
                                <div class="icon"><img src="<?php echo $serviceloopitem['our_service_icon_image']; ?>" alt=""></div>
                                <h4><?php echo $serviceloopitem['our_service_icon_title']; ?></h4>
                                <div class="text"><?php echo $serviceloopitem['our_service_icon_description']; ?></div>
                            </div>
                        </div>
                    <?php } } ?>
                        <!--Block-->
                        <!-- <div class="wel-block col-md-4">
                            <div class="inner-box">
                                <div class="icon"><img src="<?php echo get_template_directory_uri(); ?>/images/icons/check-1.svg" alt=""></div>
                                <h4>Car Rentals</h4>
                                <div class="text">Car Rentals: Enjoy the convenience of hassle-free car rentals for your
                                    driving lessons, ensuring a seamless learning experience.</div>
                            </div>
                        </div>
                       
                        <div class="wel-block col-md-4">
                            <div class="inner-box">
                                <div class="icon"><img src="<?php echo get_template_directory_uri(); ?>/images/icons/check-1.svg" alt=""></div>
                                <h4>Insurance Reduction Courses</h4>
                                <div class="text">Enroll in our specialized courses to reduce
                                    insurance premiums while enhancing your driving skills.</div>
                            </div>
                        </div>
                        
                        <div class="wel-block col-md-4">
                            <div class="inner-box">
                                <div class="icon"><img src="<?php echo get_template_directory_uri(); ?>/images/icons/check-1.svg" alt=""></div>
                                <h4>Personalized Lessons</h4>
                                <div class="text">Tailored lessons designed to meet your specific needs,
                                    providing focused and effective learning.</div>
                            </div>
                        </div>
                        <div class="wel-block col-md-4">
                            <div class="inner-box">
                                <div class="icon"><img src="<?php echo get_template_directory_uri(); ?>/images/icons/check-1.svg" alt=""></div>
                                <h4>Self Paced Learning</h4>
                                <div class="text">Progress at your own speed with our flexible self-paced learning
                                    options,
                                    empowering you to learn comfortably.</div>
                            </div>
                        </div>
                        <div class="wel-block col-md-4">
                            <div class="inner-box">
                                <div class="icon"><img src="<?php echo get_template_directory_uri(); ?>/images/icons/check-1.svg" alt=""></div>
                                <h4>Top-Rated School</h4>
                                <div class="text">Choose the top-rated driving school in town, where quality education
                                    and
                                    excellent service are our top priorities.</div>
                            </div>
                        </div> -->
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
        </div>
    </div>
</section>
	

<section class="programs-section my-5">
    <div class="auto-container">
        <div class="title-box">
            <div class="dots"><span></span></div>
            <h2><i class="bg-vector"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/Sign.png" alt=""></i><span> <?php echo get_field('resources_main_heading',5); ?>
                </span></h2>
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
                <!--Block-->
                <div class="program-block">
                    <div class="inner-box">
                        <div class="image-box">
                            <div class="image"><a href="<?php echo get_field('resource_link'); ?>"><img src="<?php echo $image; ?>" alt="" title=""></a>
                            </div>
                            <div class="icon-box"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/Steering.png" alt="" title=""></div>
                        </div>
                        <div class="mid-box">
                            <h4><a href="<?php echo get_field('resource_link'); ?>"><?php the_title(); ?></a></h4>
                            <div class="text"><?php //echo substr($strpcnt,0,70); ?></div>
                        </div>
<!--                         <div class="link-box"><a href="<?php //the_permalink(); ?>">READ MORE <i class="fa-light fa-angle-right"></i></a></div> -->
                    </div>
                </div>
				<?php endwhile;
            wp_reset_postdata(); ?>
                <!--Block-->
<!--                 <div class="program-block">
                    <div class="inner-box">
                        <div class="image-box">
                            <div class="image"><a href="#"><img src="<?php echo get_template_directory_uri(); ?>/images/alberta_drivers- guide-min.png"></a></div>
                            <div class="icon-box"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/steering-icon.svg" alt="" title=""></div>
                        </div>
                        <div class="mid-box">
                            <h4><a href="#">Alberta Drivers Guide (2023)</a></h4>
                            <div class="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                tempor.</div>
                        </div>
                        <div class="link-box"><a href="#">READ MORE <i class="fa-light fa-angle-right"></i></a></div>
                    </div>
                </div>
              
                <div class="program-block">
                    <div class="inner-box">
                        <div class="image-box">
                            <div class="image"><a href="#"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/image-13.jpg"></a></div>
                            <div class="icon-box"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/steering-icon.svg" alt="" title=""></div>
                        </div>
                        <div class="mid-box">
                            <h4><a href="#">Class 7 Practice Test</a></h4>
                            <div class="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                tempor.</div>
                        </div>
                        <div class="link-box"><a href="#">READ MORE <i class="fa-light fa-angle-right"></i></a></div>
                    </div>
                </div>
               
                <div class="program-block">
                    <div class="inner-box">
                        <div class="image-box">
                            <div class="image"><a href="#"><img src="<?php echo get_template_directory_uri(); ?>/images/alberta_transportation-min.jpg"></a></div>
                            <div class="icon-box"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/steering-icon.svg" alt="" title=""></div>
                        </div>
                        <div class="mid-box">
                            <h4><a href="#">Alberta Transportation</a></h4>
                            <div class="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                tempor.</div>
                        </div>
                        <div class="link-box"><a href="#">READ MORE <i class="fa-light fa-angle-right"></i></a></div>
                    </div>
                </div>
                <div class="program-block">
                    <div class="inner-box">
                        <div class="image-box">
                            <div class="image"><a href="#"><img src="<?php echo get_template_directory_uri(); ?>/images/traffic_ safety programs-min.jpg"></a></div>
                            <div class="icon-box"><img src="images/resource/steering-icon.svg" alt="" title=""></div>
                        </div>
                        <div class="mid-box">
                            <h4><a href="#">Traffic Safety Programs</a></h4>
                            <div class="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                                tempor.</div>
                        </div>
                        <div class="link-box"><a href="#">READ MORE <i class="fa-light fa-angle-right"></i></a></div>
                    </div>
                </div> -->
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
                    <h2 class="text-center"><?php echo get_field('home_page_last_orange_section_title',5); ?></h2>
                    <div class="link text-center mt-4"><a href="<?php echo get_field('home_page_last_orange_section_button_link',5); ?>" class="theme-btn btn-style-one"><span><?php echo get_field('home_page_last_orange_section_button_text',5); ?></span></a></div>
                </div>
            </div>
        </div>
    </div>
</section>

 <?php get_footer(); ?>