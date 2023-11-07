  <?php include('header.php') ?>

    <!-- Banner Section -->
    <section class="inner-banner">
        <div class="image-layer" style="background-image: url(images/background/banner-image-1.jpg);"></div>
        <div class="auto-container">
            <div class="content-box">
                <div class="bread-crumb">
                    <ul class="clearfix">
                        <li><a href="index.php">Home</a></li>
                        <li class="current">Contact</li>
                    </ul>
                </div>
                <h1>Contact us</h1>
            </div>
        </div>
    </section>
    <!--End Banner Section -->

    <!--Info Section-->
    <section class="info-section">
        <div class="auto-container">
            <div class="map-box">
                <iframe width="600" height="450" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/search?q=90%20Martinridge%20Grove%20Northeast%2C%20Calgary%2C%20AB%2C%20Canada&amp;key=AIzaSyDf6ceVmpRVegxzy8-gQt7Trts882t2NiA" allowfullscreen=""></iframe>
            </div>
            <div class="row clearfix">
                <!--Block-->
                <div class="info-block col-lg-4 col-md-6 col-sm-12">
                    <div class="inner-box wow fadeInUp" data-wow-duration="1500ms" data-wow-delay="0ms">
                        <div class="icon-box"><span class="fa-light fa-map-marker-alt"></span></div>
                        <h4>Office Address</h4>
                        <div class="text">90 Martinridge Grove NE, Calgary, AB, T3J 3M4</div>
                    </div>
                </div>
                <!--Block-->
                <div class="info-block col-lg-4 col-md-6 col-sm-12">
                    <div class="inner-box wow fadeInUp" data-wow-duration="1500ms" data-wow-delay="300ms">
                        <div class="icon-box"><span class="fa-light fa-envelope"></span></div>
                        <h4>Company Email</h4>
                        <div class="text"><a href="mailto:info@bluebirddriving.ca ">info@bluebirddriving.ca </a></div>
                    </div>
                </div>
                <!--Block-->
                <div class="info-block col-lg-4 col-md-6 col-sm-12">
                    <div class="inner-box wow fadeInUp" data-wow-duration="1500ms" data-wow-delay="600ms">
                        <div class="icon-box"><span class="fa-light fa-phone"></span></div>
                        <h4>Contact Us</h4>
                        <div class="text"><a href="tel:+1 403.613.8074">+1 403.613.8074</a></div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!--Contact Section-->
    <section class="contact-section">
        <div class="auto-container">
            <div class="title-box centered style-two">
                <div class="subtitle"><span>CONTACT</span></div>
                <h2><span>Get in Touch</span></h2>
            </div>
            <div class="form-box contact-form">
                <form method="post" action="https://t.commonsupport.com/driveto/sendemail.php" id="contact-form">
                    <div class="row clearfix">
                        <div class="form-group col-lg-6 col-md-6 col-sm-12">
                            <div class="field-inner">
                                <input type="text" name="username" value="" placeholder="Your Name" required>
                            </div>
                        </div>
                        <div class="form-group col-lg-6 col-md-6 col-sm-12">
                            <div class="field-inner">
                                <input type="email" name="email" value="" placeholder="Email Adress" required>
                            </div>
                        </div>
                        <div class="form-group col-lg-12 col-md-12 col-sm-12">
                            <div class="field-inner">
                                <input type="text" name="address" value="" placeholder="Your Address" required>
                            </div>
                        </div>
                        <div class="form-group col-lg-12 col-md-12 col-sm-12">
                            <div class="field-inner">
                                <textarea name="message" placeholder="Message" required></textarea>
                            </div>
                        </div>
                        <div class="form-group col-lg-12 col-md-12 col-sm-12">
                            <div class="field-inner text-center">
                                <button type="submit" class="theme-btn btn-style-one"><span>Send Message</span></button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </section>

     <!--Subscribe Section-->
    <section class="subscribe-section">
        <div class="bg-layer" style="background-image: url(images/background/subscribe-bg.png);"></div>
        <div class="auto-container">
            <div class="row clearfix">
                <div class="title-col col-md-12">
                    <div class="inner">
                        <h2 class="text-center">Schedule your lessons today!</h2>
                        <div class="link text-center mt-4"><a href="#" class="theme-btn btn-style-one"><span>DISCOVER MORE</span></a></div>
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

<?php include('footer.php') ?>