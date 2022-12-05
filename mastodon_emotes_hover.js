// ==UserScript==
// @name         CortexImplant CSS Improvements
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://corteximplant.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=corteximplant.com
// @grant        GM_addStyle
// ==/UserScript==

/*
 * Add a hover-preview for emojione emotes.
 * This straight up removes overflow: hidden on the emoji's parents,
 * I'd be surprised if that *doesn't* break something!
 *
 * Known Issues:
 *   - Emojis in a username work in chrome, but not in Firefox
 *   - Emojis in a user's bio are still clipped by some `pverflow: hidden`
 *   - the :has() CSS selector is relatively new and not yet fully supported in FF (as of 2022-12-06)
 *   - doesn't work for "X now follows you" notifications
 */

(function() {
    'use strict';

    // Use TamperMonkeys helper to inject CSS:
    GM_addStyle(`
:is(
  .status__content,
  .display-name,
  .status__display-name
):has(img.emojione:hover) {
    overflow: revert;
}
:not(.emoji-button)>img.emojione {
    transition: transform 200ms;
}
:not(.emoji-button)>img.emojione:hover {
    transform: scale(5);
}
`)
})();
