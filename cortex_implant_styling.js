// ==UserScript==
// @name         CortexImplant CSS Improvements
// @namespace    http://tampermonkey.net/
// @version      1.4.2
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

    // This will enable full-sized images inposts / disable cropping images to 16/9
    const showImagesUncropped = true

    // Add a visible red bar underneath media without an alt-text
    const highlightMediaWithoutAlt = true

    // Make the compose box larger when focussed. This will have no effect in the Advanced View.
    const popoutComposeBox = false

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
    transition: transform 750ms cubic-bezier(0.82, 0.35, 0.31, 1.1), color 750ms;
    animation: none !important;
}
.no-reduce-motion .icon-button.star-icon.deactivate>.fa-star {
    transform: rotate(0turn);
}
.no-reduce-motion .icon-button.star-icon.active>.fa-star,
.no-reduce-motion .icon-button.star-icon.activate>.fa-star {
    transform: rotate(2.4turn);
}

/* improve visibility of mentions */
a.mention {
    background: rgba(255 255 255 / 0.1);
    border-radius: 4px;
    padding: 0 2px;
}
`)

    showImagesUncropped && GM_addStyle(`
/* Forge all images to be in their original aspect ratio, not 16/9 */

.status {
    display: flex;
    flex-direction: column;
}

.status .media-gallery:not(:has(.media-gallery__item + .media-gallery__item)):has(.spoiler-button--minified) {
    height: auto !important;
}

.status .media-gallery:not(:has(.media-gallery__item + .media-gallery__item)) img {
    display: block;
}
`)

    enableGlowOnMedia && GM_addStyle(`
/* ====================
 *    Glow on Media
 * ==================== */

 /* Important note for glitch-fork users:

 it's HIGHLY recommended to disable the following
 options in the "app settings" (left sidebar):
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

/* Show thumbnails in un-spoilered posts */
.status__content__spoiler--visible + .status-card .status-card__image-image {
        visibility: visible !important;
}
    `)

    highlightMediaWithoutAlt && GM_addStyle(`
