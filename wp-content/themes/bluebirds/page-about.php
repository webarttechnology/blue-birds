<?php /* Template Name: About */

get_header();
 ?>
   
   <!-- Banner Section -->
   <section class="inner-banner">
      <div class="image-layer" style="background-image: url(<?php echo get_template_directory_uri(); ?>/images/background/banner-image-1.jpg);"></div>
      <div class="auto-container">
         <div class="content-box">
            <div class="bread-crumb">
               <ul class="clearfix">
                  <li><a href="<?php echo get_site_url(); ?>">Home</a></li>
                  <li class="current">About Us</li>
               </ul>
            </div>
            <h1>About us</h1>
         </div>
      </div>
   </section>
   <!--End Banner Section -->
   <!--Welcome Section-->
   <section class="welcome-three">
      <div class="auto-container">
         <div class="row clearfix">
            <!--Text Col-->
            <div class="text-col col-xl-6 col-lg-6 col-md-12 col-sm-12">
               <div class="inner wow fadeInRight" data-wow-duration="1500ms" data-wow-delay="0ms">
                  <div class="title-box style-two">
                     <div class="subtitle"><span><?php echo get_field('orange_heading'); ?></span></div>
                     <h2><span><?php echo get_field('about_main_heading'); ?></span></h2>
                  </div>
                  <div class="text-content">
                     <div class="text big-text"><?php echo get_field('about_main_subheading'); ?></div>
                     <div class="text"><?php echo get_field('about_description_1'); ?></div>
                  </div>
                  <div class="row clearfix">
                     <!--Block-->
                     <?php echo get_field('about_description_2'); ?>
                     <!-- <div class="wel-block-three col-lg-6 col-md-6 col-sm-12">
                        <div class="inner-box">
                           <div class="icon"><i class="fa-light fa-long-arrow-right"></i></div>
                           <h6>Appointments six days a week.</h6>
                           <div class="text">Since 2010, throughout North America for providing.</div>
                        </div>
                     </div>
                    
                     <div class="wel-block-three col-lg-6 col-md-6 col-sm-12">
                        <div class="inner-box">
                           <div class="icon"><i class="fa-light fa-long-arrow-right"></i></div>
                           <h6>Service At Affordable Rates.</h6>
                           <div class="text">Since 2010, throughout North America for providing.</div>
                        </div>
                     </div> -->
                  </div>
                  <div class="lower-links clearfix">
                     <div class="link"><a href="<?php echo get_field('about_button_link'); ?>" class="theme-btn btn-style-one semi-round"><span><?php echo get_field('about_button_text'); ?></span></a></div>
                  </div>
               </div>
            </div>
            <!--Image Col-->
            <div class="image-col col-xl-6 col-lg-6 col-md-12 col-sm-12">
               <div class="inner wow fadeInLeft" data-wow-duration="1500ms" data-wow-delay="0ms">
                  <div class="pattern"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/wel-pattern.png" alt="" title=""></div>
                  <div class="images clearfix">
                     <div class="image"><img src="<?php echo get_field('about_image_1'); ?>" alt="" title=""></div>
                     <div class="image-box">
                        <img src="<?php echo get_field('about_image_2'); ?>" alt="" title="">
                        <a href="<?php echo get_field('about_youtube_video'); ?>" class="theme-btn lightbox-image vid-btn"><span class="icon far fa-play"></span></a>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </section>


   <?php 

   $secondsec = get_field('second_section_group');
   if($secondsec){

    ?>

   <!--Start Class-->
   <section class="start-class">
      <div class="image-layer" style="background-image: url(<?php echo $secondsec['second_section_background_image']; ?>);"></div>
      <div class="auto-container">
         <div class="row clearfix">
            <!--Column-->
            <div class="title-col col-lg-7 col-md-12 col-sm-12">
               <div class="inner wow fadeInLeft" data-wow-duration="1500ms" data-wow-delay="0ms">
                  <div class="video-link"><a href="<?php echo $secondsec['second_section_video']; ?>" class="theme-btn lightbox-image vid-btn"><span class="icon fa fa-play"></span></a></div>
                  <div class="title-box">
                     <div class="dots"><span></span></div>
                     <h2><i class="bg-vector"><img src="<?php echo get_template_directory_uri(); ?>/images/resource/title-pattern-1.svg" alt=""></i><span><?php echo $secondsec['second_section_title']; ?></span></h2>
                  </div>
                  <i class="arrow-form wow zoomInLeft" data-wow-duration="2500ms" data-wow-delay="0"><img src="<?php echo get_template_directory_uri(); ?>/images/icons/curve-arrow.svg" alt=""></i>
               </div>
            </div>

            <!--Column-->
            <div class="form-col col-lg-5 col-md-12 col-sm-12">
               <div class="inner wow fadeInRight" data-wow-duration="1500ms" data-wow-delay="0ms">
                  <div class="form-box">
                     <h3>Get Free Quote</h3>
                     <?php echo do_shortcode('[contact-form-7 id="9276adc" title="Contact form 1"]'); ?>
                     <!-- <form method="post" action="https://t.commonsupport.com/driveto/contact.html">
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
                     </form> -->
                  </div>
               </div>
            </div>
         </div>
      </div>
   </section>
   <?php } ?>
   <!--Why Us Section-->
   <section class="why-us-three">
        <div class="auto-container">
            <div class="row clearfix">
                <div class="text-col col-xl-7 col-lg-7 col-md-12 col-sm-12">
                    <div class="inner wow fadeInLeft" data-wow-duration="1500ms" data-wow-delay="0ms" style="visibility: visible; animation-duration: 1500ms; animation-delay: 0ms; animation-name: fadeInLeft;">
                        <div class="title-box style-two">
                            <h2><span><?php echo get_field('step_process_main_heading',5); ?></span></h2>
                        </div>
                        <div class="why-info">
                            <div class="clearfix">
                                <?php 

            $processstep = CFS()->get('process_step_loop',5);

            if(is_array($processstep) || is_object($processstep)){
                foreach($processstep as $processsteps){

             ?>
                                <div class="why-info-block">
                                    <div class="inner-box">
                                    <div class="icon-box"><span><?php echo $processsteps['process_step_icon']; ?></span></div>
                                        <div class="count"><span><?php echo $processsteps['process_step_title']; ?></span></div>
                                        <!-- <div class="cat">Call</div> -->
                                    </div>
                                </div>
                            <?php } } ?>
                                <!-- <div class="why-info-block">
                                    <div class="inner-box">
                                        <div class="icon-box"><span class="fa-light fa-car"></span></div>
                                        <div class="count"><span>Appointment</span></div>
                                       
                                    </div>
                                </div>
                                <div class="why-info-block">
                                    <div class="inner-box">
                                    <div class="icon-box"><span><i class="bi bi-signpost-split"></i></span></div>
                                        <div class="count"><span>Road Test</span></div>
                                        
                                    </div>
                                </div>
                                <div class="why-info-block">
                                    <div class="inner-box">
                                        <div class="icon-box"><span class="fa-light fa-comment-alt"></span></div>
                                        <div class="count"><span>Pass</span></div>
                                        
                                    </div>
                                </div> -->
                            </div>
                        </div>
                    </div>
                </div>
                <!--Image Col-->
                <div class="image-col col-xl-5 col-lg-5 col-md-12 col-sm-12">
                    <div class="inner wow fadeInRight" data-wow-duration="1500ms" data-wow-delay="0ms" style="visibility: visible; animation-duration: 1500ms; animation-delay: 0ms; animation-name: fadeInRight;">
                        <div class="image-box">
                            <div class="image"><img src="<?php echo get_field('white_section_right_side_image'); ?>" alt="" title=""></div>
                            <div class="over-text"><?php echo get_field('white_section_content'); ?></div>
                        </div>
                    </div>
                </div>

                <div class="col-md-12">
                    <div class="btnprty">
                        <a href="<?php echo get_field('about_white_section_button_link'); ?>" class="dstvbtn"><?php echo get_field('about_white_section_button_text'); ?></a>
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
                        <h2 class="text-center"><?php echo get_field('home_page_last_orange_section_title',5); ?></h2>
                        <div class="link text-center mt-4"><a href="<?php echo get_field('home_page_last_orange_section_button_link',5); ?>" class="theme-btn btn-style-one"><span><?php echo get_field('home_page_last_orange_section_button_text',5); ?></span></a></div>
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