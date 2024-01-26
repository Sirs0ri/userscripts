// ==UserScript==
// @name         Toot button states
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  Add better distinguishable "disabled" and "hover" states to a toot button with a colorful background
// @updateURL    https://raw.githubusercontent.com/Sirs0ri/userscripts/main/themed-toot-button-states.js
// @downloadURL  https://raw.githubusercontent.com/Sirs0ri/userscripts/main/themed-toot-button-states.js
// @author       Sirs0ri
// @match        https://corteximplant.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=corteximplant.com
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(`
:where(.compose-form__publish-button-wrapper button, .ui__header__links .button):after {
    z-index: 1;
}
:where(.compose-form__publish-button-wrapper button, .ui__header__links .button):before {
    content: "";
    position: absolute;
    inset: -1px;
    transition: opacity 200ms;
    opacity: 0;
}
:where(.compose-form__publish-button-wrapper button, .ui__header__links .button)[disabled]:before {
    backdrop-filter: saturate(0.65) brightness(1.4) contrast(0.75) blur(1px);
    opacity: 1;
}
:where(.compose-form__publish-button-wrapper button, .ui__header__links .button)[disabled]:hover:before {
    opacity: 0.5;
}
`)
})();