/* inspired von chaos.social:
markiere medien ohne alt-text*/
.audio-player__canvas:not([title]),
.audio-player__canvas[title=""],
.media-gallery__gifv video:not([title]),
.media-gallery__gifv video[title=""],
.media-gallery__item-thumbnail img:not([alt]),
.media-gallery__item-thumbnail img[alt=""],
.video-player video:not([title]),
.video-player video[title=""] {
    border-bottom: 4px ridge red;
    box-sizing: border-box;
    border-radius: inherit;
}
    `)

    const onLoadHandler = () => {
        let composePanel = document.querySelector(".columns-area__panels__pane--compositional")
        let composeForm = document.querySelector(".compose-form")
        let backDrop = document.querySelector(".compose-form")

        if (!composePanel || !composeForm || !backDrop) {
            console.warn("an element is missing, the popout compose box can't be initialized.")
            console.log(composePanel)
            console.log(composeForm)
            console.log(backDrop)
            return
        }

        backDrop.classList.add("ignore-clicks")


        const handlerIn = (evt) => {
            /* Ignore clicks on the buttons below the compose area */
            if (event.target.nodeName === "BUTTON" || event.target.classList.contains("emoji-button")) return

            /* Ignore FocusEvents where the focus was moved automatically, e.g. when restoring focus to the page.
             * This also keeps the input small when the user's first interaction is via the emote picker, but any
             * input afterwards will extend it, so that it's not too bad a compromise.
             */
            if (event instanceof FocusEvent && event.target.classList.contains("autosuggest-textarea__textarea") && !evt.sourceCapabilities) return

            composePanel = document.querySelector(".columns-area__panels__pane--compositional")
            composePanel.classList.add("user-focus-within")
            setTimeout(() => {
                backDrop = document.querySelector(".compose-form")
                backDrop.classList.remove("ignore-clicks")
            }, 100)
        }
        const handlerOut = (evt) => {
            if (event.relatedTarget.classList.contains("emoji-button")) return
            /* Ignore FocusEvents that take the focus out of the tab */
            if (evt.relatedTarget == null) return
            /* Ignore clicks that move focus to the buttons below the compose area */
            if (composeForm.contains(event.relatedTarget)) return
            /* ignore focus-out events from anything that's not the toot- or CW-input */
            if (!(event.target.classList.contains("autosuggest-textarea__textarea") || event.target.classList.contains("spoiler-input__input") )) return


            composePanel.classList.add("user-focus-within")
            backDrop = document.querySelector(".compose-form")

            composePanel.classList.remove("user-focus-within")
            backDrop.classList.add("ignore-clicks")
        }
        const handlerBackdropClick = (evt) => {
            if (composeForm.contains(document.activeElement)) return

            console.log("bg", document.activeElement, evt)
            // This should only be handled if the user clicked on the backdrop, ie. the compose-form's :before element.
            // Since pseudoelements can't be targeted directly, this handler has to be registered on the parent, and
            // the class "ignore-clicks" is used to mimic the :before's pointer-events: none;
            if (evt.target !== backDrop) return
            if (evt.target.classList.contains("ignore-clicks")) return

            // composePanel.classList.add("user-focus-within")
            backDrop = document.querySelector(".compose-form")

            composePanel.classList.remove("user-focus-within")
            backDrop.classList.add("ignore-clicks")
        }

        composeForm.addEventListener("focusin", handlerIn)
        composeForm.addEventListener("focusout", handlerOut)
        composeForm.addEventListener("input", handlerIn)
        backDrop.addEventListener("click", handlerBackdropClick)
    }

    // register initial event hander
    popoutComposeBox && addEventListener("load", onLoadHandler, {once: true} )

    let currentInnerWidth = innerWidth
    const desktopMinWidth = 1175

    const resizeHandler = (evt) => {
        /* As soon the screen is resized from from a size lower than the mobile breakpoint to one larger... */
        if (currentInnerWidth < desktopMinWidth && innerWidth >= desktopMinWidth) {
            /* ...wait for DOM to update, then re-register the event handlers from onLoadHandler */
            setTimeout(() => onLoadHandler(), 0)
        }
        currentInnerWidth = innerWidth
    }

    popoutComposeBox && addEventListener("resize", resizeHandler)

    // load relevant styles
    popoutComposeBox && GM_addStyle(`
