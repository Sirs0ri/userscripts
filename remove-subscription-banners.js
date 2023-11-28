// ==UserScript==
// @name         Block Pay2Win Banners
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Removes nagging "Subscribe or let us sell your data" banners
// @author       https://corteximplant.com/@Sirs0ri
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if (!window._sp_?.destroyMessaging) return

    const listener = () => {
        window.requestAnimationFrame(() => {
            console.warn("Hooray! Pay2win banner removed")
            window._sp_.destroyMessaging()
        })
    }
    window._sp_.addEventListener("onMessageReady", listener)
})();
