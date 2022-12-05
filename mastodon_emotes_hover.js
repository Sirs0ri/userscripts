// ==UserScript==
// @name         CortexImplant CSS Improvements
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Improve icons' visibility on hover
// @author       @Sirs0ri
// @match        https://corteximplant.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=corteximplant.com
// @supportURL   https://github.com/Sirs0ri/userscripts/issues
// @grant        GM_addStyle
// ==/UserScript==

/* 
 * ==KNOWN ISSUES==
 *    - This straight up removes overflow: hidden on the emoji's parents,
 *      I'd be surprised if that *doesn't* break something!
 *    - Firefox doesn't support :has() yet, unless you manually turn it on via the layout.css.has-selector.enabled flag
 *
 * ==CHANGES==
 * 0.2: The "all the small things I missed" patch
 *    - Add support for DMs, Boots, Notifications, Profiles
 *    - In addition to zooming, make sure hovered icons are in front of other content and fully opaque
 *    - Since this heavly relies on the relatively new :has() CSS selector, disable the styling when :has() isn't supported
 *    - Improve documentation
 *
 * 0.1: initial release
 *    - Add highlight-on-hover to emojione emotes in toots
 */

(function() {
    'use strict';

    // Use TamperMonkey's helper to inject CSS
    // This heavily relies on :has(), without it the styling has no effect due to the @supports query.
    // The :where(...):has(...) statement is used to select a bunch of wrappers that
    // would otherwise have overflow: hidden, and remove that while an image is hovered.
    GM_addStyle(`
@supports selector(:has(a, b)) {
  /* Temporarily disable overflow on elements restraining the images while hovering */
  :where(
    /* Toots */
    .status__content,
    .display-name,
    .status__display-name,

    /* DMs */
    .conversation__content__names,
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
    .account__header__fields dt
  ):has(img.emojione:hover) {
    overflow: revert;
  }

  /* Add Transition to make it look nice */
  :not(.emoji-button)>img.emojione {
    transition:
      transform 200ms,
      opacity 200ms;
  }
  /* Finally, scale emojis on hover and make sure they're fully visible */
  :not(.emoji-button)>img.emojione:hover {
    transform: scale(5);
    opacity: 1;
    z-index: 1;
    position: relative;
  }
}
`)
})();
