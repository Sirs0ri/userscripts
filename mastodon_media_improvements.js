// ==UserScript==
// @name         CortexImplant CSS Improvements
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  Improve how media is shown on Mastodon
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
 * 0.8: Alt-Text improvements: you'll now see an [alt] badge in the top-right corner of media with alt text
 * 0.7: The "I've not had enough coffee yet" update
 *    - part 2 of the 0.6 update, I missed some things.
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

(function () {
  "use strict"

  // Use TamperMonkey's helper to inject CSS
  // This heavily relies on :has(), without it the styling has no effect due to the @supports query.

  GM_addStyle(`
/* Add "alt" indicator on images, gifs... */
.media-gallery__item:has(img[alt]):after,
.media-gallery__item:has(video[aria-label]):after{
    content: "alt";
    background: rgba(0 0 0 / 0.6);
    color: hsla(0,0%,100%,.7);
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 1;
    padding: 0 5px;
    border-radius: 4px;
    height: 27.1429px;
    display: flex;
    align-items: center;
}
/* ...and audio, videos */
.audio-player:has(canvas.audio-player__canvas[aria-label]) .video-player__buttons.right:before,
.video-player:has(video[aria-label]) .video-player__buttons.right:before{
    content: "alt";
    color: hsla(0,0%,100%,.7);
    padding: 0 5px;
}
`)

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
  )>img.emojione:hover {
    transform: scale(5);
    opacity: 1;
    z-index: 2;
    position: relative;
  }
}
`)
})()
