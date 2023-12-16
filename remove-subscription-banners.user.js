// ==UserScript==
// @name         Block Pay2Win Banners
// @namespace    https://github.com/Sirs0ri/userscripts
// @version      1.1.0
// @description  Removes nagging "Subscribe or let us sell your data" banners
// @author       https://corteximplant.com/@Sirs0ri
// @updateURL    https://raw.githubusercontent.com/Sirs0ri/userscripts/main/remove-subscription-banners.user.js
// @downloadURL  https://raw.githubusercontent.com/Sirs0ri/userscripts/main/remove-subscription-banners.user.js
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if (!window._sp_?.destroyMessages) return

    const listener = () => {
        window.requestAnimationFrame(() => {
            console.warn("Hooray! Pay2win banner removed")
            window._sp_.destroyMessages()
        })
    }
    window._sp_.addEventListener("onMessageReady", listener)
})();
