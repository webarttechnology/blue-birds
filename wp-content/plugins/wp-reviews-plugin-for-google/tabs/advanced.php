<?php
defined('ABSPATH') or die('No script kiddies please!');
$autoUpdates = get_option('auto_update_plugins', []);
$pluginSlug = "wp-reviews-plugin-for-google/wp-reviews-plugin-for-google.php";
if (isset($_GET['auto_update'])) {
check_admin_referer('ti-auto-update');
if (!in_array($pluginSlug, $autoUpdates)) {
$autoUpdates []= $pluginSlug;
update_option('auto_update_plugins', $autoUpdates, false);
}
header('Location: admin.php?page=' . sanitize_text_field($_GET['page']) . '&tab=advanced');
exit;
}
if (isset($_GET['toggle_css_inline'])) {
check_admin_referer('ti-toggle-css');
$v = (int)$_GET['toggle_css_inline'];
update_option($trustindex_pm_google->get_option_name('load-css-inline'), $v, false);
if ($v && is_file($trustindex_pm_google->getCssFile())) {
unlink($trustindex_pm_google->getCssFile());
}
header('Location: admin.php?page=' . sanitize_text_field($_GET['page']) . '&tab=advanced');
exit;
}
if (isset($_GET['delete_css'])) {
check_admin_referer('ti-delete-css');
if (is_file($trustindex_pm_google->getCssFile())) {
unlink($trustindex_pm_google->getCssFile());
}
header('Location: admin.php?page=' . sanitize_text_field($_GET['page']) . '&tab=advanced');
exit;
}
if (isset($_POST['save-notification-email'])) {
check_admin_referer('ti-notification-email-save');
$type = strtolower(trim(sanitize_text_field($_POST['type'])));
$email = strtolower(trim(sanitize_text_field($_POST['save-notification-email'])));
$trustindex_pm_google->setNotificationParam($type, 'email', $email);
exit;
}
$yesIcon = '<span class="dashicons dashicons-yes-alt"></span>';
$noIcon = '<span class="dashicons dashicons-dismiss"></span>';
$pluginUpdated = ($trustindex_pm_google->get_plugin_current_version() <= "11.1");
$cssInline = get_option($trustindex_pm_google->get_option_name('load-css-inline'), 0);
$css = get_option($trustindex_pm_google->get_option_name('css-content'));
?>
<div class="ti-box">
<div class="ti-box-header"><?php echo TrustindexPlugin_google::___('Notifications'); ?></div>
<ul class="troubleshooting-checklist">
<li>
<?php echo TrustindexPlugin_google::___('Review download available'); ?>
<ul>
<li>
<?php
$isNotificationActive = !$trustindex_pm_google->getNotificationParam('review-download-available', 'hidden', false);
echo TrustindexPlugin_google::___('Notification') .': '. ($isNotificationActive ? $yesIcon : $noIcon); ?>
<?php if ($isNotificationActive): ?>
<a href="?page=<?php echo sanitize_text_field($_GET['page']); ?>&tab=advanced&notification=review-download-available&action=hide" class="btn-text btn-refresh"><?php echo TrustindexPlugin_google::___('Disable'); ?></a>
<?php else: ?>
<a href="?page=<?php echo sanitize_text_field($_GET['page']); ?>&tab=advanced&notification=review-download-available&action=unhide" class="btn-text btn-refresh"><?php echo TrustindexPlugin_google::___('Enable'); ?></a>
<?php endif; ?>
</li>
</ul>
</li>
<li>
<?php echo TrustindexPlugin_google::___('Review download finished'); ?>
<ul>
<li>
<?php
$isNotificationActive = !$trustindex_pm_google->getNotificationParam('review-download-finished', 'hidden', false);
echo TrustindexPlugin_google::___('Notification') .': '. ($isNotificationActive ? $yesIcon : $noIcon); ?>
<?php if ($isNotificationActive): ?>
<a href="?page=<?php echo sanitize_text_field($_GET['page']); ?>&tab=advanced&notification=review-download-finished&action=hide" class="btn-text btn-refresh"><?php echo TrustindexPlugin_google::___('Disable'); ?></a>
<?php else: ?>
<a href="?page=<?php echo sanitize_text_field($_GET['page']); ?>&tab=advanced&notification=review-download-finished&action=unhide" class="btn-text btn-refresh"><?php echo TrustindexPlugin_google::___('Enable'); ?></a>
<?php endif; ?>
</li>
<li>
<div class="ti-notification-email">
<div class="ti-notice notice-error">
<p><?php echo TrustindexPlugin_google::___('Invalid email'); ?></p>
</div>
<div class="ti-inner">
<span><?php echo TrustindexPlugin_google::___('Send email notification to:'); ?></span>
<input type="text" data-type="review-download-finished" data-nonce="<?php echo wp_create_nonce('ti-notification-email-save'); ?>" class="form-control" value="<?php echo $trustindex_pm_google->getNotificationParam('review-download-finished', 'email', get_option('admin_email')); ?>" />
<a href="#" class="btn-text btn-notification-email-save"><?php echo TrustindexPlugin_google::___('Save'); ?></a>
</div>
<div class="ti-info-text"><?php echo TrustindexPlugin_google::___('Leave the field blank if you do not want email notification.'); ?></div>
</div>
</li>
</ul>
</li>
</ul>
</div>
<div class="ti-box">
<div class="ti-box-header"><?php echo TrustindexPlugin_google::___("Troubleshooting"); ?></div>
<p><strong><?php echo TrustindexPlugin_google::___('If you have any problem, you should try these steps:'); ?></strong></p>
<ul class="troubleshooting-checklist">
<li>
<?php echo TrustindexPlugin_google::___("Trustindex plugin"); ?>
<ul>
<li>
<?php echo TrustindexPlugin_google::___('Use the latest version:') .' '. ($pluginUpdated ? $yesIcon : $noIcon); ?>
<?php if (!$pluginUpdated): ?>
<a href="/wp-admin/plugins.php" class="btn-text btn-refresh"><?php echo TrustindexPlugin_google::___('Update'); ?></a>
<?php endif; ?>
</li>
<li>
<?php echo TrustindexPlugin_google::___('Use automatic plugin update:') .' '. (in_array($pluginSlug, $autoUpdates) ? $yesIcon : $noIcon); ?>
<?php if(!in_array($pluginSlug, $autoUpdates)): ?>
<a href="<?php echo wp_nonce_url('?page='. sanitize_text_field($_GET['page']) .'&tab=advanced&auto_update', 'ti-auto-update'); ?>" class="btn-text btn-refresh"><?php echo TrustindexPlugin_google::___("Enable"); ?></a>
<div class="ti-notice notice-warning">
<p><?php echo TrustindexPlugin_google::___("You should enable it, to get new features and fixes automatically, right after they published!"); ?></p>
</div>
<?php endif; ?>
</li>
</ul>
</li>
<?php if ($css): ?>
<li>
CSS
<ul>
<li><?php
$uploadDir = dirname($trustindex_pm_google->getCssFile());
echo TrustindexPlugin_google::___('writing permission') .' (<strong>'. $uploadDir .'</strong>): '. (is_writable($uploadDir) ? $yesIcon : $noIcon); ?>
</li>
<li>
<?php echo TrustindexPlugin_google::___('CSS content:'); ?>
<?php
if (is_file($trustindex_pm_google->getCssFile())) {
$content = file_get_contents($trustindex_pm_google->getCssFile());
if ($content === $css) {
echo $yesIcon;
}
else {
echo $noIcon .' '. TrustindexPlugin_google::___("corrupted") .'
<div class="ti-notice notice-warning">
<p><a href="'. wp_nonce_url('?page='. sanitize_text_field($_GET['page']) .'&tab=advanced&delete_css', 'ti-delete-css') .'">'. TrustindexPlugin_google::___("Delete the CSS file at <strong>%s</strong>.", [ $trustindex_pm_google->getCssFile() ]) .'</a></p>
</div>';
}
}
else {
echo $noIcon;
}
?>
<span class="ti-checkbox row" style="margin-top: 5px">
<input type="checkbox" value="1" <?php if ($cssInline): ?>checked<?php endif;?> onchange="window.location.href = '?page=<?php echo sanitize_text_field($_GET['page']); ?>&tab=advanced&_wpnonce=<?php echo wp_create_nonce('ti-toggle-css'); ?>&toggle_css_inline=' + (this.checked ? 1 : 0)">
<label><?php echo TrustindexPlugin_google::___('Enable CSS internal loading'); ?></label>
</span>
</li>
</ul>
</li>
<?php endif; ?>
<li>
<?php echo TrustindexPlugin_google::___('If you are using cacher plugin, you should:'); ?>
<ul>
<li><?php echo TrustindexPlugin_google::___('clear the cache'); ?></li>
<li><?php echo TrustindexPlugin_google::___("exclude Trustindex's JS file:"); ?> <strong><?php echo 'https://cdn.trustindex.io/'; ?>loader.js</strong>
<ul>
<li><a href="#" onclick="jQuery('#list-w3-total-cache').toggle(); return false;">W3 Total Cache</a>
<ol id="list-w3-total-cache" style="display: none;">
<li><?php echo TrustindexPlugin_google::___('Navigate to'); ?> "Performance" > "Minify"</li>
<li><?php echo TrustindexPlugin_google::___('Scroll to'); ?> "Never minify the following JS files"</li>
<li><?php echo TrustindexPlugin_google::___('In a new line, add'); ?> https://cdn.trustindex.io/*</li>
<li><?php echo TrustindexPlugin_google::___('Save'); ?></li>
</ol>
</li>
</ul>
</li>
</ul>
</li>
<li>
<?php
$plugin_url = 'https://wordpress.org/support/plugin/' . $trustindex_pm_google->get_plugin_slug();
$screenshot_url = 'https://snipboard.io';
$screencast_url = 'https://streamable.com/upload-video';
$pastebin_url = 'https://pastebin.com';
echo TrustindexPlugin_google::___('If the problem/question still exists, please create an issue here: %s', [ '<a href="'. $plugin_url .'" target="_blank">'. $plugin_url .'</a>' ]);
?>
<br />
<?php echo TrustindexPlugin_google::___('Please help us with some information:'); ?>
<ul>
<li><?php echo TrustindexPlugin_google::___('Describe your problem'); ?></li>
<li><?php echo TrustindexPlugin_google::___('You can share a screenshot with %s', [ '<a href="'. $screenshot_url .'" target="_blank">'. $screenshot_url .'</a>' ]); ?></li>
<li><?php echo TrustindexPlugin_google::___('You can share a screencast video with %s', [ '<a href="'. $screencast_url .'" target="_blank">'. $screencast_url .'</a>' ]); ?></li>
<li><?php echo TrustindexPlugin_google::___('If you have an (webserver) error log, you can copy it to the issue, or link it with %s', [ '<a href="'. $pastebin_url .'" target="_blank">'. $pastebin_url .'</a>' ]); ?></li>
<li><?php echo TrustindexPlugin_google::___('And include the information below:'); ?></li>
</ul>
</li>
</ul>
<textarea class="ti-troubleshooting-info" readonly><?php include $trustindex_pm_google->get_plugin_dir() . 'include' . DIRECTORY_SEPARATOR . 'troubleshooting.php'; ?></textarea>
<a href=".ti-troubleshooting-info" class="btn-text btn-copy2clipboard ti-pull-right ti-tooltip toggle-tooltip ti-tooltip-left">
<?php echo TrustindexPlugin_google::___('Copy to clipboard') ;?>
<span class="ti-tooltip-message">
<span style="color: #00ff00; margin-right: 2px">✓</span>
<?php echo TrustindexPlugin_google::___('Copied'); ?>
</span>
</a>
<div class="clear"></div>
</div>
<div class="ti-box">
<div class="ti-box-header"><?php echo TrustindexPlugin_google::___('Re-create plugin'); ?></div>
<p><?php echo TrustindexPlugin_google::___('Re-create the database tables of the plugin.<br />Please note: this removes all settings and reviews.'); ?></p>
<a href="<?php echo wp_nonce_url('?page='. esc_attr($_GET['page']) .'&tab=setup_no_reg&recreate', 'ti-recreate'); ?>" class="btn-text btn-refresh ti-pull-right" style="margin-left: 0"><?php echo TrustindexPlugin_google::___('Re-create plugin'); ?></a>
<div class="clear"></div>
</div>
<div class="ti-box">
<div class="ti-box-header"><?php echo TrustindexPlugin_google::___('Translation'); ?></div>
<p>
<?php echo TrustindexPlugin_google::___('If you notice an incorrect translation in the plugin text, please report it here:'); ?>
 <a href="mailto:support@trustindex.io">support@trustindex.io</a>
</p>
</div>