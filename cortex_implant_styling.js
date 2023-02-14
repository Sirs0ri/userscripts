// ==UserScript==
// @name         CortexImplant CSS Improvements
// @namespace    http://tampermonkey.net/
// @version      1.4.0
// @description  Change the styling for the mastodon instance I'm on
// @author       @Sirs0ri
// @match        https://corteximplant.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=corteximplant.com
// @supportURL   https://github.com/Sirs0ri/userscripts/issues
// @grant        GM_addStyle
// ==/UserScript==

/*
 * == KNOWN ISSUES ==
 *    - Firefox doesn't support :has() yet, unless you manually turn it on via the layout.css.has-selector.enabled flag.
 *      The general restyling shouldn't be affected.
 *      The animated notifications menu entry should work with the aforementioned flag enabled.
 *      The [alt] indicator on media unfortunately doesn#t seem to work in FF at all.
 *      Affected parts of this stylesheet have a notice at the start.
 *    - If you're on my git, this incorporates the changes found in mastodon_media_improvements.js
 *      Use one of the two userscripts. If you're not on my git, ignore this.
 *    - The glow-on-media might look off on glitch-fork with certain settings. I recommend the following options:
 *      (under App Aettings -> Media)
 *        - [off] Letterbox Media
 *        - [off] Full-width media previews
 *        - [on ] Inline preview cards for external links
 *      Alternatively, you can turn off the glow effect entirely via the CONFIGURABLE OPTIONS section below.
 */

