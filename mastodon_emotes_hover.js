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
 */

(function() {
    'use strict';

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