@media screen and (min-width: 1175px) {

    .navigation-bar {
        z-index: 3;
    }

    .columns-area__panels__pane--compositional {
        z-index: 3;
    }

    .compose-form {
        position: relative;
        width: 100%;
        transition: width 200ms, margin-left 200ms;
    }

    .user-focus-within .compose-form {
        --width: clamp(100%, calc( ( 100vw - clamp(0px, calc(4vw - 48px), 50px) - 600px ) / 2 - 20px), 450px);
        width: var(--width);
        margin-left: calc( 285px - var(--width));
        z-index: 2;
    }

    .compose-form:before {
        content: "";
        position: fixed;
        inset: 0;
        background-color: rgba(0 0 0 / 0);
        z-index: -1;
        pointer-events: none;
        transition: background-color 200ms;
    }

    .user-focus-within .compose-form:before {
        background-color: rgba(0 0 0 / 0.25);
        pointer-events: all;
    }

    .autosuggest-textarea__textarea {
        transition: min-height 200ms;
    }
    .user-focus-within .autosuggest-textarea__textarea {
        min-height: 200px !important;
    }

    .link-footer {
        margin-top: auto
    }
}
    `)

    // alpha mask of the people and the logo from the header image
    const footerImgMask = "data:image/avif;base64,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"
    // The CORTEX IMPLANT Logo
    const logoSvg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOTIzIiBoZWlnaHQ9IjI0MiI+PGRlZnM+PHBhdGggaWQ9InByZWZpeF9fYSIgZD0iTTAgMGg2djgwSDB6Ii8+PHBhdGggaWQ9InByZWZpeF9fYyIgZD0iTTAgMGgxMXY4MEgweiIvPjxwYXRoIGlkPSJwcmVmaXhfX2IiIGQ9Ik0wIDBoMTZ2ODBIMHoiLz48L2RlZnM+PGcgZmlsbD0iI2ZmZiI+PGcgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMjcgMTdoMTU1bC0xMyAzNUg2NmwzMiA0N2g1M2wtMTMgMzVIODBMMTcgNDN6bTE2NSAwaDEzM2wtNDYgMTE3SDE0NnptMjQgMzVoNThsLTE4IDQ3aC01OHptMTE5LTM1aDExOWwtMjggNzRoLTE2bC0xNC0xOSA3LTIwaC0zMWwzMyA0N2g3MWwtMTQgMzZoLTc1bC0zOS01NS0yMSA1NGgtMzd6bTEyOSAwaDE0MWwtMTMgMzVoLTUwbC0zMSA4MmgtMzdsMzEtODJoLTU0em0xNTAgMGgxNDRsLTEzIDM1aC05NGw0IDZoODhsLTEzIDM1aC05M2wtMzQtNDh6bS0yMCA0N2gxNWwyNCAzNWg5NGwtMTQgMzZoLTk3bC0zMS00NXptMTc1LTQ3aDM4bC05IDI0IDEyIDE3aDM5bDE1LTEyIDEyLTI5aDM3bC0xOSA1MS0yMSAxNiAxNSAyMS0xMiAzMWgtMzdsMTAtMjYtMTItMTdoLTQ2bC0xOCAxNC0xMSAyOWgtMzhsMTktNTAgMjgtMjItMTMtMTh6TTk5MSAxN2gzN2wtNDUgMTE5aC0zNnptNDcgMGgxNDZsLTQ1IDExN2gtMzdsMzEtODJoLTE2bC0xNyA0NWgtMzhsMTgtNDVoLTE5bC0zMSA4MmgtMzd6bTE1NiAwaDExOWwtMzAgNzgtMjggMTloLTYybC04IDIwaC0zN3ptMjMgMzVoNDVsLTggMjAgNSA2aC01MnptMTA0LTM1aDM4bC0zMiA4MmgxMDNsLTEzIDM1aC0xNDF6bTE1MCAwaDE0MmwtNDUgMTE4aC0zN2wzMS04M2gtNjdsLTE1IDQxIDM5LTI4IDI1IDI1LTU4IDQ0aC02MHptMTUxIDBoMTMzbC00NSAxMTdoLTM3bDMxLTgyaC01OGwtMzEgODJoLTM4em0xNDMgMGgxNDFsLTEzIDM1aC01MGwtMzEgODJoLTM3bDMxLTgyaC01NHoiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxNDUpIj48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9Ijc5Ii8+PHVzZSBocmVmPSIjcHJlZml4X19iIiB4PSIxMDIiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2MiIHg9IjEyNCIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYSIgeD0iMTQxIi8+PHVzZSBocmVmPSIjcHJlZml4X19hIiB4PSIxNjQiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2MiIHg9IjE3NiIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYSIgeD0iMjA0Ii8+PHVzZSBocmVmPSIjcHJlZml4X19jIiB4PSIyMjciLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9IjI0NCIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYiIgeD0iMjY3Ii8+PHVzZSBocmVmPSIjcHJlZml4X19jIiB4PSIyODkiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9IjMwNiIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYyIgeD0iMzI5Ii8+PHVzZSBocmVmPSIjcHJlZml4X19iIiB4PSIzNDciLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9IjM4MSIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYyIgeD0iMzkyIi8+PHVzZSBocmVmPSIjcHJlZml4X19hIiB4PSI0MjEiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9IjQzMiIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYSIgeD0iNDU1Ii8+PHVzZSBocmVmPSIjcHJlZml4X19jIiB4PSI0NzgiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9IjQ5NCIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYyIgeD0iNTE4Ii8+PHVzZSBocmVmPSIjcHJlZml4X19iIiB4PSI1MzUiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9IjU1NyIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYiIgeD0iNTgxIi8+PHVzZSBocmVmPSIjcHJlZml4X19jIiB4PSI2MDMiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9IjYyMCIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYyIgeD0iNjQzIi8+PHVzZSBocmVmPSIjcHJlZml4X19iIiB4PSI2NjAiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9IjY4MyIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYyIgeD0iNzA1Ii8+PHVzZSBocmVmPSIjcHJlZml4X19iIiB4PSI3MjMiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9Ijc1NyIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYSIgeD0iNzY4Ii8+PHVzZSBocmVmPSIjcHJlZml4X19jIiB4PSI3OTEiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9IjgwOCIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYSIgeD0iODMxIi8+PHVzZSBocmVmPSIjcHJlZml4X19iIiB4PSI4NDMiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2MiIHg9Ijg2NSIvPjwvZz48cGF0aCBkPSJNOTQ0IDE0OGgxMXY0MWgtMTF6bTUwIDBoMTJjMSA0NiAyIDY3LTQzIDc3bC04LTEwYzI0LTQgMzktMTIgMzktMzh6bTYzLTRsMTMgOCAxMSAxMC0xMCA4LTIxLTE4em02MCAxMmw3IDhjLTE0IDM3LTU3IDUzLTcwIDU2bC03LTEwYzMyLTExIDU3LTIzIDcwLTU0em01OC03aDU1Yy0zIDQ2LTI4IDYyLTU1IDc2bC05LThjMTktOSA0Ny0yNCA1Mi01OWgtMzRjLTYgOC0xMSAxNC0yMSAyMWwtOC02YzktNiAxNy0xNiAyMC0yNG0xMDctNWgxMXYyOWw2LTVjMTQgMyAyNiA4IDM5IDE1bC05IDhjLTExLTctMjMtMTItMzYtMTZ2NDloLTExem00MyAybDMtMSA0IDExLTMgMnptOC0xbDMtMSA1IDEwLTMgMnptNDQgMzJoOHY5aC04em00NS0yNmg3NmMtMyAzMi0zMSA0NS0zOSA1MmwtOC04YzE2LTggMzUtMjcgMzEtMzRoLTYwem0xOSAzM2MxOSAxNCAyNSAyMSAzNCAzNmwtOSA0Yy0xMC0xNS0xOC0yNS0zMi0zNHptMTU5LTM5bDEwIDdjLTIzIDIyLTQzIDM0LTc0IDQ3bC04LTljMjMtOSA1Ni0yNyA3Mi00NXptLTIyIDI3djUyaC0xMXYtNDV6bTcxLTI4YzExIDYgMTQgOSAyNCAxOGwtOSA5Yy03LTctMTMtMTMtMjEtMTh6bTYxIDEybDYgOGMtMTAgMzMtNDggNDktNjkgNTdsLTctMTFjMzEtMTAgNTctMjQgNzAtNTR6bTQzLTloNTljMSAzNi0yOCA2MC01NCA3N2wtMTAtOGMyOC0xMyA1My00NSA1MC01OWgtNDV6bTM4IDQyYzE2IDkgMjYgMTkgMzUgMzFsLTE0IDRjLTgtMTMtMjItMjQtMjctMjd6bTIzLTQ0bDQtMSA0IDEzLTQgMXptNi0ybDQtMiA1IDEyLTQgMnoiLz48L2c+PC9zdmc+"

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
.status__info__icons {
    height: 100%
}

#mastodon[data-props='{"locale":"de"}'] .compose-form__publish-button-wrapper > .button.primary::after {
    content: "Cybertrööt!"
}

/* center the "USERNAME boosted" text at the top of a toot */
.status__prepend {
    flex-grow: 0;
    align-self: center;
    margin-left: 26px;
    z-index: 1;
}

aside .status__display-name:hover {
    text-decoration: underline;
}

@keyframes statusPrependIcon {
    0%   { background-position: 0   0%; }
    20%  { background-position: 0 100%; }
    100% { background-position: 0 100%; }
}

.status__prepend .status__prepend-icon {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='22' height='209'><path d='M4.97 3.16c-.1.03-.17.1-.22.18L.8 8.24c-.2.3.03.78.4.8H3.6v2.68c0 4.26-.55 3.62 3.66 3.62h7.66l-2.3-2.84c-.03-.02-.03-.04-.05-.06H7.27c-.44 0-.72-.3-.72-.72v-2.7h2.5c.37.03.63-.48.4-.77L5.5 3.35c-.12-.17-.34-.25-.53-.2zm12.16.43c-.55-.02-1.32.02-2.4.02H7.1l2.32 2.85.03.06h5.25c.42 0 .72.28.72.72v2.7h-2.5c-.36.02-.56.54-.3.8l3.92 4.9c.18.25.6.25.78 0l3.94-4.9c.26-.28 0-.83-.37-.8H18.4v-2.7c0-3.15.4-3.62-1.25-3.66z' fill='%23606984' stroke-width='0'/><path d='M7.78 19.66c-.24.02-.44.25-.44.5v2.46h-.06c-1.08 0-1.86-.03-2.4-.03-1.64 0-1.25.43-1.25 3.65v4.47c0 4.26-.56 3.62 3.65 3.62H8.5l-1.3-1.06c-.1-.08-.18-.2-.2-.3-.02-.17.06-.35.2-.45l1.33-1.1H7.28c-.44 0-.72-.3-.72-.7v-4.48c0-.44.28-.72.72-.72h.06v2.5c0 .38.54.63.82.38l4.9-3.93c.25-.18.25-.6 0-.78l-4.9-3.92c-.1-.1-.24-.14-.38-.12zm9.34 2.93c-.54-.02-1.3.02-2.4.02h-1.25l1.3 1.07c.1.07.18.2.2.33.02.16-.06.3-.2.4l-1.33 1.1h1.28c.42 0 .72.28.72.72v4.47c0 .42-.3.72-.72.72h-.1v-2.47c0-.3-.3-.53-.6-.47-.07 0-.14.05-.2.1l-4.9 3.93c-.26.18-.26.6 0 .78l4.9 3.92c.27.25.82 0 .8-.38v-2.5h.1c4.27 0 3.65.67 3.65-3.62v-4.47c0-3.15.4-3.62-1.25-3.66zM10.34 38.66c-.24.02-.44.25-.43.5v2.47H7.3c-1.08 0-1.86-.04-2.4-.04-1.64 0-1.25.43-1.25 3.65v4.47c0 3.66-.23 3.7 2.34 3.66l-1.34-1.1c-.1-.08-.18-.2-.2-.3 0-.17.07-.35.2-.45l1.96-1.6c-.03-.06-.04-.13-.04-.2v-4.48c0-.44.28-.72.72-.72H9.9v2.5c0 .36.5.6.8.38l4.93-3.93c.24-.18.24-.6 0-.78l-4.94-3.92c-.1-.08-.23-.13-.36-.12zm5.63 2.93l1.34 1.1c.1.07.18.2.2.33.02.16-.03.3-.16.4l-1.96 1.6c.02.07.06.13.06.22v4.47c0 .42-.3.72-.72.72h-2.66v-2.47c0-.3-.3-.53-.6-.47-.06.02-.12.05-.18.1l-4.94 3.93c-.24.18-.24.6 0 .78l4.94 3.92c.28.22.78-.02.78-.38v-2.5h2.66c4.27 0 3.65.67 3.65-3.62v-4.47c0-3.66.34-3.7-2.4-3.66zM13.06 57.66c-.23.03-.4.26-.4.5v2.47H7.28c-1.08 0-1.86-.04-2.4-.04-1.64 0-1.25.43-1.25 3.65v4.87l2.93-2.37v-2.5c0-.44.28-.72.72-.72h5.38v2.5c0 .36.5.6.78.38l4.94-3.93c.24-.18.24-.6 0-.78l-4.94-3.92c-.1-.1-.24-.14-.38-.12zm5.3 6.15l-2.92 2.4v2.52c0 .42-.3.72-.72.72h-5.4v-2.47c0-.3-.32-.53-.6-.47-.07.02-.13.05-.2.1L3.6 70.52c-.25.18-.25.6 0 .78l4.93 3.92c.28.22.78-.02.78-.38v-2.5h5.42c4.27 0 3.65.67 3.65-3.62v-4.47-.44zM19.25 78.8c-.1.03-.2.1-.28.17l-.9.9c-.44-.3-1.36-.25-3.35-.25H7.28c-1.08 0-1.86-.03-2.4-.03-1.64 0-1.25.43-1.25 3.65v.7l2.93.3v-1c0-.44.28-.72.72-.72h7.44c.2 0 .37.08.5.2l-1.8 1.8c-.25.26-.08.76.27.8l6.27.7c.28.03.56-.25.53-.53l-.7-6.25c0-.27-.3-.48-.55-.44zm-17.2 6.1c-.2.07-.36.3-.33.54l.7 6.25c.02.36.58.55.83.27l.8-.8c.02 0 .04-.02.04 0 .46.24 1.37.17 3.18.17h7.44c4.27 0 3.65.67 3.65-3.62v-.75l-2.93-.3v1.05c0 .42-.3.72-.72.72H7.28c-.15 0-.3-.03-.4-.1L8.8 86.4c.3-.24.1-.8-.27-.84l-6.28-.65h-.2zM4.88 98.6c-1.33 0-1.34.48-1.3 2.3l1.14-1.37c.08-.1.22-.17.34-.2.16 0 .34.08.44.2l1.66 2.03c.04 0 .07-.03.12-.03h7.44c.34 0 .57.2.65.5h-2.43c-.34.05-.53.52-.3.78l3.92 4.95c.18.24.6.24.78 0l3.94-4.94c.22-.27-.02-.76-.37-.77H18.4c.02-3.9.6-3.4-3.66-3.4H7.28c-1.08 0-1.86-.04-2.4-.04zm.15 2.46c-.1.03-.2.1-.28.2l-3.94 4.9c-.2.28.03.77.4.78H3.6c-.02 3.94-.45 3.4 3.66 3.4h7.44c3.65 0 3.74.3 3.7-2.25l-1.1 1.34c-.1.1-.2.17-.32.2-.16 0-.34-.08-.44-.2l-1.65-2.03c-.06.02-.1.04-.18.04H7.28c-.35 0-.57-.2-.66-.5h2.44c.37 0 .63-.5.4-.78l-3.96-4.9c-.1-.15-.3-.23-.47-.2zM4.88 117.6c-1.16 0-1.3.3-1.3 1.56l1.14-1.38c.08-.1.22-.14.34-.16.16 0 .34.04.44.16l2.22 2.75h7c.42 0 .72.28.72.72v.53h-2.6c-.3.1-.43.54-.2.78l3.92 4.9c.18.25.6.25.78 0l3.94-4.9c.22-.28-.02-.77-.37-.78H18.4v-.53c0-4.2.72-3.63-3.66-3.63H7.28c-1.08 0-1.86-.03-2.4-.03zm.1 1.74c-.1.03-.17.1-.23.16L.8 124.44c-.2.28.03.77.4.78H3.6v.5c0 4.26-.55 3.62 3.66 3.62h7.44c1.03 0 1.74.02 2.28 0-.16.02-.34-.03-.44-.15l-2.22-2.76H7.28c-.44 0-.72-.3-.72-.72v-.5h2.5c.37.02.63-.5.4-.78L5.5 119.5c-.12-.15-.34-.22-.53-.16zm12.02 10c1.2-.02 1.4-.25 1.4-1.53l-1.1 1.36c-.07.1-.17.17-.3.18zM5.94 136.6l2.37 2.93h6.42c.42 0 .72.28.72.72v1.25h-2.6c-.3.1-.43.54-.2.78l3.92 4.9c.18.25.6.25.78 0l3.94-4.9c.22-.28-.02-.77-.37-.78H18.4v-1.25c0-4.2.72-3.63-3.66-3.63H7.28c-.6 0-.92-.02-1.34-.03zm-1.72.06c-.4.08-.54.3-.6.75l.6-.74zm.84.93c-.12 0-.24.08-.3.18l-3.95 4.9c-.24.3 0 .83.4.82H3.6v1.22c0 4.26-.55 3.62 3.66 3.62h7.44c.63 0 .97.02 1.4.03l-2.37-2.93H7.28c-.44 0-.72-.3-.72-.72v-1.22h2.5c.4.04.67-.53.4-.8l-3.96-4.92c-.1-.13-.27-.2-.44-.2zm13.28 10.03l-.56.7c.36-.07.5-.3.56-.7zM17.13 155.6c-.55-.02-1.32.03-2.4.03h-8.2l2.38 2.9h5.82c.42 0 .72.28.72.72v1.97H12.9c-.32.06-.48.52-.28.78l3.94 4.94c.2.23.6.22.78-.03l3.94-4.9c.22-.28-.02-.77-.37-.78H18.4v-1.97c0-3.15.4-3.62-1.25-3.66zm-12.1.28c-.1.02-.2.1-.28.18l-3.94 4.9c-.2.3.03.78.4.8H3.6v1.96c0 4.26-.55 3.62 3.66 3.62h8.24l-2.36-2.9H7.28c-.44 0-.72-.3-.72-.72v-1.97h2.5c.37.02.63-.5.4-.78l-3.96-4.9c-.1-.15-.3-.22-.47-.2zM5.13 174.5c-.15 0-.3.07-.38.2L.8 179.6c-.24.27 0 .82.4.8H3.6v2.32c0 4.26-.55 3.62 3.66 3.62h7.94l-2.35-2.9h-5.6c-.43 0-.7-.3-.7-.72v-2.3h2.5c.38.03.66-.54.4-.83l-3.97-4.9c-.1-.13-.23-.2-.38-.2zm12 .1c-.55-.02-1.32.03-2.4.03H6.83l2.35 2.9h5.52c.42 0 .72.28.72.72v2.34h-2.6c-.3.1-.43.53-.2.78l3.92 4.9c.18.24.6.24.78 0l3.94-4.9c.22-.3-.02-.78-.37-.8H18.4v-2.33c0-3.15.4-3.62-1.25-3.66zM4.97 193.16c-.1.03-.17.1-.22.18l-3.94 4.9c-.2.3.03.78.4.8H3.6v2.68c0 4.26-.55 3.62 3.66 3.62h7.66l-2.3-2.84c-.03-.02-.03-.04-.05-.06H7.27c-.44 0-.72-.3-.72-.72v-2.7h2.5c.37.03.63-.48.4-.77l-3.96-4.9c-.12-.17-.34-.25-.53-.2zm12.16.43c-.55-.02-1.32.03-2.4.03H7.1l2.32 2.84.03.06h5.25c.42 0 .72.28.72.72v2.7h-2.5c-.36.02-.56.54-.3.8l3.92 4.9c.18.25.6.25.78 0l3.94-4.9c.26-.28 0-.83-.37-.8H18.4v-2.7c0-3.15.4-3.62-1.25-3.66z' fill='%23606984' stroke-width='0'/></svg>");
    background-position: 0 0;
    width: 22px;
    /* scale to 17px via transform to keep the multi-sürite layout intact */
    transform: scale(calc(17 / 22)) translateY(-1px);
    aspect-ratio: 22 / 19;
    background-size: cover;
    animation: 4.5s infinite normal statusPrependIcon steps(10);
}
.status__prepend .status__prepend-icon:before {
    display: none;
}

/* Better gradient on collapsed toots */
.status.collapsed .status__content {
    height: 45px;
    margin-bottom: -15px;
    -webkit-mask-image: linear-gradient(to bottom, black, transparent 60% );
    mask-image: linear-gradient(to bottom, black, transparent 60% );
}
:is(#fake, .status.collapsed .status__content):after {
    display: none;
}

/* Make sure the search suggestions are always ontop, the otherwise highest z-index I use is 100 */
body>div[data-popper-escaped]:last-child {
    z-index: 1000 !important;
}

`)

    GM_addStyle(`

/* Add our logo */
@media screen and (min-width: 1175px) {
    body.flavour-glitch .columns-area__panels__pane--navigational .columns-area__panels__pane__inner:before {
        content: "";
        object-fit: contain;
        background: url(${logoSvg});
        display: block;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        height: 48px;
        max-width: 100%;
        margin-top: 10px;
        filter: drop-shadow(0px 0px 3px rgba(255 255 255 / .3));
    }

    body.flavour-glitch .navigation-panel {
        margin-top: 0;
        height: calc(100% - 68px);
    }
    body.flavour-glitch .navigation-panel:before {
        content: "";
        width: 100%;
        margin: 20px 0;
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
        transition: box-shadow 200ms, outline-color 200ms, background-color 200ms;
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
        bottom: 0;
    }
    .compose-form .emoji-picker-dropdown .emoji-button {
        position: sticky;
        top: 5px;
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

    .column-link--logo {
        padding: 0;
    }

    .column-link--logo svg {
        display: none;
    }

    .column-link--logo:before {
        content: "";
        object-fit: contain;
        background: url(${logoSvg});
        display: block;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        height: 48px;
        max-width: 100%;
    }

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

    .column-back-button--slim [role="button"]:after,
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

    .column-back-button--slim [role="button"],
    #tabs-bar__portal>button,
    .column-header__wrapper {
        border-radius: 8px;
        backdrop-filter: blur(3px);
        background: hsla(227deg 16% 23% / 0.8);
        transition: box-shadow 200ms;
    }
    .column-back-button--slim [role="button"]:hover,
    #tabs-bar__portal>button:hover,
    .column-header__wrapper:hover {
        box-shadow: var(--neon-box-shadow-small);
    }
    .column-back-button--slim [role="button"]:hover:after,
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

    /* ===== Posts styling ===== */

    .status-unlisted {
        box-shadow: 0px 4px 10px -8px #388e3c;
    }
    .status-public {
        box-shadow: 0px 4px 10px -8px #1976d2;
    }
    .status-direct {
        box-shadow: 0px 4px 10px -8px #d32f2f;
    }
    .status-private {
        box-shadow: 0px 4px 10px -8px #ffa000;
    }

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

    /* Coloring */

    [data-column="notifications"] .status[data-favourited-by] {
        background: hsla(240deg 4% 20% / 1);
        --border-hsl: 42.12deg 96.12% 40.39%;
    }

    .notification-follow,
    [data-column="notifications"] .status[data-boosted-by] {
        background: hsla(231deg 18% 22% / 1);
        --border-hsl: 239.48deg 100% 77.45%
    }

    :is(
        #fake,
        .status.unread,
        .notification.unread,
    ):before {
        border-color: hsl(var(--border-hsl, 227deg 16% 71%));
        border-radius: inherit;
    }

    .notification-follow, .notification-follow-request {
        border-bottom: none;
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
    h1#Lists {
        visibility: hidden;
    }
    .column-back-button--slim [role="button"] {
        margin-left: -10px;
        margin-right: -10px;
        width: calc(100% + 20px);
    }

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

/* make sure the grey hover outline is *behind* the emoji */
.emoji-mart-category .emoji-mart-emoji:hover:before {
    z-index: -1;
}

button.emoji-mart-emoji span, button.emoji-mart-emoji img {
    transition: transform 200ms;
}
button.emoji-mart-emoji:hover span, button.emoji-mart-emoji:hover img {
    transform: scale(1.4);
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
.media-gallery__gifv__label {
    padding: 0 5px;
    line-height: 27.1429px;
    font-size: 1em;
    background: rgba(0 0 0 / 0.6);
    color: hsla(0 0% 100% / .7);
    font-weight: normal;
    border-radius: 8px;
}
.sensitive-marker {
    background: rgba(0 0 0 / 0.6);
    color: hsla(0 0% 100% / .7);
    line-height: 23.141px;
    border-radius: 8px;
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