(function() {
    'use strict';

    // ====================
    // CONFIGURABLE OPTIONS
    // ====================

    // I personally don't like the checkmarks Glitch-Fork adds to e.g. the fac- and boost-buttons.
    // If you want them disabled, change the following boolean from `false` to `true`:
    const hideCheckmarks = false

    // Glitch-Fork makes soem animations super bouncy, e.g. when expanding a post or faving it.
    // Setting the following option to "true" will make the animations smoother, removing the "overshooting" effect
    const disableBouncyAnimations = false

    // This will turn on/off the glow on media content embedded in posts. Use this option e.g. if you're experiencing issues with glitch's layout options and my changes.
    const enableGlowOnMedia = true

    // Use TamperMonkey's helper to inject CSS
    // see https://codepen.io/mattgrosswork/pen/VwprebG

    hideCheckmarks && GM_addStyle(`
/* disable checkmark on buttons */
.detailed-status__button .icon-button.active:after, .status__action-bar-button.active:after {
    content: ""
}
`)

    disableBouncyAnimations && GM_addStyle(`
/* ====================
 * de-springyfy anims
 * ==================== */

.no-reduce-motion .status__collapse-button>.fa-angle-double-up {
    transition: transform 200ms ease-in-out, color 200ms;
    animation: none !important;
}
.no-reduce-motion .icon-button.star-icon>.fa-star {
    transition: transform 500ms ease-in-out, color 500ms;
    animation: none !important;
}
.no-reduce-motion .icon-button.star-icon.deactivate>.fa-star {
    transform: rotate(0turn);
}
.no-reduce-motion .icon-button.star-icon.activate>.fa-star {
    transform: rotate(2turn);
}

/* improve visibility of mentions */
a.mention {
    background: rgba(255 255 255 / 0.1);
    border-radius: 4px;
    padding: 0 2px;
}
`)

    enableGlowOnMedia && GM_addStyle(`
/* ====================
 *    Glow on Media
 * ==================== */

 /* Important note for glitch-fork users:

 it's HIGHLY recommended to disable the following
 options in the "app settings" (left sidebar):

   - Letterbox Media
   - full-width media previews
 */

@keyframes fadeIn {
    0%   { opacity: 0; }
    100% { opacity: 1; }
}

:is(#fake,
    .columns-area--mobile .status .audio-player,
    .columns-area--mobile .status .media-gallery,
    .columns-area--mobile .status .video-player
) {
    margin-top: 20px;
}

.media-gallery,
.media-gallery__item,
.video-player.inline {
    overflow: revert;
}

.media-gallery__item,
.video-player.inline {
    border-radius: 8px;
}
.media-gallery__item>*,
.video-player.inline>* {
    border-radius: inherit;
    overflow: hidden;
}

.media-gallery__item canvas {
    filter: blur(0px);
    transition: filter 100ms;
}

.media-gallery__item img {
    background: transparent;
    transition: background 200ms;
}

/* the preview only gets --hidden once the img is fully loaded */
.media-gallery__preview--hidden + .media-gallery__item-thumbnail img {
    background: #393f4f;
}

/* Duplicate the rule in case :has isn't properly supported. */
.media-gallery__item:has(canvas+div) canvas,
.media-gallery__item:has(canvas+a) canvas {
    display: revert;
    filter: blur(4px);
}
/* Undo hiding the blurhash canvas unless it's for part of a video in full screen */
:not(.fullscreen, .detailed)>.media-gallery__preview--hidden {
    display: revert;
    filter: blur(4px);
}

.media-gallery__item>*:not(canvas) {
    animation: 200ms ease-out 0s 1 fadeIn;
}

.media-gallery__item>*:not(canvas):after {
    content: "";
    outline: 3px solid rgba(128 128 128 / 0.1);
    outline-offset: -2px;
    position: absolute;
    inset: 0;
    z-index: 2;
    border-radius: inherit;
    mix-blend-mode: plus-lighter;
    pointer-events: none;
}

/* YT Video Embeds & other link image previews */
.status-card  {
    border-radius: 8px;
    overflow: revert;
}
.status-card__image {
    border-radius: inherit;
    position: relative;
}
canvas.status-card__image-preview {
    border-radius: inherit;
    z-index: unset;
    filter: blur(4px);
}
.status-card__image iframe {
    border-radius: inherit
}
canvas.status-card__image-preview--hidden {
    display: revert;
}
:is(#fake, .status-card__image-image) {
    border-radius: inherit;
    max-width: 100%;
    position: relative;
}
.status-card__image:after {
    content: "";
    outline: 3px solid rgba(128 128 128 / 0.1);
    outline-offset: -2px;
    position: absolute;
    inset: 0;
    z-index: 2;
    border-radius: inherit;
    mix-blend-mode: plus-lighter;
    pointer-events: none;
}
    `)

    // alpha mask of the people and the logo from the header image
    const footerImgMask = "data:image/avif;base64,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"
    // The CORTEX IMPLANT Logo
    const logoImg = "data:image/png;base64,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"

    GM_addStyle(`

/* ====================
 * Misc general changes
 * ==================== */

/* Remove underline from button links */
a.button {
    text-decoration: none;
}

/* wider margin next to the main content scroller */
@media screen and (min-width: 1175px) {
    .columns-area__panels__main {
        margin: 0 clamp(0px, calc(4vw - 48px), 50px);
    }

    .compose-form {
        padding: 10px 0;
        overflow-y: revert !important;
    }

    .compose-panel,
    .compose-form .compose-form__publish .compose-form__publish-button-wrapper,
    .account__header__tabs,
    .account__header__tabs__buttons {
        overflow: revert;
    }
}

/* I've seen an article without any content exactly once, now I'll bever see one again! */
.columns-area--mobile article:empty {
    display: none;
}

/* Make clickable area of posts larger */

.status:not(.collapsed) .status__content--with-action {
    margin-top: -72px;
    padding-top: 82px;
}
.status__prepend + .status .status__content--with-action {
    margin-top: -110px;
    padding-top: 110px;
}
.status__content--with-action:nth-last-child(3) {
    /* Followed by a media gallery */
    margin-bottom: -16px;
    padding-bottom: 16px;
}
.status__prepend a,
.status__info a,
.status__info__icons {
    z-index: 1;
    position: relative;
}

#mastodon[data-props='{"locale":"de"}'] .compose-form__publish-button-wrapper > .button.primary::after {
    content: "Cybertrööt!"
}
`)

    GM_addStyle(`

/* Add our logo */
@media screen and (min-width: 1175px) {
    .columns-area__panels__pane--navigational .columns-area__panels__pane__inner:before {
        content: "";
        object-fit: contain;
        background: url(${logoImg});
            display: block;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        height: 48px;
        max-width: 100%;
        margin-top: 10px;
    }

    .navigation-panel {
        margin-top: 0;
        height: calc(100% - 68px);
    }
    .navigation-panel:before {
        content: "";
        width: 100%;
        margin: 10px 0;
    }
}
`)

    GM_addStyle(`
/* Colors

posts
search__input
	hsl(227deg 16% 19%)

active post
.scrollable.about:before
header
	hsl(227deg 16% 23%)

posts border
lists border
	hsl(227deg 16% 27%)

header border
.column-header__collapsible
.search__input border
	hsl(227deg 16% 31%)

.scrollable.about:before border
header:hover border
	hsl(227deg 16% 51%)
*/


/* ====================
 *   Neon-ify the page
 * ====================*/

/* min-width: 1175px is Mastodon's breakpoint after which it shows the "desktop" ui */
@media screen and (min-width: 1175px) {
    body {
        --neon-color: 219deg 100% 50%;
        --white-hsl: 0deg 0% 100%;
        --a-norm: 1;
        --a-small: 0.05;
        --neon-box-shadow:
            /* White glow */
            0 0 7px hsla(var(--white-hsl) / 1),
            0 0 10px hsla(var(--white-hsl) / 1),
            0 0 21px hsla(var(--white-hsl) / 1),
            /* Colored glow */
            0 0 42px hsla(var(--neon-color) / 1),
            0 0 82px hsla(var(--neon-color) / 1),
            0 0 92px hsla(var(--neon-color) / 1),
            0 0 102px hsla(var(--neon-color) / 1),
            0 0 151px hsla(var(--neon-color) / 1);
        --neon-box-shadow-small:
            /* White glow */
            0 0 6px -2px hsla(var(--white-hsl) / 0.4),
            0 0 10px hsla(var(--white-hsl) / 0.2),
            0 0 15px hsla(var(--white-hsl) / 0.1),
            /* Colored glow */
            0 0 10px hsla(var(--neon-color) / 0.07),
            0 0 25px hsla(var(--neon-color) / 0.05),
            0 0 47px hsla(var(--neon-color) / 0.12),
            /* White inside glow */
            inset 0 0 5px hsla(var(--white-hsl) / 0.3)
    }

    /* ===== Buttons get a glow-on-hover ===== */

    .button {
        outline: 1px solid transparent;
        outline-offset: -1px;
        transition: box-shadow 200ms, outline-color 200ms;
    }
    .button:hover {
        outline-color: hsl(240deg 100% 83%);
        box-shadow: var(--neon-box-shadow-small);
    }

    /* ====================
     *    Side/nav menu
     * =================== */

    /* Allow the glow to leak out of the nav menu */
    .navigation-panel {
        overflow: unset;
    }

    /* Glowy horizontal lines */
    .navigation-panel:before,
    :is(#fake, .compose-panel, .navigation-panel) hr {
        box-shadow: var(--neon-box-shadow);
        border-top: 1px solid hsl(227deg 16% 81%);
        position: relative;
        z-index: -1;
        margin: 20px 0;
        height: 0;
    }

    :is(#fake, .compose-panel) .spacer {
        margin: 30px 0 !important;
    }

    /* Profile Menu */
    .dropdown-menu {
        border-radius: 8px;
        padding: 8px 0;
    }

    /* Search popup */
    .search-popout {
        border-radius: 8px;
    }

    /* ===== Compose form ===== */

    /* I'm abusing a property of :is() to avoid an !important here.
     * :is()'s specificity is the highest spec. of all selectors in it,
     * even if those selectors are invalid. Using :is() with a valid
     * .class selector and an invalid #id selector bumps up the spec.
     * for the whole :is() selector from .class to #id which allows
     * it to override some default styles.
     * A declaration with !important would still take precedence.
     * Docs: https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity
     */

     /* I'm not *quite* happy with these colors. Waiting for more inspiration */

     :is(#fakeId, .compose-form__warning) {
         border-radius: 8px;
     }

    :is(#fakeId, .compose-form__autosuggest-wrapper) {
        border-radius: 8px;
        border: 1px solid hsl(227deg 16% 51%);
        padding: 5px 0;
        /* Make sure this is above the autosuggest window at z 99 */
        z-index: 100;
        transition: box-shadow 200ms;
        background: white;
    }
    :is(#fakeId, .compose-form__autosuggest-wrapper):focus-within {
        box-shadow: var(--neon-box-shadow-small);
    }
    :is(#fakeId, .compose-form__autosuggest-wrapper) .autosuggest-textarea__textarea,
    :is(#fakeId, .compose-form__autosuggest-wrapper) .compose-form__modifiers {
        background: none;
    }

    .compose-form .emoji-picker-dropdown {
        top: 6px;
        right: 2px;
    }
    /* make sure this isn't covered by the compose area in advanced mode*/
    .emoji-picker-dropdown__menu {
        z-index: 100;
    }

    /* Suggestions box */
    .compose-form .autosuggest-textarea__suggestions.autosuggest-textarea__suggestions--visible {
        border-radius: 8px;
        margin-top: -20px;
        padding-top: 26px; /* This has a default padding of 6px */
    }

    .compose-form .autosuggest-textarea__suggestions.autosuggest-textarea__suggestions--visible,
    :is(#fakeId, .compose-form__buttons-wrapper) {
        border: 1px solid hsl(227deg 16% 51%);
    }

    :is(#fakeId, .compose-form__buttons-wrapper) {
        border-radius: 8px;
        margin-top: -20px;
        padding-top: 30px;
        background: hsl(227deg 16% 81%);
    }
    .compose-form__buttons button {
        min-width: 27px;
        border-radius: 8px;
    }

    /* This is actually the language selector */
    .privacy-dropdown.active .privacy-dropdown__value {
        border-radius: 8px 8px 0 0;
    }
    .language-dropdown__dropdown {
        border-radius: 8px;
    }

    .reply-indicator {
        border-radius: 8px;
        margin-bottom: 20px;
    }


    .compose-form .spoiler-input__input {
        border-radius: 8px;
    }
    .compose-form .spoiler-input {
        transition: height .4s ease, opacity .4s ease, margin-bottom 0.2s ease 0.1s;

        background: white;
        border-radius: 8px;
        border: 1px solid hsl(227deg 16% 51%);
        box-sizing: border-box;
        padding-top: 5px;
        margin-bottom: -7px;
    }
    .compose-form .spoiler-input.spoiler-input--visible {
        margin-bottom: -20px;

        height: 69px; /* nice */
    }

    /* ===== right side menu ===== */

    /* Adjust Horizontal align of the first <hr> with the first post in a feed */
    .navigation-panel__logo hr {
        margin-top: 14px;
    }

    .column-link--transparent {
        position: relative;
    }

    @keyframes flickerIn {
        0%   { opacity: 0   }
        40%  { opacity: 0.7 }
        75%  { opacity: 0.4 }
        100% { opacity: 1   }
    }

    .column-link--transparent:hover span:before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(to right, rgba(255 255 255 / 0.05), rgba(255 255 255 / 0.1));
        border-radius: 8px;

        animation:  200ms ease-out 0s 1 flickerIn;
    }
    .column-link--transparent:hover span:after {
        content: "";
        position: absolute;
        top: 8px;
        right: 8px;
        bottom: 8px;
        width: 1px;
        background: white;
        box-shadow: var(--neon-box-shadow);

        animation: 200ms ease-out 0s 1 flickerIn;
    }

    /* ====================
     *    Main Feed
     * =================== */

    /* ===== Header of feeds (e.g. the main feed) styling ===== */

    .tabs-bar__wrapper {
        background: none;
    }

    .search__input {
        border-radius: 8px;
        outline: 1px solid hsl(227deg 16% 31%);
        outline-offset: -1px;
        background: hsl(224deg 16% 19%);
    }

    #tabs-bar__portal>button,
    .column-header__wrapper {
        border-radius: 8px
    }

    #tabs-bar__portal>button:after,
    .column-header__wrapper:after {
        content: "";
        position: absolute;
        inset: 0px;
        border-radius: inherit;
        border: 1px solid hsl(227deg 16% 31%);
        z-index: 2;
        pointer-events: none;
    }

    #tabs-bar__portal>button,
    .column-header__wrapper {
        backdrop-filter: blur(3px);
        background: hsla(227deg 16% 23% / 0.8);
        transition: box-shadow 200ms;
    }
    #tabs-bar__portal>button:hover,
    .column-header__wrapper:hover {
        box-shadow: var(--neon-box-shadow-small);
    }
    #tabs-bar__portal>button:hover:after,
    .column-header__wrapper:hover:after {
        border-color: hsl(227deg 16% 51%);
    }

    .column-back-button {
        background: none;
        border-radius: inherit;
    }
    .column-back-button:hover,
    .column-header__back-button:hover {
        text-decoration: none;
    }

    .column-header__wrapper.active {
        box-shadow: none;
    }

    .column-header,
    .column-header__button,
    .column-header__collapsible-inner,
    .column-header__back-button {
        background: none;
    }

    .column-header__button,
    .column-header__back-button {
        position: relative;
        min-width: 48px;
    }

    :is(#fake, .column-header__back-button) {
        padding: 0 15px;
    }

    .column-header__button:hover,
    .column-header__back-button:hover {
        color: white;
    }

    .column-header__button:before,
    .column-header__back-button:before {
        content: "";
        position: absolute;
        inset: 4px;
        border-radius: 8px;
        background: none;
        transition: background 200ms, color 200ms;
        z-index: -1;
    }

    .column-header__button:hover:before,
    .column-header__back-button:hover:before {
        background: hsla(227deg 16% 41% / 1);
    }

    .column-header__button.active {
        border-radius: 8px 8px 0 0;
    }

    .column-header__collapsible {
        background: hsl(227deg 16% 31%);
    }
    .column-header__collapsible,
    .announcements {
        border-radius: 0 0 8px 8px;
    }
    .announcements .announcements__mastodon {
        border-bottom-left-radius: inherit;
    }
    .column-header__collapsible:not(.collapsed)+.announcements {
        border-radius: 8px;
        margin-top: 20px;
    }

    /* The header has a z-index of 2, make sure this is in
     * its own stacking contect below the header.
     * Otherwise spoiler-button can show up above the header */
    .columns-area--mobile,
    .columns-area--mobile .column {
        z-index: 1;
        overflow: revert;
    }
    .columns-area--mobile .scrollable {
        background: none;
        contain: style;
        margin-top: 20px;
    }
    .explore__search-results,
    .explore__links {
        margin-top: 20px;
    }
    .columns-area--mobile {
        padding: 0 10px 10px;
        box-sizing: border-box;
    }

    .dismissable-banner {
        margin-top: 20px;
        border-radius: 8px;
        border: 1px solid hsl(224deg 16% 27%);
    }

    .dismissable-banner__action button {
        min-width: 40px;
        min-height: 40px;
    }

    /* ===== Posts styling ===== /*

    /* All these refer to posts, in feeds... */
    .columns-area--mobile article,
    /* the main post in post-detail-view */
    .columns-area--mobile .scrollable>div[tabindex="-1"],
    /* and preceeding and following posts in post-detail-view */
    .columns-area--mobile .scrollable>div>div[tabindex="-1"],

    /* not technically posts, but these explore / search result items should have the same styles */
    .explore__search-results .account,
    .explore__search-results .empty-column-indicator,
    .explore__links .dismissable-banner,
    .regeneration-indicator
    {
        margin-bottom: 20px;
        border: 1px solid hsl(227deg 16% 27%);
        background: hsl(227deg 16% 19%);
        border-radius: 8px;
    }

    .explore__search-results>button {
        margin-bottom: 20px;
        border: 1px solid hsl(227deg 16% 27%);
        border-radius: 8px;
        transition: background 200ms, box-shadow 200ms, color 200ms;
    }
    .explore__search-results>button:hover {
        box-shadow: var(--neon-box-shadow-small);
        color: white;
    }

    .explore__search-results .trends__item {
        border-bottom: none;
    }
    .explore__search-results .trends__item+div[tabindex="-1"] {
        margin-top: 20px
    }
    .explore__search-results .trends__item+.trends__item {
        border- : 1px solid hsl(224deg 16% 27%);
    }


    /* give the selected post in single-post-view a lighter background */
    .columns-area--mobile .scrollable>div[tabindex="-1"] {
        box-shadow: var(--neon-box-shadow-small);
        border-color: hsl(227deg 16% 51%);
        background: hsl(227deg 16% 23%);
    }

    /* remove bottom border on all kinds of posts */
    :where(.columns-area--mobile article,
           .columns-area--mobile .scrollable>div[tabindex="-1"],
           .columns-area--mobile .scrollable>div>div[tabindex="-1"]
    ) .status,
    /* follow notifications */
    .notification .account,
    /* and the "load more" button */
    .load-gap {
        border-bottom: none;
        border-radius: inherit;
    }

    .status__action-bar {
        margin-top: 8px;
        margin-bottom: -8px;
    }

    .status__action-bar,
    .detailed-status__action-bar {
        height: 40px;
    }

    :where(.status__action-bar, .detailed-status__action-bar) :is(button, .status__action-bar-dropdown, detailed-status__action-bar-dropdown) {
        height: 100% !important;
        min-width: 40px !important;
        border-radius: 8px;
    }
    .detailed-status__action-bar-dropdown span {
        height: 100%;
    }

    /* Make sure everything inside a post follows the border radius */
    .focusable,
    .columns-area--mobile article>div,
    .columns-area--mobile article>div>.notification.unread,
    .columns-area--mobile article>div>.notification.unread:before,
    .columns-area--mobile article>div>.status__wrapper.unread,
    .columns-area--mobile article>div>.status__wrapper.unread:before {
        border-radius: inherit;
    }

    .status__wrapper--filtered {
        border: none;
    }

    .column-subheading {
        background: none;
    }
    article>a {
        border-radius: inherit;
    }

    /* Edge cases for single status view */
    /* group of posts before the one opened post */
    .columns-area--mobile .scrollable>div:first-of-type:not([role=feed]):not(.account__section-headline):not([tabindex="-1"]) {
        border: none;
        background: none;
    }
    .columns-area--mobile .scrollable>div:first-of-type:not([role=feed]):not(.account__section-headline):first-child .status {
        border: none;
    }

    .detailed-status {
        background: none;
    }
    .detailed-status__action-bar {
        border-radius: 0 0 8px 8px;
        border: none;
        background: none;
    }

    /* Notifications / explore */

    article .account {
        border: none;
    }

    .account__section-headline,
    .notification__filter-bar {
        margin-top: -20px;
        padding-top: 40px;
        border-radius: 8px;
        border: 1px solid #393f4f;
    }

    .account__section-headline :is(button, a),
    .notification__filter-bar button {
        border-radius: inherit;
    }

    .account__section-headline :is(button, a) span,
    .notification__filter-bar button span,
    .notification__filter-bar button i {
        transition: color 200ms
    }
    .account__section-headline :is(button, a):hover span,
    .notification__filter-bar button:hover span,
    .notification__filter-bar button:hover i {
        color: white;
    }

    .notification__filter-bar button i:before {
        z-index: 1;
        position: relative;
    }
    .account__section-headline :is(button, a) span:before,
    .notification__filter-bar button span:before {
        mix-blend-mode: screen;
    }
    .account__section-headline :is(button, a) span:before,
    .notification__filter-bar button span:before,
    .notification__filter-bar button i:after {
        content: "";
        position: absolute;
        inset: 4px;
        background: transparent;
        border-radius: 8px;
        transition: background 200ms;
        z-index: 0;
    }
    .account__section-headline :is(button, a):hover span:before,
    .notification__filter-bar button:hover span:before,
    .notification__filter-bar button:hover i:after {
        background-color: hsla(227deg 16% 41% / 1);
    }

    /* Mentions use .status__wrapper directly, all other notifications are wrapped in a .notification div */
    .status.unread:after,
    .notification.unread:after {
        content: "";
        position: absolute;
        top: 4px;
        bottom: 4px;
        left: 2px;
        width: 1px;
        background: white;
        box-shadow: var(--neon-box-shadow);
        z-index: -1;
    }

    .notification-favourite,
    .status[data-favourited-by] {
        background: rgba(202 143 4 / 0.05);
    }
    :is(
        #fake,
        .notification-favourite,
        .status[data-favourited-by]
    ):before {
        border-color: rgba(202 143 4 / 1);
    }

    .notification-follow, .notification-follow-request {
        border-bottom: none;
    }
    .notification-follow,
    .notification-reblog {
        background: rgba(140 141 255 / 0.05);
    }
    :is(#fake, .notification-follow, .notification-reblog):before {
        border-color: rgba(140 141 255 / 1);
    }

    .status.unread:before {
        border-color: hsl(239deg 100% 90%);
    }

    .notification.unread:before, .status.unread:before {
        border-radius: inherit;
    }

    /* ===== Profile ===== */

    .account-timeline__header {
        margin-bottom: 20px;
        border-radius: 8px;
        outline: 1px solid #393f4f;
        outline-offset: -1px;
        background: #1f232b;
    }
    .account__header,
    .account__header__bar {
        border-radius: inherit;
    }

    .account__header__bar {
        border-bottom: none;
    }
    .account__action-bar {
        border-top: none;
    }

    .account__action-bar__tab {
        border-style: solid;
        border-width: 0 1px 4px 1px;
        border-color: transparent
    }

    .account__action-bar,
    .account__action-bar__tab.active {
        border-radius: 0 0 8px 8px;
    }
    .account__action-bar__tab.active {
        border-color: #42485a;
        border-bottom-color: #6364ff;
    }

    .account__header__bio .account__header__fields {
        border-radius: 8px;
        margin: 10px;
        border: 1px solid #42485a;
    }

    .account__header__fields dl:first-of-type {
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
    }
    .account__header__fields dl:last-of-type {
        border-bottom-left-radius: inherit;
        border-bottom-right-radius: inherit;
    }

    .account__header__fields dt {
        border-top-left-radius: inherit;
        border-bottom-left-radius: inherit;
        width: 200px;
    }

    .account__header__fields dd.verified {
        border-radius: 2px
    }

    :is(#fake, .account__header__fields dd) {
        border-top-right-radius: inherit;
        border-bottom-right-radius: inherit;
    }

    /* Make sure the "joined at..." date aligns with the text above it */
    :is(#fake, .account__header__joined) {
        padding: 5px 15px;
    }

    .account__section-headline:not(:first-child) {
        background: none;
        border: none;
    }

    .empty-column-indicator {
        border-radius: 8px;
    }

    /* discover */
    .explore__search-header+.scrollable .account__section-headline {
        margin-top: -40px;
        padding-top: 39px;
        background: #1f232b;
    }

    /* DMs */
    .conversation {
        border-bottom: none
    }
    .follow_requests-unlocked_explanation {
        background: none;
        margin-top: -20px;
    }
    .status.status-direct {
        outline: 1px solid hsl(225 15% 35% / 1);
        outline-offset: 0px;
    }

    /* Lists */
    .column-inline-form {
        margin-top: 20px;
        outline: 1px solid hsl(224deg 16% 27%);
        outline-offset: -1px;
        border-radius: 8px;
    }

    /* XY not found indicator */
    .regeneration-indicator {
        margin-top: 20px;
    }

    /* ===== About page ===== */

    .scrollable.about {
        margin-top: 0;
        padding: 20px 0px;
    }

    body:not(.layout-multiple-columns) .scrollable.about:before {
        content: "";
        display: block;
        position: relative;
        top: -20px;
        left: -10px;
        height: 48px;
        width: calc(100% + 20px);
        background: hsl(227deg 16% 23%);
        box-sizing: border-box;
        border-radius: 8px;
        border-left: 1px solid;
        border-right: 1px solid;
        border-color: hsl(227deg 16% 51%);
        clip-path: polygon(0 0, 5% 0%, 3% 85%, 5% 85%, 7% 0%, 9% 0%, 7% 85%, 9% 85%, 11% 0%, 100% 0, 100% 100%, 95% 100%, 97% 15%, 95% 15%, 93% 100%, 91% 100%, 93% 15%, 91% 15%, 89% 100%, 13% 100%, 14% 57.5%, 16% 57.5%, 15% 100%, 15% 85%, 88% 85%, 87% 100%, 89% 15%, 13% 15%, 11% 100%, 0 100%);
    }

    body.layout-multiple-columns .scrollable.about {
        padding-top: 0;
    }

    .about__header__hero.loaded.image {
        overflow: revert;
    }
    .about__header__hero.loaded .image__preview {
        display: revert;
        z-index: -1;
        filter: blur(5px);
        border-radius: inherit;
    }
    .about__header__hero.loaded img {
        border-radius: inherit;
    }
    .about__meta,
    .about__section,
    .about__domain-blocks {
        border-radius: 8px;
    }

    .about__section__title,
    .about__section__body {
        border-radius: inherit !important;
    }
    .about__section__body {
        margin-top: -20px;
        padding-top: 40px;
    }


    /* ===== Profile directory ===== */
     .account-card {
         margin: 20px 0 !important;
         border-radius: 8px;
         border: 1px solid hsl(224deg 16% 35%);
     }
     .account-card__permalink,
     .account-card__header,
     .account-card__header img{
         border-radius: inherit;
     }

     .account-card__header {
         padding: 0;
     }


    /* ====================
     *     Scrollbars
     * ==================== */

    html {
        scrollbar-color: hsl(227deg 16% 23%) rgba(0,0,0,.1);
    }

    ::-webkit-scrollbar {
        width: 12px;
        height: 12px;
    }

    ::-webkit-scrollbar-thumb {
        margin: 0 2px;
        width: 8px;
        background: hsl(227deg 16% 18%);
        border: 1px solid hsl(225deg 16% 28%);
        border-radius: 50px;

        transition: background-color 200ms;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: hsl(225deg 16% 28%);
        border-color: hsl(227deg 16% 38%);
    }

    ::-webkit-scrollbar-thumb:active {
        background: hsl(227deg 16% 38%);
        border-color: hsl(227deg 16% 48%);
    }

    ::-webkit-scrollbar-track {
        border: 0 #fff;
        border-radius: 8px;
        background: rgba(0,0,0,.1);
    }

    ::-webkit-scrollbar-track:active,
    ::-webkit-scrollbar-track:hover {
        background: hsl(224deg 16% 19%);
        background: rgba(0,0,0,.2);
    }

    ::-webkit-scrollbar-corner {
        background: transparent:
    }

    /* ====================
     *    Advanced View
     * ==================== */

    /* ===== General Changes ===== */

    .columns-area .drawer,
    .columns-area .drawer__inner:not(.darker)
    {
        overflow: revert;
    }
    .columns-area .drawer__pager {
        overflow-y: auto;
        overflow-x: hidden;
    }
    .columns-area .drawer__inner {
        height: auto;
        min-height: 100%;
    }

    .column, .drawer {
        padding: 10px;
    }


    /* Center the columns when space permits it, instead of having them left-aligned */
    body.layout-multiple-columns .columns-area>*:first-child {
        margin-left: auto;
        width: 350px;
    }
    body.layout-multiple-columns .columns-area>*:last-child {
        margin-right: auto;
    }

    /* ===== First column - search, Profile, compose form ===== */

    /* nav menu at the top of 1st column */
    body.layout-multiple-columns .drawer--header,
    body.layout-multiple-columns .drawer--header a,
    body.layout-multiple-columns .drawer__inner {
        border-radius: 8px;
    }

    body.layout-multiple-columns .drawer--header {
        border: 1px solid hsl(224deg 16% 35%);
    }

    body.layout-multiple-columns .drawer__inner {
        background: linear-gradient(180deg, transparent 50%, hsl(223deg 16% 32%));
    }

    /* The CI Theme hides the mastodon usually displayed here - let's replace it with something more thematically fitting */
    body.layout-multiple-columns .drawer__inner__mastodon {
        background: none;
        content: url(https://corteximplant.com/system/site_uploads/files/000/000/006/@1x/68f324b193475041.png);
        object-fit: contain;
        min-height: auto;
        object-position: bottom;
        display: revert;
        border-radius: inherit;
        -webkit-mask-image: url(${footerImgMask});
        -webkit-mask-size: contain;
        -webkit-mask-position: bottom;
        -webkit-mask-repeat: no-repeat
    }
    body.layout-multiple-columns .drawer__inner__mastodon img {
        display: none;
    }

    /* user profile info in the 1st column */
    body.layout-multiple-columns .drawer__inner .navigation-bar {
        background: hsl(223deg 16% 32%);
        border-radius: inherit;
    }

    body.layout-multiple-columns .column-header {
        background: hsl(227deg 16% 23%);
        border-radius: 8px;
    }

    /* Spacing between other columns' headers / content */
    body.layout-multiple-columns .column .scrollable {
        border-radius: 8px;
    }
    body.layout-multiple-columns .column .scrollable:not(:first-child) {
        margin-top: 10px;
    }

    /* "getting started" page */
    body.layout-multiple-columns .getting-started,
    .getting-started__wrapper,
    .getting-started .flex-spacer,
    .getting-started .column-link {
        background: none;
    }

    .getting-started .column-link {
        color: #d9e1e8;
        position: relative;
    }
    .getting-started .column-link:hover {
        color: white;
    }

    .getting-started .column-link:hover span:before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(to right, rgba(255 255 255 / 0.05), rgba(255 255 255 / 0.1));
        border-radius: 8px;

        animation:  200ms ease-out 0s 1 flickerIn;
    }
    .getting-started .column-link:hover span:after {
        content: "";
        position: absolute;
        top: 8px;
        right: 8px;
        bottom: 8px;
        width: 1px;
        background: white;
        box-shadow: var(--neon-box-shadow);

        animation: 200ms ease-out 0s 1 flickerIn;
    }


    .getting-started .link-footer {
        margin-top: auto;
        border-radius: inherit;
    }


    /* user badges */

    .account-role {
        position: relative;
        margin-top: 2px !important;
        /* Start a new stacking context */
        z-index: 1;

        --background-hsl: 225deg 10% 30%;
        --border-hsl: 227deg 16% 76%;
        --shine-hsl: 227deg 16% 54%;
        --antishine-hsl: 227deg 16% 10%;
    }

    .account-role::before,
    .account-role::after {
        content: "";
        position: absolute;
        border-radius: inherit;
        background-size: 300% 100%;
        animation: shine 5000ms infinite;
        background-position: -100% 50%;
    }

    /* border */
    .account-role::before {
        z-index: -2;
        inset: -1px;
        background-image: linear-gradient(60deg, transparent 0%, transparent 40%, hsla(var(--antishine-hsl) / 0.4) 50%, transparent 60%, transparent 100%), linear-gradient(hsl(var(--border-hsl)), hsl(var(--border-hsl)));
    }
    /* background */
    .account-role::after {
        z-index: -1;
        inset: 0px;
        background-image: linear-gradient(60deg, transparent 0%, transparent 45%, hsla(var(--shine-hsl) / 0.2) 55%, transparent 65%, transparent 100%), linear-gradient(hsl(var(--background-hsl)), hsl(var(--background-hsl)));
    }

    @keyframes shine {
        0%   { background-position: 100% 50%; }
        100% { background-position:   0% 50%; }
    }

}
`)

    GM_addStyle(`
/* Emoji picker bigger images */

.emoji-mart-category-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(42px, 1fr));
}
.emoji-mart-category button img,
.emoji-mart-category button span {
    width: 30px !important;
    height: 30px !important;
}

/* more comfy emoji picker icon */

.emoji-button>img {
    height: 0;
}
.emoji-button:after {
    content: "";
    background: url(https://corteximplant.com/system/custom_emojis/images/000/025/784/original/aa6fb2394bcb9f0a.png);
    filter: grayscale(100%);
    opacity: .8;
    display: block;
    margin: 0;
    width: 22px;
    height: 22px;
    background-size: contain;

    transition: filter 200ms, opacity 200ms;
}
.emoji-button:hover:after {
    filter: none;
    opacity: 1;
}
`)

    GM_addStyle(`
/* WARNING: This relies on :has and thus won't work well in FF (as of Jan 2023) */

/* reposition spoiler button to have the same position as the alt tag */
.spoiler-button--minified button {
    border-radius: 8px !important;
}
/* same for the "follows you" tag on profiles */
.account__header__info {
    top: 4px;
    left: 4px;
}
span.relationship-tag {
    border-radius: 8px;
    background: rgba(0 0 0 / 0.6);
    color: hsla(0 0% 100% / .7);
    opacity: 1;
}

/* Add "alt" indicator on images, gifs... */
.media-gallery__item:has(img[alt]):after,
.media-gallery__item:has(video[aria-label]):after{
    content: "alt";
    background: rgba(0 0 0 / 0.6);
    color: hsla(0 0% 100% / .7);
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 1;
    padding: 0 5px;
    border-radius: 8px;
    height: 27.1429px;
    display: flex;
    align-items: center;
    pointer-events: none;
}
/* ...and audio, videos */
.audio-player:has(canvas.audio-player__canvas[aria-label]) .video-player__buttons.right:before,
.video-player:has(video[aria-label]) .video-player__buttons.right:before{
    content: "alt";
    color: hsla(0 0% 100% / .7);
    padding: 0 5px;
    pointer-events: none;
}
`)


    GM_addStyle(`
/* WARNING: This relies on :has and thus won't work well in FF (as of Jan 2023) */

/* Glitch Effect on notifications */

.column-link--transparent:has(i+i) {
  position: relative;
  z-index: 2;
  --padding: 15px;
  --start: 25px;
  padding: var(--padding);

  text-decoration: none;
}

.column-link--transparent:has(i+i)::before,
.column-link--transparent:has(i+i)::after {
  content: attr(title);
  position: absolute;
  width: 110%;
  z-index: -1;
}

.column-link--transparent:has(i+i)::before {
  top: calc((10em / 60) + var(--padding));
  left: calc((15em / 60) + var(--padding) + var(--start));
  color: #6364ff;
  animation: paths 10s step-end infinite, opacity 10s step-end infinite,
    font 16s step-end infinite, movement 20s step-end infinite;
}

.column-link--transparent:has(i+i)::after {
  top: calc((5em / 60) + var(--padding));
  left: calc((-10em / 60) + var(--padding) + var(--start));
  color: #1bc7fb;
  animation: paths 10s step-end infinite, opacity 10s step-end infinite,
    font 14s step-end infinite, movement 16s step-end infinite;
}
.column-link--transparent:has(i+i) span {
  animation: paths 10s step-end infinite;
}

@keyframes paths {
  0% {
    clip-path: polygon(
      0% 43%,
      83% 43%,
      83% 22%,
      23% 22%,
      23% 24%,
      91% 24%,
      91% 26%,
      18% 26%,
      18% 83%,
      29% 83%,
      29% 17%,
      41% 17%,
      41% 39%,
      18% 39%,
      18% 82%,
      54% 82%,
      54% 88%,
      19% 88%,
      19% 4%,
      39% 4%,
      39% 14%,
      76% 14%,
      76% 52%,
      23% 52%,
      23% 35%,
      19% 35%,
      19% 8%,
      36% 8%,
      36% 31%,
      73% 31%,
      73% 16%,
      1% 16%,
      1% 56%,
      50% 56%,
      50% 8%
    );
  }

  5% {
    clip-path: polygon(
      0% 29%,
      44% 29%,
      44% 83%,
      94% 83%,
      94% 56%,
      11% 56%,
      11% 64%,
      94% 64%,
      94% 70%,
      88% 70%,
      88% 32%,
      18% 32%,
      18% 96%,
      10% 96%,
      10% 62%,
      9% 62%,
      9% 84%,
      68% 84%,
      68% 50%,
      52% 50%,
      52% 55%,
      35% 55%,
      35% 87%,
      25% 87%,
      25% 39%,
      15% 39%,
      15% 88%,
      52% 88%
    );
  }

  30% {
    clip-path: polygon(
      0% 53%,
      93% 53%,
      93% 62%,
      68% 62%,
      68% 37%,
      97% 37%,
      97% 89%,
      13% 89%,
      13% 45%,
      51% 45%,
      51% 88%,
      17% 88%,
      17% 54%,
      81% 54%,
      81% 75%,
      79% 75%,
      79% 76%,
      38% 76%,
      38% 28%,
      61% 28%,
      61% 12%,
      55% 12%,
      55% 62%,
      68% 62%,
      68% 51%,
      0% 51%,
      0% 92%,
      63% 92%,
      63% 4%,
      65% 4%
    );
  }

  45% {
    clip-path: polygon(
      0% 33%,
      2% 33%,
      2% 69%,
      58% 69%,
      58% 94%,
      55% 94%,
      55% 25%,
      33% 25%,
      33% 85%,
      16% 85%,
      16% 19%,
      5% 19%,
      5% 20%,
      79% 20%,
      79% 96%,
      93% 96%,
      93% 50%,
      5% 50%,
      5% 74%,
      55% 74%,
      55% 57%,
      96% 57%,
      96% 59%,
      87% 59%,
      87% 65%,
      82% 65%,
      82% 39%,
      63% 39%,
      63% 92%,
      4% 92%,
      4% 36%,
      24% 36%,
      24% 70%,
      1% 70%,
      1% 43%,
      15% 43%,
      15% 28%,
      23% 28%,
      23% 71%,
      90% 71%,
      90% 86%,
      97% 86%,
      97% 1%,
      60% 1%,
      60% 67%,
      71% 67%,
      71% 91%,
      17% 91%,
      17% 14%,
      39% 14%,
      39% 30%,
      58% 30%,
      58% 11%,
      52% 11%,
      52% 83%,
      68% 83%
    );
  }

  76% {
    clip-path: polygon(
      0% 26%,
      15% 26%,
      15% 73%,
      72% 73%,
      72% 70%,
      77% 70%,
      77% 75%,
      8% 75%,
      8% 42%,
      4% 42%,
      4% 61%,
      17% 61%,
      17% 12%,
      26% 12%,
      26% 63%,
      73% 63%,
      73% 43%,
      90% 43%,
      90% 67%,
      50% 67%,
      50% 41%,
      42% 41%,
      42% 46%,
      50% 46%,
      50% 84%,
      96% 84%,
      96% 78%,
      49% 78%,
      49% 25%,
      63% 25%,
      63% 14%
    );
  }

  90% {
    clip-path: polygon(
      0% 41%,
      13% 41%,
      13% 6%,
      87% 6%,
      87% 93%,
      10% 93%,
      10% 13%,
      89% 13%,
      89% 6%,
      3% 6%,
      3% 8%,
      16% 8%,
      16% 79%,
      0% 79%,
      0% 99%,
      92% 99%,
      92% 90%,
      5% 90%,
      5% 60%,
      0% 60%,
      0% 48%,
      89% 48%,
      89% 13%,
      80% 13%,
      80% 43%,
      95% 43%,
      95% 19%,
      80% 19%,
      80% 85%,
      38% 85%,
      38% 62%
    );
  }

  1%,
  7%,
  33%,
  47%,
  78%,
  93% {
    clip-path: none;
  }
}

@keyframes movement {
  0% {
    top: calc((0em / 60) + var(--padding));
    left: calc((-20em / 60) + var(--padding) + var(--start));
  }

  15% {
    top: calc((10em / 60) + var(--padding));
    left: calc((10em / 60) + var(--padding) + var(--start));
  }

  60% {
    top: calc((5em / 60) + var(--padding));
    left: calc((-10em / 60) + var(--padding) + var(--start));
  }

  75% {
    top: calc((-5em / 60) + var(--padding));
    left: calc((20em / 60) + var(--padding) + var(--start));
  }

  100% {
    top: calc((10em / 60) + var(--padding));
    left: calc((5em / 60) + var(--padding) + var(--start));
  }
}

@keyframes opacity {
  0% {
    opacity: 0.1;
  }

  5% {
    opacity: 0.7;
  }

  30% {
    opacity: 0.4;
  }

  45% {
    opacity: 0.6;
  }

  76% {
    opacity: 0.4;
  }

  90% {
    opacity: 0.8;
  }

  1%,
  7%,
  33%,
  47%,
  78%,
  93% {
    opacity: 0;
  }
}

@keyframes font {
  0% {
    font-weight: 100;
    color: #e0287d;
    filter: blur(3px);
  }

  20% {
    font-weight: 500;
    color: #fff;
    filter: blur(0);
  }

  50% {
    font-weight: 300;
    color: #1bc7fb;
    filter: blur(2px);
  }

  60% {
    font-weight: 700;
    color: #fff;
    filter: blur(0);
  }

  90% {
    font-weight: 500;
    color: #e0287d;
    filter: blur(6px);
  }
}
`)

    // This heavily relies on :has(), without it the styling has no effect due to the @supports query.
    // The :where(...):has(...) statement is used to select a bunch of wrappers that
    // would otherwise have overflow: hidden, and remove that while an image is hovered.
    //
    // This is mostly part of the Cortex-Implant Custom CSS by now, you shouldn't need this.
    GM_addStyle(`
/* Hover-Zoom for emotes */
@supports selector(:has(a, b)) {
  /* Temporarily disable overflow on elements restraining the images while hovering */
  :where(
    /* Toots */
    .status__content,
    :not(.reply-indicator__display-name)>.display-name,
    .status__display-name,

    /* Poll Option */
    label.poll__option,

    /* DMs */
    .conversation__content__names,
    .detailed-status__display-name,
    .detailed-status__display-name strong,
    .conversation__content__info,
    .conversation__content,

    /* Boosts */
    .status__prepend>span,

    /* follow notifications */
    .notification__message>span,
    .account__display-name strong,
    .account .account__display-name,

    /* Profiles */
    .account__header__tabs__name h1,
    .account__header__content,

    /* Profile Info Table */
    .account__header__fields dd,
    .account__header__fields dt,

    /* Replying to a toot - body only */
    .reply-indicator,
    .reply-indicator__content,
    .status__content,

    /* Picture in picture player */
    .picture-in-picture__header__account,
    .picture-in-picture__header .display-name span,
    .picture-in-picture__header .display-name strong
  ):has(img.emojione:hover) {
    overflow: revert;
  }

  /* Add Transition to make it look nice */
  :not(
    .reply-indicator__header strong,
    .emoji-button,
    .reactions-bar__item__emoji
  )>img.emojione {
    transition:
      transform 200ms,
      opacity 200ms;
  }
  /* Finally, scale emojis on hover and make sure they're fully visible */
  :not(
    .reply-indicator__header strong,
    .emoji-button,
    .reactions-bar__item__emoji
  )>img.emojione:hover
  {
    transform: scale(5);
    opacity: 1;
    z-index: 2;
    position: relative;
  }
}
`)
})();
