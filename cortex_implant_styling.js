// ==UserScript==
// @name         CortexImplant CSS Improvements
// @namespace    http://tampermonkey.net/
// @version      1.5.3-b0
// @description  Change the styling for the mastodon instance I'm on
// @author       @Sirs0ri
// @match        https://corteximplant.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=corteximplant.com
// @supportURL   https://github.com/Sirs0ri/userscripts/issues
// @grant        GM_addStyle
// ==/UserScript==

/*
 * == TODO ==
 *    - ?
 */

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

(function () {
  "use strict"

  // ====================
  //      Helpers
  // ====================

  const desktopViewVisible = new Event("desktopViewVisible")
  const desktopViewHiddenEvent = new Event("desktopViewHidden")

  let _currentInnerWidth = window.innerWidth
  const _desktopMinWidth = 1175

  const onResize = evt => {
    if (_currentInnerWidth < _desktopMinWidth && innerWidth >= _desktopMinWidth) {
      dispatchEvent(desktopViewVisible)
    } else if (innerWidth < _desktopMinWidth && _currentInnerWidth >= _desktopMinWidth) {
      dispatchEvent(desktopViewHiddenEvent)
    }
    _currentInnerWidth = innerWidth
  }

  addEventListener("resize", onResize)

  /** Register a handler to the "load" event, and when the vew switches from mibile to desktop */
  function registerLoadHandlerDesktop (handler) {
    addEventListener("load", handler, { once: true })
    addEventListener("desktopViewVisible", evt => {
      // Run the handler on the next frame, to give the DOM a chance to update
      setTimeout(() => handler(evt), 0)
    })
  }

  // Get own account info from embedded "initial-state" JSON
  const elem = document.getElementById("initial-state")
  const data = JSON.parse(elem.text)
  const user = data.accounts[data.meta.me]?.username

  // get account color
  const avatarLink = data.accounts[data.meta.me]?.avatar_static

  function createElem (tagName, options) {
    const elem = document.createElement(tagName)
    Object.assign(elem, options)
    if (options.class) elem.classList.add(...options.class.split(" "))
    return elem
  }

  // ====================
  //     Preferences
  // ====================

  // These preferences will be persisted in localStorage. When upgrading from a version that
  // still has preferences defined as booleans make sure to note them down before upgrading!

  function loadSettings () {
    const loaded = localStorage.getItem(`userscript-sirs0ri-settings-${user}`)

    const settings = {
      hideCheckmarks: true,
      disableBouncyAnimations: true,
      enableGlowOnMedia: true,
      showImagesUncropped: true,
      highlightMediaWithoutAlt: true,
      popoutComposeBox: true,
      imACat: true,
    }

    if (loaded == null) {
      settings._firstRun = true
    } else {
      const parsed = JSON.parse(loaded)
      if (parsed.hideCheckmarks != null) settings.hideCheckmarks = parsed.hideCheckmarks
      if (parsed.disableBouncyAnimations != null) settings.disableBouncyAnimations = parsed.disableBouncyAnimations
      if (parsed.enableGlowOnMedia != null) settings.enableGlowOnMedia = parsed.enableGlowOnMedia
      if (parsed.showImagesUncropped != null) settings.showImagesUncropped = parsed.showImagesUncropped
      if (parsed.highlightMediaWithoutAlt != null) settings.highlightMediaWithoutAlt = parsed.highlightMediaWithoutAlt
      if (parsed.popoutComposeBox != null) settings.popoutComposeBox = parsed.popoutComposeBox
      if (parsed.imACat != null) settings.imACat = parsed.imACat
    }

    return settings
  }

  function storeSettings (vals) {
    const str = JSON.stringify(vals)

    localStorage.setItem(`userscript-sirs0ri-settings-${user}`, str)
  }

  let settingsWhenPopupOpened

  function openSettings (evt) {
    if (evt) evt.preventDefault()
    settingsWhenPopupOpened = { ...settings }
    document.body.classList.add("userscript-modal--active")
  }

  function closeSettings (evt) {
    evt.preventDefault()
    document.body.classList.remove("userscript-modal--active")
  }

  const settings = loadSettings()

  if (settings._firstRun) {
    document.body.classList.add("userscript-modal--firstrun")
    delete settings._firstRun
    storeSettings(settings)
    openSettings()
  }

  function onSettingChange (evt) {
    switch (evt.target.id) {
      case "hideCheckmarks":
        settings.hideCheckmarks = evt.target.checked
        break
      case "disableBouncyAnimations":
        settings.disableBouncyAnimations = evt.target.checked
        break
      case "enableGlowOnMedia":
        settings.enableGlowOnMedia = evt.target.checked
        break
      case "showImagesUncropped":
        settings.showImagesUncropped = evt.target.checked
        break
      case "highlightMediaWithoutAlt":
        settings.highlightMediaWithoutAlt = evt.target.checked
        break
      case "popoutComposeBox":
        settings.popoutComposeBox = evt.target.checked
        break
      case "imACat":
        settings.imACat = evt.target.checked
        break
      default:
        return
    }

    let needsReload = false
    if (settings.hideCheckmarks !== settingsWhenPopupOpened.hideCheckmarks) needsReload = true
    if (settings.disableBouncyAnimations !== settingsWhenPopupOpened.disableBouncyAnimations) needsReload = true
    if (settings.enableGlowOnMedia !== settingsWhenPopupOpened.enableGlowOnMedia) needsReload = true
    if (settings.showImagesUncropped !== settingsWhenPopupOpened.showImagesUncropped) needsReload = true
    if (settings.highlightMediaWithoutAlt !== settingsWhenPopupOpened.highlightMediaWithoutAlt) needsReload = true
    if (settings.popoutComposeBox !== settingsWhenPopupOpened.popoutComposeBox) needsReload = true
    if (settings.imACat !== settingsWhenPopupOpened.imACat) needsReload = true

    storeSettings(settings)

    if (needsReload) document.querySelector(".userscript-modal-root").classList.add("needs-reload")
    else document.querySelector(".userscript-modal-root").classList.remove("needs-reload")
  }

  const _insertFooter = (evt) => {
    const footer = document.querySelector(".link-footer")

    if (!footer) {
      console.warn("footer not found")
      return
    }

    const insert = createElem("p", { innerHTML: "<strong>Sirs0ri's userscript</strong>: " })
    const separator = createElem("span", {
      innerHTML: " · ",
      ariaHidden: true,
    })
    const preferencesLink = createElem("a", {
      textContent: document.querySelector(".column-link[href='/settings/preferences']").title,
      href: "#",
      onclick: openSettings,
    })
    const issuesLink = createElem("a", {
      textContent: "Issues",
      href: "https://github.com/Sirs0ri/userscripts/issues",
      target: "_blank",
    })
    const codeLink = createElem("a", {
      textContent: document.querySelector(".link-footer [href*='github.com']").textContent,
      href: "https://github.com/Sirs0ri/userscripts/blob/main/cortex_implant_styling.js",
      target: "_blank",
    })
    const versionSpan = createElem("span", { innerHTML: "v" + GM_info.script.version })

    insert.appendChild(preferencesLink)
    insert.appendChild(separator.cloneNode(true))
    insert.appendChild(issuesLink)
    insert.appendChild(separator.cloneNode(true))
    insert.appendChild(codeLink)
    insert.appendChild(separator.cloneNode(true))
    insert.appendChild(versionSpan)

    footer.insertBefore(insert, footer.firstChild)
  }

  const _insertSettingsModal = (evt) => {
    const modalWrapper = createElem("div", { class: "modal-root userscript-modal-root" })
    const modalOverlay = createElem("div", { class: "modal-root__overlay", role: "presentation", onclick: closeSettings })
    const modalContainer = createElem("div", { class: "modal-root__container", role: "dialog" })
    const modalModal = createElem("div", { class: "userscript-settings__modal" })

    modalModal.innerHTML = `
<nav>
  <a 
    role="button"
    tabindex="0"
    class="glitch local-settings__navigation__item active"
    title="General"
    aria-label="General"
  >
    <i role="img" class="fa fa-cogs fa-fw"></i>
    <span>General</span>
  </a>

  <div>
    <p class="reload-needed-hint" class="test">
      Some of the settings you changed need the page to be reloaded to apply.
    </p>
    <button
      id="userscript-settings__reload"
      tabindex="0"
      title="Reload"
      aria-label="Reload"
      class="button reload-needed-hint"
    >
      <i role="img" class="fa fa-refresh fa-fw"></i>
      <span>reload</span>
    </button>
    <button
      id="userscript-settings__close"
      tabindex="0"
      title="Close"
      aria-label="Close"
      class="button"
    >
      <i role="img" class="fa fa-times fa-fw"></i>
      <span>Close</span>
    </button>

  </div>
</nav>

<div class="userscript-settings__content">

  <p class="first-run-notice">
    Hi there choom! <br>
    This userscript has a settings UI now! You're seeing this because you're running the new version of the script for
    the first time. <br>

    If you want to access this UI in the future, you'll be able to find it in the page's footer, next to the links to
    this instance's about page.
  </p>

  <h1><span>General</span></h1>

  <div class="userscript-settings__item">
    <input id="hideCheckmarks" type="checkbox">
    <label for="hideCheckmarks">
      hide checkmarks
    </label>

    <p>Disable the checkmarks Glitch-Fork adds to e.g. the fav- and boost-buttons</p>
  </div>
  <div class="userscript-settings__item">
    <input id="disableBouncyAnimations" type="checkbox">
    <label for="disableBouncyAnimations">
      disable bouncy animations
    </label>

    <p>Smooth out some animations that Glitch-Fork would otherwise make super bouncy, e.g. when expanding a post or
      faving it</p>
  </div>
  <div class="userscript-settings__item">
    <input id="enableGlowOnMedia" type="checkbox">
    <label for="enableGlowOnMedia">
      enable glow on media
    </label>

    <p>Enable a glow effect around media content embedded in posts</p>
  </div>
  <div class="userscript-settings__item">
    <input id="showImagesUncropped" type="checkbox">
    <label for="showImagesUncropped">
      show images uncropped
    </label>

    <p>Enable full-sized images in posts, instead of cropping images to 16/9</p>
  </div>
  <div class="userscript-settings__item">
    <input id="highlightMediaWithoutAlt" type="checkbox">
    <label for="highlightMediaWithoutAlt">
      highlight media without alt text
    </label>

    <p>Highlight media without an alt text by adding a visible red bar underneath</p>
  </div>
  <div class="userscript-settings__item">
    <input id="popoutComposeBox" type="checkbox">
    <label for="popoutComposeBox">
      growing compose box
    </label>

    <p>Make the compose box larger when focussed. This will have no effect in the Advanced View.</p>
  </div>
  <div class="userscript-settings__item">
    <input id="imACat" type="checkbox">
    <label for="imACat">
      imACat 🐈
    </label>

    <p>Meow?</p>
  </div>
</div>`
    modalWrapper.appendChild(modalOverlay)
    modalWrapper.appendChild(modalContainer)
    modalContainer.appendChild(modalModal)

    setTimeout(() => {
      document.getElementById("userscript-settings__close").onclick = closeSettings
      document.getElementById("userscript-settings__reload").onclick = () => location.reload()
      document.getElementById("hideCheckmarks").onclick = onSettingChange
      document.getElementById("hideCheckmarks").checked = settings.hideCheckmarks
      document.getElementById("disableBouncyAnimations").onclick = onSettingChange
      document.getElementById("disableBouncyAnimations").checked = settings.disableBouncyAnimations
      document.getElementById("enableGlowOnMedia").onclick = onSettingChange
      document.getElementById("enableGlowOnMedia").checked = settings.enableGlowOnMedia
      document.getElementById("showImagesUncropped").onclick = onSettingChange
      document.getElementById("showImagesUncropped").checked = settings.showImagesUncropped
      document.getElementById("highlightMediaWithoutAlt").onclick = onSettingChange
      document.getElementById("highlightMediaWithoutAlt").checked = settings.highlightMediaWithoutAlt
      document.getElementById("popoutComposeBox").onclick = onSettingChange
      document.getElementById("popoutComposeBox").checked = settings.popoutComposeBox
      document.getElementById("imACat").onclick = onSettingChange
      document.getElementById("imACat").checked = settings.imACat
    }, 0)

    GM_addStyle(`

.userscript-modal-root {
    transition: visibility 200ms;
    pointer-events: none;
    opacity: 0;

    transition: opacity 200ms;
}
.userscript-modal-root > div {
    width: 100vw;
}

body.userscript-modal--active {
    overflow-y: hidden !important;
    margin-right: 12px;
}

body.userscript-modal--active .userscript-modal-root {
    pointer-events: revert;

    opacity: 1;
}

body.userscript-modal--active .userscript-settings__modal {
    pointer-events: auto;
}

.userscript-settings__modal {
    background: #d9e1e8;
    border-radius: 8px;
    color: #282c37;
    height: 80vh;
    max-height: 450px;
    max-width: 740px;
    overflow: hidden;
    position: relative;
    width: 80vw;

    display: flex;

    box-sizing: border-box;
}

.userscript-settings__modal nav {
    display: flex;
    flex-direction: column;

    background: #f2f5f7;
    font-size: 15px;
    line-height: 20px;
    overflow-y: auto;
    width: 212px;
    flex: 1 0 auto;
}

.userscript-settings__modal nav *+* {
    margin-top: 15px
}

.userscript-settings__modal nav > :last-child {
    margin-top: auto;
    padding: 15px;
    display: grid;
    font-size: 13px;
}

.userscript-settings__content {
    padding: 15px;
    overflow-y: scroll;
}

.userscript-settings__content .first-run-notice {
    margin-bottom: 20px;
    display: none;
}

body.userscript-modal--firstrun .userscript-settings__content .first-run-notice {
    display: block;
}

.userscript-settings__modal h1 {
    font-size: 18px;
    font-weight: 500;
    line-height: 24px;
    margin-bottom: 20px;
}

.userscript-settings__item {
    padding-inline-start: 4ch;
    position: relative;
}

.userscript-settings__item + .userscript-settings__item {
    margin-top: 15px;
}

.userscript-settings__item input[type="checkbox"] {
    position: absolute;
    top: 0;
    left: 0;
}
.userscript-settings__item p {
    opacity: 0.8;
}

.reload-needed-hint {
    visibility: hidden;
}
.needs-reload .reload-needed-hint {
    visibility: visible;
}
`)
    document.body.appendChild(modalWrapper)
  }

  const insertSettings = (evt) => {
    _insertFooter(evt)

    // only insert the modal during the "load" event, not on subsequent runs of this functions when the view switches from mobile to desktop
    if (evt.type !== "load") return

    _insertSettingsModal(evt)
  }

  registerLoadHandlerDesktop(insertSettings)

  // Use TamperMonkey's helper to inject CSS
  // see https://codepen.io/mattgrosswork/pen/VwprebG
  GM_addStyle(`

/* general setup */

p {
    line-height: 1.5;
}

body {
    /* border radii */
    --border-radius-button: 10px;
    --border-radius-button-between: 3px;

    /* COLORS */
    --hsl-white: 0deg 0% 100%;
    --color-white: hsl(var(--hsl-white));

    --neon-glow-hsl: 219deg 100% 50%;

    /* hl is a color to be used as highlight ontop of another color */
    --color-primary: hsl(239.65deg 100% 66.47%);
    --color-hl-primary: hsl(240deg 100% 83%);

    /* used in the neon bars in the menu */
    --hsl-offwhite-blue: 224deg 60% 81%;
    --color-offwhite-primary: hsl(224deg 60% 81%);

    --color-green: #388e3c; /* Unlisted posts */
    --color-blue: #1976d2; /* formerly public posts */
    --color-red: #d32f2f; /* Direct posts */
    --color-yellow: hsl(48 71% 54%); /* Private posts - original: ffa000*/

    --color-gold: hsl(41 100% 45% / 1); /* favs */
    --color-purple: hsl(240deg 100% 77%); /* boosts */
    --color-orange: hsl(22 100% 45%); /* reports */

    /* page background  */
    --color-grey-0: hsl(224deg 17% 9%);

    /* .account-timeline__header                        -> background
     * explore -> subheader                             -> background
     */
    --color-grey-1: hsl(223deg 17% 14%);

    /* .search__input                                   -> background
     * .column-back-button--slim [role="button"]:after  -> border
     * #tabs-bar__portal>button:after                   -> border
     * .column-header__wrapper:after                    -> border
     * posts                                            -> background
     * search results                                   -> background
     * explore links                                    -> background
     * ::-webkit-scrollbar-thumb                        -> background
     * ::-webkit-scrollbar-track:active                 -> background
     * ::-webkit-scrollbar-track:hover                  -> background
     */
    --color-grey-2: hsl(224deg 17% 19%);

    /* .column-back-button--slim [role="button"]        -> background 0.8
     * #tabs-bar__portal>button                         -> background 0.8
     * .column-header__wrapper                          -> background 0.8
     * selected post                                    -> background
     * .about:before                                    -> background
     * scrollbars                                       -> ???
     * body.layout-multiple-columns .column-header      -> background
     */
    --hsl-grey-3: 227deg 17% 23%;
    --color-grey-3: hsl(var(--hsl-grey-3));

    /* .dismissable-banner                              -> border
     * posts                                            -> border
     * search results                                   -> border
     * explore links                                    -> border
     * .explore__search-results>button                  -> border
     * .account__section-headline                       -> border
     * .notification__filter-bar                        -> border
     * .account-timeline__header                        -> outline
     * lists .column-inline-form                        -> outline
     * ::-webkit-scrollbar-thumb                        -> border
     * ::-webkit-scrollbar-thumb:hover                  -> background
     */
    --color-grey-4: hsl(227deg 17% 27%);

    /* .search__input                                   -> background
     * .column-header__collapsible                      -> background
     * .account__action-bar__tab.active                 -> border
     * .account__header__bio .account__header__fields   -> border
     * body.layout-multiple-columns .drawer__inner      -> background
     * body.layout-multiple-columns .drawer__inner .navigation-bar  -> background
     */
    --color-grey-5: hsl(227deg 17% 31%);

    /* .column-header__button:hover:before              -> background
     * .column-header__back-button:hover:before         -> background
     * .account__section-headline :is(button, a):hover span:before  -> background
     * .notification__filter-bar button:hover span:before  -> background
     * .notification__filter-bar button:hover i:after   -> background
     * .account-card                                    -> border
     * ::-webkit-scrollbar-thumb:hover                  -> border
     * ::-webkit-scrollbar-thumb:active                 -> background
     * body.layout-multiple-columns .drawer--header     -> border
     * .search__input                                   -> border
     */
    --color-grey-6: hsl(227deg 17% 41%);

    /* .compose-form__autosuggest-wrapper               -> border
     * .compose-form__buttons-wrapper                   -> border
     * .compose-form .spoiler-input                     -> border
     * .column-back-button--slim [role="button"]:hover:after -> border
     * #tabs-bar__portal>button:hover:after             -> border
     * .column-header__wrapper:hover:after              -> border
     * selected post                                    -> border
     * .about:before                                    -> border
     * ::-webkit-scrollbar-thumb:active                 -> border
     */
    --color-grey-7: hsl(227deg 17% 51%);

    /* Notifications                                    -> border
     */
    --hsl-grey-8: 227deg 17% 71%;
    --color-grey-8: hsl(var(--hsl-grey-8));

    /* .compose-form__buttons-wrapper                   -> background
     */
    --color-grey-9: hsl(227deg 17% 81%);

    --anim-dur: 200ms;

    --neon-box-shadow:
      /* White glow */
      0 0 7px hsla(var(--hsl-white) / 1),
      0 0 10px hsla(var(--hsl-white) / 1),
      0 0 21px hsla(var(--hsl-white) / 1),
      /* Colored glow */
      0 0 42px hsla(var(--neon-glow-hsl) / 1),
      0 0 82px hsla(var(--neon-glow-hsl) / 1),
      0 0 92px hsla(var(--neon-glow-hsl) / 1),
      0 0 102px hsla(var(--neon-glow-hsl) / 1),
      0 0 151px hsla(var(--neon-glow-hsl) / 1);
    --neon-box-shadow-small:
      /* White glow */
      0 0 6px -2px hsla(var(--hsl-white) / 0.4),
      0 0 10px hsla(var(--hsl-white) / 0.2),
      0 0 15px hsla(var(--hsl-white) / 0.1),
      /* Colored glow */
      0 0 10px hsla(var(--neon-glow-hsl) / 0.07),
      0 0 25px hsla(var(--neon-glow-hsl) / 0.05),
      0 0 47px hsla(var(--neon-glow-hsl) / 0.12),
      /* White inside glow */
      inset 0 0 5px hsla(var(--hsl-white) / 0.3);
}

@keyframes flicker-in {
    0%   { opacity: 0   }
    40%  { opacity: 0.7 }
    75%  { opacity: 0.4 }
    100% { opacity: 1   }
}
    `)

  settings.hideCheckmarks && GM_addStyle(`
/* disable checkmark on buttons */
.detailed-status__button .icon-button.active:after, .status__action-bar-button.active:after {
    content: ""
}
`)

  settings.disableBouncyAnimations && GM_addStyle(`
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
`)

  settings.showImagesUncropped && GM_addStyle(`
/* Force all images to be in their original aspect ratio, not 16/9 */

.status .media-gallery:not(:has(.media-gallery__item + .media-gallery__item)):has(.spoiler-button--minified) {
    height: auto !important;
}

.status .media-gallery:not(:has(.media-gallery__item + .media-gallery__item)) img {
    display: block;
}
`)

  settings.enableGlowOnMedia && GM_addStyle(`
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

.media-gallery__item{
    border-radius: var(--border-radius-button-between);
}
.media-gallery__item>*,
.video-player.inline>* {
    border-radius: inherit;
    overflow: hidden;
}

/* single item */
.media-gallery__item[style*="inset: auto;"],
.video-player.inline {
    border-radius: var(--border-radius-button);
}

/* left half auto 2px auto auto */
.media-gallery__item[style*="inset: auto 2px auto auto;"] {
    inset: 0 !important;
    width: calc(50% - 2px) !important;
    height: 100% !important;
    margin: 0 2px 0 0;
    border-start-start-radius: var(--border-radius-button);
    border-end-start-radius: var(--border-radius-button);
}
/* right half auto auto auto 2px */
.media-gallery__item[style*="inset: auto auto auto 2px;"] {
    inset: 0 !important;
    width: calc(50% - 2px) !important;
    height: 100% !important;
    margin: 0 0 0 2px;
    border-start-end-radius: var(--border-radius-button);
    border-end-end-radius: var(--border-radius-button);
}

/* top left image */
.media-gallery__item[style*="inset: auto 2px 2px auto;"] {
    inset: 0 !important;
    width: calc(50% - 2px) !important;
    height: calc(50% - 2px) !important;
    margin: 0 2px 2px 0;
    border-start-start-radius: var(--border-radius-button);
}

/* top right image */
.media-gallery__item[style*="inset: auto auto 2px 2px;"] {
    inset: 0 !important;
    width: calc(50% - 2px) !important;
    height: calc(50% - 2px) !important;
    margin: 0 0 2px 2px;
    border-start-end-radius: var(--border-radius-button);
}

/* bottom left image */
.media-gallery__item[style*="inset: 2px 2px auto auto;"] {
    inset: 0 !important;
    width: calc(50% - 2px) !important;
    height: calc(50% - 2px) !important;
    margin: 2px 2px 0 0;
    border-end-start-radius: var(--border-radius-button);
}

/* bottom right image */
.media-gallery__item[style*="inset: 2px auto auto 2px;"] {
    inset: 0 !important;
    width: calc(50% - 2px) !important;
    height: calc(50% - 2px) !important;
    margin: 2px 0 0 2px;
    border-end-end-radius: var(--border-radius-button);
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
    filter: blur(3px);
}
/* Undo hiding the blurhash canvas unless it's for part of a video in full screen */
:not(.fullscreen, .detailed)>.media-gallery__preview--hidden {
    display: revert;
    filter: blur(3px);
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
    border-radius: var(--border-radius-button);
    overflow: revert;
}
.status-card__image {
    border-radius: inherit;
    position: relative;
}
:is(#fake, canvas.status-card__image-preview) {
    border-radius: inherit;
    z-index: unset;
    filter: blur(3px);
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

  settings.highlightMediaWithoutAlt && GM_addStyle(`
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

.focal-point-modal__content video {
    border-bottom: none;
}
    `)

  const debugFocus = false

  const onLoadHandler = () => {
    let composePanel = document.querySelector(".columns-area__panels__pane--compositional")
    const composeForm = document.querySelector(".compose-form")
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
      debugFocus && console.log("in", evt)
      /* Ignore clicks on the buttons below the compose area */
      if (evt.target.nodeName === "BUTTON" || evt.target.classList.contains("emoji-button")) return

      /* Ignore FocusEvents where the focus was moved automatically, e.g. when restoring focus to the page.
             * This also keeps the input small when the user's first interaction is via the emote picker, but any
             * input afterwards will extend it, so that it's not too bad a compromise.
             */
      if (evt instanceof FocusEvent && evt.target.classList.contains("autosuggest-textarea__textarea") && !evt.sourceCapabilities) return

      debugFocus && console.log("in handled", evt)

      composePanel = document.querySelector(".columns-area__panels__pane--compositional")
      composePanel.classList.add("user-focus-within")
      setTimeout(() => {
        backDrop = document.querySelector(".compose-form")
        backDrop.classList.remove("ignore-clicks")
      }, 100)
    }
    const handlerOut = (evt) => {
      debugFocus && console.log("out", evt)

      /* Ignore FocusEvents that take the focus out of the tab */
      if (evt.relatedTarget == null) return
      /* Ignore clicks that move focus within the compose area, e.g. to the buttons below */
      if (composeForm.contains(evt.relatedTarget)) return
      /* ignore events that remove focus from buttons that now have the .active class, i.e. after opening one of the menus */
      if (evt.target.nodeName === "BUTTON" && evt.target.classList.contains("active")) return
      /* ignore events that remove focus from the emoji-button, e.g. when opening the emoji picker */
      if (evt.target.classList.contains("emoji-button")) return

      debugFocus && console.log("out handled", evt)

      composePanel.classList.add("user-focus-within")
      backDrop = document.querySelector(".compose-form")

      composePanel.classList.remove("user-focus-within")
      backDrop.classList.add("ignore-clicks")
    }
    const handlerBackdropClick = (evt) => {
      debugFocus && console.log("bg-click", evt)
      if (composeForm.contains(document.activeElement)) return

      // This should only be handled if the user clicked on the backdrop, ie. the compose-form's :before element.
      // Since pseudoelements can't be targeted directly, this handler has to be registered on the parent, and
      // the class "ignore-clicks" is used to mimic the :before's pointer-events: none;
      if (evt.target !== backDrop) return
      if (evt.target.classList.contains("ignore-clicks")) return

      debugFocus && console.log("bg-click handled", evt)

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
  settings.popoutComposeBox && registerLoadHandlerDesktop(onLoadHandler)

  // load relevant styles
  settings.popoutComposeBox && GM_addStyle(`
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
        --width: clamp(100%, calc( ( 100vw - clamp(0px, calc(4vw - 48px), 50px) - 600px ) / 2 - 30px), 450px);
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

    :is(#fake, .autosuggest-textarea__textarea) {
        transition: min-height 200ms;
        padding: 3px 40px 0px 15px;
    }
    .user-focus-within .autosuggest-textarea__textarea {
        min-height: 200px !important;
    }

    .link-footer {
        margin-top: auto
    }
}
    `)

  const doCatThings = avatarLink && user && settings.imACat

  doCatThings && GM_addStyle(`

@keyframes earwiggleleft {
    0%  { transform: rotate(35deg) skew(28deg) }
    25% { transform: rotate(10deg) skew(28deg) }
    50% { transform: rotate(20deg) skew(28deg) }
    75% { transform: rotate(0)     skew(28deg) }
    to  { transform: rotate(35deg) skew(28deg) }
}

@keyframes earwiggleright {
    0%  { transform: rotate(-32deg) skew(-28deg) }
    30% { transform: rotate(-10deg) skew(-28deg) }
    55% { transform: rotate(-20deg) skew(-28deg) }
    75% { transform: rotate(0)      skew(-28deg) }
    to  { transform: rotate(-32deg) skew(-28deg) }
}

.account__header__bar {
    z-index: 1
}
.detailed-status__display-avatar {
    z-index: 1;
    position: relative;
}
.status__info>span,
.detailed-status__display-name
{
    overflow: revert;
}

.account__avatar-overlay-overlay {
    position: static;
    margin-top: -25%;
    margin-left: auto;
}

[data-avatar-of="@${user}"]:before, [data-avatar-of="@${user}"]:after {
    background: #ebbcba;
    border: solid 4px currentColor;
    box-sizing: border-box;
    content: "";
    display: inline-block;
    height: 50%;
    width: 50%;
    z-index: -1;
    position: relative;
    color: rgb(129, 125, 131);
    color: var(--color-1);
    background: var(--color-6);
    scale: 0;
    transition: scale 300ms;
}

body.meow [data-avatar-of="@${user}"]:before,
body.meow [data-avatar-of="@${user}"]:after {
    scale: 1;
}

[data-avatar-of="@${user}"]:before {
    border-radius: 0 75% 75%;
    transform: rotate(32deg) skew(28deg);
}
[data-avatar-of="@${user}"]:hover:before {
    animation: earwiggleleft 1s;
    animation-iteration-count: 1;
}

[data-avatar-of="@${user}"]:after {
    border-radius: 75% 0 75% 75%;
    transform: rotate(-32deg) skew(-28deg);
}
[data-avatar-of="@${user}"]:hover:after {
    animation: earwiggleright 1s ;
}
    `)

  if (doCatThings) {
    // most of this code is from https://github.com/zygisS22/color-palette-extraction/blob/master/index.js#L17, adjusted for my needs:
    // - lower fidelity: less quantizising for fewer colors,
    const calculateLuminance = (p) => 0.2126 * p.r + 0.7152 * p.g + 0.0722 * p.b

    /**
         * Using relative luminance we order the brightness of the colors
         * the fixed values and further explanation about this topic
         * can be found here -> https://en.wikipedia.org/wiki/Luma_(video)
         */
    const orderByLuminance = (rgbValues) => rgbValues.sort((p1, p2) => calculateLuminance(p2) - calculateLuminance(p1))

    const buildRgb = (imageData) => {
      const targetLength = imageData.length / 4
      const rgbValues = Array(targetLength)
      // note that we are loopin every 4!
      // for every Red, Green, Blue and Alpha
      for (let i = 0; i < targetLength; i++) {
        const j = i * 4
        rgbValues[i] = {
          r: imageData[j],
          g: imageData[j + 1],
          b: imageData[j + 2],
          // j+3 would hold the alpha value that we don't care about
        }
      }
      return rgbValues
    }

    // returns what color channel has the biggest difference
    const findBiggestColorRange = (rgbValues) => {
      /**
             * Min is initialized to the maximum value posible
             * from there we procced to find the minimum value for that color channel
             *
             * Max is initialized to the minimum value posible
             * from there we procced to fin the maximum value for that color channel
             */
      const rs = rgbValues.map(p => p.r)
      const gs = rgbValues.map(p => p.g)
      const bs = rgbValues.map(p => p.b)

      const rRange = Math.max(...rs) - Math.min(...rs)
      const gRange = Math.max(...gs) - Math.min(...gs)
      const bRange = Math.max(...bs) - Math.min(...bs)

      // determine which color has the biggest difference
      const biggestRange = Math.max(rRange, gRange, bRange)
      if (biggestRange === rRange) {
        return "r"
      } else if (biggestRange === gRange) {
        return "g"
      } else {
        return "b"
      }
    }

    const quantizationReducer = (prev, curr) => {
      prev.r += curr.r
      prev.g += curr.g
      prev.b += curr.b

      return prev
    }

    /**
         * Median cut implementation
         * can be found here -> https://en.wikipedia.org/wiki/Median_cut
         */
    const quantization = (rgbValues, depth) => {
      const MAX_DEPTH = 3

      // Base case
      if (depth === MAX_DEPTH || rgbValues.length === 0) {
        const color = rgbValues.reduce(
          quantizationReducer,
          { r: 0, g: 0, b: 0 },
        )

        color.r = Math.round(color.r / rgbValues.length)
        color.g = Math.round(color.g / rgbValues.length)
        color.b = Math.round(color.b / rgbValues.length)

        return [color]
      }

      /**
             *  Recursively do the following:
             *  1. Find the pixel channel (red,green or blue) with biggest difference/range
             *  2. Order by this channel
             *  3. Divide in half the rgb colors list
             *  4. Repeat process again, until desired depth or base case
             */
      const componentToSortBy = findBiggestColorRange(rgbValues)
      rgbValues.sort((p1, p2) => {
        return p1[componentToSortBy] - p2[componentToSortBy]
      })

      const mid = rgbValues.length / 2

      const rgbValues2 = rgbValues.splice(mid)

      depth++

      const firstHalf = quantization(rgbValues, depth)
      const secndHalf = quantization(rgbValues2, depth)

      return [
        ...firstHalf,
        ...secndHalf,
      ]
    }

    const getColors = (link) => {
      const image = new Image()

      // Set the canvas size to be 100x100 - enough to extract some "good enough" colors.
      const w = 100
      const h = 100

      const canvas = new OffscreenCanvas(w, w)
      const ctx = canvas.getContext("2d")

      image.onload = () => {
        // const start = performance.now()
        ctx.drawImage(image, 0, 0, w, h)

        /**
                 * getImageData returns an array full of RGBA values
                 * each pixel consists of four values: the red value of the colour, the green, the blue and the alpha
                 * (transparency). For array value consistency reasons,
                 * the alpha is not from 0 to 1 like it is in the RGBA of CSS, but from 0 to 255.
                 */
        const imageData = ctx.getImageData(0, 0, w, h)

        // Convert the image data to RGB values so its much simpler
        const rgbArray = buildRgb(imageData.data)

        /**
                 * Color quantization
                 * A process that reduces the number of colors used in an image
                 * while trying to visually maintin the original image as much as possible
                 */
        const quantColors = orderByLuminance(quantization(rgbArray, 0))

        document.body.classList.add("meow")
        const style = `body {\n${quantColors.map((p, i) => `--color-${i}: rgb(${p.r}, ${p.g}, ${p.b});`).join("\n")}\n}`
        GM_addStyle(style)
      }
      image.src = link
    }

    // this doesn't need to run right away, it can wait a bit.
    // As a nice sideeffect, when this runs the profile picture's probably already cached!
    setTimeout(() => getColors(avatarLink), 750)
  }

  // #region raw images

  // alpha mask of the people and the logo from the header image
  const footerImgMask = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAAGhbWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAsaWxvYwAAAABEAAACAAEAAAABAAAJXAAAA+EAAgAAAAEAAAHJAAAHkwAAAEJpaW5mAAAAAAACAAAAGmluZmUCAAAAAAEAAGF2MDFDb2xvcgAAAAAaaW5mZQIAAAAAAgAAYXYwMUFscGhhAAAAABppcmVmAAAAAAAAAA5hdXhsAAIAAQABAAAA12lwcnAAAACxaXBjbwAAABRpc3BlAAAAAAAAAZAAAADSAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAUaXNwZQAAAAAAAAGQAAAA0gAAAA5waXhpAAAAAAEIAAAADGF2MUOBABwAAAAAOGF1eEMAAAAAdXJuOm1wZWc6bXBlZ0I6Y2ljcDpzeXN0ZW1zOmF1eGlsaWFyeTphbHBoYQAAAAAeaXBtYQAAAAAAAAACAAEEAQKDBAACBAUGhwgAAAt8bWRhdBIACgYYIfH6Paoyhg8SsB2AUbyA39PTD5gNBxR0wgF0FjWT7zR68F8ugYAf54lqqeOuuFwqZ3hNwr9bGZ5U1lFVcU6mE4csVlscnGMjfqY6iiX1U+E7PEMiwK5JwLjUVSWixjape3PgnIYPqKVp7IlqPAEs1GBtGRiX3psFfNO0hZB9MqO85kd5nYaKADRHWYhn/fOdu5tknZt6bdi3cQMPmVWoXrBT8thRs/VcbgnsOWljDnuHzhQYgYQJDmbTff77GYWZai61AQOMHGG4tLfI9kf4QOOLOhIucI74uMDDcQRs0GSENuXA92UE9mXLjF5x4XvUZ/sXzkc8r+9KaTwqguxq0HVWjKqbGwLsRq30LhKnM79+OCXAmBOkBkQ5AhcijjB8oVH2p58cwbYisp6vIXbV71luiupGElXlNGbOx7B4QqmUr16C14EXjCHPwjsWLXbOUcqAgZnNRBDThAe/+WqiISQiEdr5qOe0memOOsxK3FVJzrj0T522HX/si0rhz0jcGfTzwJbIVN9NDkiaE/V7NqvksczNAEXWiBIyXC0B0bO6QKW3/py3YoedDa0xNPjBI6ayL1YuIG09PmOWpgBkEPMw2V8NoPJh7zYka8rtZw39AZ+yfyyEqsLAm3POTPyf1AtCTgPgYMnU68PtX11X6XGkkY0WdrWqVJIAQqRsJKltlCexThVizKqrlny2DqQdQ1X79qblpPuk7uxWOniJgwKBADyJzfKpSxaXnsZ2lpdKVGAlTD/T0aIrhvcpOZCEfiqsx2fz6xUhkz0c0sdhNL/MAmrXlTqM95HoK13Ns1vwdfJtZUuhqU6wVV2WXAS7zuY7RBOoKuWihmza9JJdgOD5pwZNUhS7otEg1fDuEu6Fzfqh4chMs5yQNHUxf09tRJLcD4C8h/ZjU506i1HzS+upLDa4f8elFk2wFIAWhsyAH9vZ580Ctu+POcoXRkpTSeBGZ1pOqkMDhcEPQoBLVpQEOWYl82QFP4+vXpTMMjPlc17MUkmdGhpDxv8rCKLltyZXI6h1WhwW3XrF9RBCF/SujuIic7HCFCGOCZ29v9mGG6jXyiCoV3Cnm0A5aBOpu+ekEj6053u1/LM9jZNLG46HTRR3fV0MwUSAaHPxFGVSgGBxWG8kOJ8Skq038NTa0QBorR71InNAkl9L0paEcB30OLj1VA35tGb4kij8mmNVYeuSVHnOCQPKu6tz4InZEyuxBcOEtecSgvHO8Z7fCKoLZeS76B+u4xbpOt5rDnQ5/mY/oY7sYfg4lh3BR0ywG5VkIxkCRdvBNeLAMPfXkmv1OPkouwi0QoHbyb/0N9TmSi04l3B84Kr2d3dytsMblSG9VfXY/Wr1+5zrYxXGMI/Z4LqKRSeHz1rWT5u5kkLUPKGC0aNyCXxXpZCWxI3Vy5N8ojEhw65h9yCDiPgUwSAoGetR0zdpyKoC99SOSfEU85jasjbAur6bjnkTeFTkIXpSUZcbBS+pFOro1Ok/spoxGqFcSeMXYGxySZGIDE61JxP5A2k27tPMrrdL1JXzM29ShL89BD3FkENzxpg8mWo/lfrU2SjToR64cswKbPunHBKg9nDpMxGc0maxZVuv/jpjWk3RS5hiHxcioBjWZHmVKUC0akBk4M0eMrMg1ukgQfR62nfwP7yMVk+Gy+wfNyqpN1RNd6imFZplBPh/3CAq7Zd/g13SviyNpeOjb1rmXnOzDjDQqwq1NUCpheyJBOyB/tJUGX2Bvaks96mFh5XQJW7fb/Pj+eZsOEWRCLneLtS4TamYiTeVwpOI2mxGDEFMh9cwFr65ItEfoQE5MYrTi7F6mbndWf+E3p7AjggIgK6AxLWCEDysgUJqdLQIRi3YMvFiNGN7NZrtffLJdRIa6yupA2Of1GQXVkzUuHsGRJe1UQS5UX6RN1ClW0zS6cLzqinMlGxXptOzxYSxk1FTGxM5WQMBhmTTit2BJTIz5x8gNe0TSEc0+a1vVwd2dFIDjC0N56hXhKOckkmgAiM0A5cX2dfP5WL05VXVmmYxcARHCMvxYEfzwyNRXihjNg7/A7mitVqLBXyWS0oDIKCKHbDwzJKvrHP51Zd2ENvMWjN6QiRuT1ilcCZ7AHg98yr0fShy4skMOsXwVrKx9FnOxylYtTLblwoczA8Z2GJ3NeHUbwX6LzGxWUtTM4YvU/xSqLQqPzHNz3xcqhgBo7t5PdyDAh7XeVpDqN5xIIrQLlCc+c4rYSEov04lYMHbw38mE0chhQIXFGEX4PXcvqtHUsPmVsddQVXWA/uNZfD43eAr1X1Ejd4vPE6L/PhXzgp7v45xiQl00T9b9H9bUemgNi+7v9XhFiXKDscpHLYHQmCLmBJOpmyn2t0U3OnIMUVF6ynzb/LLaW5V39r/+qCdngZQNFEe7a+BByfU+M/mt01J1iB/Hk+sYuJ7J+ni54aSxdu9/9DrMP56C5xoQtGcJe9blxhWEKjcIzatj/zBuRUdVMUMBbU5DOqU0Qu1JnC8rnGJw4+G3Dh7Zr2QJa2vyinqOwAkyyE9N688B2/bg8wWi92en3rjVASDJQ2mMboccoxlRHeyzuKj7eASAAoKGCHx+j2QICBoQDLQB0SsAAAFAB5hALo5rWi0VnReu6QX08qPdtNIF2VYD////+5BfZl5fRYyaopZToCSBTy8/+////vOksc1IXFhe6m4oUTtD3O6SfWaZzOtnskuzIHqcGGhqXwqF5L8sLekcKSx0FX//qfHfC8X5IhCS0uPziNKyfX1njCDMBz+NyeAxA6Az0/4IxWZuC9z4uxr7f7vC1rGEpHqa7NxyEKuH73rQR5vHoTiKkVXr2Df//+IJvgM+j/vo8egYLaq7xMaA8bBKEH/4rAiT7Gckd14boMfj///T3tzEgnUp/PZLabyMActYCfxNbBuZlcd2GP34KAzh0x3rY+6fWipmAapnRBFX8WmoKAfiRyyBb69Nu/a1zUDqAqEW9lKCEqEce6rWe7TolmITNYYgmaZ92aMp+ZOJTH0f8XtyxH3+EcbHAl42ZmnBRfu3j/c1yExmiV7rG/nizwmecZ6TYYL4BqLfU7gFEfWmDsssT9G8fGoezRIQLp2/w1KOpAq0GnMfD53DHDPd7j2RuZLR9ENOhKmTaYJpkDo8S0eTjnZ2AHbEm7fDlcGkp1PXmYik+1/dvm84Xfy2GvD3xXC90bll2TnXg87olytN4m8uikC9PX/KN62MP8OvJKqHdehrFAZjDtAZqsX/sPy0RdTTSBrSNtf8CMr5bDHC/fLzjFQT/SgDlySOaVg65u4afXt5vcMAdAjpxP9vB+5SIvIe17o0lvTYIBvYAlCU/K9Pjq0Jod//3o/ODo+oeNCw5/DMoDivafx0fnbsKec3I0Zp8658YORfZOu/4VNHPvqs+UkPl//81hE3+EVy8hV4osdFALAwSnuj75KIJZSHKtuWwtBNnCvbJ7ZgmTy4upDCMu4OKbrUXrX5w+x8sfSgc1GeU9H4x7c/cgWCekBBs38wCT7zW2IaQC2KYMybcacB6EsW6fNEjlT7LTH3sQpdKh6OfhIxDZ808+PRpF9LBHAIozXfybEtJYVjVNpAPTzghNuXG1fAZ4Hq/qsNAHk8cn2iR+/7pFNPjVwXDlaKwuUCythdA2LusuN9KKezAmEwuW9o7CakmqKSaotjE/Pbm6AkGrJOPGiU5ZgRzZv7+LTZ38IDM3dWNJPDyhQ8XP/wekq/jBfBG29mgXFFzm2nZSj+rdzzh6GODG5CL/+Qic//+peaPHRQXJcicfgoWYAtnb6krFgOrpZjDkrkzJaUkYYU1BqYm1nsfIENJo/yLoOA5f5A06p4X60jRo5bvf+xhbU1L/3W8LPbFBryg+2gJvP28xHzUYoCTBYVes6JXLh8B7BOlJxLEA="
  // The CORTEX IMPLANT Logo
  const logoSvg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOTIzIiBoZWlnaHQ9IjI0MiI+PGRlZnM+PHBhdGggaWQ9InByZWZpeF9fYSIgZD0iTTAgMGg2djgwSDB6Ii8+PHBhdGggaWQ9InByZWZpeF9fYyIgZD0iTTAgMGgxMXY4MEgweiIvPjxwYXRoIGlkPSJwcmVmaXhfX2IiIGQ9Ik0wIDBoMTZ2ODBIMHoiLz48L2RlZnM+PGcgZmlsbD0iI2ZmZiI+PGcgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMjcgMTdoMTU1bC0xMyAzNUg2NmwzMiA0N2g1M2wtMTMgMzVIODBMMTcgNDN6bTE2NSAwaDEzM2wtNDYgMTE3SDE0NnptMjQgMzVoNThsLTE4IDQ3aC01OHptMTE5LTM1aDExOWwtMjggNzRoLTE2bC0xNC0xOSA3LTIwaC0zMWwzMyA0N2g3MWwtMTQgMzZoLTc1bC0zOS01NS0yMSA1NGgtMzd6bTEyOSAwaDE0MWwtMTMgMzVoLTUwbC0zMSA4MmgtMzdsMzEtODJoLTU0em0xNTAgMGgxNDRsLTEzIDM1aC05NGw0IDZoODhsLTEzIDM1aC05M2wtMzQtNDh6bS0yMCA0N2gxNWwyNCAzNWg5NGwtMTQgMzZoLTk3bC0zMS00NXptMTc1LTQ3aDM4bC05IDI0IDEyIDE3aDM5bDE1LTEyIDEyLTI5aDM3bC0xOSA1MS0yMSAxNiAxNSAyMS0xMiAzMWgtMzdsMTAtMjYtMTItMTdoLTQ2bC0xOCAxNC0xMSAyOWgtMzhsMTktNTAgMjgtMjItMTMtMTh6TTk5MSAxN2gzN2wtNDUgMTE5aC0zNnptNDcgMGgxNDZsLTQ1IDExN2gtMzdsMzEtODJoLTE2bC0xNyA0NWgtMzhsMTgtNDVoLTE5bC0zMSA4MmgtMzd6bTE1NiAwaDExOWwtMzAgNzgtMjggMTloLTYybC04IDIwaC0zN3ptMjMgMzVoNDVsLTggMjAgNSA2aC01MnptMTA0LTM1aDM4bC0zMiA4MmgxMDNsLTEzIDM1aC0xNDF6bTE1MCAwaDE0MmwtNDUgMTE4aC0zN2wzMS04M2gtNjdsLTE1IDQxIDM5LTI4IDI1IDI1LTU4IDQ0aC02MHptMTUxIDBoMTMzbC00NSAxMTdoLTM3bDMxLTgyaC01OGwtMzEgODJoLTM4em0xNDMgMGgxNDFsLTEzIDM1aC01MGwtMzEgODJoLTM3bDMxLTgyaC01NHoiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxNDUpIj48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9Ijc5Ii8+PHVzZSBocmVmPSIjcHJlZml4X19iIiB4PSIxMDIiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2MiIHg9IjEyNCIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYSIgeD0iMTQxIi8+PHVzZSBocmVmPSIjcHJlZml4X19hIiB4PSIxNjQiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2MiIHg9IjE3NiIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYSIgeD0iMjA0Ii8+PHVzZSBocmVmPSIjcHJlZml4X19jIiB4PSIyMjciLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9IjI0NCIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYiIgeD0iMjY3Ii8+PHVzZSBocmVmPSIjcHJlZml4X19jIiB4PSIyODkiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9IjMwNiIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYyIgeD0iMzI5Ii8+PHVzZSBocmVmPSIjcHJlZml4X19iIiB4PSIzNDciLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9IjM4MSIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYyIgeD0iMzkyIi8+PHVzZSBocmVmPSIjcHJlZml4X19hIiB4PSI0MjEiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9IjQzMiIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYSIgeD0iNDU1Ii8+PHVzZSBocmVmPSIjcHJlZml4X19jIiB4PSI0NzgiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9IjQ5NCIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYyIgeD0iNTE4Ii8+PHVzZSBocmVmPSIjcHJlZml4X19iIiB4PSI1MzUiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9IjU1NyIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYiIgeD0iNTgxIi8+PHVzZSBocmVmPSIjcHJlZml4X19jIiB4PSI2MDMiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9IjYyMCIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYyIgeD0iNjQzIi8+PHVzZSBocmVmPSIjcHJlZml4X19iIiB4PSI2NjAiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9IjY4MyIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYyIgeD0iNzA1Ii8+PHVzZSBocmVmPSIjcHJlZml4X19iIiB4PSI3MjMiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9Ijc1NyIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYSIgeD0iNzY4Ii8+PHVzZSBocmVmPSIjcHJlZml4X19jIiB4PSI3OTEiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2EiIHg9IjgwOCIvPjx1c2UgaHJlZj0iI3ByZWZpeF9fYSIgeD0iODMxIi8+PHVzZSBocmVmPSIjcHJlZml4X19iIiB4PSI4NDMiLz48dXNlIGhyZWY9IiNwcmVmaXhfX2MiIHg9Ijg2NSIvPjwvZz48cGF0aCBkPSJNOTQ0IDE0OGgxMXY0MWgtMTF6bTUwIDBoMTJjMSA0NiAyIDY3LTQzIDc3bC04LTEwYzI0LTQgMzktMTIgMzktMzh6bTYzLTRsMTMgOCAxMSAxMC0xMCA4LTIxLTE4em02MCAxMmw3IDhjLTE0IDM3LTU3IDUzLTcwIDU2bC03LTEwYzMyLTExIDU3LTIzIDcwLTU0em01OC03aDU1Yy0zIDQ2LTI4IDYyLTU1IDc2bC05LThjMTktOSA0Ny0yNCA1Mi01OWgtMzRjLTYgOC0xMSAxNC0yMSAyMWwtOC02YzktNiAxNy0xNiAyMC0yNG0xMDctNWgxMXYyOWw2LTVjMTQgMyAyNiA4IDM5IDE1bC05IDhjLTExLTctMjMtMTItMzYtMTZ2NDloLTExem00MyAybDMtMSA0IDExLTMgMnptOC0xbDMtMSA1IDEwLTMgMnptNDQgMzJoOHY5aC04em00NS0yNmg3NmMtMyAzMi0zMSA0NS0zOSA1MmwtOC04YzE2LTggMzUtMjcgMzEtMzRoLTYwem0xOSAzM2MxOSAxNCAyNSAyMSAzNCAzNmwtOSA0Yy0xMC0xNS0xOC0yNS0zMi0zNHptMTU5LTM5bDEwIDdjLTIzIDIyLTQzIDM0LTc0IDQ3bC04LTljMjMtOSA1Ni0yNyA3Mi00NXptLTIyIDI3djUyaC0xMXYtNDV6bTcxLTI4YzExIDYgMTQgOSAyNCAxOGwtOSA5Yy03LTctMTMtMTMtMjEtMTh6bTYxIDEybDYgOGMtMTAgMzMtNDggNDktNjkgNTdsLTctMTFjMzEtMTAgNTctMjQgNzAtNTR6bTQzLTloNTljMSAzNi0yOCA2MC01NCA3N2wtMTAtOGMyOC0xMyA1My00NSA1MC01OWgtNDV6bTM4IDQyYzE2IDkgMjYgMTkgMzUgMzFsLTE0IDRjLTgtMTMtMjItMjQtMjctMjd6bTIzLTQ0bDQtMSA0IDEzLTQgMXptNi0ybDQtMiA1IDEyLTQgMnoiLz48L2c+PC9zdmc+"
  // The animateable "boost" svg
  const boostSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='22' height='209'><path d='M4.97 3.16c-.1.03-.17.1-.22.18L.8 8.24c-.2.3.03.78.4.8H3.6v2.68c0 4.26-.55 3.62 3.66 3.62h7.66l-2.3-2.84c-.03-.02-.03-.04-.05-.06H7.27c-.44 0-.72-.3-.72-.72v-2.7h2.5c.37.03.63-.48.4-.77L5.5 3.35c-.12-.17-.34-.25-.53-.2zm12.16.43c-.55-.02-1.32.02-2.4.02H7.1l2.32 2.85.03.06h5.25c.42 0 .72.28.72.72v2.7h-2.5c-.36.02-.56.54-.3.8l3.92 4.9c.18.25.6.25.78 0l3.94-4.9c.26-.28 0-.83-.37-.8H18.4v-2.7c0-3.15.4-3.62-1.25-3.66z' fill='%23606984' stroke-width='0'/><path d='M7.78 19.66c-.24.02-.44.25-.44.5v2.46h-.06c-1.08 0-1.86-.03-2.4-.03-1.64 0-1.25.43-1.25 3.65v4.47c0 4.26-.56 3.62 3.65 3.62H8.5l-1.3-1.06c-.1-.08-.18-.2-.2-.3-.02-.17.06-.35.2-.45l1.33-1.1H7.28c-.44 0-.72-.3-.72-.7v-4.48c0-.44.28-.72.72-.72h.06v2.5c0 .38.54.63.82.38l4.9-3.93c.25-.18.25-.6 0-.78l-4.9-3.92c-.1-.1-.24-.14-.38-.12zm9.34 2.93c-.54-.02-1.3.02-2.4.02h-1.25l1.3 1.07c.1.07.18.2.2.33.02.16-.06.3-.2.4l-1.33 1.1h1.28c.42 0 .72.28.72.72v4.47c0 .42-.3.72-.72.72h-.1v-2.47c0-.3-.3-.53-.6-.47-.07 0-.14.05-.2.1l-4.9 3.93c-.26.18-.26.6 0 .78l4.9 3.92c.27.25.82 0 .8-.38v-2.5h.1c4.27 0 3.65.67 3.65-3.62v-4.47c0-3.15.4-3.62-1.25-3.66zM10.34 38.66c-.24.02-.44.25-.43.5v2.47H7.3c-1.08 0-1.86-.04-2.4-.04-1.64 0-1.25.43-1.25 3.65v4.47c0 3.66-.23 3.7 2.34 3.66l-1.34-1.1c-.1-.08-.18-.2-.2-.3 0-.17.07-.35.2-.45l1.96-1.6c-.03-.06-.04-.13-.04-.2v-4.48c0-.44.28-.72.72-.72H9.9v2.5c0 .36.5.6.8.38l4.93-3.93c.24-.18.24-.6 0-.78l-4.94-3.92c-.1-.08-.23-.13-.36-.12zm5.63 2.93l1.34 1.1c.1.07.18.2.2.33.02.16-.03.3-.16.4l-1.96 1.6c.02.07.06.13.06.22v4.47c0 .42-.3.72-.72.72h-2.66v-2.47c0-.3-.3-.53-.6-.47-.06.02-.12.05-.18.1l-4.94 3.93c-.24.18-.24.6 0 .78l4.94 3.92c.28.22.78-.02.78-.38v-2.5h2.66c4.27 0 3.65.67 3.65-3.62v-4.47c0-3.66.34-3.7-2.4-3.66zM13.06 57.66c-.23.03-.4.26-.4.5v2.47H7.28c-1.08 0-1.86-.04-2.4-.04-1.64 0-1.25.43-1.25 3.65v4.87l2.93-2.37v-2.5c0-.44.28-.72.72-.72h5.38v2.5c0 .36.5.6.78.38l4.94-3.93c.24-.18.24-.6 0-.78l-4.94-3.92c-.1-.1-.24-.14-.38-.12zm5.3 6.15l-2.92 2.4v2.52c0 .42-.3.72-.72.72h-5.4v-2.47c0-.3-.32-.53-.6-.47-.07.02-.13.05-.2.1L3.6 70.52c-.25.18-.25.6 0 .78l4.93 3.92c.28.22.78-.02.78-.38v-2.5h5.42c4.27 0 3.65.67 3.65-3.62v-4.47-.44zM19.25 78.8c-.1.03-.2.1-.28.17l-.9.9c-.44-.3-1.36-.25-3.35-.25H7.28c-1.08 0-1.86-.03-2.4-.03-1.64 0-1.25.43-1.25 3.65v.7l2.93.3v-1c0-.44.28-.72.72-.72h7.44c.2 0 .37.08.5.2l-1.8 1.8c-.25.26-.08.76.27.8l6.27.7c.28.03.56-.25.53-.53l-.7-6.25c0-.27-.3-.48-.55-.44zm-17.2 6.1c-.2.07-.36.3-.33.54l.7 6.25c.02.36.58.55.83.27l.8-.8c.02 0 .04-.02.04 0 .46.24 1.37.17 3.18.17h7.44c4.27 0 3.65.67 3.65-3.62v-.75l-2.93-.3v1.05c0 .42-.3.72-.72.72H7.28c-.15 0-.3-.03-.4-.1L8.8 86.4c.3-.24.1-.8-.27-.84l-6.28-.65h-.2zM4.88 98.6c-1.33 0-1.34.48-1.3 2.3l1.14-1.37c.08-.1.22-.17.34-.2.16 0 .34.08.44.2l1.66 2.03c.04 0 .07-.03.12-.03h7.44c.34 0 .57.2.65.5h-2.43c-.34.05-.53.52-.3.78l3.92 4.95c.18.24.6.24.78 0l3.94-4.94c.22-.27-.02-.76-.37-.77H18.4c.02-3.9.6-3.4-3.66-3.4H7.28c-1.08 0-1.86-.04-2.4-.04zm.15 2.46c-.1.03-.2.1-.28.2l-3.94 4.9c-.2.28.03.77.4.78H3.6c-.02 3.94-.45 3.4 3.66 3.4h7.44c3.65 0 3.74.3 3.7-2.25l-1.1 1.34c-.1.1-.2.17-.32.2-.16 0-.34-.08-.44-.2l-1.65-2.03c-.06.02-.1.04-.18.04H7.28c-.35 0-.57-.2-.66-.5h2.44c.37 0 .63-.5.4-.78l-3.96-4.9c-.1-.15-.3-.23-.47-.2zM4.88 117.6c-1.16 0-1.3.3-1.3 1.56l1.14-1.38c.08-.1.22-.14.34-.16.16 0 .34.04.44.16l2.22 2.75h7c.42 0 .72.28.72.72v.53h-2.6c-.3.1-.43.54-.2.78l3.92 4.9c.18.25.6.25.78 0l3.94-4.9c.22-.28-.02-.77-.37-.78H18.4v-.53c0-4.2.72-3.63-3.66-3.63H7.28c-1.08 0-1.86-.03-2.4-.03zm.1 1.74c-.1.03-.17.1-.23.16L.8 124.44c-.2.28.03.77.4.78H3.6v.5c0 4.26-.55 3.62 3.66 3.62h7.44c1.03 0 1.74.02 2.28 0-.16.02-.34-.03-.44-.15l-2.22-2.76H7.28c-.44 0-.72-.3-.72-.72v-.5h2.5c.37.02.63-.5.4-.78L5.5 119.5c-.12-.15-.34-.22-.53-.16zm12.02 10c1.2-.02 1.4-.25 1.4-1.53l-1.1 1.36c-.07.1-.17.17-.3.18zM5.94 136.6l2.37 2.93h6.42c.42 0 .72.28.72.72v1.25h-2.6c-.3.1-.43.54-.2.78l3.92 4.9c.18.25.6.25.78 0l3.94-4.9c.22-.28-.02-.77-.37-.78H18.4v-1.25c0-4.2.72-3.63-3.66-3.63H7.28c-.6 0-.92-.02-1.34-.03zm-1.72.06c-.4.08-.54.3-.6.75l.6-.74zm.84.93c-.12 0-.24.08-.3.18l-3.95 4.9c-.24.3 0 .83.4.82H3.6v1.22c0 4.26-.55 3.62 3.66 3.62h7.44c.63 0 .97.02 1.4.03l-2.37-2.93H7.28c-.44 0-.72-.3-.72-.72v-1.22h2.5c.4.04.67-.53.4-.8l-3.96-4.92c-.1-.13-.27-.2-.44-.2zm13.28 10.03l-.56.7c.36-.07.5-.3.56-.7zM17.13 155.6c-.55-.02-1.32.03-2.4.03h-8.2l2.38 2.9h5.82c.42 0 .72.28.72.72v1.97H12.9c-.32.06-.48.52-.28.78l3.94 4.94c.2.23.6.22.78-.03l3.94-4.9c.22-.28-.02-.77-.37-.78H18.4v-1.97c0-3.15.4-3.62-1.25-3.66zm-12.1.28c-.1.02-.2.1-.28.18l-3.94 4.9c-.2.3.03.78.4.8H3.6v1.96c0 4.26-.55 3.62 3.66 3.62h8.24l-2.36-2.9H7.28c-.44 0-.72-.3-.72-.72v-1.97h2.5c.37.02.63-.5.4-.78l-3.96-4.9c-.1-.15-.3-.22-.47-.2zM5.13 174.5c-.15 0-.3.07-.38.2L.8 179.6c-.24.27 0 .82.4.8H3.6v2.32c0 4.26-.55 3.62 3.66 3.62h7.94l-2.35-2.9h-5.6c-.43 0-.7-.3-.7-.72v-2.3h2.5c.38.03.66-.54.4-.83l-3.97-4.9c-.1-.13-.23-.2-.38-.2zm12 .1c-.55-.02-1.32.03-2.4.03H6.83l2.35 2.9h5.52c.42 0 .72.28.72.72v2.34h-2.6c-.3.1-.43.53-.2.78l3.92 4.9c.18.24.6.24.78 0l3.94-4.9c.22-.3-.02-.78-.37-.8H18.4v-2.33c0-3.15.4-3.62-1.25-3.66zM4.97 193.16c-.1.03-.17.1-.22.18l-3.94 4.9c-.2.3.03.78.4.8H3.6v2.68c0 4.26-.55 3.62 3.66 3.62h7.66l-2.3-2.84c-.03-.02-.03-.04-.05-.06H7.27c-.44 0-.72-.3-.72-.72v-2.7h2.5c.37.03.63-.48.4-.77l-3.96-4.9c-.12-.17-.34-.25-.53-.2zm12.16.43c-.55-.02-1.32.03-2.4.03H7.1l2.32 2.84.03.06h5.25c.42 0 .72.28.72.72v2.7h-2.5c-.36.02-.56.54-.3.8l3.92 4.9c.18.25.6.25.78 0l3.94-4.9c.26-.28 0-.83-.37-.8H18.4v-2.7c0-3.15.4-3.62-1.25-3.66z' fill='%23606984' stroke-width='0'/></svg>"

  // #endregion

  GM_addStyle(`

/* ====================
 * Misc general changes
 * ==================== */

/* ===== BUTTONS ===== */

/* adjust color of fav button */
.icon-button.star-icon.active {
    color: var(--color-gold);
}

.button, button {
    border-radius: var(--border-radius-button);
}

/* Remove underline from button links */
a.button {
    text-decoration: none;
}
.button.logo-button {
    line-height: 1;
}

button[disabled] {
    cursor: not-allowed !important;
}

.account__header__tabs__buttons {
    gap: var(--border-radius-button-between);
}
.account__header__tabs__buttons > * {
    border-radius: var(--border-radius-button-between);
}
.account__header__tabs__buttons > :first-child {
    border-top-left-radius: var(--border-radius-button);
    border-bottom-left-radius: var(--border-radius-button);
}
.account__header__tabs__buttons > :last-child {
    border-top-right-radius: var(--border-radius-button);
    border-bottom-right-radius: var(--border-radius-button);
}
.account__header__tabs__buttons > span > * {
    border-radius: inherit !important;
}

/* ===== special formatting ===== */

/* improve visibility of mentions (and thereby hashtags) and code snippets */
a.mention,
code {
    background: rgba(255 255 255 / 0.1);
    border-radius: 4px;
    padding: 1px 5px;
    margin-inline: -2px;
}
/* inline code uses just <code>, code blocks are additionally wrapped in a <pre> */
pre > code {
    display: block
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

/* hide some UI that looks broken from the latest 4.1.2+glitch update */

.status__avatar {
    box-shadow: none;
}

.notification__line, .status__line {
    display: none;
}

/* Make clickable area of posts larger */

.status:not(.collapsed) .status__content--with-action {
    padding-top: 58px;
    margin-top: -48px;
    margin-bottom: 0;
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
    height: 100%;
    display: grid;
    grid-auto-flow: column;
    justify-items: center;
    align-items: center;
    grid-auto-columns: 1fr;
}
.status__content__spoiler-link {
    border-radius: 100vh;
    padding-inline: 10px;
    vertical-align: text-bottom;
}
.status__content--with-spoiler > div:not(.status__content__spoiler) {
    line-height: 1.5em;
}

#mastodon[data-props='{"locale":"de"}'] .compose-form__publish-button-wrapper > .button.primary::after {
    content: "Cybertrööt!"
}

/* center the "USERNAME boosted" text at the top of a toot */
.status__prepend {
    flex-grow: 0;
    align-self: center;
    margin-left: 26px;
}
.status__prepend:hover {
    z-index: 2;
}

/* make sure links to user profiles are consistently underlined on hover */
aside .status__display-name:hover,
.status.collapsed .display-name:hover .display-name__html {
    text-decoration: underline;
}
@keyframes statusPrependIcon {
    0%   { background-position: 0   0%; }
    20%  { background-position: 0 100%; }
    100% { background-position: 0 100%; }
}

.status__prepend .fa-retweet.status__prepend-icon {
    background-image: url("${boostSvg}");
    background-position: 0 0;
    width: 22px;
    /* scale to 17px via transform to keep the multi-sprite layout intact */
    transform: scale(calc(17 / 22)) translateY(-1px);
    aspect-ratio: 22 / 19;
    background-size: cover;
    animation: 4.5s infinite normal statusPrependIcon steps(10);
}
.status__prepend .fa-retweet.status__prepend-icon:before {
    display: none;
}

/* Better gradient on collapsed toots */
.status.collapsed .status__content {
    height: 35px;
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

/* Make filtered posts less intrusive */

.status__wrapper--filtered {
    padding: 0;
    background: var(--color-grey-0);
    outline: 3px solid var(--color-grey-0);
    outline-offset: -1px;
}

`)

  /* Add our logo */
  GM_addStyle(`

@media screen and (min-width: 1175px) {

    body.flavour-glitch .columns-area__panels__pane--navigational .columns-area__panels__pane__inner:before {
        content: "";
        object-fit: contain;
        background: url(${logoSvg});
        display: block;
        background-repeat: no-repeat;
        background-position: center;
        height: 48px;
        margin-top: 10px;
        --glow-radius: 2px;
        backdrop-filter: blur(2px) saturate(1.5);
        margin-inline: -10px;
        max-width: calc(100% + 20px);
        background-size: calc(100% - 20px);
    }

    @keyframes move-background {
        0%   { background-position:   0% 50%; }
        100% { background-position: 600% 50%; }
    }

    body.flavour-glitch .columns-area__panels__pane--navigational .columns-area__panels__pane__inner:after {
        content: "";
        -webkit-mask-image: url(${logoSvg});
        display: block;
        height: 48px;
        margin-top: 10px;
        position: absolute;
        top: 0;
        width: 100%;
        z-index: -1;
        background-image: linear-gradient(110deg,
            hsl(330deg  99% 71%),
            hsl(  0deg 100% 50%),
            hsl( 33deg 100% 50%),
            hsl( 60deg 100% 50%),
            hsl(120deg 100% 28%),
            hsl(180deg 100% 38%),
            hsl(265deg  99% 30%),
            hsl(300deg 100% 28%),
            hsl(330deg  99% 71%));
        -webkit-mask-size: contain;
        -webkit-mask-repeat: no-repeat;
        -webkit-mask-position: center;
        background-repeat: repeat;
        background-size: 600%;

        animation: 400ms fadeIn ease-out, move-background 60s 1s linear infinite;
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

  /* neon-ify the page */
  GM_addStyle(`
body {
    background: var(--color-grey-0)
}

/* ====================
 *   Neon-ify the page
 * ====================*/

/* min-width: 1175px is Mastodon's breakpoint after which it shows the "desktop" ui */
@media screen and (min-width: 1175px) {

    /* ===== Buttons get a glow-on-hover ===== */

    .button {
        outline: 1px solid transparent;
        outline-offset: -1px;
        transition: box-shadow var(--anim-dur), outline-color var(--anim-dur), background-color var(--anim-dur);
        background-color: var(--color-primary)
    }
    /* These buttons are transparent by default, restore that default */
    .block-modal__cancel-button, .confirmation-modal__cancel-button, .confirmation-modal__secondary-button, .mute-modal__cancel-button {
        --color-primary: transparent;
    }

    .button:not([disabled]):hover {
        outline-color: var(--color-hl-primary);
        box-shadow: var(--neon-box-shadow-small);
    }

    /* poll options get similar treatment */

    .status__content .poll li {
        border-radius: var(--border-radius-button-between);
        border: 1px solid var(--color-grey-4);
        margin-bottom: var(--border-radius-button-between);
    }
    .status__content .poll li:first-of-type {
        border-top-left-radius: var(--border-radius-button);
        border-top-right-radius: var(--border-radius-button);
        border: 1px solid var(--color-grey-4);
    }
    .status__content .poll li:last-of-type {
        border-bottom-left-radius: var(--border-radius-button);
        border-bottom-right-radius: var(--border-radius-button);
        border: 1px solid var(--color-grey-4);
    }

    .status__content .poll__option {
        padding: 12px 8px;
        border-radius: inherit
    }

    .status__content .poll__option.selectable {
        outline: 1px solid var(--color-grey-5);
        transition: background-color var(--anim-dur), outline-color var(--anim-dur);
    }
    .status__content .poll__option.selectable:hover {
        background-color: var(--color-grey-4);
        outline-color: var(--color-grey-6);
    }

    .status__content .poll__chart {
        margin-top: -3px;
        background: var(--color-grey-7);
        border-radius: unset;
        border-bottom-left-radius: inherit;
        border-bottom-right-radius: inherit;
    }

    .status__content .poll__chart.leading {
        box-shadow: var(--neon-box-shadow-small);
        background: var(--color-primary);
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
        border-top: 1px solid var(--color-grey-9);
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

    :is(#fake, .compose-form__warning) {
        border-radius: 8px;
    }

    :is(#fake, .compose-form__autosuggest-wrapper) {
        border-radius: 8px;
        border: 1px solid var(--color-grey-7);
        /* Make sure this is above the autosuggest window at z 99 */
        z-index: 100;
        transition: box-shadow 200ms;
        background: white;
        padding: 10px 0;
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
        top: 0;
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
        border: 1px solid var(--color-grey-7);
    }

    :is(#fakeId, .compose-form__buttons-wrapper) {
        border-radius: 8px;
        margin-top: -20px;
        padding-top: 30px;
        background: var(--color-grey-9);
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
        border: 1px solid var(--color-grey-7);
        box-sizing: border-box;
        padding-top: 5px;
    }
    .compose-form .spoiler-input.spoiler-input--visible {
        margin-bottom: -13px;
        height: 69px; /* nice */
    }

    .spoiler-input + .compose-form__autosuggest-wrapper {
        /* pull this up by 7px to compensate for .spoiler-input's 7px of padding + border */
        margin-top: -7px;
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
        font-size: 15px;
        padding: 12.5px 15px;
    }

    .getting-started__trends h4 a:hover:before,
    .column-link--transparent:hover:before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(to right, hsl(var(--hsl-offwhite-blue) / 0.05), hsl(var(--hsl-offwhite-blue) / 0.1));
        border-radius: 8px;

        animation: 200ms flicker-in ease-out;
    }
    .getting-started__trends h4 a:hover:after,
    .column-link--transparent:hover span:after {
        content: "";
        position: absolute;
        top: 8px;
        right: 8px;
        bottom: 8px;
        width: 1px;
        background: var(--color-offwhite-primary);
        box-shadow: var(--neon-box-shadow);

        animation: 200ms flicker-in ease-out;
    }

    /* make the "trending now" look like the rest of the menu items */

    .getting-started__trends h4 {
        padding: 0;
        border: none;
    }
    .getting-started__trends h4 a {
        position: relative;
        text-transform: none;
        padding: 12.5px 15px;
        display: block;
        padding-inline-start: calc(25px + 1.28571429em);
    }
    /* trending hashtags in feeds */
    .getting-started__trends h4 span {
        color: #d9e1e8;
        font-size: 15px;
    }
    /* profile's featured hashtags */
    .getting-started__trends h4>span {
        margin: 15px;
        display: block;
        text-transform: none;
        padding-inline-start: calc(5px + 1.28571429em);
    }
    .getting-started__trends h4 span:before {
        content: "";
        font-family: FontAwesome;
        margin-right: 5px;
        width: 1.28571429em;
        text-align: center;
        display: inline-block;
        margin-inline-start: calc(-5px - 1.28571429em);
    }

    .getting-started__trends .trends__item {
        padding: 10px 15px;
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
        outline: 1px solid var(--color-grey-6);
        outline-offset: -1px;
        background: var(--color-grey-5);
    }

    #tabs-bar__portal>button:after,
    .column-header__wrapper:after,
    h1:where(#Lists, #Follow-requests):after
    {
        content: "";
        position: absolute;
        inset: 0px;
        border-radius: inherit;
        border: 1px solid var(--color-grey-5);
        z-index: 2;
        pointer-events: none;
    }

    #tabs-bar__portal>button,
    .column-header__wrapper {
        border-radius: 8px;
        backdrop-filter: blur(3px);
        background: hsla(var(--hsl-grey-3) / 0.8);
        transition: box-shadow 200ms;
    }
    #tabs-bar__portal>button:hover,
    .column-header__wrapper:hover,
    h1:where(#Lists, #Follow-requests):hover {
        box-shadow: var(--neon-box-shadow-small);
    }
    #tabs-bar__portal>button:hover:after,
    .column-header__wrapper:hover:after,
    h1:where(#Lists, #Follow-requests):hover:after {
        border-color: var(--color-grey-7);
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
    .column-header__back-button:hover,
    .column-back-button:hover {
        color: var(--color-white);
    }

    .column-header__button:before,
    .column-header__back-button:before,
    .column-back-button:before {
        content: "";
        position: absolute;
        inset: 4px;
        border-radius: 8px;
        background: none;
        transition: background 200ms, color 200ms;
        z-index: -1;
    }

    .column-header__button:hover:before,
    .column-header__back-button:hover:before,
    .column-back-button:hover:before {
        background: var(--color-grey-6);
    }

    .column-header__button.active {
        border-radius: 8px 8px 0 0;
    }

    .column-header__collapsible {
        background: var(--color-grey-5);
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
        border: 1px solid var(--color-grey-4);
    }

    .dismissable-banner__action button {
        min-width: 40px;
        min-height: 40px;
    }

    /* ===== Posts styling ===== */

    .status {
        display: flex;
        flex-direction: column;
    }

    .status-unlisted,
    .detailed-status-unlisted {
        --color-privacy: var(--color-green, white);
    }
    .status-public,
    .detailed-status-public {
        --color-privacy: var(--color-grey-8, white);
    }
    .status-direct,
    .detailed-status-direct {
        --color-privacy: var(--color-red, white);
    }
    .status-private,
    .detailed-status-private {
        --color-privacy: var(--color-yellow, white);
    }

    .status-unlisted,
    .status-public,
    .status-direct,
    .status-private {
        box-shadow: 0px 4px 10px -8px var(--color-privacy);
    }
    .hicolor-privacy-icons .status__visibility-icon.fa-unlock,
    .hicolor-privacy-icons .status__visibility-icon.fa-globe,
    .hicolor-privacy-icons .status__visibility-icon.fa-envelope,
    .hicolor-privacy-icons .status__visibility-icon.fa-lock {
        color: var(--color-privacy);
    }

    .hicolor-privacy-icons .privacy-dropdown__option .fa-unlock {
        color: var(--color-green);
    }
    .hicolor-privacy-icons .privacy-dropdown__option .fa-globe {
        color: var(--color-grey-8);
    }
    .hicolor-privacy-icons .privacy-dropdown__option .fa-envelope {
        color: var(--color-red);
    }
    .hicolor-privacy-icons .privacy-dropdown__option .fa-lock {
        color: var(--color-yellow);
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
        border: 1px solid var(--color-grey-4);
        background: var(--color-grey-2);
        border-radius: var(--border-radius-button);
    }

    .explore__search-results>button {
        margin-bottom: 20px;
        border: 1px solid var(--color-grey-4);
        border-radius: 8px;
        transition: background 200ms, box-shadow 200ms, color 200ms;
    }
    .explore__search-results>button:hover {
        box-shadow: var(--neon-box-shadow-small);
        color: var(--color-white);
    }

    .explore__search-results .trends__item {
        border-bottom: none;
    }
    .explore__search-results .trends__item+div[tabindex="-1"] {
        margin-top: 20px
    }



    /* give the selected post in single-post-view a lighter background */
    .columns-area--mobile .scrollable>div[tabindex="-1"]:has(.detailed-status) {
        box-shadow: var(--neon-box-shadow-small);
        border-color: var(--color-grey-7);
        background: var(--color-grey-3);
    }
    .detailed-status {
        border-top: none
    }
    .detailed-status .status__content {
        font-size: 15px;
        line-height: 20px;
    }

    /* remove bottom border on all kinds of posts */
    .status,
    /* follow notifications */
    .notification .account,
    /* and the "load more" button */
    .load-gap {
        border-bottom: none;
        border-radius: inherit;
    }

    :is(#fake, .status__action-bar) {
        margin-top: 15px;
        margin-bottom: 0;
    }

    .status__action-bar,
    .detailed-status__action-bar {
        height: 40px;
        gap: var(--border-radius-button-between);
    }

    :where(.status__action-bar, .detailed-status__action-bar)
    :is(button, .status__action-bar-dropdown, detailed-status__action-bar-dropdown) {
        height: 100% !important;
        min-width: 40px !important;
        border-radius: 8px;
        z-index: 1;
    }
    .detailed-status__action-bar-dropdown span {
        height: 100%;
    }

    /* Make sure everything inside a post follows the border radius */
    article > div[tabindex="-1"],
    .focusable,
    .columns-area--mobile article > div,
    .columns-area--mobile article > div > .notification.unread,
    .columns-area--mobile article > div > .notification.unread:before,
    .columns-area--mobile article > div > .status__wrapper.unread,
    .columns-area--mobile article > div > .status__wrapper.unread:before {
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
    .columns-area--mobile .scrollable>div:first-of-type:not(:where(
        .account__section-headline, .account-timeline__header, [role=feed], [tabindex="-1"]
    )) {
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
        padding: 15px;
        padding-top: 0;
    }

    /* Notifications / explore */

    article .account {
        border: none;
    }

    .account__section-headline {
        padding-inline: 10px;
    }

    .account__section-headline,
    .notification__filter-bar {
        border-radius: 8px;
        border: 1px solid var(--color-grey-4);
    }
    .notification__filter-bar {
        margin-top: -20px;
        padding-top: 40px;
    }

    .account__section-headline :is(button, a),
    .notification__filter-bar button {
        border-radius: inherit;
        flex: 1 1 0;
    }

    .account__section-headline :is(button, a) span,
    .notification__filter-bar button span,
    .notification__filter-bar button i {
        transition: color 200ms
    }
    .account__section-headline :is(button, a):hover span,
    .notification__filter-bar button:hover span,
    .notification__filter-bar button:hover i {
        color: var(--color-white);
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
        background-color: var(--color-grey-6);
    }


    /* Mentions use .status__wrapper directly, all other notifications are wrapped in a .notification div */
    .status.unread:after,
    .notification.unread:after {
        content: "";
        position: absolute;
        top: 4px;
        bottom: 4px;
        left: 1px;
        width: 2px;
        background: white;
        box-shadow: var(--neon-box-shadow);
        z-index: -1;
        opacity: 0;
        animation: flicker-in 200ms ease-out 200ms both;
    }

    /* Notification Coloring */

    /* Color the icon */
    .notification__message :is(#fake, .fa) {
        color: var(--color-notification)
    }

    [data-column="notifications"] .status {
        --color-notification: var(--color-grey-8);
    }

    [data-column="notifications"] .status[data-favourited-by] {
        --color-notification: var(--color-gold);
    }

    .notification-follow,
    .notification-admin-sign-up,
    [data-column="notifications"] .status[data-boosted-by] {
        --color-notification: var(--color-purple);
    }


    .notification-admin-report {
        --color-notification: var(--color-orange);
    }

    :is(
        #fake,
        .status.unread,
        .notification.unread,
    ) {
        border-left-style: solid;
        border-left-width: 4px;
        border-left-color: var(--color-notification, transparent);
        border-radius: inherit;
    }

    :is(#fake, .status.unread) {
        padding-left: 11px;
    }

    :is(.notification-admin-sign-up,
        .notification-follow,
        .notification-admin-report)
    .notification__message {
        margin-left: 15px;
    }
    :is(.notification-admin-sign-up,
        .notification-follow,
        .notification-admin-report
    ).unread .notification__message {
        margin-left: 11px;
    }

    :is(.notification-admin-sign-up,
        .notification-follow,
    ).unread .account {
        padding-left: 6px;
    }
    .notification-admin-report.unread .notification__report {
        margin-left: -4px;
    }

    :is(.notification-admin-sign-up,
        .notification-follow
    ) .account__wrapper {
        margin-block: 1em 0.5em;
    }

    :is(.notification-admin-sign-up,
        .notification-follow
    ) .account__avatar-wrapper {
        margin-left: 5px;
    }

    :is(
        #fake,
        .status,
        .notification,
    ):before {
        content: "";
        position: absolute;
        inset: 0;
        left: unset;

        width: 100%;

        background-color: var(--color-notification, transparent);
        opacity: 0.05;
        border-radius: inherit;

        pointer-events: none;
    }

    .notification-follow, .notification-follow-request {
        border-bottom: none;
    }


    /* ===== Profile ===== */

    .account-timeline__header {
        margin-bottom: 20px;
        border-radius: 8px;
        border: 1px solid var(--color-grey-4);
        background: var(--color-grey-1);
    }
    .account__header {
        border-radius: inherit;
    }

    .account__header ,
    .account__header__bar,
    .account__header__bio {
        overflow: visible;
    }

    .account__header__bar {
        border-radius: 0 0 8px 8px;
        border-bottom: 1px solid var(--color-grey-4);
    }

    .account__header__image {
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
    }

    .account__header__account-note {
        border: 1px solid #42485a;
        border-radius: 8px;
        margin: 0;
    }

    .account__header__tabs__buttons .icon-button {
        font-size: 18px !important;
        height: 36px !important;
        width: unset !important;
        min-width: 36px;
        box-sizing: border-box;
    }

    .account__disclaimer {
        margin: 10px 5px;
    }

    .account__action-bar {
        border-radius: var(--border-radius-button);
        border: none;
        margin: 10px;
    }

    .account__action-bar-links {
        border-radius: inherit;
    }

    :is(.account__action-bar__tab, #fake) {
        border: 1px solid var(--color-grey-5);
    }
    .account__action-bar__tab {
        border: 1px solid var(--color-grey-5);
        border-radius: var(--border-radius-button-between);
        transition: background-color 200ms;
        position: relative;
    }
    .account__action-bar__tab.active {
        background-color: var(--color-grey-2);
    }
    .account__action-bar__tab + .account__action-bar__tab {
        margin-inline-start: var(--border-radius-button-between);
    }
    .account__action-bar__tab:first-child {
        border-top-left-radius: inherit;
        border-bottom-left-radius: inherit;
    }
    .account__action-bar__tab:last-child {
        border-top-right-radius: inherit;
        border-bottom-right-radius: inherit;
    }

    .account__action-bar__tab:hover {
        background-color: var(--color-grey-4);
    }

    :is(.account__action-bar__tab, #fake):hover {
        border-color: var(--color-grey-6);
    }
    .account__action-bar__tab>* {
        position: relative;
    }

    .account__action-bar__tab.active:before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        border-bottom: 4px solid var(--color-primary);
    }






    /* ===== Account links ===== */

    .account__header__bio .account__header__fields {
        border-radius: var(--border-radius-button);
        margin: 10px;
        border: none;
    }

    .account__header__fields dl {
        border: none;
        border-radius: var(--border-radius-button-between);
    }
    .account__header__fields dl+dl {
        margin-top: var(--border-radius-button-between);
    }
    .account__header__fields dl:first-of-type {
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
    }
    .account__header__fields dl:last-of-type {
        border-bottom-left-radius: inherit;
        border-bottom-right-radius: inherit;
    }

    .account__header__fields dt,
    .account__header__fields dd {
        border-radius: var(--border-radius-button-between);
    }

    .account__header__fields dt {
        /* border: 1px solid var(--color-grey-6); */
        background: var(--color-grey-1);
        border-top-left-radius: inherit;
        border-bottom-left-radius: inherit;
        width: 200px;
        margin-right: var(--border-radius-button-between);
    }

    .account__header__fields dd {
        border: 1px solid var(--color-grey-6);
        background: hsl(var(--hsl-offwhite-blue) / 0.05);
        position: relative;
    }

    .account__header__fields dd a:before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        opacity: 0;
        background-image: radial-gradient(currentColor, transparent);
        transition: opacity 200ms;
    }
    .account__header__fields dd a:hover:before {
        opacity: 0.1;
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
        background: var(--color-grey-1);
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

    /* Lists / Follower requests */
    h1#Lists, h1#Follow-requests {
        margin-left: -10px;
        margin-right: -10px;
        border-radius: 8px;
        backdrop-filter: blur(3px);
        background: hsla(var(--hsl-grey-3) / 0.8);
        transition: box-shadow 200ms;
        position: sticky;
        top: 10px;
    }
    .column-back-button--slim {
        position: sticky;
        top: 58px;
        z-index: 2;
    }
    .column-back-button--slim [role="button"] {
        margin-right: -10px;
        width: auto;
        border-radius: 8px
    }

    .column-inline-form {
        margin-top: 20px;
        outline: 1px solid var(--color-grey-4);
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
        background: var(--color-grey-3);
        box-sizing: border-box;
        border-radius: 8px;
        border-left: 1px solid;
        border-right: 1px solid;
        border-color: var(--color-grey-7);
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
        border: 1px solid var(--color-grey-6);
    }
    .account-card__permalink,
    .account-card__header,
    .account-card__header img{
        border-radius: inherit;
    }

    .account-card__header {
        padding: 0;
    }

    .account-card__title {
        position: relative;
    }


    /* ====================
     *     Scrollbars
     * ==================== */

    html {
        scrollbar-color: var(--color-grey-3) rgba(0,0,0,.1);
    }

    ::-webkit-scrollbar {
        width: 12px;
        height: 12px;
    }

    ::-webkit-scrollbar-thumb {
        margin: 0 2px;
        width: 8px;
        background: var(--color-grey-2);
        border: 1px solid var(--color-grey-4);
        border-radius: 50px;

        transition: background-color 200ms;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: var(--color-grey-4);
        border-color: var(--color-grey-6);
    }

    ::-webkit-scrollbar-thumb:active {
        background: var(--color-grey-6);
        border-color: var(--color-grey-7);
    }

    ::-webkit-scrollbar-track {
        border: 0 #fff;
        border-radius: 8px;
        background: rgba(0,0,0,.1);
    }

    ::-webkit-scrollbar-track:active,
    ::-webkit-scrollbar-track:hover {
        background: var(--color-grey-2);
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

    /* ===== Feeds ===== */

    .columns-area:not(.columns-area--mobile) .scrollable {
        background: transparent;
    }

    .columns-area:not(.columns-area--mobile) :where(
        .scrollable article,
        .scrollable.detailed-status__wrapper .focusable
    ) {
        background: var(--color-grey-2);
        border-radius: 8px;
        border: 1px solid var(--color-grey-4);
        margin-bottom: 10px;
    }

    .columns-area:not(.columns-area--mobile) .scrollable.detailed-status__wrapper .focusable:not(.status) {
        background: var(--color-grey-3);
        border-color: var(--color-grey-7);
    }

    .columns-area:not(.columns-area--mobile) :where(
        .notification--in-thread .status__action-bar,
        .notification--in-thread .status__content,
        .status--in-thread .status__action-bar,
        .status--in-thread .status__content
    ) {
        -webkit-margin-start: 0;
        margin-inline-start: 0;
        width: 100%;
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
        border: 1px solid var(--color-grey-6);
    }

    body.layout-multiple-columns .drawer__inner {
        background: linear-gradient(180deg, transparent 50%, var(--color-grey-5));
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
        background: var(--color-grey-5);
        border-radius: inherit;
    }

    body.layout-multiple-columns .column-header {
        background: var(--color-grey-3);
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
        background: linear-gradient(to right, hsl(var(--hsl-offwhite-blue) / 0.05), hsl(var(--hsl-offwhite-blue) / 0.1));
        border-radius: 8px;

        animation:  200ms flicker-in ease-out;
    }
    .getting-started .column-link:hover span:after {
        content: "";
        position: absolute;
        top: 8px;
        right: 8px;
        bottom: 8px;
        width: 1px;
        background: var(--color-white);
        box-shadow: var(--neon-box-shadow);

        animation: 200ms flicker-in ease-out;
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

        --bg-hsl: 225deg 10% 30%;
        --border-hsl: 227deg 16% 76%;
        --bg-shine-hsl: 227deg 16% 54%;
        --border-shine-hsl: 227deg 16% 10%;
    }

    /* owner */
    .user-role-3 {
        --border-hsl: 330deg 100% 50%;
        --border-shine-hsl: 254deg 100% 65%;
    }
    /* moderator */
    .user-role-1 {
        --border-hsl: 149.12deg 34% 60.78%;
        --border-shine-hsl: 240deg 100% 69%;
    }
    /* supporter */
    .user-role-34 {
        --border-shine-hsl: 58deg 100% 47%;
        --border-hsl: 187deg 98% 48%;
    }

    /* User badges */
    @keyframes shine {
        0%   { background-position: 100% 50%; }
        100% { background-position:   0% 50%; }
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
        background-image: linear-gradient(60deg, transparent 0%, transparent 40%, hsla(var(--border-shine-hsl) / 0.4) 50%, transparent 60%, transparent 100%), linear-gradient(hsl(var(--border-hsl)), hsl(var(--border-hsl)));
    }
    /* background */
    .account-role::after {
        z-index: -1;
        inset: 0px;
        background-image: linear-gradient(60deg, transparent 0%, transparent 45%, hsla(var(--bg-shine-hsl) / 0.2) 55%, transparent 65%, transparent 100%), linear-gradient(hsl(var(--bg-hsl)), hsl(var(--bg-hsl)));
    }


    /* This makes the buttons beneath toots look different */

    .status__action-bar :where(button, a),
    .detailed-status__button,
    .detailed-status__action-bar-dropdown {
        border: 1px solid;
        border-radius: var(--border-radius-button-between);
        border-color: var(--color-grey-5);
        position: relative;
    }

    .status__action-bar a {
        flex: 1 1 22px;
        height: 40px;
        box-sizing: border-box;
        padding-inline: 10px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }

    :where(.status__action-bar, .detailed-status__action-bar) :where(button, a):before {
        content: "";
        position: absolute;
        inset: 0;
        left: unset;
        width: 100%;
        background-color: var(--color-grey-7);
        opacity: 0.1;
        border-radius: inherit;
        pointer-events: none;
    }

    :where(.status__action-bar, .detailed-status__action-bar) button.disabled {
        background-color: var(--color-grey-1);
    }

    :where(.status__action-bar, .detailed-status__action-bar) button.active:before {
        opacity: 0.2;
        background-image: radial-gradient(currentColor, transparent);
    }

    .status__action-bar > * {
        margin-inline: 0;
    }

    :where(.status__action-bar, .detailed-status__action-bar) > :first-child {
        border-start-start-radius: var(--border-radius-button);
        border-end-start-radius: var(--border-radius-button);
    }

    :where(.status__action-bar, .detailed-status__action-bar) > :last-child {
        border-start-end-radius: var(--border-radius-button);
        border-end-end-radius: var(--border-radius-button);
    }

    :is(.status:not(.collapsed) .status__content--with-action, #fake) {
        padding-top: 58px;
        margin-top: -48px;
        margin-bottom: 0;
    }

    .status__action-bar-spacer {
        display: none;
    }

    .detailed-status__button button,
    .detailed-status__action-bar-dropdown > span,
    .detailed-status__action-bar-dropdown button {
        width: 100% !important;
        border-radius: inherit;
    }
}
`)

  /* emoji picker improvements */
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

/* remove empty icons */
.emoji-mart-category-list li:empty {
    display: none;
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

  /* image alt label changes */
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
    animation:
        paths 10s step-end infinite,
        opacity 10s step-end infinite,
        font 16s step-end infinite,
        movement 20s step-end infinite;
}

.column-link--transparent:has(i+i)::after {
    top: calc((5em / 60) + var(--padding));
    left: calc((-10em / 60) + var(--padding) + var(--start));
    color: #1bc7fb;
    animation:
        paths 10s step-end infinite,
        opacity 10s step-end infinite,
        font 14s step-end infinite,
        movement 16s step-end infinite;
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
        position: relative;
        /* the spoiler button has a z-index of 100, make sure this goes over the spoiler button. */
        z-index: 101;
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
        /* increase by 1, to have the hovered emoji overlap all others */
        z-index: 102;
    }

    /* Adjust the "better gradient" on collapsed toots */
    .status.collapsed .status__content:has(img.emojione:hover) {
        overflow: visible;
        margin-top: -30px;
        padding-top: 40px;
        z-index: 1;

        -webkit-mask-image: linear-gradient(to bottom, black 40px, transparent 81%);
        mask-image: linear-gradient(to bottom, black 40px, transparent 81%);
    }

    @keyframes heartbeat {
        0%  { scale: 1    }
        25% { scale: 1    }
        30% { scale: 0.9  }
        45% { scale: 1    }
        50% { scale: 0.95 }
        55% { scale: 1    }
    }

    :not(
        .reply-indicator__header strong,
        .emoji-button,
        .reactions-bar__item__emoji
    )>img.emojione[title*="heart"]:hover
    {
        animation: heartbeat 1.5s infinite;
    }
}
`)
})();
