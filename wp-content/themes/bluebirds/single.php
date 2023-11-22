<?php
/**
 * The template for displaying all single posts
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/#single-post
 *
 * @package WordPress
 * @subpackage Twenty_Twenty_One
 * @since Twenty Twenty-One 1.0
 */

get_header(); ?>

<section class="inner-banner">
   <div class="image-layer" style="background-image: url(<?php echo get_template_directory_uri(); ?>/images/background/banner-image-1.jpg);"></div>
   <div class="auto-container">
      <div class="content-box">
         <div class="bread-crumb">
            <ul class="clearfix">
               <li><a href="<?php echo get_site_url(); ?>">Home</a></li>
               <li class="current">Blog Details</li>
            </ul>
         </div>
         <h1>Blog Details</h1>
      </div>
   </div>
</section>

<section class="py-5">
	<div class="container">
		<div class="row">

<?php
/* Start the Loop */
while ( have_posts() ) :
	the_post(); 

	//get_template_part( 'template-parts/content/content-single' ); ?>
			<div class="program-block col-md-12">
                     <div class="inner-box">
                         <div class="image-box">
                             <div class="image">
                             	<?php
           if ( has_post_thumbnail() ) :
           	$featured_image = wp_get_attachment_image_src( get_post_thumbnail_id( get_the_ID() ), 'medium' ); ?>
                             	<img class="blog_Img" src="<?php echo $featured_image[0]; ?> " alt="" title="">
                             	<?php endif; ?>
                             </div>
                         </div>
                         <div class="mid-box">
                             <h4 class="pb-3"><?php the_title(); ?></h4>
                             <div class="text"><?php the_content(); ?></div>
                         </div>
                         <!-- <div class="link-box"><a href="#">READ MORE <i class="fa-light fa-angle-right"></i></a></div> -->
                     </div>
                 </div>
			<?php    endwhile; // End of the loop. ?>
			</div>
	</div> 
</section>

			<?php
	if ( is_attachment() ) {
		// Parent post navigation.
		the_post_navigation(
			array(
				/* translators: %s: Parent post link. */
				'prev_text' => sprintf( __( '<span class="meta-nav">Published in</span><span class="post-title">%s</span>', 'twentytwentyone' ), '%title' ),
			)
		);
	}

	// If comments are open or there is at least one comment, load up the comment template.
	//if ( comments_open() || get_comments_number() ) {
	//	comments_template();
//	}

	// Previous/next post navigation.
//	$twentytwentyone_next = is_rtl() ? twenty_twenty_one_get_icon_svg( 'ui', 'arrow_left' ) : twenty_twenty_one_get_icon_svg( 'ui', 'arrow_right' );
//	$twentytwentyone_prev = is_rtl() ? twenty_twenty_one_get_icon_svg( 'ui', 'arrow_right' ) : twenty_twenty_one_get_icon_svg( 'ui', 'arrow_left' );

//	$twentytwentyone_next_label     = esc_html__( 'Next post', 'twentytwentyone' );
//	$twentytwentyone_previous_label = esc_html__( 'Previous post', 'twentytwentyone' );

//	the_post_navigation(
	//	array(
//			'next_text' => '<p class="meta-nav">' . $twentytwentyone_next_label . $twentytwentyone_next . '</p><p class="post-title">%title</p>',
//			'prev_text' => '<p class="meta-nav">' . $twentytwentyone_prev . $twentytwentyone_previous_label . '</p><p class="post-title">%title</p>',
//		)
//	);


get_footer();
