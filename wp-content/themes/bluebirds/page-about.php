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

                  <h2 data-aos="fade-down"><span><?php echo get_field('about_main_heading'); ?></span></h2>

               </div>

               <div class="text-content">
                  <div class="subtitle"><span><?php echo get_field('orange_heading'); ?></span></div>
                  <div class="text big-text"><?php echo get_field('about_main_subheading'); ?></div>

                  <div class="text"><?php echo get_field('about_description_1'); ?></div>

               </div>
               <div class="row clearfix">
                  <!--Block-->
                  <div class="wel-block-three col-lg-6 col-md-6 col-sm-12 d-none">
                     <div class="inner-box">
                        <div class="icon"><i class="fa-light fa-long-arrow-right"></i></div>
                        <h6>Appointments six days a week.</h6>
                        <div class="text">Since 2010, throughout North America for providing.</div>
                     </div>
                  </div>
                  <!--Block-->
                  <div class="wel-block-three col-lg-6 col-md-6 col-sm-12 d-none">
                     <div class="inner-box">
                        <div class="icon"><i class="fa-light fa-long-arrow-right"></i></div>
                        <h6>Service At Affordable Rates.</h6>
                        <div class="text">Since 2010, throughout North America for providing.</div>
                     </div>
                  </div>
               </div>
               <div class="lower-links clearfix d-none">
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
                  <div class="image-box d-none">
                     <img src="images/resource/welcome-4.jpg" alt="" title="">
                     <a href="https://www.youtube.com/watch?v=0xhr0j877bI"
                        class="theme-btn lightbox-image vid-btn d-none"><span class="icon far fa-play"></span></a>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</section>



<!-- <section class="how-work p-5">
   <div class="auto-container">
      <div class="row">
         <div class="col-md-12">
            <div class="hw-work">
               <h1 class="text-center">How It Work?</h1>
               <p class="text-center">There are only a few easy steps until your traffic ticket is dismissed, your
                  driving record is clean and your auto <br>
                  insurances rates are safe from increases:</p>
               <div class="how-image pt-5"><img src="images/how_work.png"></div>

            </div>
         </div>
      </div>
   </div>
</section> -->

<!--Start Class-->
<section class="start-class d-none">
   <div class="image-layer" style="background-image: url(images/background/bg-image-1.jpg);"></div>
   <div class="auto-container">
      <div class="row clearfix">
         <!--Column-->
         <div class="title-col col-lg-7 col-md-12 col-sm-12">
            <div class="inner wow fadeInLeft" data-wow-duration="1500ms" data-wow-delay="0ms">
               <div class="video-link d-none"><a href="https://www.youtube.com/watch?v=0xhr0j877bI"
                     class="theme-btn lightbox-image vid-btn"><span class="icon fa fa-play"></span></a></div>
               <div class="title-box">
                  <div class="dots"><span></span></div>
                  <h2><i class="bg-vector d-none"><img src="images/resource/title-pattern-1.svg" alt=""></i><span>Start 5 Hours
                        Class Movie Training</span></h2>
               </div>
               <!-- <i class="arrow-form wow zoomInLeft" data-wow-duration="2500ms" data-wow-delay="0"><img
                     src="images/icons/curve-arrow.svg" alt=""></i> -->
            </div>
         </div>
         <!--Column-->
         <div class="form-col col-lg-5 col-md-12 col-sm-12">
            <div class="inner wow fadeInRight" data-wow-duration="1500ms" data-wow-delay="0ms">
               <div class="form-box">
                  <h3>Get Free Quote</h3>
                  <form method="post" action="https://t.commonsupport.com/driveto/contact.html">
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
</section>


<!-- how-work -->

<section class="how-work">
   <div class="container">
      <div class="row">
         <div class="col-md-12">
            <div class="hw-work">
               <h1 class="text-center"><?php echo get_field('how_it_works_main_heading'); ?></h1>
               <p class="text-center"><?php echo get_field('how_it_works_main_subheading'); ?></p>
               <div class="how-image"><img src="<?php echo get_field('how_it_works_image'); ?>"></div>

            </div>
         </div>
      </div>
   </div>
</section>


