// ==UserScript==
// @name         CortexImplant CSS Improvements
// @namespace    http://tampermonkey.net/
// @version      1.2
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
 */

(function() {
    'use strict';

    // Use TamperMonkey's helper to inject CSS
    // see https://codepen.io/mattgrosswork/pen/VwprebG

    // alpha mask of the people and the logo from the header image
    const footerImgMask = "data:image/avif;base64,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"

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

.status__content--with-action {
    margin-top: -72px;
    padding-top: 72px;
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
.status__info a {
    z-index: 1;
    position: relative;
}

#mastodon[data-props='{"locale":"de"}'] .compose-form__publish-button-wrapper > .button::after {
    content: "Cybertrööt!"
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
    .dropdown-menu.bottom {
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

    .column-header__back-button:last-child {
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
        border-radius: 0 0 8px 8px;
        background: hsl(227deg 16% 31%);
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
    .columns-area--mobile {
        padding: 0 10px 10px;
        box-sizing: border-box;
    }

    /* ===== Posts styling ===== /*

    /* All these refer to posts, in feeds... */
    .columns-area--mobile article,
    /* the main post in post-detail-view */
    .columns-area--mobile .scrollable>div[tabindex="-1"],
    /* and preceeding and following posts in post-detail-view */
    .columns-area--mobile .scrollable>div>div[tabindex="-1"]
    {
        margin-bottom: 20px;
        border: 1px solid hsl(227deg 16% 27%);
        background: hsl(227deg 16% 19%);
        border-radius: 8px;
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
    /* and the "load more" button */
    .load-gap {
        border-bottom: none;
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


    /* Lists are still TODO because I don't use them */
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

    /* Notifications */

    .notification__filter-bar,
    .account__section-headline {
        margin-top: -20px;
        padding-top: 40px;
        border-radius: 8px;
        border: 1px solid #393f4f;
    }

    .notification__filter-bar button {
        /* background: none;*/
        border-radius: inherit;
    }

    .notification__filter-bar button span,
    .notification__filter-bar button i {
        transition: color 200ms
    }
    .notification__filter-bar button:hover span,
    .notification__filter-bar button:hover i {
        color: white;
    }

    .notification__filter-bar button i:before {
        z-index: 1;
        position: relative;
    }
    .notification__filter-bar button span:before {
        mix-blend-mode: screen;
    }
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
    .notification__filter-bar button:hover span:before,
    .notification__filter-bar button:hover i:after {
        background-color: hsla(227deg 16% 41% / 1);
    }

    /* Mentions use .status__wrapper directly, all other notifications are wrapped in a .notification div */
    .status__wrapper.unread:after,
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

    .notification-favourite {
        background: rgba(202 143 4 / 0.05);
    }
    :is(#fake, .notification-favourite):before {
        border-color: rgba(202 143 4 / 1);
    }

    .notification-follow,
    .notification-reblog {
        background: rgba(140 141 255 / 0.05);
    }
    :is(#fake, .notification-follow, .notification-reblog):before {
        border-color: rgba(140 141 255 / 1);
    }

    .status__wrapper.unread:before {
        border-color: hsl(239deg 100% 90%);
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

    .account__section-headline:not(:first-child) {
        background: none;
        border: none;
    }

    /* discover */
    .explore__search-header+.scrollable .account__section-headline {
        margin-top: -40px;
        padding-top: 39px;
        background: #1f232b;
    }

    /* Link previews */
    .status-card {
        border-radius: 8px;
    }

    /* DMs */
    .conversation {
        border-bottom: none
    }
    .follow_requests-unlocked_explanation {
        background: none;
        margin-top: -20px;
    }

    /* Lists */
    .column-inline-form {
        margin-top: 20px;
        outline: 1px solid hsl(224deg 16% 27%);
        outline-offset: -1px;
        border-radius: 8px;
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
     *    Glow on Media
     * ==================== */

    @keyframes fadeIn {
        0%   { opacity: 0; }
        100% { opacity: 1; }
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
    body.layout-multiple-columns .drawer__header,
    body.layout-multiple-columns .drawer__header a,
    body.layout-multiple-columns .drawer__inner {
        border-radius: 8px;
    }

    body.layout-multiple-columns .drawer__header {
        border: 1px solid hsl(224deg 16% 35%);
    }

    body.layout-multiple-columns .drawer__inner {
        background: linear-gradient(180deg, transparent 50%, hsl(223deg 16% 32%));
    }

    /* The CI Theme hides the mastodon usually displayed here - let's replace it with something more thematically fitting */
    body.layout-multiple-columns .drawer__inner__mastodon {
        background: none;
        content: url(https://cdn.masto.host/corteximplantcom/site_uploads/files/000/000/006/@1x/68f324b193475041.png);
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
    background: url(https://cdn.masto.host/corteximplantcom/custom_emojis/images/000/025/784/original/aa6fb2394bcb9f0a.png);
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
/* hide main logos */
a.column-link.column-link--logo svg,
svg.logo {
    display: none;
}

/* Replace with Coretex Implant logo */
a.column-link.column-link--logo:before,
a.ui__header__logo:before {
    content: "";
    object-fit: contain;
    background: url("https://mikoshi.obeythesystem.com/index.php/apps/files_sharing/publicpreview/dEytn3JLdqSEj3t?x=2864&y=824&a=true&file=logo.png&scalingup=0");
    display: block;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    margin: -10px;
}

a.column-link.column-link--logo:before {
    height: 48px;
}

a.ui__header__logo:before {
    height: 25px;
    aspect-ratio: 1923/242;
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
