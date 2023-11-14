<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'bluebirds_db' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', '' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'XF(pDvfS|wX2KYmvk~(l#C2Fv41[fcG4atwqo)qojt62#C[=C[a9IC.[yR@cCdE=' );
define( 'SECURE_AUTH_KEY',  ')k:L3}?9e.[&%[G9l$70;Z)6GD3QBTt>.ie/FSOD%MMqzRcV>=3=-Z$%~D*3q3~Q' );
define( 'LOGGED_IN_KEY',    'VITh=J%JtXjZkdU+eP982&.%s7Q#p{8 -LMmga .X]0|/lF0@&i+tjO~.;c` .&v' );
define( 'NONCE_KEY',        'c#e)o&B{~d>wN~VoefN@B8von}KPT=pE}dvo.|-M|aW3oZ$471QBZKHpQvYh=?j@' );
define( 'AUTH_SALT',        '9];rJn47LMfj!M`*!n09G>xgG` /iOa5)>[vB)twy56+zz.[h;4@jzRR.<V#dYwA' );
define( 'SECURE_AUTH_SALT', '&VS6?Q_b;<tM[Xi+HOy&fZ~aHtVJ JjHnh$Y2}Xj[dH,zy366CY;AM88.,J|hnH ' );
define( 'LOGGED_IN_SALT',   '6mHQ15`@=lmPKdY2|LM4y7Y!B7Uv&q[vG+F)|GROZBRq6%$H3<dQI?]ntnZ6ThTw' );
define( 'NONCE_SALT',       '9f[;]A`R)7x3N{`]|7 PWh_Ns_||]H.;4j*#SX3UH}=NGN-$l!]H5X,^NG!x}[J;' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
