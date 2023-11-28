<?php /* Template Name: Driving Lesson Booking */

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
                  <li class="current">Driving Lesson</li>
               </ul>
            </div>
            <h1>Driving Lesson Booking</h1>
         </div>
      </div>
   </section>
   <!--End Banner Section -->



   <section class="pt-5 pb-5">
   	<div class="container">
   		<div class="row">
   		   <div class="col-md-12">
   		   	<?php echo do_shortcode('[bookly-form]'); ?>
   		   </div>
   		</div>
   	</div>
   	
   </section>

 



 <?php get_footer(); ?>