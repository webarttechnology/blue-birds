    <!--Main Footer-->
    <footer class="main-footer">
        <div class="upper-section">
            <div class="auto-container">
                <div class="row clearfix">

                    <div class="big-col col-md-6">
                        <div class="row clearfix">

                            <div class="footer-column col-xl-7 col-lg-7 col-md-6 col-sm-12">
                                <div class="about">
                                    <div class="footer-logo"><a href="index.html" title="Driving School HTML Template"><img src="images/blue_logo.png" alt="" title="Driving School HTML Template"></a></div>
                                    <div class="text">Cillum dolre fugiat nula pariatur excepteur anim idet laborum. Sed ut perspiciatis und kmnis iste natus goluptatem.</div>
                                    <div class="address"><span class="icon fa-light fa-map-marker-alt"></span>90 Martinridge Grove NE, Calgary, AB, T3J 3M4</div>
                                    <!-- <div class="phone">
                                        <span class="icon fa fa-phone"></span>
                                        <span class="subtitle">Start a New Project</span>
                                        <a href="tel:+1 403.613.8074" class="theme-btn">+1 403.613.8074</a>
                                    </div> -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="big-col col-md-3">
                        <div class="row clearfix">
                            <div class="footer-column">
                                <h6>Quick Links</h6>
                                <div class="links">
                                    <ul>
                                        <li><a href="#">Home</a></li>
                                        <li><a href="#">About Us</a></li>
                                        <li><a href="#">Services</a></li>
                                        <li><a href="#">Contact Us</a></li>
                                    </ul>
                                </div>
                            </div>

                            <div class="footer-column col-xl-7 col-lg-7 col-md-6 col-sm-12 d-none">
                                <h6>Our Gallery</h6>
                                <!--Logo-->
                                <div class="footer-gallery">
                                    <div class="inner clearfix">
                                        <div class="image-block"><div class="image"><a href="images/resource/image-1.jpg" class="lightbox-image" data-fancybox="gallery"><img src="images/resource/g-thumb-1.jpg" alt=""></a></div></div>
                                        <div class="image-block"><div class="image"><a href="images/resource/image-2.jpg" class="lightbox-image" data-fancybox="gallery"><img src="images/resource/g-thumb-2.jpg" alt=""></a></div></div>
                                        <div class="image-block"><div class="image"><a href="images/resource/image-3.jpg" class="lightbox-image" data-fancybox="gallery"><img src="images/resource/g-thumb-3.jpg" alt=""></a></div></div>
                                        <div class="image-block"><div class="image"><a href="images/resource/image-1.jpg" class="lightbox-image" data-fancybox="gallery"><img src="images/resource/g-thumb-4.jpg" alt=""></a></div></div>
                                        <div class="image-block"><div class="image"><a href="images/resource/image-2.jpg" class="lightbox-image" data-fancybox="gallery"><img src="images/resource/g-thumb-5.jpg" alt=""></a></div></div>
                                        <div class="image-block"><div class="image"><a href="images/resource/image-3.jpg" class="lightbox-image" data-fancybox="gallery"><img src="images/resource/g-thumb-6.jpg" alt=""></a></div></div>
                                        <div class="image-block"><div class="image"><a href="images/resource/image-1.jpg" class="lightbox-image" data-fancybox="gallery"><img src="images/resource/g-thumb-7.jpg" alt=""></a></div></div>
                                        <div class="image-block"><div class="image"><a href="images/resource/image-2.jpg" class="lightbox-image" data-fancybox="gallery"><img src="images/resource/g-thumb-8.jpg" alt=""></a></div></div>
                                        <div class="image-block"><div class="image"><a href="images/resource/image-3.jpg" class="lightbox-image" data-fancybox="gallery"><img src="images/resource/g-thumb-9.jpg" alt=""></a></div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="big-col col-md-3">
                        <div class="row clearfix">
                            <div class="footer-column ">
                                <h6>Services</h6>
                                <div class="links">
                                    <ul>
                                        <li><a href="#">All-In-One Training Package</a></li>
                                        <li><a href="#">Brush-Up Packages</a></li>
                                        <li><a href="#">Car Rental</a></li>
                                        <li><a href="#">Free Pick Up & Drop Off Location</a></li>
                                </div>
                            </div>
                        </div>    
                    </div>

                </div>
            </div>
        </div>

        <div class="f-bottom">
            <div class="auto-container">
                <div class="inner clearfix">
                    <div class="copyright">Copyrights &copy; 2023 Blue Bird. <a href="#">Privacy Policy</a>  /  <a href="#">Booking Guide</a></div>
                    <div class="social-links d-none">
                        <ul class="clearfix">
                            <li><a href="https://www.facebook.com/p/Blue-Bird-Driving-School-Calgary-100063759630061" target="_blank"><i class="fab fa-facebook-f"></i></a></li>
                            <li><a href="#"><i class="fab fa-instagram"></i></a></li>
                            <li><a href="#"><i class="fab fa-linkedin-in"></i></a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

    </footer>

