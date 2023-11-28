<?php
defined( 'ABSPATH' ) or die( 'No script kiddies please!' );
if (!current_user_can('edit_pages')) {
die('The account you\'re logged in to doesn\'t have permission to access this page.');
}
if (isset($_GET['wc_notification'])) {
$mode = sanitize_text_field($_GET['wc_notification']);
$dbValue = 'hide';
if ($mode === 'later') {
$dbValue = $time = time() + (30 * 86400);
}
update_option('trustindex-wc-notification', $dbValue, false);
if ($mode === 'open') {
header('Location: https://wordpress.org/plugins/customer-reviews-collector-for-woocommerce/');
exit;
}
echo '<script type="text/javascript">self.close();</script>';
exit;
}
if (isset($_GET['notification'])) {
$type = sanitize_text_field($_GET['notification']);
switch (sanitize_text_field($_GET['action'])) {
case 'later':
$trustindex_pm_google->setNotificationParam($type, 'timestamp', time() + (14 * 86400));
break;
case 'close':
if ($type !== 'rate-us') {
$trustindex_pm_google->setNotificationParam($type, 'active', false);
}
break;
case 'open':
$trustindex_pm_google->setNotificationParam($type, 'active', false);
if ($type === 'rate-us') {
header('Location: https://wordpress.org/support/plugin/'. $trustindex_pm_google->get_plugin_slug() . '/reviews/?rate=5#new-post');
exit;
}
$tab = 'setup_no_reg';
if (in_array($type, [ 'review-download-available', 'review-download-finished' ])) {
$tab = 'my_reviews';
}
header('Location: admin.php?page=' . sanitize_text_field($_GET['page']) .'&tab='. $tab);
break;
case 'hide':
$trustindex_pm_google->setNotificationParam($type, 'hidden', true);
header('Location: admin.php?page=' . sanitize_text_field($_GET['page']) .'&tab=advanced');
break;
case 'unhide':
$trustindex_pm_google->setNotificationParam($type, 'hidden', false);
header('Location: admin.php?page=' . sanitize_text_field($_GET['page']) .'&tab=advanced');
break;
}
exit;
}
if (isset($_GET['test_proxy'])) {
check_admin_referer('ti-test-proxy');
delete_option($trustindex_pm_google->get_option_name('proxy-check'));
header('Location: admin.php?page=' . sanitize_text_field($_GET['page']) .'&tab=' . sanitize_text_field($_GET['tab']));
exit;
}
if (isset($_REQUEST['command']) && $_REQUEST['command'] === 'rate-us-feedback') {
check_admin_referer('ti-rate-us');
$text = isset($_POST['text']) ? trim(wp_kses_post(stripslashes($_POST['text']))) : "";
$email = isset($_POST['email']) ? trim(sanitize_text_field($_POST['email'])) : "";
$star = isset($_REQUEST['star']) ? (int)$_REQUEST['star'] : 1;
update_option($trustindex_pm_google->get_option_name('rate-us-feedback'), $star, false);
if ($star > 3) {
header('Location: https://wordpress.org/support/plugin/'. $trustindex_pm_google->get_plugin_slug() . '/reviews/?rate='. $star .'#new-post');
}
else {
wp_mail('support@trustindex.io', 'Feedback from Google plugin', "We received a <strong>$star star</strong> feedback about the Google plugin from $email:<br /><br />$text", [
'From: '. $email,
'Content-Type: text/html; charset=UTF-8'
]);
}
exit;
}
$tabs = [];
if ($trustindex_pm_google->is_trustindex_connected()) {
$defaultTab = 'setup_trustindex_join';
$tabs[ 'Trustindex admin' ] = 'setup_trustindex_join';
$tabs[ TrustindexPlugin_google::___('Free Widget Configurator') ] = 'setup_no_reg';
}
else {
$defaultTab = 'setup_no_reg';
$tabs[ TrustindexPlugin_google::___('Free Widget Configurator') ] = 'setup_no_reg';
}
if ($trustindex_pm_google->is_noreg_linked()) {
$tabs[ TrustindexPlugin_google::___('My reviews') ] = 'my_reviews';
}
$tabs[ TrustindexPlugin_google::___('Get Reviews') ] = 'get_reviews';
$tabs[ TrustindexPlugin_google::___('Rate Us') ] = 'rate';
if (!$trustindex_pm_google->is_trustindex_connected()) {
$tabs[ TrustindexPlugin_google::___('Get more Features') ] = 'setup_trustindex';
$tabs[ TrustindexPlugin_google::___('Log In') ] = 'setup_trustindex_join';
}
$tabs[ TrustindexPlugin_google::___('Advanced') ] = 'advanced';
$tabs[ TrustindexPlugin_google::___('Feature request') ] = 'feature_request';
$selectedTab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : null;
$subTabs = null;
$newBadgeTabs = [];
if (get_option($trustindex_pm_google->get_option_name('widget-setted-up'), 0) && !get_option($trustindex_pm_google->get_option_name('reply-generated'), 0)) {
$newBadgeTabs []= 'my_reviews';
}
$found = false;
foreach ($tabs as $tab) {
if (is_array($tab)){
if (array_search($selectedTab, $tab) !== FALSE) {
$found = true;
break;
}
}
else {
if ($selectedTab === $tab) {
$found = true;
break;
}
}
}
if (!$found) {
$selectedTab = $defaultTab;
}
$httpBlocked = false;
if (defined('WP_HTTP_BLOCK_EXTERNAL') && WP_HTTP_BLOCK_EXTERNAL) {
if (!defined('WP_ACCESSIBLE_HOSTS') || strpos(WP_ACCESSIBLE_HOSTS, '*.trustindex.io') === FALSE) {
$httpBlocked = true;
}
}
$proxy = new WP_HTTP_Proxy();
$proxyCheck = true;
if ($proxy->is_enabled()) {
$optName = $trustindex_pm_google->get_option_name('proxy-check');
$dbData = get_option($optName, "");
if (!$dbData) {
$response = wp_remote_post("https://admin.trustindex.io/" . 'api/userCheckLoggedIn', [
'timeout' => '30',
'redirection' => '5',
'blocking' => true
]);
if (is_wp_error($response)) {
$proxyCheck = $response->get_error_message();
update_option($optName, $response->get_error_message(), false);
}
else {
update_option($optName, 1, false);
}
}
else {
if ($dbData !== '1') {
$proxyCheck = $dbData;
}
}
}
?>
<div id="ti-assets-error" class="notice notice-warning" style="display: none; margin-left: 0; margin-right: 0; padding-bottom: 9px">
<p>
<?php echo TrustindexPlugin_google::___('For some reason, the <strong>CSS</strong> file required to run the plugin was not loaded.<br />One of your plugins is probably causing the problem.'); ?>
</p>
</div>
<script type="text/javascript">
window.onload = function() {
let notLoaded = [];
let loadedCount = 0;
let jsFiles = [
{
url: '<?php echo $trustindex_pm_google->get_plugin_file_url('static/js/admin-page-settings-connect.js'); ?>',
id: 'connect'
},
{
url: '<?php echo $trustindex_pm_google->get_plugin_file_url('static/js/admin-page-settings-common.js'); ?>',
id: 'common'
},
<?php if(in_array($trustindex_pm_google->shortname, [ 'google', 'facebook' ])): ?>
{
url: '<?php echo $trustindex_pm_google->get_plugin_file_url('static/js/admin-page-settings.js'); ?>',
id: 'unique'
}
<?php endif; ?>
];
let addElement = function(type, url, callback) {
let element = document.createElement(type);
if (type === 'script') {
element.type = 'text/javascript';
element.src = url;
}
else {
element.type = 'text/css';
element.rel = 'stylesheet';
element.href = url;
element.id = 'trustindex_settings_style_google-css';
}
document.head.appendChild(element);
element.addEventListener('load', function() { callback(true); });
element.addEventListener('error', function() { callback(false); });
};
let isCSSExists = function() {
let link = document.getElementById('trustindex_settings_style_google-css');
return link && Boolean(link.sheet);
};
let isJSExists = function(id) {
return typeof TrustindexJsLoaded !== 'undefined' && typeof TrustindexJsLoaded[ id ] !== 'undefined';
};
let process = function() {
if (loadedCount < jsFiles.length + 1) {
return false;
}
if (notLoaded.length) {
document.getElementById('trustindex-plugin-settings-page').remove();
let warningBox = document.getElementById('ti-assets-error');
if (warningBox) {
warningBox.style.display = 'block';
warningBox.querySelector('p strong').innerHTML = notLoaded.join(', ');
}
}
}
if (!isCSSExists()) {
addElement('link', '<?php echo $trustindex_pm_google->get_plugin_file_url('static/css/admin-page-settings.css'); ?>', function(success) {
loadedCount++;
if (!success) {
notLoaded.push('CSS');
}
process();
});
}
else {
loadedCount++;
}
jsFiles.forEach(function(js) {
if (!isJSExists(js.id)) {
addElement('script', js.url, function(success) {
loadedCount++;
if (!success) {
if (notLoaded.indexOf('JS') === -1) {
notLoaded.push('JS');
}
}
process();
});
}
else {
loadedCount++;
}
});
};
</script>
<div id="trustindex-plugin-settings-page" class="ti-toggle-opacity">
<h1 class="ti-free-title">
<?php echo TrustindexPlugin_google::___("Widgets for Google Reviews"); ?>
<a href="https://www.trustindex.io/ti-redirect.php?a=sys&c=wp-google-l" target="_blank" title="Trustindex" class="ti-pull-right">
<img src="<?php echo $trustindex_pm_google->get_plugin_file_url('static/img/trustindex.svg'); ?>" />
</a>
</h1>
<div class="container_wrapper">
<div class="container_cell" id="container-main">
<?php if ($httpBlocked): ?>
<div class="ti-box ti-notice-error">
<p>
<?php echo TrustindexPlugin_google::___('Your site cannot download our widget templates, because of your server settings not allowing that:'); ?><br /><a href="https://wordpress.org/support/article/editing-wp-config-php/#block-external-url-requests" target="_blank">https://wordpress.org/support/article/editing-wp-config-php/#block-external-url-requests</a><br /><br />
<strong><?php echo TrustindexPlugin_google::___('Solution'); ?></strong><br />
<?php echo TrustindexPlugin_google::___('a) You should define <strong>WP_HTTP_BLOCK_EXTERNAL</strong> as false'); ?><br />
<?php echo TrustindexPlugin_google::___("b) or you should add Trustindex as an <strong>WP_ACCESSIBLE_HOSTS</strong>: \"*.trustindex.io\""); ?><br />
</p>
</div>
<?php endif; ?>
<?php if ($proxyCheck !== TRUE): ?>
<div class="ti-box ti-notice-error">
<p>
<?php echo TrustindexPlugin_google::___('It seems you are using a proxy for HTTP requests but after a test request it returned a following error:'); ?><br />
<strong><?php echo $proxyCheck; ?></strong><br /><br />
<?php echo TrustindexPlugin_google::___('Therefore, our plugin might not work properly. Please, contact your hosting support, they can resolve this easily.'); ?>
</p>
<a href="<?php echo wp_nonce_url('?page='. esc_attr($_GET['page']) .'&tab='. esc_attr($_GET['tab']) .'&test_proxy', 'ti-test-proxy'); ?>" class="btn-text btn-refresh"><?php echo TrustindexPlugin_google::___('Test again') ;?></a>
</div>
<?php endif; ?>
<div class="nav-tab-wrapper">
<?php foreach ($tabs as $tabName => $tab): ?>
<?php
$isActive = $selectedTab == $tab;
$action = $tab;
if (is_array($tab)) {
$isActive = array_search($selectedTab, $tab) !== FALSE;
$action = array_shift(array_values($tab));
if ($isActive) {
$subTabs = $tab;
}
}
?>
<a
id="link-tab-<?php echo esc_attr($action); ?>"
class="nav-tab<?php if($isActive): ?> nav-tab-active<?php endif; ?><?php if($tab == 'advanced' || $tab == 'feature_request'): ?> nav-tab-right<?php endif; ?>"
href="<?php echo admin_url('admin.php?page='.$trustindex_pm_google->get_plugin_slug().'/settings.php&tab='. esc_attr($action)); ?>"
>
<?php echo esc_html($tabName); ?>
<?php if (in_array($tab, $newBadgeTabs)): ?>
<span class="ti-new-badge"><?php echo TrustindexPlugin_google::___('new'); ?></span>
<?php endif; ?>
</a>
<?php endforeach; ?>
</div>
<?php if ($subTabs): ?>
<div class="nav-tab-wrapper sub-nav">
<?php foreach ($subTabs as $tabName => $tab): ?>
<a
id="link-tab-<?php echo esc_attr($tab); ?>"
class="nav-tab<?php if($selectedTab == $tab): ?> nav-tab-active<?php endif; ?>"
href="<?php echo admin_url('admin.php?page='.$trustindex_pm_google->get_plugin_slug().'/settings.php&tab='. esc_attr($tab)); ?>"
><?php echo esc_html($tabName); ?></a>
<?php endforeach; ?>
</div>
<?php endif; ?>
<div id="tab-<?php echo esc_attr($selectedTab); ?>">
<?php include(plugin_dir_path(__FILE__ ) . 'tabs' . DIRECTORY_SEPARATOR . $selectedTab . '.php'); ?>
</div>
</div>
</div>
</div>
<div id="ti-loading">
<div class="ti-loading-effect"><div></div><div></div><div></div></div>
</div>