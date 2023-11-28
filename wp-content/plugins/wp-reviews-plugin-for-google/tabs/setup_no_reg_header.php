<?php
defined('ABSPATH') or die('No script kiddies please!');
$ti_command = isset($_REQUEST['command']) ? sanitize_text_field($_REQUEST['command']) : null;
$ti_command_list = [
'save-page',
'delete-page',
'save-style',
'save-filter',
'save-set',
'save-language',
'save-dateformat',
'save-options',
'save-align',
'save-review-text-mode',
'save-amp-notice-hide',
'review-manual-download'
];
if (!in_array($ti_command, $ti_command_list)) {
$ti_command = null;
}
function trustindex_plugin_connect_page($pageDetails = null, $defaultSettings = true, $reviewDownload = false)
{
global $trustindex_pm_google;
global $wpdb;
if (!$pageDetails) {
return false;
}
$pageDetails['name'] = json_encode($pageDetails['name']);
$trustindex_pm_google->setNotificationParam('not-using-no-connection', 'active', false);
$trustindex_pm_google->setNotificationParam('not-using-no-widget', 'active', true);
$trustindex_pm_google->setNotificationParam('not-using-no-widget', 'timestamp', time() + (2 * 3600));
$tableName = $trustindex_pm_google->get_tablename('reviews');
$wpdb->query('TRUNCATE `'. $tableName .'`');
$reviews = null;
if (isset($pageDetails['reviews'])) {
$reviews = $pageDetails['reviews'];
unset($pageDetails['reviews']);
}
$requestId = null;
if (isset($pageDetails['request_id'])) {
$requestId = $pageDetails['request_id'];
unset($pageDetails['request_id']);
}
else if (isset($_REQUEST['review_request_id'])) {
$requestId = $_REQUEST['review_request_id'];
}
if ($requestId) {
update_option($trustindex_pm_google->get_option_name('review-download-request-id'), $requestId, false);
}
$manualDownload = 0;
if (isset($pageDetails['manual_download'])) {
$manualDownload = (int)$pageDetails['manual_download'];
unset($pageDetails['manual_download']);
}
else if (isset($_REQUEST['manual_download'])) {
$manualDownload = (int)$_REQUEST['manual_download'];
}
delete_option($trustindex_pm_google->get_option_name('review-download-token'));
if ($reviewDownload) {
update_option($trustindex_pm_google->get_option_name('review-download-inprogress'), $reviewDownload, false);
update_option($trustindex_pm_google->get_option_name('review-manual-download'), $manualDownload, false);
update_option($trustindex_pm_google->get_option_name('review-download-is-connecting'), 1, false);
}
else {
delete_option($trustindex_pm_google->get_option_name('review-download-inprogress'));
delete_option($trustindex_pm_google->get_option_name('review-manual-download'));
delete_option($trustindex_pm_google->get_option_name('review-download-is-connecting'));
}
if (is_array($reviews)) {
foreach ($reviews as $row) {
$date = isset($row['created_at']) ? $row['created_at'] : (isset($row['date']) ? $row['date'] : '');
$wpdb->insert($tableName, [
'user' => $row['reviewer']['name'],
'user_photo' => $row['reviewer']['avatar_url'],
'text' => $row['text'],
'rating' => $row['rating'] ? $row['rating'] : 5,
'date' => substr($date, 0, 10),
'reviewId' => isset($row['id']) ? $row['id'] : null,
'reply' => isset($row['reply']) ? $row['reply'] : ""
]);
}
if ($trustindex_pm_google->shortname == 'facebook' || count($reviews) == $pageDetails['rating_number'] || count($reviews) === 10) {
$timestamp = time() + (86400 * 10);
if (isset($pageDetails['timestamp'])) {
$timestamp = $pageDetails['timestamp'];
unset($pageDetails['timestamp']);
}
update_option($trustindex_pm_google->get_option_name('download-timestamp'), $timestamp, false);
delete_option($trustindex_pm_google->get_option_name('review-download-inprogress'));
delete_option($trustindex_pm_google->get_option_name('review-manual-download'));
update_option($trustindex_pm_google->get_option_name('review-download-modal'), 0, false);
}
}
update_option($trustindex_pm_google->get_option_name('page-details'), $pageDetails, false);
$GLOBALS['wp_object_cache']->delete( $trustindex_pm_google->get_option_name('page-details'), 'options' );
if ($defaultSettings) {
$lang = strtolower(substr(get_locale(), 0, 2));
if (!isset(TrustindexPlugin_google::$widget_languages[ $lang ])) {
$lang = 'en';
}
update_option($trustindex_pm_google->get_option_name('lang'), $lang, false);
header('Location: admin.php?page=' . sanitize_text_field($_GET['page']) .'&tab=setup_no_reg');
}
else {
$trustindex_pm_google->noreg_save_css(true);
}
}
function trustindex_plugin_disconnect_page($settingsDelete = true)
{
global $trustindex_pm_google;
global $wpdb;
$trustindex_pm_google->delete_async_request();
delete_option($trustindex_pm_google->get_option_name('review-download-inprogress'));
delete_option($trustindex_pm_google->get_option_name('review-download-request-id'));
delete_option($trustindex_pm_google->get_option_name('review-manual-download'));
delete_option($trustindex_pm_google->get_option_name('page-details'));
delete_option($trustindex_pm_google->get_option_name('review-content'));
delete_option($trustindex_pm_google->get_option_name('css-content'));
if (is_file($trustindex_pm_google->getCssFile())) {
unlink($trustindex_pm_google->getCssFile());
}
if ($settingsDelete) {
delete_option($trustindex_pm_google->get_option_name('style-id'));
delete_option($trustindex_pm_google->get_option_name('scss-set'));
delete_option($trustindex_pm_google->get_option_name('filter'));
delete_option($trustindex_pm_google->get_option_name('lang'));
delete_option($trustindex_pm_google->get_option_name('dateformat'));
delete_option($trustindex_pm_google->get_option_name('no-rating-text'));
delete_option($trustindex_pm_google->get_option_name('verified-icon'));
delete_option($trustindex_pm_google->get_option_name('enable-animation'));
delete_option($trustindex_pm_google->get_option_name('show-arrows'));
delete_option($trustindex_pm_google->get_option_name('show-header-button'));
delete_option($trustindex_pm_google->get_option_name('reviews-load-more'));
delete_option($trustindex_pm_google->get_option_name('show-reviewers-photo'));
delete_option($trustindex_pm_google->get_option_name('widget-setted-up'));
}
$wpdb->query('TRUNCATE `'. $trustindex_pm_google->get_tablename('reviews') .'`');
$trustindex_pm_google->setNotificationParam('not-using-no-connection', 'active', true);
$trustindex_pm_google->setNotificationParam('not-using-no-connection', 'timestamp', time() + 86400);
$trustindex_pm_google->setNotificationParam('not-using-no-widget', 'active', false);
}
function trustindex_plugin_change_step($step = 5)
{
global $trustindex_pm_google;
if ($step < 5) {
$optionsToDelete = [
'widget-setted-up',
'align',
'review-text-mode',
'verified-icon',
'enable-animation',
'no-rating-text',
'disable-font',
'show-reviewers-photo',
'show-logos',
'show-stars',
'footer-filter-text'
];
foreach ($optionsToDelete as $name) {
delete_option($trustindex_pm_google->get_option_name($name));
}
}
if ($step < 4) {
delete_option($trustindex_pm_google->get_option_name('scss-set'));
}
if ($step < 3) {
delete_option($trustindex_pm_google->get_option_name('style-id'));
}
if ($step < 2) {
trustindex_plugin_disconnect_page();
}
}
if ($ti_command === 'save-page') {
check_admin_referer('ti-save-page');
$pageDetails = isset($_POST['page_details']) ? json_decode(stripcslashes($_POST['page_details']), true) : null;
$reviewDownload = isset($_POST['review_download']) ? sanitize_text_field($_POST['review_download']) : 0;
trustindex_plugin_connect_page($pageDetails, true, $reviewDownload);
header('Location: admin.php?page=' . sanitize_text_field($_GET['page']) .'&tab=setup_no_reg');
exit;
}
else if ($ti_command === 'delete-page') {
check_admin_referer('ti-delete-page');
trustindex_plugin_disconnect_page();
header('Location: admin.php?page='. sanitize_text_field($_GET['page']) .'&tab=setup_no_reg');
exit;
}
else if ($ti_command === 'save-style') {
check_admin_referer('ti-save-style');
$styleId = (int)$_REQUEST['style_id'];
update_option($trustindex_pm_google->get_option_name('style-id'), $styleId, false);
delete_option($trustindex_pm_google->get_option_name('review-content'));
trustindex_plugin_change_step(3);
if (in_array($styleId, [ 17, 21, 52, 53 ])) {
$trustindex_pm_google->noreg_save_css();
}
if (isset($_GET['style_id'])) {
header('Location: admin.php?page='. sanitize_text_field($_GET['page']) .'&tab=setup_no_reg');
}
exit;
}
else if ($ti_command === 'save-set') {
check_admin_referer('ti-save-set');
update_option($trustindex_pm_google->get_option_name('scss-set'), sanitize_text_field($_REQUEST['set_id']), false);
trustindex_plugin_change_step(4);
$trustindex_pm_google->noreg_save_css(true);
if (isset($_GET['set_id'])) {
header('Location: admin.php?page='. sanitize_text_field($_GET['page']) .'&tab=setup_no_reg');
}
exit;
}
else if ($ti_command === 'save-filter') {
check_admin_referer('ti-save-filter');
$filter = isset($_POST['filter']) ? sanitize_text_field($_POST['filter']) : null;
$filter = json_decode(stripcslashes($filter), true);
update_option($trustindex_pm_google->get_option_name('filter'), $filter, false);
exit;
}
else if ($ti_command === 'save-language') {
check_admin_referer('ti-save-language');
update_option($trustindex_pm_google->get_option_name('lang'), sanitize_text_field($_POST['lang']), false);
delete_option($trustindex_pm_google->get_option_name('review-content'));
exit;
}
else if ($ti_command === 'save-dateformat') {
check_admin_referer('ti-save-dateformat');
update_option($trustindex_pm_google->get_option_name('dateformat'), sanitize_text_field($_POST['dateformat']), false);
exit;
}
else if ($ti_command === 'save-options') {
check_admin_referer('ti-save-options');
$r = 0;
if (isset($_POST['verified-icon'])) {
$r = sanitize_text_field($_POST['verified-icon']);
}
update_option($trustindex_pm_google->get_option_name('verified-icon'), $r, false);
$r = 1;
if (isset($_POST['enable-animation'])) {
$r = sanitize_text_field($_POST['enable-animation']);
}
update_option($trustindex_pm_google->get_option_name('enable-animation'), $r, false);
$r = 1;
if (isset($_POST['show-arrows'])) {
$r = sanitize_text_field($_POST['show-arrows']);
}
update_option($trustindex_pm_google->get_option_name('show-arrows'), $r, false);
$r = 1;
if (isset($_POST['show-header-button'])) {
$r = sanitize_text_field($_POST['show-header-button']);
}
update_option($trustindex_pm_google->get_option_name('show-header-button'), $r, false);
$r = 1;
if (isset($_POST['reviews-load-more'])) {
$r = sanitize_text_field($_POST['reviews-load-more']);
}
update_option($trustindex_pm_google->get_option_name('reviews-load-more'), $r, false);
$r = 1;
if (isset($_POST['show-reviewers-photo'])) {
$r = sanitize_text_field($_POST['show-reviewers-photo']);
}
update_option($trustindex_pm_google->get_option_name('show-reviewers-photo'), $r, false);
$r = 0;
if (isset($_POST['no-rating-text'])) {
$r = sanitize_text_field($_POST['no-rating-text']);
}
update_option($trustindex_pm_google->get_option_name('no-rating-text'), $r, false);
$r = 0;
if (isset($_POST['disable-font'])) {
$r = sanitize_text_field($_POST['disable-font']);
}
update_option($trustindex_pm_google->get_option_name('disable-font'), $r, false);
$r = 1;
if (isset($_POST['show-logos'])) {
$r = sanitize_text_field($_POST['show-logos']);
}
update_option($trustindex_pm_google->get_option_name('show-logos'), $r, false);
$r = 1;
if (isset($_POST['show-stars'])) {
$r = sanitize_text_field($_POST['show-stars']);
}
update_option($trustindex_pm_google->get_option_name('show-stars'), $r, false);
$r = 0;
if (isset($_POST['footer-filter-text'])) {
$r = sanitize_text_field($_POST['footer-filter-text']);
}
update_option($trustindex_pm_google->get_option_name('footer-filter-text'), $r, false);
delete_option($trustindex_pm_google->get_option_name('review-content'));
$trustindex_pm_google->noreg_save_css(true);
exit;
}
else if ($ti_command === 'save-align') {
check_admin_referer('ti-save-align');
update_option($trustindex_pm_google->get_option_name('align'), sanitize_text_field($_POST['align']), false);
$trustindex_pm_google->noreg_save_css(true);
exit;
}
else if ($ti_command === 'save-review-text-mode') {
check_admin_referer('ti-save-review-text-mode');
update_option($trustindex_pm_google->get_option_name('review-text-mode'), sanitize_text_field($_POST['review_text_mode']), false);
$trustindex_pm_google->noreg_save_css(true);
exit;
}
else if ($ti_command === 'save-amp-notice-hide') {
update_option($trustindex_pm_google->get_option_name('amp-hidden-notification'), 1, false);
exit;
}
else if ($ti_command === 'review-manual-download') {
check_admin_referer('ti-download-reviews');
$response = wp_remote_post('https://admin.trustindex.io/source/wordpressPageRequest', [
'body' => [ 'id' => get_option($trustindex_pm_google->get_option_name('review-download-request-id')) ],
'timeout' => '30',
'redirection' => '5',
'blocking' => true
]);
if (is_wp_error($response)) {
$wp_query->set_404();
status_header(404);
}
else {
$json = json_decode(wp_remote_retrieve_body($response), true);
if (isset($json['error']) && $json['error']) {
update_option($trustindex_pm_google->get_option_name('review-download-inprogress'), 'error', false);
}
else if (isset($json['details'])) {
$trustindex_pm_google->save_details($json['details']);
$trustindex_pm_google->save_reviews(isset($json['reviews']) ? $json['reviews'] : []);
delete_option($trustindex_pm_google->get_option_name('review-download-token'));
delete_option($trustindex_pm_google->get_option_name('review-download-inprogress'));
delete_option($trustindex_pm_google->get_option_name('review-manual-download'));
update_option($trustindex_pm_google->get_option_name('download-timestamp'), time() + (86400 * 10), false);
}
else {
$wp_query->set_404();
status_header(404);
}
}
exit;
}
if (isset($_GET['recreate'])) {
check_admin_referer('ti-recreate');
$trustindex_pm_google->uninstall();
$trustindex_pm_google->activate();
header('Location: admin.php?page=' . sanitize_text_field($_GET['page']) .'&tab=setup_no_reg');
exit;
}
if (isset($_GET['setup_widget'])) {
check_admin_referer('ti-setup-widget');
update_option($trustindex_pm_google->get_option_name('widget-setted-up'), 1, false);
header('Location: admin.php?page=' . sanitize_text_field($_GET['page']) .'&tab=setup_no_reg');
}
$reviews = [];
if ($trustindex_pm_google->is_noreg_linked()) {
$reviews = $wpdb->get_results('SELECT * FROM `'. $trustindex_pm_google->get_tablename('reviews') .'` ORDER BY date DESC');
}
$isReviewDownloadInProgress = $trustindex_pm_google->is_review_download_in_progress();
$styleId = get_option($trustindex_pm_google->get_option_name('style-id'));
$scssSet = get_option($trustindex_pm_google->get_option_name('scss-set'));
$lang = get_option($trustindex_pm_google->get_option_name('lang'), 'en');
$dateformat = get_option($trustindex_pm_google->get_option_name('dateformat'), 'Y-m-d');
$noRatingText = get_option($trustindex_pm_google->get_option_name('no-rating-text'), $trustindex_pm_google->get_default_no_rating_text($styleId, $scssSet));
$filter = get_option($trustindex_pm_google->get_option_name('filter'), $trustindex_pm_google->get_widget_default_filter());
$verifiedIcon = get_option($trustindex_pm_google->get_option_name('verified-icon'), 0);
$enableAnimation = get_option($trustindex_pm_google->get_option_name('enable-animation'), 1);
$showArrows = get_option($trustindex_pm_google->get_option_name('show-arrows'), 1);
$showHeaderButton = get_option($trustindex_pm_google->get_option_name('show-header-button'), 1);
$reviewsLoadMore = get_option($trustindex_pm_google->get_option_name('reviews-load-more'), 1);
$widgetSettedUp = get_option($trustindex_pm_google->get_option_name('widget-setted-up'), 0);
$disableFont = get_option($trustindex_pm_google->get_option_name('disable-font'), 0);
$align = get_option($trustindex_pm_google->get_option_name('align'), in_array($styleId, [ 36, 37, 38, 39 ]) ? 'center' : 'left');
$reviewTextMode = get_option($trustindex_pm_google->get_option_name('review-text-mode'), 'readmore');
$footerFilterText = get_option($trustindex_pm_google->get_option_name('footer-filter-text'), 0);
$scssSetTmp = $scssSet ? $scssSet : 'light-background';
$showReviewersPhoto = get_option($trustindex_pm_google->get_option_name('show-reviewers-photo'), TrustindexPlugin_google::$widget_styles[ $scssSetTmp ]['reviewer-photo'] ? 1 : 0);
$showLogos = get_option($trustindex_pm_google->get_option_name('show-logos'), TrustindexPlugin_google::$widget_styles[ $scssSetTmp ]['hide-logos'] ? 0 : 1);
$showStars = get_option($trustindex_pm_google->get_option_name('show-stars'), TrustindexPlugin_google::$widget_styles[ $scssSetTmp ]['hide-stars'] ? 0 : 1);
$currentStep = isset($_GET['step']) ? (int)sanitize_text_field($_GET['step']) : 0;
if ($currentStep === 3 && in_array($styleId, [ 17, 21, 52, 53 ])) {
$currentStep = 4;
}
if (!$trustindex_pm_google->is_noreg_linked()) {
$styleId = null;
$scssSet = null;
$widgetSettedUp = null;
}
wp_enqueue_style('trustindex-widget-preview-css', 'https://cdn.trustindex.io/assets/ti-preview-box.css');
$example = 'HairPalace';
$exampleUrl = null;
switch ('google') {
case 'airbnb':
$exampleUrl = 'https://www.airbnb.com/rooms/2861469';
break;
case 'amazon':
$exampleUrl = 'https://www.amazon.com/sp?seller=A2VE8XCDXE9M4H';
break;
case 'arukereso':
$exampleUrl = 'https://www.arukereso.hu/stores/media-markt-online-s66489';
break;
case 'booking':
$exampleUrl = 'https://www.booking.com/hotel/us/four-seasons-san-francisco.html';
break;
case 'capterra':
$exampleUrl = 'https://www.capterra.com/p/192416/MicroStation';
break;
case 'ebay':
$exampleUrl = 'https://www.ebay.com/fdbk/feedback_profile/scarhead1';
break;
case 'foursquare':
$exampleUrl = 'https://foursquare.com/v/lands-end-lookout/4f839a12e4b049ff96c6b29a';
break;
case 'hotels':
$exampleUrl = 'https://www.hotels.com/ho108742';
break;
case 'opentable':
$exampleUrl = 'https://www.opentable.com/r/historic-johns-grill-san-francisco';
break;
case 'szallashu':
$exampleUrl = 'https://revngo.com/ramada-by-wyndham-city-center-hotel-budapest';
break;
case 'thumbtack':
$exampleUrl = 'https://www.thumbtack.com/ca/san-francisco/handyman/steve-switchenko-installations-handyman-services/service/246750705829561442';
break;
case 'tripadvisor':
$exampleUrl = 'https://www.tripadvisor.com/Restaurant_Review-g186338-d5122082-Reviews-Alexander_The_Great-London_England.html';
break;
case 'trustpilot':
$exampleUrl = 'https://www.trustpilot.com/review/generalitravelinsurance.com';
break;
case 'expedia':
$exampleUrl = 'https://www.expedia.com/London-Hotels-The-Hayden-Pub-Rooms.h39457643.Hotel-Information';
break;
case 'google':
$example = 'ChIJ9TmAVZfbQUcROoTJtH8TuFU';
break;
case 'yelp':
$exampleUrl = 'https://www.yelp.ie/biz/the-iveagh-gardens-dublin-2';
break;
case 'zillow':
$exampleUrl = 'https://www.zillow.com/profile/NealandNealTeam/#reviews';
break;
}
?>