</div>
<!--End pagewrapper--> 

<!--Scroll to top-->
<div class="scroll-to-top scroll-to-target" data-target="html"><span class="icon"><img src="images/icons/arrow-up.svg" alt="" title="Go To Top"></span></div>

<script src="js/jquery.js"></script>
<script src="js/popper.min.js"></script>
<script src="js/bootstrap.min.js"></script>
<script src="js/jquery-ui.js"></script>
<script src="js/jquery.fancybox.js"></script>
<script src="js/owl.js"></script>
<script src="js/wow.js"></script>
<script src="js/custom-script.js"></script>
<script src="https://static.elfsight.com/platform/platform.js" data-use-service-core defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

<script>
console.clear();

const { gsap } = window;

const cursorOuter = document.querySelector(".cursor--large");
const cursorInner = document.querySelector(".cursor--small");
let isStuck = false;
let mouse = {
    x: -100,
    y: -100,
};

// Just in case you need to scroll
let scrollHeight = 0;
window.addEventListener('scroll', function(e) {
    scrollHeight = window.scrollY
})

let cursorOuterOriginalState = {
    width: cursorOuter.getBoundingClientRect().width,
    height: cursorOuter.getBoundingClientRect().height,
};
const buttons = document.querySelectorAll("main button");

buttons.forEach((button) => {
    button.addEventListener("pointerenter", handleMouseEnter);
    button.addEventListener("pointerleave", handleMouseLeave);
});

document.body.addEventListener("pointermove", updateCursorPosition);
document.body.addEventListener("pointerdown", () => {
    gsap.to(cursorInner, 0.15, {
        scale: 2,
    });
});
document.body.addEventListener("pointerup", () => {
    gsap.to(cursorInner, 0.15, {
        scale: 1,
    });
});

function updateCursorPosition(e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
}

function updateCursor() {
    gsap.set(cursorInner, {
        x: mouse.x,
        y: mouse.y,
    });

    if (!isStuck) {
        gsap.to(cursorOuter, {
            duration: 0.15,
            x: mouse.x - cursorOuterOriginalState.width/2,
            y: mouse.y - cursorOuterOriginalState.height/2,
        });
    }

    requestAnimationFrame(updateCursor);
}

updateCursor();

function handleMouseEnter(e) {
    isStuck = true;
    const targetBox = e.currentTarget.getBoundingClientRect();
    gsap.to(cursorOuter, 0.2, {
        x: targetBox.left, 
        y: targetBox.top + scrollHeight,
        width: targetBox.width,
        height: targetBox.width,
        borderRadius: 0,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    });
}

function handleMouseLeave(e) {
    isStuck = false;
    gsap.to(cursorOuter, 0.2, {
        width: cursorOuterOriginalState.width,
        height: cursorOuterOriginalState.width,
        borderRadius: "50%",
        backgroundColor: "transparent",
    });
}

</script>

</body>

</html>