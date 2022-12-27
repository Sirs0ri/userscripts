// ==UserScript==
// @name         CortexImplant CSS Improvements
// @namespace    http://tampermonkey.net/
// @version      0.6
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
 * 0.6: Disable zoom on account name of a person you're draftign a reply to
 * 0.5: A couple more fixes to correctly enable zoom on:
 *    - Poll Options
 *    - Profile Info
 *    - Replies
 *    - Picture-in-picture player
 *    - Response-draft
 * 0.4: The "I'm testing in production" hotfix
 *    - Increased emoji's z-index to 2, to pull them on top of embedded images in toots
 * 0.3: The "one more thing" update
 *    - Add a selector I missed for the currently selected DM/Toot
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

  /* X when drafting a response, this is by default 25.x px high and would cause a layout shift with changed overflow */
  .reply-indicator__cancel {
    height: 24px
  }

  /* Add Transition to make it look nice */
  :not(
    .emoji-button,
    .reactions-bar__item__emoji
  )>img.emojione {
    transition:
      transform 200ms,
      opacity 200ms;
  }
  /* Finally, scale emojis on hover and make sure they're fully visible */
  :not(
    .emoji-button,
    .reactions-bar__item__emoji
  )>img.emojione:hover {
    transform: scale(5);
    opacity: 1;
    z-index: 2;
    position: relative;
  }
}
`)
})();