<!--Why Us Section-->
<section class="why-us-three">
   <div class="auto-container">
      <div class="row clearfix">
         <div class="text-col col-lg-12 col-md-12 col-sm-12 single-column">

            <div class="inner wow fadeInLeft" data-wow-duration="1500ms" data-wow-delay="0ms"
               style="visibility: visible; animation-duration: 1500ms; animation-delay: 0ms; animation-name: fadeInLeft;">
               <div class="title-box style-two">
                  <h2><span><?php //echo get_field('our_best_feature_main_heading'); ?></span></h2>
               </div>
               <div class="container">
                  <div class="clearfix">
                     <div class="why-info-box">

                        <!-- <div class="card">
                           <a class="card1" href="#">
                              <p>This is heading</p>
                              <p class="small">Card description with lots of great facts and interesting details.</p>
                              <div class="go-corner" href="#">
                                 <div class="go-arrow">
                                    →
                                 </div>
                              </div>
                           </a>
                        </div>


 -->







                        <div class="row">
							
							 <?php 
                              $ourfeature = CFS()->get('our_best_feature_block');
                              
                              if(is_array($ourfeature) || is_object($ourfeature)){
                              
                                  foreach($ourfeature as $ourfeatureitem){
                              
                               ?>

                           <div class="col-lg-3 col-md-3 col-sm-12 single-column">
                              <div class="why-info-block">
                              <div class="card">
                           <a class="card1" href="#">
                                 <div class="inner-box">
                                    <div class="icon-box"><span><?php echo $ourfeatureitem['best_feature_icon']; ?></span></div>
                                    <p class="small"><span class="count"><?php echo $ourfeatureitem['best_feature_title']; ?></span></p>
                                 </div>
                           </a>
                                    <!-- <div class="cat">Call</div> -->
                                 </div>
                              </div>
                           </div>
						
							<?php } } ?>

<!--                            <div class="col-lg-6 col-md-6 col-sm-12 single-column">
                              <div class="why-info-block">
                              <div class="card">
                           <a class="card1" href="#">
                                 <div class="inner-box">
                                    <div class="icon-box"><span><i class="bi bi-person-gear"></i></span></div>
                                    <p class="small"><span class="count">Professional Expertise</span></p>
                                 </div>
                           </a>
                                   
                                 </div>
                              </div>
                           </div> -->



                           <!-- <div class="col-lg-6 col-md-6 col-sm-12 single-column">
                              <div class="why-info-block">
                                 <div class="inner-box">
                                    <div class="icon-box"><span><i class="bi bi-person-gear"></i></span></div>
                                    <div class="count"><span></span></div>
                                     <div class="cat">Appointment</div> 
                                 </div>
                              </div>
                           </div> --->

<!--                            <div class="col-lg-6 col-md-6 col-sm-12 single-column">
                              <div class="why-info-block">
                              <div class="card">
                           <a class="card1" href="#">
                                 <div class="inner-box">
                                    <div class="icon-box"><span><i class="bi bi-signpost-split"></i></span></div>
                                    <p class="small"><span class="count">Liscensed</span></p>
                                 </div>
                           </a>
                                   
                                 </div>
                              </div>
                           </div> -->




                           <!-- <div class="col-lg-6 col-md-6 col-sm-12 single-column">
                              <div class="why-info-block">
                                 <div class="inner-box">
                                    <div class="icon-box"><span></span></div>
                                    <div class="count"><span> </span></div>
                                  
                                 </div>
                              </div>
                           </div> -->

<!--                            <div class="col-lg-6 col-md-6 col-sm-12 single-column">
                              <div class="why-info-block">
                              <div class="card">
                           <a class="card1" href="#">
                                 <div class="inner-box">
                                    <div class="icon-box"><span class="fa-light fa-comment-alt"></span></div>
                                    <p class="small"><span class="count"> Highest Passing Rate</span></p>
                                 </div>
                           </a>
                                    
                                 </div>
                              </div>
                           </div> -->


<!-- 
                           <!-- <div class="col-lg-6 col-md-6 col-sm-12 single-column">
                              <div class="why-info-block">
                                 <div class="inner-box">
                                    <div class="icon-box"></div>
                                    <div class="count"><span>/span></div> -->
                                    <!-- <div class="cat">Pass</div> 
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <!--Image Col-->
         <!-- <div class="image-col col-xl-5 col-lg-5 col-md-12 col-sm-12">
                    <div class="inner wow fadeInRight" data-wow-duration="1500ms" data-wow-delay="0ms" style="visibility: visible; animation-duration: 1500ms; animation-delay: 0ms; animation-name: fadeInRight;">
                        <div class="image-box">
                            <div class="image d-none"><img src="images/resource/image-14.jpg" alt="" title=""></div>
                            <div class="over-text">We Are Since 2006 ! Over 200 Awards</div>
                        </div>
                    </div>
                </div> --> 

         <div class="col-md-12">
            <!-- <div class="btnprty now-button">
               <a href="<?php //echo get_field('best_feature_section_button_link'); ?>" class="dstvbtn"><?php //echo get_field('best_feature_section_button'); ?></a>
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