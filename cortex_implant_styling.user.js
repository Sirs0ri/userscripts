// ==UserScript==
// @name         CortexImplant CSS Improvements
// @namespace    http://tampermonkey.net/
// @version      1.8.0-b5
// @description  Change the styling for the mastodon instance I'm on
// @author       @Sirs0ri
// @updateURL    https://raw.githubusercontent.com/Sirs0ri/userscripts/develop/cortex_implant_styling.user.js
// @downloadURL  https://raw.githubusercontent.com/Sirs0ri/userscripts/develop/cortex_implant_styling.user.js
// @supportURL   https://github.com/Sirs0ri/userscripts/issues
// @match        https://corteximplant.com/*
// @match        https://cyber.ms/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=obeythesystem.com
// @grant        GM_addStyle
// @grant        GM_getResourceURL
//
// @resource     ci_header_mask.avif     https://raw.githubusercontent.com/Sirs0ri/userscripts/main/assets/ci_header_mask.avif
// @resource     ci_logo_min.svg         https://raw.githubusercontent.com/Sirs0ri/userscripts/main/assets/ci_logo_min.svg
// @resource     m_boost_sprites.svg     https://raw.githubusercontent.com/Sirs0ri/userscripts/main/assets/m_boost_sprites.svg
// @resource     noise_bw.svg            https://raw.githubusercontent.com/Sirs0ri/userscripts/main/assets/noise_bw.svg
// ==/UserScript==

/*
 * == TODO ==
 *    - vanilla flavor:
 *      - post actions have a broken layout
 *      - header has a border-bottom
 *      - Profile view is broken
 *    - 4.3.0 fixes
 *      - Icons massive (fixed through custom.css)
 *      - poll: winning option is spaced weirdy by massive checkmark
 *       -> https://corteximplant.com/@marta/112134741728666664
 *      - overflow in posts for cat ears
 *      - reply ui with the new compose box
 *      - post actions menu has no highlighting
 *      - like animation is offcenter again
 *    - Refactor for new CSS features
 *      - CSS Nesting
 *      - color-mix() instead of HSL combining
 *    - Make style changes hot-swappable through the stylesheet returned by GM_addStyle
 *    - items under a post might wrap weirdly:
 *      see https://corteximplant.com/@kaiserkiwi/112044242777155596
 *      .detailed-status__meta { flex-wrap: wrap; gap: 0.4em; }
 *    - 4.3.0-alpha fixes
 *      - account links highlights broken
 *    - Long usernames
 *      - Break the layout in the pip viewer
 */

/*
 * == KNOWN ISSUES ==
 *    - Firefox didn't support :has() before v121, unless you manually turned it on via
 *      the layout.css.has-selector.enabled flag. Starting with 121 (Released 2023-12-19)
 *      that flag will be on by default!
 *      The general restyling shouldn't be affected either way.
 *      With that flag active, everything should work.
 *      Affected parts of this stylesheet have a notice at the start.
 *    - If you're on my git, this incorporates the changes found in mastodon_media_improvements.js
 *      Use one of the two userscripts. If you're not on my git, ignore this.
 *    - The glow-on-media might look off on glitch-fork with certain settings. I recommend the following options:
 *      (under App Settings -> Media)
 *        - [off] Letterbox Media
 *        - [off] Full-width media previews
 *        - [on ] Inline preview cards for external links
 *      Alternatively, you can turn off the glow effect entirely via the options found in the page footer.
 */

(function () {
  "use strict"

  // #region raw images

  // alpha mask of the people and the logo from the header image
  const footerImgMask = GM_getResourceURL("ci_header_mask.avif")
  // The CORTEX IMPLANT Logo
  const logoSvg = GM_getResourceURL("ci_logo_min.svg")
  // The animateable "boost" svg
  const boostSvg = GM_getResourceURL("m_boost_sprites.svg")
  // The animateable "boost" svg
  const noiseSvg = GM_getResourceURL("noise_bw.svg")

  // #endregion

  // ====================
  //      Helpers
  // ====================

  const desktopViewVisible = new Event("desktopViewVisible")
  const desktopViewHiddenEvent = new Event("desktopViewHidden")

  let _currentInnerWidth = window.innerWidth
  const _desktopMinWidth = 1175

  const onResize = () => {
    if (_currentInnerWidth < _desktopMinWidth && innerWidth >= _desktopMinWidth) {
      dispatchEvent(desktopViewVisible)
    } else if (innerWidth < _desktopMinWidth && _currentInnerWidth >= _desktopMinWidth) {
      dispatchEvent(desktopViewHiddenEvent)
    }
    _currentInnerWidth = innerWidth
  }

  addEventListener("resize", onResize)

  /** Register a handler to the "load" event, and when the vew switches from mobile to desktop */
  function registerLoadHandlerDesktop (handler) {
    addEventListener("load", evt => {
      const ui = document.querySelector(".ui")

      if (ui) {
        handler(evt)
        return
      }

      // Mastodon UI isn't loaded in yet, set up a MutationObserver to catch the mounting event
      const appContainer = document.getElementById("mastodon")

      if (!appContainer) {
        return
      }

      const cb = (mutationList, observer) => {
        const ui = document.querySelector(".ui")

        if (ui) {
          // console.log("ui found through mutation observer")
          handler(evt)
          observer.disconnect()
          return
        }

        console.warn("load event failed to execute with valid Mastodon UI")
      }

      const observer = new MutationObserver(cb)

      observer.observe(appContainer, { childList: true })
    }, { once: true })

    addEventListener("desktopViewVisible", evt => {
      // Run the handler on the next frame, to give the DOM a chance to update
      setTimeout(() => {
        // console.log("desktopViewVisible event")
        handler(evt)
      }, 0)
    })
  }

  // Get own account info from embedded "initial-state" JSON
  const elem = document.getElementById("initial-state")
  const data = JSON.parse(elem.text)
  const user = data.accounts[data.meta.me]?.username
  // const mascot = data.meta.mascot

  const authorizedFetch = async url => {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${data.meta.access_token}` } }).then(res => res.json())
    console.log(res)
    return res
  }
  // authorizedFetch("/api/v1/markers?timeline[]=home")

  // get account color
  const avatarLink = data.accounts[data.meta.me]?.avatar_static

  function createElem (tagName, options = {}) {
    const elem = document.createElement(tagName)

    for (const [key, val] of Object.entries(options)) {
      switch (key) {
        case "class":
          elem.classList.add(...val.trim().split(" "))
          break
        case "innerHTML":
        case "innerText":
        case "textContent":
        case "checked":
        case "onclick":
          elem[key] = val
          break
        default:
          elem.setAttribute(key, val)
      }
    }
    return elem
  }

  // #region preferences
  // ====================
  //     Preferences
  // ====================

  const allOptions = [
    {
      id: "enableTheme",
      textLabel: "general restyling",
      textDescription: "Enable my theme across the mastodon webclient.",
      defaultvalue: true,
    },
    {
      id: "hideCheckmarks",
      textLabel: "hide checkmarks",
      textDescription: "Disable the checkmarks Glitch-Fork adds to e.g. the fav- and boost-buttons on Mastodon <4.3.0",
      defaultvalue: true,
    },
    {
      id: "disableBouncyAnimations",
      textLabel: "disable bouncy animations",
      textDescription: "Smooth out some animations that Glitch-Fork would otherwise make super bouncy, e.g. when expanding a post or faving it",
      defaultvalue: true,
    },
    {
      id: "highlightReplies",
      textLabel: "highlight replies",
      textDescription: "Add an indicator to replies in the main timeline, similar to the one for boosts",
      defaultvalue: true,
    },
    {
      id: "enableGlowOnMedia",
      textLabel: "enable glow on media",
      textDescription: "Enable a glow effect around media content embedded in posts",
      defaultvalue: true,
    },
    {
      id: "hoverImages",
      textLabel: "enlarge images on hover",
      textDescription: "Enlarge images in posts to full size on hover, instead of cropping images to 16/9.",
      defaultvalue: true,
    },
    {
      id: "highlightMediaWithoutAlt",
      textLabel: "highlight media without alt text",
      textDescription: "Highlight media without an alt text by adding a visible red bar underneath",
      defaultvalue: true,
    },
    {
      id: "popoutComposeBox",
      textLabel: "growing compose box",
      textDescription: "Make the compose box larger when focussed. This will have no effect in the Advanced View.",
      defaultvalue: false,
    },
    {
      id: "freezeTopPosition",
      textLabel: "Keep scrollposition in feeds",
      textDescription: "When loading new posts on timelines, keep the previously first post in view, instead of staying scrolled all the way to the top. [Simple View only]",
      defaultvalue: false,
    },
    {
      id: "imACat",
      textLabel: "imACat 🐈",
      textDescription: "Meow?",
      defaultvalue: false,
    },
    {
      id: "showOldPunks",
      textLabel: "[Advanced view] Bring back the old Cyberpunks",
      textDescription: "Show the two cyberpunks chilling at the bottom of the compose area. When disabled, John Cyberdon will watch over your toots.",
      defaultvalue: false,
    },
    /* data only, as long as there's no textLabel a setting will not have a GUI */
    {
      id: "catEarColorsStyle",
      default: null,
    },
    {
      id: "catEarColorsLink",
      default: null,
    },
  ]

  // These preferences will be persisted in localStorage. When upgrading from a version that
  // still has preferences defined as booleans make sure to note them down before upgrading!

  function loadSettings () {
    const loaded = localStorage.getItem(`userscript-sirs0ri-settings-${user}`)

    const settings = Object.fromEntries(allOptions.map(o => [o.id, o.defaultvalue]))

    if (loaded == null) {
      settings._firstRun = true
    } else {
      const parsed = JSON.parse(loaded)
      for (const option of allOptions) {
        if (parsed[option.id] != null) settings[option.id] = parsed[option.id]
      }
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
    if (allOptions.map(o => o.id).includes(evt.target.id)) settings[evt.target.id] = evt.target.checked

    let needsReload = false
    for (const option of allOptions) {
      if (settings[option.id] === settingsWhenPopupOpened[option.id]) continue

      // else, if the option's changed
      needsReload = true
      break
    }

    storeSettings(settings)

    if (needsReload) document.querySelector(".userscript-modal-root").classList.add("needs-reload")
    else document.querySelector(".userscript-modal-root").classList.remove("needs-reload")
  }

  const _insertFooter = async (evt) => {
    let footer = document.querySelector(".link-footer")

    if (!footer) {
      const isAdvancedUi = document.body.classList.contains("layout-multiple-columns")
      if (!isAdvancedUi) {
        console.warn("not using advanced UI, the footer *should* be here by now!")
        return
      }

      footer = await new Promise((resolve, reject) => {
        let resolved = false
        setTimeout(() => {
          if (resolved) return
          console.warn("timeout while searching footer")
          resolve(undefined)
        }, 1000)

        const columnsArea = document.querySelector(".columns-area")

        const cb = (mutationList, observer) => {
          const footer = document.querySelector(".link-footer")

          if (footer) {
            observer.disconnect()
            resolved = true
            resolve(footer)
          }
        }

        const observer = new MutationObserver(cb)

        observer.observe(columnsArea, { childList: true, subtree: true })
      })

      if (!footer) return
    }

    const insert = createElem("p", { innerHTML: "<strong>Sirs0ri's userscript</strong>: " })
    const separator = createElem("span", {
      innerHTML: " · ",
      ariaHidden: true,
    })
    const preferencesLink = createElem("a", {
      textContent: document.querySelector(".column-link[href='/settings/preferences']").title,
      role: "button",
      onclick: openSettings,
    })
    const issuesLink = createElem("a", {
      textContent: "Issues",
      href: "https://github.com/Sirs0ri/userscripts/issues",
      target: "_blank",
    })
    const codeLink = createElem("a", {
      textContent: document.querySelector(".link-footer [href*='github.com']").textContent,
      href: "https://github.com/Sirs0ri/userscripts/blob/dev/cortex_implant_styling.js",
      target: "_blank",
    })
    const versionSpan = createElem("span", { innerText: "v" + GM_info.script.version })

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
    const modalModal = createElem("div", { class: "userscript-settings__modal" })

    const _makeSettingsItem = (id, labelText, description) => {
      const wrapper = createElem("div", { class: "userscript-settings__item" })

      wrapper.appendChild(createElem("input", {
        id,
        type: "checkbox",
        checked: settings[id],
        onclick: onSettingChange,
      }))
      wrapper.appendChild(createElem("label", { for: id, textContent: labelText }))
      wrapper.appendChild(createElem("p", { textContent: description }))

      return wrapper
    }

    const nav = createElem("nav")

    nav.appendChild(createElem("a", {
      role: "button",
      tabindex: "0",
      class: "glitch local-settings__navigation__item active",
      title: "General",
      "aria-label": "General",
      innerHTML: `
        <i role="img" class="fa fa-cogs fa-fw"></i>
        <span>General</span>`,
    }))

    // const buttonsWrapper = createElem("div", {class: "footer"})
    const buttonsWrapper = createElem("footer")

    buttonsWrapper.appendChild(createElem("p", {
      class: "reload-needed-hint",
      innerText: "Some of the settings you changed need the page to be reloaded to apply.",
    }))
    buttonsWrapper.appendChild(createElem("button", {
      tabindex: "0",
      title: "Reload",
      "aria-label": "Reload",
      class: "button reload-needed-hint",
      innerHTML: `
        <i role="img" class="fa fa-refresh fa-fw"></i>
        <span>reload</span>`,
      onclick: () => location.reload(),
    }))
    buttonsWrapper.appendChild(createElem("button", {
      tabindex: "0",
      title: "Close",
      "aria-label": "Close",
      class: "button",
      innerHTML: `
        <i role="img" class="fa fa-times fa-fw"></i>
        <span>Close</span>`,
      onclick: closeSettings,
    }))

    nav.appendChild(buttonsWrapper)

    modalModal.appendChild(nav)

    const settingsWrapper = createElem("div", {
      class: "userscript-settings__content",
    })

    settingsWrapper.appendChild(createElem("p", {
      class: "first-run-notice",
      innerHTML: `Hi there choom! <br>
        This userscript has a settings UI now! You're seeing this because you're
        running the new version of the script for the first time. <br>

        If you want to access this UI in the future, you'll be able to find it 
        in the page's footer, next to the links to this instance's about page.`,
    }))

    settingsWrapper.appendChild(createElem("h1", { innerText: "General" }))

    for (const option of allOptions) {
      if (option.textLabel) {
        settingsWrapper.appendChild(_makeSettingsItem(option.id, option.textLabel, option.textDescription))
      }
    }

    modalModal.appendChild(settingsWrapper)

    modalWrapper.appendChild(createElem("div", {
      class: "modal-root__overlay",
      role: "presentation",
      onclick: closeSettings,
    }))

    const modalContainer = createElem("div", {
      class: "modal-root__container",
      role: "dialog",
    })
    modalWrapper.appendChild(modalContainer)
    modalContainer.appendChild(modalModal)

    GM_addStyle(`

.link-footer a {
  cursor: pointer;
}

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

.userscript-settings__modal nav footer {
  margin-top: auto;
  padding: 15px;
  display: grid;
  font-size: 13px;
}

.userscript-settings__modal nav footer > *+* {
  margin-top: 15px
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

  // #endregion

  /* variables & animations */

  GM_addStyle(`
:root {
  /* border radii */
  --border-radius-button: 10px;
  --border-radius-button-between: 3px;

  /* COLORS */
  --color-white: white;

  --color-neon-glow: hsl(219deg 100% 50%);

  /* hl is a color to be used as highlight ontop of another color */
  --color-primary: hsl(239.65deg 100% 66.47%);
  --color-hl-primary: hsl(240deg 100% 83%);

  /* used in the neon bars in the menu */
  --color-offwhite-primary: hsl(224deg 60% 81%);

  /* Unlisted posts */
  --color-green: #388e3c;
  /* formerly public posts */
  --color-blue: #1976d2;
  /* Direct posts */
  --color-red: #d32f2f;
  /* Private posts - original: ffa000*/
  --color-yellow: hsl(48 71% 54%);

  /* favs */
  --color-gold: hsl(41 100% 45%);
  /* boosts */
  --color-purple: hsl(240 100% 77%);
  /* reports */
  --color-orange: hsl(22 100% 45%);

  /* page background  */
  --color-grey-0: hsl(224deg 17% 9%);

  /* .account-timeline__header                        -> background
   * explore -> subheader                             -> background
   */
  --color-grey-1: hsl(223deg 17% 14%);

  /* .search__input                                   -> background
   * .column-back-button--slim [role="button"]::after -> border
   * #tabs-bar__portal>button::after                  -> border
   * .column-header__wrapper::after                   -> border
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
   * .about::before                                   -> background
   * scrollbars                                       -> ???
   * body.layout-multiple-columns .column-header      -> background
   */
  --color-grey-3: hsl(227deg 17% 23%);

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

  /* .column-header__button:hover::before             -> background
   * .column-header__back-button:hover::before        -> background
   * .account__section-headline :is(button, a):hover span::before  -> background
   * .notification__filter-bar button:hover span::before  -> background
   * .notification__filter-bar button:hover i::after  -> background
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
   * .column-back-button--slim [role="button"]:hover::after -> border
   * #tabs-bar__portal>button:hover::after             -> border
   * .column-header__wrapper:hover::after              -> border
   * selected post                                    -> border
   * .about::before                                   -> border
   * ::-webkit-scrollbar-thumb:active                 -> border
   */
  --color-grey-7: hsl(227deg 17% 51%);

  /* Notifications                                    -> border
   */
  --color-grey-8: hsl(227deg 17% 71%);

  /* .compose-form__buttons-wrapper                   -> background
   */
  --color-grey-9: hsl(227deg 17% 81%);

  --anim-dur: 200ms;

  --neon-box-shadow:
    /* White glow */
    0 0   7px color-mix(in srgb, var(--color-white) 100%, transparent),
    0 0  10px color-mix(in srgb, var(--color-white) 100%, transparent),
    0 0  21px color-mix(in srgb, var(--color-white) 100%, transparent),
    /* Colored glow */
    0 0  42px color-mix(in srgb, var(--color-neon-glow) 100%, transparent),
    0 0  82px color-mix(in srgb, var(--color-neon-glow) 100%, transparent),
    0 0  92px color-mix(in srgb, var(--color-neon-glow) 100%, transparent),
    0 0 102px color-mix(in srgb, var(--color-neon-glow) 100%, transparent),
    0 0 151px color-mix(in srgb, var(--color-neon-glow) 100%, transparent);
  --neon-box-shadow-small:
    /* White glow */
    0 0 6px -2px color-mix(in srgb, var(--color-white) 40%, transparent),
    0 0 10px color-mix(in srgb, var(--color-white) 20%, transparent),
    0 0 15px color-mix(in srgb, var(--color-white) 10%, transparent),
    /* Colored glow */
    0 0 10px color-mix(in srgb, var(--color-neon-glow)   7%, transparent),
    0 0 25px color-mix(in srgb, var(--color-neon-glow)   5%, transparent),
    0 0 47px color-mix(in srgb, var(--color-neon-glow)  12%, transparent),
    /* White inside glow */
    inset 0 0 5px color-mix(in srgb, var(--color-white) 30%, transparent);

  --noise-url: url(${noiseSvg});
}

@keyframes flicker-in {
  0%   { opacity: 0   }
  40%  { opacity: 0.7 }
  75%  { opacity: 0.4 }
  100% { opacity: 1   }
}`)

  /* General layout improvements */
  GM_addStyle(`
:root {
  scrollbar-gutter: stable;
  margin-right: 0 !important;
}

p {
  line-height: 1.5;
}

.e-content ol, .e-content ul, .reply-indicator__content ol, .reply-indicator__content ul, .status__content__text ol, .status__content__text ul{
  margin-inline-start: 3ch;
}

/* Status layout - enable easy insertion of the "replying to..." hint */
header.status__info {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

.status__info__icons {
  height: fit-content;
}
`)

  if (settings.hideCheckmarks) {
    GM_addStyle(`
/* disable checkmark on buttons */
.detailed-status__button .icon-button.active::after,
.status__action-bar-button.active::after {
  content: "";
  display: none
}
`)
  }

  if (settings.highlightReplies) {
    GM_addStyle(`
@media screen and (min-width: 1175px) {

  .status.status__wrapper-reply:not(.status--in-thread):not(.muted) .status__info:not(aside + .status__info)::before {
    color: #606984;
    font-size: 14px;
    grid-column: 1 / -1;
    place-self: start;
    content: "\\21B6  Replying to a conversation";
    border: 1px solid;
    border-radius: 100vmax;
    padding: 1px 8px;
  }

  .status.status__wrapper-reply:not(.status--in-thread):not(.muted):has(.status__info:not(aside + .status__info)) {
    --extra-top-spacing: 32px;
  }

  .status.status__wrapper-reply:not(.status--in-thread):not(.muted) aside.status__prepend > span::after {
    content: " a reply"
  }
}
`)
  }

  if (settings.disableBouncyAnimations) {
    const clickHandler = (evt) => {
      let target = evt.target

      if (evt.target.ownerSVGElement) {
        const allButtons = document.querySelectorAll("button.icon-button.bookmark-icon")

        target = [...allButtons].find(b => b.contains(evt.target))
      }

      if (target == null) return

      const closestBookmarkButton = target.closest("button.icon-button.bookmark-icon")

      if (closestBookmarkButton == null) return

      closestBookmarkButton.parentElement.classList.add("clicked")

      const cb = (mutationList, observer) => {
        if (closestBookmarkButton.classList.contains("active")) {
          closestBookmarkButton.classList.add("activate")
          closestBookmarkButton.classList.remove("deactivate")
        } else {
          closestBookmarkButton.classList.add("deactivate")
          closestBookmarkButton.classList.remove("activate")
        }

        observer.disconnect()
      }

      const observer = new MutationObserver(cb)
      observer.observe(closestBookmarkButton, { childList: true })
    }

    document.addEventListener("click", clickHandler, true)

    GM_addStyle(`
/* ====================
 * de-springyfy anims
 * ==================== */

.no-reduce-motion .status__collapse-button>.fa-angle-double-up,
.no-reduce-motion .status__collapse-button>.icon {
  transition: transform 200ms ease-in-out, color 200ms;
  animation: none !important;
}

@keyframes rotateIn {
  from { transform: rotate(0turn); }
  to   { transform: rotate(2.4turn); }
}
@keyframes rotateOut {
  from { transform: rotate(2.4turn); }
  to   { transform: rotate(0turn); }
}

.icon.icon-star {
  transform-origin: 50% 50% !important;

  & > path {
    /* optically center the star */
    transform: translateY(-60px);
  }
}

.no-reduce-motion .icon-button.star-icon.deactivate>.fa-star,
.no-reduce-motion .icon-button.star-icon.deactivate>.icon {
  animation: rotateOut 750ms;
}

.no-reduce-motion .icon-button.star-icon.activate>.fa-star,
.no-reduce-motion .icon-button.star-icon.activate>.icon {
  animation: rotateIn 750ms;
}

/* When activating the button, the icon does a flip and changes color. The flip is split
   into two halves, so that it only does a 180° rotation, but doesn't end up upside down.
   The color change during the flip animation is slightly delayed so that it mostly happens
   during the 2nd part of the flip. Both animations together run for 2x --anim-halftime.

   When deactivating the bookmark button, the icon only changes color (fading to grey).
   The animation runs for 1.5x --anim-halftime.

   The mask-image makes it so that the icon looks like the background is filled in the moment
   the icon passes the halfway point in the animation, instead of at the beginnign of the
   animation. A --_m property of "white" disables the mask by filling it completely in white.

   The .clicked class is applied to the button' parent as soon as the button's been clicked.
   The .activate class is applied just after Mastodon handles the click, when the inline SVGs
   have already been switched.
   */

.no-reduce-motion .icon-button.bookmark-icon {
  --anim-halftime: 250ms;
  transition: color calc(1.5 * var(--anim-halftime));
}
.no-reduce-motion .icon-button.bookmark-icon.active {
  transition: color calc(1.5 * var(--anim-halftime)) calc(0.5 * var(--anim-halftime));
}

.no-reduce-motion .icon-button.bookmark-icon svg {
  --_m: white;
  mask-image:
    url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M0 0V-960H960V0H0ZM280-242 480-328 680-242V-760H280V-242ZM280-760H680 280Z"></path></svg>'),
    linear-gradient(var(--_m), var(--_m));
  mask-position: center;
}

.no-reduce-motion .status__action-bar .icon-button.bookmark-icon svg {
  mask-size: 20px 20px;
}

/* the value of --_m will be overwritten by the animation with "white" */
.no-reduce-motion .clicked > .icon-button.bookmark-icon.active svg {
  --_m: transparent;
}

.no-reduce-motion .clicked > .icon-button.bookmark-icon.activate svg {
  animation: flip-over-1 var(--anim-halftime) ease-in,
             flip-over-2 var(--anim-halftime) var(--anim-halftime) ease-out forwards;
}

@keyframes flip-over-1 {
  0%   {
    transform: perspective(3em) rotateX(0deg);
  }
  100%  {
    transform: perspective(3em) rotateX(-90deg);
  }
}

@keyframes flip-over-2 {
  0%   {
    transform: perspective(3em) rotateX(-270deg);
    --_m: white;
  }
  100% {
    transform: perspective(3em) rotateX(-360deg);
    --_m: white;
  }
}
`)
  }

  if (settings.showImagesUncropped) {
    GM_addStyle(`
/* Force all images to be in their original aspect ratio, not 16/9 */

.media-gallery, video {
  aspect-ratio: unset !important;
}

.spoiler-button:not(.spoiler-button--minified) + .media-gallery__item {
  aspect-ratio: 16 / 9;
}
`)
  }

  if (settings.freezeTopPosition) {
    GM_addStyle(`
body.layout-single-column.at-top .column[aria-label] {
  margin-top: 1px;
}

.tabs-bar__wrapper {
  transition: box-shadow 300ms;
}

body.layout-single-column.pinned .tabs-bar__wrapper {
  box-shadow: 0px 5px 25px -20px var(--color-blue);
}

/* add a "pause" icon to the column header */
.column-header > button::after {
  content: "";
  font: normal normal normal 14px/1 FontAwesome;
  opacity: 0;
  transition: opacity 300ms;
  margin-inline-start: 5px;
  color: var(--color-grey-7);
  display: inline-block;
  scale: 0.9;
  align-self: center;
}
body.layout-single-column.pinned .column-header > button::after {
  opacity: 1;
}
`)

    let atTop = true
    let debounce = null

    const scrollHandler = evt => {
      const previousAtTop = atTop

      let pinned = false

      if (window.scrollY === 0) {
        // when the user's scrolled to the very top, scroll down 1px to keep the currently first post "pinned" at its current position
        // Otherwise, Mastodon will keep the newest post at the top and you'll use your scrolling position.
        atTop = true
      } else if (window.scrollY === 1) {
        // When the window's scrolled to 1px, add some UI later to display that the feed is "pinned"
        pinned = true
      } else {
        atTop = false
      }

      if (pinned) {
        document.body.classList.add("pinned")
      } else {
        document.body.classList.remove("pinned")
      }

      if (atTop !== previousAtTop) {
        if (debounce) clearTimeout(debounce)
        debounce = setTimeout(topChangeHandler, atTop ? 500 : 0)
      }
    }

    const topChangeHandler = () => {
      if (atTop) {
        const el = document.querySelector("body.layout-single-column .column[aria-label]")
        if (el == null) return

        document.body.classList.add("at-top")
        window.scrollBy(0, 1)
      } else {
        document.body.classList.remove("at-top")
      }
    }

    settings.freezeTopPosition && window.addEventListener("scroll", scrollHandler)

    settings.freezeTopPosition && topChangeHandler()
  }

  // TODO:
  //   - [x] Images overlap Emotes
  //   - [ ] Make sure images are always fully visible, like a position sticky?

  /* Firefox animates the max-height from the image's original height to 100cqh for some reason,
   * every time the image is added to the DOM
   * This worakround only applies the transition on hover, meaning the images won't animate on load. */
  const mouseoverHandler = e => {
    if (!["IMG", "CANVAS", "VIDEO"].includes(e.target.nodeName)) return

    let target

    if (e.target.parentElement.classList.contains("media-gallery__item-thumbnail") ||
        e.target.classList.contains("media-gallery__item-gifv-thumbnail")) {
      target = e.target
    } else if (e.target.nextElementSibling?.classList.contains("media-gallery__item-thumbnail")) {
      target = e.target.nextElementSibling.querySelector("img")
    }

    if (!target) return

    target.style.transition = "background 200ms, max-height 200ms, min-height 200ms"
  }

  if (settings.hoverImages) {
    document.addEventListener("mouseover", mouseoverHandler)

    GM_addStyle(`
.media-gallery {
  /* overlap emotes */
  z-index: 101;
  overflow: visible;
  container: parent / size;
}
.media-gallery:hover {
  z-index: 102;
}

.media-gallery :where(.spoiler-button, .media-gallery__item__badges) {
  transition: opacity 200ms, transform 200ms;
}
.media-gallery:hover .spoiler-button.spoiler-button--minified:not(:hover),
.media-gallery:hover .spoiler-button.spoiler-button--minified:not(:hover) ~ div .media-gallery__item__badges:not(:hover) {
  --opacity: 0.2;
  transform: scale(0.9)
}

.media-gallery .media-gallery__item__badges {
  z-index: 2;
}

.media-gallery .media-gallery__item {
  align-items: center;
  display: flex !important;

  overflow: visible;
}

article:hover,
.media-gallery__item:hover {
  z-index: 3;
}

article:not(:hover),
.media-gallery__item:not(:hover) {
  animation: keep-up 400ms;
}

@keyframes keep-up {
  0%,
  100% {
    z-index: 2;
  }
}

.media-gallery .media-gallery__item:not(.media-gallery__item--tall) {
  --height: calc(50cqh - (var(--border-radius-button-between) + var(--extra-gap, 0px)) / 2);
  height: var(--height);
}

.media-gallery :is(#fake, .media-gallery__item-thumbnail, .media-gallery__gifv) {
  overflow: visible !important;
  position: relative;
  height: auto;
  transition: transform 200ms ease-out, border-radius 200ms;
}
.media-gallery .media-gallery__item:hover :is(.media-gallery__item-thumbnail, .media-gallery__gifv) {
  transform: scale(1.15);
  border-radius: var(--border-radius-button);
}
.layout-multiple-columns .media-gallery .media-gallery__item:hover :is(.media-gallery__item-thumbnail, .media-gallery__gifv) {
  transform: scale(1.05)
}

.media-gallery .media-gallery__item-thumbnail img,
.media-gallery .media-gallery__gifv video {
  height: auto;
  display: block;
  max-height: 100cqh;
  min-height: 50cqh;
}
.media-gallery .media-gallery__item--tall :is(img, video) {
  min-height: 65cqh;
}
.media-gallery .media-gallery__item:not(.media-gallery__item--tall) .media-gallery__item-thumbnail img,
.media-gallery .media-gallery__item:not(.media-gallery__item--tall) .media-gallery__gifv video {
  max-height: var(--height);
}

.media-gallery .media-gallery__item:hover :where(img, video) {
  max-height: 60vh !important;
  min-height: 0cqh;
  max-width: 80vw;
}

article {
  z-index: 1;
  position: relative;
}

`)
  }

  if (settings.enableGlowOnMedia) {
    GM_addStyle(`
/* ====================
 *    Glow on Media
 * ==================== */

/* Important note for glitch-fork users:

it's HIGHLY recommended to disable the following
options in the "app settings" (left sidebar):
  - full-width media previews
*/

.media-gallery {
  --extra-gap: 2px;
}

@keyframes fadeIn {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}

.media-gallery__item {
  outline: 8px solid var(--color-grey-5);
  outline-offset: -8px;
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

.media-gallery__item>*:not(canvas, media-gallery__item__badges) {
  animation: 200ms ease-out 0s 1 fadeIn;
}

.media-gallery__item>*:not(canvas, .media-gallery__item__badges)::after {
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

:is(#fake, canvas.status-card__image-preview) {
  border-radius: inherit;
  z-index: unset;
  filter: blur(3px);
}
canvas.status-card__image-preview--hidden {
  display: revert;
}
.status-card__image::after {
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
`)
  }

  if (settings.highlightMediaWithoutAlt) {
    GM_addStyle(`
/* inspired von chaos.social:
markiere medien ohne alt-text */

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
  }

  const debugFocus = false

  const onLoadHandler = () => {
    let composePanel = document.querySelector(".columns-area__panels__pane--compositional")
    const composeForm = document.querySelector(".compose-form")
    let backDrop = document.querySelector(".compose-form")

    const textarea = document.querySelector(".compose-form textarea.autosuggest-textarea__textarea")

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

      if (evt instanceof InputEvent) {
        textarea.parentElement.dataset.value = textarea.value
      }
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

      textarea.style.height = null
      textarea.parentElement.dataset.value = textarea.value
    }
    const handlerBackdropClick = (evt) => {
      debugFocus && console.log("bg-click", evt)
      if (composeForm.contains(document.activeElement)) return

      // This should only be handled if the user clicked on the backdrop, ie. the compose-form's ::before element.
      // Since pseudoelements can't be targeted directly, this handler has to be registered on the parent, and
      // the class "ignore-clicks" is used to mimic the ::before's pointer-events: none;
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
  if (settings.popoutComposeBox) {
    registerLoadHandlerDesktop(onLoadHandler)

    // load relevant styles
    GM_addStyle(`
@media screen and (min-width: 1175px) {

  .navigation-bar {
    z-index: 3;
  }

  .columns-area__panels__pane--compositional.user-focus-within {
    z-index: 3;
  }

  .compose-form {
    position: relative;
  }

  .compose-form > :not(.compose-form__warning, .reply-indicator) {
    width: 100%;
    margin-left: 0;
    transition: width 200ms, margin-left 200ms;
  }

  .user-focus-within .compose-form {
    z-index: 2;
  }

  .user-focus-within .compose-form > :not(.compose-form__warning, .reply-indicator) {
    --width: clamp(100%, calc( ( 100vw - clamp(0px, calc(4vw - 48px), 50px) - 600px ) / 2 - 30px), 450px);
    width: var(--width);
    margin-left: calc( 285px - var(--width));
  }

  .compose-form::before {
    content: "";
    position: fixed;
    inset: 0;
    background-color: rgba(0 0 0 / 0);
    z-index: -1;
    pointer-events: none;
    transition: background-color 200ms;
  }

  .user-focus-within .compose-form::before {
    background-color: rgba(0 0 0 / 0.25);
    pointer-events: all;
  }

  :is(#fake, .autosuggest-textarea__textarea) {
    transition: min-height 200ms;
    /* padding: 3px 40px 0px 15px; */
  }
  .user-focus-within .autosuggest-textarea__textarea {
    min-height: 200px !important;
  }

  .link-footer {
    margin-top: auto
  }

  /* autogrow shenannigans */
  .autosuggest-textarea label {
    display: grid;
    overflow-x: hidden;

    textarea {
      grid-area: 1 / 1 / 2 / 2;
      line-height: inherit;
    }

    &::after {
      content: attr(data-value);
      grid-area: 1 / 1 / 2 / 2;
      padding: 10px 32px 0 10px;
      color: transparent;
      font-family: inherit;
      font-size: 14px;
      white-space: pre-wrap;
      pointer-events: none;
    }
  }

`)
  }

  const doCatThings = avatarLink && user && settings.imACat

  if (doCatThings) {
    GM_addStyle(`

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

/* what does this do? */

.account__header__bar {
  z-index: 1
}
.detailed-status__display-avatar {
  z-index: 1;
  position: relative;
}
/* TODO: move this to general fixes */
.status__info > span {
  overflow: unset;
  min-width: 0;
}
:is(.status__display-name, #fake) {
  max-width: calc(100% - 56px);
  gap: 15px;
}
.display-name__html {
  text-overflow: ellipsis;
}

.notification__message > :is(#fake, span) {
  text-wrap: wrap;
}
.account__avatar-overlay-overlay .account__avatar {
  z-index: 2;
}

@supports selector(:has(a, b)) {
  .status__avatar:has( > [data-avatar-of="@${user}"]) {
    transform: translateY(3%);
  }
}


/* DMs */
.account__avatar-composite {
  overflow: visible;
}

[data-avatar-of="@${user}"] {
  overflow: visible;
}

[data-avatar-of="@${user}"] img {
  z-index: 1;
  position: relative;
}

[data-avatar-of="@${user}"]::before,
[data-avatar-of="@${user}"]::after {
  content: "";
  box-sizing: border-box;
  display: inline-block;
  height: 50%;
  width: 50%;
  position: absolute;
  /* z-index: 1; */
  border: solid 4px currentColor;
  color: var(--color-1, transparent);
  background: var(--color-6, transparent);
  transition: scale 300ms;
  /* scale: 0; */
}

[data-avatar-of="@${user}"]::before,
[data-avatar-of="@${user}"]::after {
  scale: 1;
}

[data-avatar-of="@${user}"]::before {
  border-radius: 0 75% 75%;
  transform: rotate(32deg) skew(28deg);
  top: 0;
  left: 0;
}
[data-avatar-of="@${user}"]:hover::before {
  animation: earwiggleleft 1s;
  animation-iteration-count: 1;
}

[data-avatar-of="@${user}"]::after {
  border-radius: 75% 0 75% 75%;
  transform: rotate(-32deg) skew(-28deg);
  top: 0;
  right: 0;
}
[data-avatar-of="@${user}"]:hover::after {
  animation: earwiggleright 1s ;
}
`)

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
      // note that we are looping every 4!
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
      if (settings.catEarColorsStyle && settings.catEarColorsLink === link) {
        // use existing colors, don't recalculate them
        GM_addStyle(settings.catEarColorsStyle)
        return
      }

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

        // Store colors for the next page load
        settings.catEarColorsStyle = style
        settings.catEarColorsLink = link
        storeSettings(settings)
      }
      image.src = link
    }

    // this doesn't need to run right away, it can wait a bit.
    // As a nice sideeffect, when this runs the profile picture's probably already cached!
    setTimeout(() => getColors(avatarLink), 750)
  }

  if (settings.enableTheme) {
    GM_addStyle(`

/* ====================
 * Misc general changes
 * ==================== */


/* ===== Galleries, Media, YT, Links ===== */

/* Galleries with 1-4 images, videos, audio */

.columns-area--mobile .status :is(
    #fake, .audio-player, .media-gallery, .video-player
) {
  margin-top: 20px;
}

.media-gallery {
  gap: calc(var(--border-radius-button-between) + var(--extra-gap, 0px));
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.media-gallery__item {
  border-radius: var(--border-radius-button-between);
}
.media-gallery__item *,
.video-player.inline > * {
  border-radius: inherit;
  overflow: hidden;
}

/* single item */
.media-gallery__item--tall.media-gallery__item--wide,
.video-player.inline,
.audio-player {
  border-radius: var(--border-radius-button);
}

/* left half */
.media-gallery__item--tall:not(.media-gallery__item ~ .media-gallery__item) {
  border-start-start-radius: var(--border-radius-button);
  border-end-start-radius: var(--border-radius-button);
}

/* right half */
.media-gallery__item ~ .media-gallery__item--tall {
  border-start-end-radius: var(--border-radius-button);
  border-end-end-radius: var(--border-radius-button);
}

/* first item */
:not(.media-gallery__item) + .media-gallery__item {
  border-start-start-radius: var(--border-radius-button);
}

/* 2nd item */
.media-gallery__item + .media-gallery__item:not(.media-gallery__item + .media-gallery__item + .media-gallery__item) {
  border-start-end-radius: var(--border-radius-button);
}

/* 3rd item in a 3-item-grid */
.media-gallery__item--tall + .media-gallery__item + .media-gallery__item,
/* 4th item in a 4-item grid */
.media-gallery__item + .media-gallery__item + .media-gallery__item + .media-gallery__item {
  border-end-end-radius: var(--border-radius-button);
}

/* 3rd item in a 4-item grid */
.media-gallery__item:not(.media-gallery__item--tall) + .media-gallery__item + .media-gallery__item:not(
  .media-gallery__item + .media-gallery__item + .media-gallery__item + .media-gallery__item
) {
  border-end-start-radius: var(--border-radius-button);
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
.status-card__image iframe {
  border-radius: inherit
}
:is(#fake, .status-card__image-image, .status-card__image-preview) {
  border-radius: inherit;
  max-width: 100%;
}
:is(#fake, .status-card__image-image) {
  position: relative;
}
/* Show thumbnails in un-spoilered posts */
.status__content__spoiler--visible + .status-card .status-card__image-image {
  visibility: visible !important;
}

.status-card__image.status-card-video {
  background: transparent;
}

/* Hide the thumbnail-placeholder for horizontal link previews */
.status-card.horizontal:has(svg.icon-file-text) .status-card__image,
.status-card.horizontal:has(i.fa-file-text) .status-card__image {
  display: none;
}


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

.status__content__read-more-button,
.status__content__translate-button {
  padding: 0;
  margin-top: 1em;
}


/* ===== emotes ===== */

/* allwo non-square emotes */
:is(.emojione, #fake) {
  width: auto;
  vertical-align: text-bottom;
}


/* ===== special formatting ===== */

/* improve visibility of mentions, hashtags and code snippets */
a.mention,
a.hashtag, .hashtag-bar a,
a.status-link:not(.unhandled-link),
code {
  background: rgba(255 255 255 / 0.1);
  border-radius: 4px;
  padding: 1px 4px;
  color: inherit;
}
.hashtag-bar {
  gap: 0.4em 0.3em;
}
.hashtag-bar a {
  margin-inline: 0;
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

/* I've seen an article without any content exactly twice, now I'll bever see one again! */
article:empty {
  display: none;
}


/* ===== hide some UI that looks broken from the latest 4.1.2+glitch update ===== */

.status__avatar {
  box-shadow: none;
}

.notification__line, .status__line {
  display: none;
}


/* ===== Improve posts UI ===== */

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
  display: grid;
  grid-auto-flow: column;
  justify-items: center;
  align-items: center;
  grid-auto-columns: 1fr;
  flex-shrink: 0;
}
.status__content__spoiler-link {
  border-radius: 100vh;
  vertical-align: baseline;
  padding: 0.2em 1em 0;
}
.status__content--with-spoiler > div:not(.status__content__spoiler) {
  line-height: 1.5em;
}

/* center the "USERNAME boosted" text at the top of a toot */
.status__prepend {
  flex-grow: 0;
  align-self: center;
  margin-left: 36px;
  max-width: calc(100% - 30px);
}
.status__prepend:hover {
  z-index: 2;
}

/* make sure links to user profiles are consistently underlined on hover */
aside .status__display-name:hover,
.status.collapsed .display-name:hover .display-name__html {
  text-decoration: underline;
}

/* old replacement for the animated boost icon */
/* will be scaled to 17px via transform to keep the multi-sprite layout intact */
/*
@keyframes statusPrependIcon {
  0%   { background-position: 0   0%; }
  20%  { background-position: 0 100%; }
  100% { background-position: 0 100%; }
}

.status__prepend .fa-retweet.status__prepend-icon {
  background-image: url("${boostSvg}");
  background-position: 0 0;
  width: 22px;
  transform: scale(calc(17 / 22)) translateY(-1px);
  aspect-ratio: 22 / 19;
  background-size: cover;
  animation: 4.5s infinite normal statusPrependIcon steps(10);
}
.status__prepend .fa-retweet.status__prepend-icon::before {
  display: none;
}
*/

/* Better gradient on collapsed toots */
.status.collapsed .status__content {
  height: 35px;
  margin-bottom: -15px;
  margin-top: -30px;
  padding-top: 40px;

  overflow: visible;

  -webkit-mask-image: linear-gradient(to bottom, black 40px, transparent 81%);
  mask-image: linear-gradient(to bottom, black 40px, transparent 81%);
}

:is(#fake, .status.collapsed .status__content)::after {
  display: none;
}

/* ===== Make filtered posts less intrusive ===== */

.status__wrapper--filtered {
  padding: 0;
  background: var(--color-grey-0);
  outline: 3px solid var(--color-grey-0);
  outline-offset: -1px;
}

/* improve long usernames by adding an ellipsis (that doesn't break the zoom-on-hover!) */

.account--minimal.account .account__display-name {
  align-items: stretch;
}

.detailed-status__display-name,
.account .account__display-name {
  display: flex;
  min-width: 0;
  overflow: visible;
  gap: 15px;
}
.detailed-status__display-name .display-name {
  min-width: 0;
}

.status__info > span {
  overflow: unset;
  min-width: 0;
}
.status__display-name {
  max-width: calc(100% - 56px);
}

.status__display-name,
.display-name {
  overflow: visible;
}

:is(#fake, .display-name__html) {
  text-overflow: ellipsis;
  direction: ltr;
}

/* Firefox does some odd things with text-overflow: ellipsis; when an image at the end of the name would exceed the bounding box, this ::after makes enough room for the image */
.display-name:not(.inline) .display-name__html:has(img)::after {
  content: "";
  width: 2.4em;
  display: inline-block;
}

.display-name__account {
  position: relative;
}


/* ===== some other changes ===== */

#mastodon[data-props='{"locale":"de"}'] .compose-form__publish-button-wrapper > .button.primary::after {
  content: "Cybertrööt!"
}

/* Make sure the search suggestions are always ontop, the otherwise highest z-index I use is 100 */
body>div[data-popper-escaped]:last-child {
  z-index: 1000 !important;
}

/* add "follow/unfollow" labels to buttons in followed/following lists */

article > .account > .account__wrapper {
  display: grid;
  grid-template-columns: auto 1fr;
}

.account__contents {
  max-width: calc(100% - 56px);
  overflow: unset;
}

.account__relationship {
  padding: 0;
  place-self: auto end;
}

.account__relationship button {
  padding: 10px;
  height: auto !important;
  width: auto !important;
}
`)
  }

  /* Add our logo */
  GM_addStyle(`

@media screen and (min-width: 1175px) {

  body.flavour-glitch .columns-area__panels__pane--navigational .columns-area__panels__pane__inner::before {
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

  body.flavour-glitch .columns-area__panels__pane--navigational .columns-area__panels__pane__inner::after {
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
  body.flavour-glitch .navigation-panel::before {
    content: "";
    width: 100%;
    margin: 20px 0;
  }
}
`)

  /* neon-ify the page and other style adjustments */
  if (settings.enableTheme) {
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
  .navigation-panel::before,
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

  /* Profile Menu, search */

  .search__popout,
  .dropdown-menu {
    z-index: 101;
    border-radius: 8px;
    margin-top: var(--border-radius-button-between);
    backdrop-filter: blur(3px);
    background: color-mix(in srgb, var(--color-grey-3) 80%, transparent);
    border: 1px solid var(--color-grey-7);
  }
  .search__popout h4 {
    color: var(--color-white);
  }
  .search__popout__menu__message {
    color: var(--color-grey-9);
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

  .reply-indicator {
    max-height: min(40%, 360px);
    box-sizing: border-box;
  }

  /* I'm not *quite* happy with these colors. Waiting for more inspiration */
  .reply-indicator__header {
    overflow: visible;
  }

  .reply-indicator__display-name {
    display: grid;
    align-items: center;
    grid-template-columns: auto 1fr;
    overflow: visible;

    & :is(.display-name.inline, #fake) {
      overflow: hidden;
    }
  }

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
    padding: 0;
    padding-block-end: 10px;
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
    z-index: 101;
    pointer-events: none;
  }
  .compose-form .emoji-picker-dropdown .emoji-button {
    position: sticky;
    top: 0;
    pointer-events: all;
  }

  .reply-indicator__cancel {
    z-index: 1;
    position: relative;
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


  /* 4.3.x fixes */
  .compose-form__footer {

    .compose-form__buttons {

      display: grid;
      grid-template-columns: repeat(5, 1fr);


      :where(div, button) {
        width: 100%;
        box-sizing: border-box !important;
      }

      .character-counter {
        grid-column-end: -1;
        padding-inline-end: 2px;
      }
    }
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
    margin-bottom: -23px;
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

  .column-link--logo::before {
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
    padding: 15px;
  }

  .getting-started__trends h4 a:hover::before,
  .column-link--transparent:hover::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to right,
      color-mix(in srgb, var(--color-offwhite-primary)  5%, transparent),
      color-mix(in srgb, var(--color-offwhite-primary) 10%, transparent));
    border-radius: 8px;

    animation: 200ms flicker-in ease-out;
  }
  .getting-started__trends h4 a:hover::after,
  .column-link--transparent:hover span::after {
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
    padding: 15px;
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
  .getting-started__trends h4 span::before {
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

   .column > .scrollable {
     border: none;
   }

  /* ===== Header of feeds (e.g. the main feed) styling ===== */

  .tabs-bar__wrapper {
    background: none;
    --background-filter: none;
  }

  .search__input {
    border-radius: 8px;
    border: 1px solid var(--color-grey-6);
    background: var(--color-grey-5);
    box-sizing: border-box;
    height: 48px;
    padding-block: 0 !important;
  }
  .search__icon .icon-times-circle {
    top: 13px;
  }

  .column-header {
    border: none;
  }

  #tabs-bar__portal>button::after,
  .column-header__wrapper::after,
  h1:where(#Lists, #Follow-requests)::after
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
    background: color-mix(in srgb, var(--color-grey-3) 80%, transparent);
    transition: box-shadow 200ms;
  }
  #tabs-bar__portal>button:hover,
  .column-header__wrapper:hover,
  h1:where(#Lists, #Follow-requests):hover {
    box-shadow: var(--neon-box-shadow-small);
  }
  #tabs-bar__portal>button:hover::after,
  .column-header__wrapper:hover::after,
  h1:where(#Lists, #Follow-requests):hover::after {
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

  .column-header__button::before,
  .column-header__back-button::before,
  .column-back-button::before {
    content: "";
    position: absolute;
    inset: 4px;
    border-radius: 8px;
    background: none;
    transition: background 200ms, color 200ms;
    z-index: -1;
  }

  .column-header__button:hover::before,
  .column-header__back-button:hover::before,
  .column-back-button:hover::before {
    background: var(--color-grey-6);
  }

  .column-header__button.active {
    border-radius: 8px 8px 0 0;
  }

  .column-header__collapsible {
    background: var(--color-grey-5);
    border-bottom: none;
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
  .explore__links {
    margin-top: 20px;
  }
  .columns-area--mobile {
    padding: 0 10px 10px;
    box-sizing: border-box;
  }

  .hashtag-header {
    border: none;
    margin-bottom: 20px;
  }

  /* ===== info banners ===== */

  .dismissable-banner {
    margin-block: 0;
    border-radius: 8px;
    border: 1px solid var(--color-grey-4);
  }
  .item-list > .dismissable-banner {
    margin-top: 0;
    margin-bottom: 20px;
  }

  .dismissable-banner__action button {
    min-width: 40px;
    min-height: 40px;
  }

  /* ===== "x new items" button when autorefresh is disabled ===== */

  .load-more.load-gap {
    width: calc(100% - 40px);
    margin-block: 0 20px;
    margin-inline: auto;
    border: 1px solid var(--color-grey-7);
    border-radius: var(--border-radius-button);
    background-color: var(--color-grey-2);
    box-shadow: 0px 0px 10px -3px var(--color-primary);
    color: var(--color-grey-8);
    transition:
      background-color 200ms,
      border-color 200ms,
      box-shadow 200ms,
      color 200ms;
  }
  .load-more.load-gap:hover {
    background-color: var(--color-grey-3);
    border-color: var(--color-grey-8);
    box-shadow: var(--neon-box-shadow-small);
    color: var(--color-grey-9);
  }

  /* disable the styling on the article sometimes surrounding the load gap */
  article[data-id^="gap:"] {
    background: none !important;
    border: none !important;
  }


  /* ===== Posts styling ===== */

  .status {
    display: flex;
    flex-direction: column;
    padding: 15px;
  }

  .detailed-status__wrapper {
    position: relative;
  }

  .status-unlisted,
  .detailed-status__wrapper-unlisted {
    --color-privacy: var(--color-green, white);
  }
  .status-public,
  .detailed-status__wrapper-public {
    --color-privacy: var(--color-grey-8, white);
  }
  .status-direct,
  .detailed-status__wrapper-direct {
    --color-privacy: var(--color-red, white);
  }
  .status-private,
  .detailed-status__wrapper-private {
    --color-privacy: var(--color-yellow, white);
  }

  .status-unlisted,
  .status-public,
  .status-direct,
  .status-private {
    box-shadow: 0px 4px 10px -8px var(--color-privacy);
  }

  .status:not(.status-public)::after,
  .detailed-status__wrapper:not(.detailed-status__wrapper-public)::after {
    content: "";
    pointer-events: none;
    background: var(--color-privacy);
    position: absolute;
    inset: 0;
    border-radius: inherit;

    -webkit-mask-image:
      radial-gradient(at 39px calc(39px + var(--extra-top-spacing, 0px)), rgba(0, 0, 0, 0.2) 5%, rgba(0 0 0 / 0.06) 20%, transparent 70%),
      var(--noise-url);
    -webkit-mask-size: 600px 600px, 200px;
    -webkit-mask-composite: intersect;
    -webkit-mask-repeat: no-repeat, repeat;

    mask-image:
      radial-gradient(at 39px calc(39px + var(--extra-top-spacing, 0px)), rgba(0, 0, 0, 0.2) 5%, rgba(0 0 0 / 0.06) 20%,  transparent 70%),
      var(--noise-url);
    mask-size: 600px 600px, 200px;
    mask-composite: intersect;
    mask-repeat: no-repeat, repeat;
  }

  /* pre-4.3.0 */
  .hicolor-privacy-icons .status__visibility-icon.fa-unlock,
  .hicolor-privacy-icons .status__visibility-icon.fa-globe,
  .hicolor-privacy-icons .status__visibility-icon.fa-envelope,
  .hicolor-privacy-icons .status__visibility-icon.fa-lock,
  /* >= 4.3.0 */
  .hicolor-privacy-icons .status__visibility-icon.icon-unlock,
  .hicolor-privacy-icons .status__visibility-icon.icon-globe,
  .hicolor-privacy-icons .status__visibility-icon.icon-envelope,
  .hicolor-privacy-icons .status__visibility-icon.icon-lock
  {
    color: var(--color-privacy);
  }

  body:has(.hicolor-privacy-icons) .privacy-dropdown__option .icon-unlock,
  .hicolor-privacy-icons .privacy-dropdown__option .fa-unlock {
    color: var(--color-green);
  }
  body:has(.hicolor-privacy-icons) .privacy-dropdown__option .icon-globe,
  .hicolor-privacy-icons .privacy-dropdown__option .fa-globe {
    color: var(--color-grey-8);
  }
  body:has(.hicolor-privacy-icons) .privacy-dropdown__option .icon-envelope,
  .hicolor-privacy-icons .privacy-dropdown__option .fa-envelope {
    color: var(--color-red);
  }
  body:has(.hicolor-privacy-icons) .privacy-dropdown__option .icon-lock,
  .hicolor-privacy-icons .privacy-dropdown__option .fa-lock {
    color: var(--color-yellow);
  }

  /* All these refer to posts, in feeds... */
  .columns-area--mobile article:not(.explore__search-results article:only-child),
  /* the main post in post-detail-view */
  .columns-area--mobile .scrollable>div[tabindex="-1"],
  /* preceeding and following posts in post-detail-view */
  .columns-area--mobile .scrollable>div>div[tabindex="-1"],
  /* search results */
  .item-list>article[data-id],

  /* not technically posts, but these explore / search result items should have the same styles */
  .explore__search-results .empty-column-indicator,
  .explore__links .dismissable-banner,
  .search-results__section > div,
  .regeneration-indicator,
  .getting-started__wrapper
  {
    margin-bottom: 20px;
    border: 1px solid var(--color-grey-4);
    box-sizing: border-box;
    background: var(--color-grey-2);
    border-radius: var(--border-radius-button);
    /* TODO: remove old styles */

    /* background: color-mix(in srgb, transparent 90%, rgb(255, 255, 255)); */
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    border: 1px solid color-mix(in srgb, transparent 85%, white);
    /* backdrop-filter: blur(10px) saturate(180%); */
  }

  /* Search Results */
  .explore__search-results {
    background: none;
  }
  .search-results__section {
    margin-bottom: 20px;
    border: none;
  }

  .search-results__section > div {
    margin-bottom: var(--border-radius-button-between);
    border-radius: var(--border-radius-button-between);
  }
  .search-results__section > div:first-child {
    border-top-left-radius: var(--border-radius-button);
    border-top-right-radius: var(--border-radius-button);
  }
  .search-results__section > div:last-child {
    border-bottom-left-radius: var(--border-radius-button);
    border-bottom-right-radius: var(--border-radius-button);
  }

  /* remove the drop shadow from posts in search results because otherwise it looks too tight */
  .search-results__section > div[tabindex="-1"] > :where(.status-unlisted, .status-public, .status-direct, .status-private) {
    box-shadow: none;
  }

  .search-results__section .search-results__section__header {
    background: var(--color-grey-3);
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

  .search-results__section .account:last-child,
  .search-results__section .trends__item:last-child {
    border-bottom: 1px solid color-mix(in srgb, transparent 85%, white);
  }
  .explore__search-results .trends__item+div[tabindex="-1"] {
    margin-top: 20px
  }

  .account {
    border: none;
  }

  /* ==== detailed status ==== */

  /* give the selected post in single-post-view a lighter background */
  .columns-area--mobile .scrollable>div[tabindex="-1"]:has(.detailed-status) {
    box-shadow: var(--neon-box-shadow-small);
    border-color: var(--color-grey-7);
    background: var(--color-grey-3);
  }

  .detailed-status__wrapper {
    padding: 15px;
    gap: 15px;
    display: flex;
    flex-direction: column;
  }

  :is(.detailed-status, #important) {
    position: relative;
    border-top: none;
    padding: 0;
    background: none;

    .status__content {
      font-size: 15px;
      line-height: 20px;
    }
  }

  :is(.detailed-status__action-bar, #important) {
    padding: 0;
    border-radius: 0 0 8px 8px;
    border: none;
    background: none;
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

  /* Make sure everything inside a post follows the border radius */
  article > div[tabindex="-1"],
  .focusable,
  .columns-area--mobile article > div:not(.search-results__section),
  .columns-area--mobile article > div > .notification.unread,
  .columns-area--mobile article > div > .notification.unread::before,
  .columns-area--mobile article > div > .status__wrapper.unread,
  .columns-area--mobile article > div > .status__wrapper.unread::before {
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

  /* ===== Notifications / explore / Account's post/replies/media tabs ===== */

  /* .notification__filter-bar
   *    notifications use  button > i    and
   *                       button > span
   *
   * .account__section-headline
   *    explore uses       a      > span
   *    account uses       a      > span
   *    "live feeds" uses  a      > div
   */

/*
  .notification {
    padding: 10px 14px;

    .account {
      padding: 0;
    }
  }
*/

  .notification__message {

    :is(&, #important) {
      margin-top: 0;
    }

    padding-top: 0;
    min-height: 24px;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    margin: 0;
    padding: 0;
    gap: 10px;

    & > span {
      max-width: calc(100% - 10px);
    }

    & > .notification__favourite-icon-wrapper {
      position: initial;
    }

    .icon {
      display: block;
    }
  }

  /* "x liked your toot" post in 4.3 */
  .status__wrapper > .notification__message {
    grid-template-columns: auto minmax(0, 1fr) auto;
    padding: 10px;

    & + .status.collapsed .status__content {
      margin-top: ;
      padding-top: 30px;
    }
    .status__collapse-button {
      margin: 0;
      display: block;
    }
  }

  .account__section-headline {
    padding-inline: 10px;
  }

  .account__section-headline,
  .notification__filter-bar {
    border-radius: 8px;
    border: 1px solid var(--color-grey-4);
  }
  /* notifications header */
  .notification__filter-bar {
    margin-top: -20px;
    padding-top: 20px;
  }
  /* explore / live feeds header */
  .account__section-headline {
    margin-top: -20px;
    padding-top: 20px;
  }

  /*
   * .account__section-headline a          account sections, also explore tabs
   * .account__section-headline button     search results
   * .notification__filter-bar button      notification filters
   */
  .account__section-headline :is(button, a),
  .notification__filter-bar button {
    border-radius: inherit;
    flex: 1 1 0;
    padding: 0;
    min-height: 48px;
    display: grid;
    place-items: center;
  }

  .account__section-headline :is(button, a) :is(div, span),
  .notification__filter-bar button span,
  .notification__filter-bar button i {
    transition: color 200ms
  }
  .account__section-headline :is(button, a):hover :is(div, span),
  .notification__filter-bar button:hover span,
  .notification__filter-bar button:hover i {
    color: var(--color-white);
  }

  .account__section-headline :is(button, a),
  .notification__filter-bar button {
    isolation: isolate;
    position: relative;
  }

  /* hover background */
  .account__section-headline :is(button, a)::after,
  .notification__filter-bar button::after {
    content: "";
    position: absolute;
    inset: 4px;
    background: transparent;
    border-radius: 8px;
    transition: background 200ms;
    z-index: -1;
  }
  .account__section-headline :is(button, a):hover::after,
  .notification__filter-bar button:hover::after {
    background-color: var(--color-grey-6);
  }

  :is(
    #fake,
    .account__section-headline a,
    .account__section-headline button,
    .notification__filter-bar button
  )::before {
    inset-block-end: 4px;

    inset-inline: 0;
    margin-inline: auto;
    width: 80%;
    transform: none;
  }


  /* Mentions use .status__wrapper directly, all other notifications are wrapped in a .notification div */
  article:has(.unread)::before {
    content: "";
    position: absolute;
    top: 5px;
    bottom: 5px;
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
  .notification__message :is(#fake, .fa, svg.icon) {
    color: var(--color-notification);
  }

  .notification__filter-bar + .scrollable {

    /* article > div[tabindex="-1"] > ... */

    /* report       -> has .notification__message and .notification__report */
    .notification,
    /* reply        -> has .status
       like, boost  -> has aside.notification__message and .status
    */
    .status__wrapper {
      --color-notification: var(--color-grey-8);

      background-image: linear-gradient(
        color-mix(in srgb, var(--color-notification) 5%, transparent),
        color-mix(in srgb, var(--color-notification) 5%, transparent));

      /* report */
      &.notification-admin-report {
        --color-notification: var(--color-orange);

        .notification__report {
          gap: 15px;
          padding: 10px 15px;
          border: 0;
        }
      }

      /* follow */
      &.notification-follow,
      /* boost */
      &[data-boosted-by] {
        --color-notification: var(--color-purple);
      }

      /* like */
      &[data-favourited-by] {
        --color-notification: var(--color-gold);
      }

      /* reply */
      &.status__wrapper-reply { }

      /* dm */
      &.status__wrapper-direct { }

      /* polls and edits of boosted posts have a [data-undefined-by] if I'd want to style them */

      .notification__message,
      .account {
        padding: 10px 15px;
      }

      .notification__message {
        padding-bottom: 0;
      }

      .status {
        backround: none;
      }
    }

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

    padding: 10px;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    --gap: 10px;
    gap: var(--gap);
  }

  .account__header__tabs {
    margin-inline-start: 0;
    padding: 0;
  }
  .account__header__tabs__name {
    padding: 0 var(--gap);
  }

  .account__header__badges {
    adding: 0;
  }

  .account__header__image {
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
  }

  .account__header__account-note {
    border: 1px solid #42485a;
    border-radius: 8px;
    margin: 0;

    padding: 0;
    padding: 10px;
    box-sizing: border-box;
  }

  .account__header__account-note :is(textarea, #important) {
    margin: 0;
    width: 100%;
  }

  .account__header__tabs__buttons .icon-button {
    font-size: 18px !important;
    height: 36px !important;
    width: unset !important;
    min-width: 36px;
    box-sizing: border-box;
  }

  .account__header__extra {
    margin: 0;
    padding: 0;
  }

  .account__header__bio {
    margin: 0;
    display: grid;
    gap: calc(2 * var(--gap));
    margin-block-end: var(--gap);
  }

  .account__disclaimer {
    /* this is the "Information below may reflect the user's profile incompletely." hint.
    Make sure the "view full profile" link looks like a button. */
    margin: 10px 0;
    gap: 10px;
    position: relative;

    & > div {
      display: contents;

      & > span {
        text-wrap: balance;
      }

      & > a {
        padding: 7px 18px;
        min-width: calc(calc(100% - 2 * var(--border-radius-button-between)) / 3);
        box-sizing: border-box;

        border: 1px solid var(--color-grey-5);
        border-radius: var(--border-radius-button);


        color: var(--color-grey-7);
        white-space: nowrap;
        text-decoration: navajowhite;
        text-align: center;

        transition:
          background-color 200ms,
          border-color 200ms,
          color 200ms,
          box-shadow 200ms;

        &:hover {
          border-color: var(--color-grey-7) !important;
          background: var(--color-grey-2);
          color: var(--color-grey-9);
          box-shadow: var(--neon-box-shadow-small);
        }
      }
    }
  }

  .account__action-bar {
    border-radius: var(--border-radius-button);
    border: none;
    margin: 10px;
  }

  .account__header__fields {
    margin: 0 !important;
  }
  .account__header__content.translate {
    padding: 0 var(--gap);
  }
  .account__header__joined {
    padding:  0 var(--gap) !important;
  }
  .account-role {
    margin: 0 !important;
  }

  /* Tabs below the accoutn info */

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

  .account__action-bar__tab.active::before {
    content: "";
    position: absolute;
    inset: 0;
    border-bottom: 4px solid var(--color-primary);
  }

  .account__action-bar__tab.active:first-child::before {
    border-bottom-left-radius: inherit;
  }

  .account__action-bar__tab.active:last-child::before {
    border-bottom-right-radius: inherit;
  }






  /* ===== Account links ===== */

  .account__header__account-note {
    border-color: var(--color-grey-6);
    border-radius: var(--border-radius-button);
  }

  .account__header__bio .account__header__fields {
    border-radius: var(--border-radius-button);
    margin: 10px;
    border: none;
  }

  .account__header__bio .account__header__fields:last-child {

    dl {
      border-width: 1px;
      border-style: solid;
    }

    dl:not(.verified) {
      border-color: var(--color-grey-6);
    }

    dl + dl {
      margin-top: var(--border-radius-button-between);
    }
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
    border-bottom-left-radius: inherit !important;
    border-bottom-right-radius: inherit !important;
  }

  .account__header__fields dt,
  .account__header__fields dd {
    border-radius: var(--border-radius-button-between);
    max-height: unset;
  }

  .account__header__fields dt {
    background: var(--color-grey-1);
    border-top-left-radius: inherit;
    border-bottom-left-radius: inherit;
    width: 200px;
    margin-right: var(--border-radius-button-between);
  }

  .account__header__fields:not(:last-child) dd {
    border-style: solid;
    border-width: 1px;
    position: relative;
    /* TODO: This looks weird sometimes. e.g. https://corteximplant.com/@LevelUp@mastodon.art */
    white-space: initial;
    word-break: break-all;

    &:not(.verified) {
      border-color: var(--color-grey-6);
      background: color-mix(in srgb, var(--color-offwhite-primary) 5%, transparent);
    }
  }

  .account__header__fields dd {
    position: relative;
  }

  .account__header__fields dd a::before {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0;
    background-image: radial-gradient(currentColor, transparent);
    transition: opacity 200ms;
  }
  .account__header__fields dd a:hover::before {
    opacity: 0.1;
  }

  :is(#fake, .account__header__fields dd) {
    border-radius: var(--border-radius-button-between);
    border-top-right-radius: inherit;
    border-bottom-right-radius: inherit;

    word-break: break-word;
    text-align: start;
    text-wrap: balance;
  }

  /* Make sure the "joined at..." date aligns with the text above it */
  :is(#fake, .account__header__joined) {
    padding: 5px 15px;
  }

  .account-timeline__header .account__section-headline:not(:first-child) {
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
    border-bottom: none;
  }
  .status.status-direct {
    outline: 1px solid hsl(225 15% 35% / 1);
    outline-offset: 0px;
  }


  .conversation--unread.muted :is(
    .status__content,
    .status__content a,
    .status__content p,
    .status__content__text,
    .status__display-name strong,
    #important
  ) {
    color: var(--fg)
  }

  .conversation__content__names {
    white-space: normal;
  }
  .conversation__content .status__action-bar {
    justify-content: start;
  }


  /* Lists / Follower requests */
  h1#Lists, h1#Follow-requests {
    margin-left: -10px;
    margin-right: -10px;
    border-radius: 8px;
    backdrop-filter: blur(3px);
    background: color-mix(in srgb, var(--color-grey-3) 80%, transparent);
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

  body:not(.layout-multiple-columns) .scrollable.about::before {
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
  :is(.account-card, #fake) {
    margin: 0 0 20px 0;
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

  /* everything but Safari */
  @supports (scrollbar-color: auto) {

    html {
      scrollbar-color: var(--color-grey-3) transparent;
    }

    .layout-multiple-columns .scrollable {
      scrollbar-width: thin;
      padding-inline-end: 5px;
    }

  }

  /* everything but Firefox */
  @supports selector(::-webkit-scrollbar) {

    ::-webkit-scrollbar {
      width: 12px;
      height: 12px;
      background: red;
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
    background: url(/packs/media/flavours/glitch/images/wave-drawer-glitched-f44fa25589f31f0ee52ab119cea119cb.png) no-repeat bottom/100% auto;
    border-radius: inherit;

    display: flex;
    align-items: flex-end;
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



  /* ===== "getting started" page / last column ===== */

  .getting-started__wrapper {

    & > div {
      border-radius: inherit;
    }

    .column-link {
      border: none;
      border-radius: inherit;
      background-color: transparent;
      transition: background-color 200ms;

      &:hover {
        background-color: var(--color-grey-4);
      }
    }
  }

  /*
  div[data-column="getting-started"] .getting-started__wrapper {
    background: none;
  }

  div[data-column="getting-started"] .column-subheading {
    background: var(--color-grey-4);
    border-radius: 8px;
    color: var(--color-grey-8);
    margin-bottom: 10px;
  }

  div[data-column="getting-started"] div ~ .column-subheading {
    margin-top: 10px;
  }

  div[data-column="getting-started"] .column-link {
    color: #d9e1e8;
    position: relative;
    background: transparent;
  }
  div[data-column="getting-started"] .column-link:hover {
    color: white;
  }

  div[data-column="getting-started"] .column-link:hover span::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to right,
      color-mix(in srgb, var(--color-offwhite-primary)  5%, transparent),
      color-mix(in srgb, var(--color-offwhite-primary) 10%, transparent));
    border-radius: 8px;

    animation:  200ms flicker-in ease-out;
  }
  div[data-column="getting-started"] .column-link:hover span::after {
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

  div[data-column="getting-started"] .link-footer {
    margin-top: auto;
    border-radius: inherit;
  }
  */


  /* user badges */

  .account-role {
    position: relative;
    margin-top: 2px !important;
    /* Start a new stacking context */
    z-index: 1;

    --color-role-bg: hsl(225deg 10% 30%);
    --color-role-border: hsl(227deg 16% 76%);
    --color-role-bg-shine: hsl(227deg 16% 54%);
    --color-role-border-shine: hsl(227deg 16% 10%);
  }

  /* owner */
  .user-role-3 {
    --color-role-border: hsl(330deg 100% 50%);
    --color-role-border-shine: hsl(254deg 100% 65%);
  }
  /* moderator */
  .user-role-1 {
    --color-role-border: hsl(149.12deg 34% 60.78%);
    --color-role-border-shine: hsl(240deg 100% 69%);
  }
  /* supporter */
  .user-role-34 {
    --color-role-border: hsl(187deg 98% 48%);
    --color-role-border-shine: hsl(58deg 100% 47%);
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
    background-image:
      linear-gradient(60deg,
        transparent 0%,
        transparent 40%,
        color-mix(in srgb, var(--color-role-border-shine) 40%, transparent) 50%,
        transparent 60%,
        transparent 100%
      ),
      linear-gradient(var(--color-role-border), var(--color-role-border));
  }
  /* background */
  .account-role::after {
    z-index: -1;
    inset: 0px;
    background-image:
      linear-gradient(60deg,
        transparent 0%,
        transparent 45%,
        color-mix(in srgb, var(--color-role-bg-shine) 20%, transparent) 55%,
        transparent 65%,
        transparent 100%
      ),
      linear-gradient(var(--color-role-bg), var(--color-role-bg));
  }


  /* This makes the buttons beneath toots look different */

  .status__action-bar,
  .detailed-status__action-bar {
    /* height: 40px; */
    gap: var(--border-radius-button-between);
    position: relative;
    align-items: stretch;
  }

  :where(.status__action-bar, .detailed-status__action-bar)
  :is(button, .status__action-bar-dropdown, detailed-status__action-bar-dropdown) {
    height: 100% !important;
    min-width: 40px !important;
    border-radius: 8px;
    z-index: 1;
  }
  .detailed-status__button button,
  .status__action-bar-button {
    transition: color 200ms
  }
  .detailed-status__action-bar-dropdown span {
    height: 100%;
  }

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
    /* height: 40px; */
    box-sizing: border-box;
    padding-inline: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  :where(.status__action-bar, .detailed-status__action-bar) :where(button, a)::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: var(--color-grey-7);
    opacity: 0.1;
    border-radius: inherit;
    pointer-events: none;
  }

  :where(.status__action-bar, .detailed-status__action-bar) button.disabled {
    background-color: var(--color-grey-1);
  }

  :where(.status__action-bar, .detailed-status__action-bar) button.active::before {
    opacity: 0.2;
    background-image: radial-gradient(currentColor, transparent);
  }

  .status__action-bar > *,
  .detailed-status__action-bar button {
    margin-inline: 0 !important;
    padding: 7px;
  }

  :where(.status__action-bar, .detailed-status__action-bar) > :first-child {
    border-start-start-radius: var(--border-radius-button);
    border-end-start-radius: var(--border-radius-button);
  }

  :where(.status__action-bar, .detailed-status__action-bar) > :last-child,
  .status__action-bar > :last-child button {
    border-start-end-radius: var(--border-radius-button);
    border-end-end-radius: var(--border-radius-button);
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
  }

  if (settings.showOldPunks) {
    GM_addStyle(`

body.layout-multiple-columns .drawer__inner__mastodon {
  content: url(https://corteximplant.com/system/site_uploads/files/000/000/006/@1x/68f324b193475041.png);
  object-fit: contain;
  min-height: auto;
  object-position: bottom;

  -webkit-mask-image: url(${footerImgMask});
  -webkit-mask-size: contain;
  -webkit-mask-position: bottom;
  -webkit-mask-repeat: no-repeat;
}
`)
  }

  /* emoji picker improvements */
  GM_addStyle(`

/* Emoji picker bigger images */

.emoji-mart-category-list {
  display: grid;
  grid-template-columns: repeat(6, minmax(42px, 1fr));
  /* todo: is there a better way for this, considering the cells are supposed to be the same size anyways? */
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

.emoji-mart-category-label {
  top: -1px;
}

.emoji-mart-category-label span {
  background: linear-gradient(to bottom, white 20%, rgba(255 255 255 / 0.9) 80%, transparent);
}


/* make sure the grey hover outline is *behind* the emoji */
.emoji-mart-category .emoji-mart-emoji:hover::before {
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
.emoji-button::after {
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
.emoji-button:hover::after {
  filter: none;
  opacity: 1;
}
`)

  /* ===== image alt label changes ===== */
  GM_addStyle(`

/* WARNING: This relies on :has and thus won't work well in FF (as of Jan 2023) */

/* reposition spoiler button to have the same position as the alt tag */
.spoiler-button--minified button {
  border-radius: 8px !important;
}
.spoiler-button--minified button .icon {
  width: 20px;
  height: 20px;
  padding: 2px;
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

.media-gallery__item__badges {
  /* force alt/gif badges to lowercase since i think it looks nicer */
  text-transform: lowercase;
  border-radius: 8px;
  /* and align them with the spoiler button */
  bottom: 4px;
  inset-inline-start: 4px;
}

/* Add "alt" indicator on audio, videos */
.audio-player:has(canvas.audio-player__canvas[aria-label]) .video-player__buttons.right::before,
.video-player video[aria-label] ~ .video-player__controls .video-player__buttons.right::before{
  content: "alt";
  color: hsla(0 0% 100% / .7);
  padding: 0 5px;
  pointer-events: none;
}
.media-gallery__gifv__label {
  line-height: 27.1429px;
  padding: 0 5px;
}

.media-gallery__alt__label,
.media-gallery__gifv__label,
.sensitive-marker,
/* "hide media" button */
.icon-button.overlayed,
/* "click to show" for galleries */
.spoiler-button__overlay__label,
/* play/open actions on YT videos */
.status-card__actions > div
{
  border-radius: 8px;

  color: hsla(0 0% 100% / .7);
  font-size: 0.8em;
  font-weight: normal;
  line-height: 1.5;

  background: rgba(0 0 0 / 0.5);

  -webkit-backdrop-filter: grayscale(1) invert(1) brightness(.7) contrast(0.2) opacity(0.5);
  backdrop-filter: grayscale(1) invert(1) brightness(.7) contrast(0.2) opacity(0.5);

  transition: opacity 200ms;
  opacity: var(--opacity, 1);
}
`)

  /* ===== Glitch Effect on notifications & default avatars ===== */
  if (settings.enableTheme) {
    GM_addStyle(`

@media (prefers-reduced-motion: no-preference) {

  :where(
    .account__avatar, .account__avatar-overlay-overlay
  )[style*="/avatars/original/missing.png"],
  .account__avatar:has(img[src*="avatars/original/missing.png"]) {
    animation: paths 10s step-end infinite;
    position: relative;
    --padding: -5px;
    --start: 5px;
    overflow: visible;
  }

  :where(
    .account__avatar, .account__avatar-overlay-overlay
  ) img {
    border-radius: inherit;
  }

  :where(
    .account__avatar, .account__avatar-overlay-overlay
  )[style*="/avatars/original/missing.png"]::before,
  :where(
    .account__avatar, .account__avatar-overlay-overlay
  )[style*="/avatars/original/missing.png"]::after,
  .account__avatar:has(img[src*="/avatars/original/missing.png"])::before,
  .account__avatar:has(img[src*="/avatars/original/missing.png"])::after {
    content: "";
    position: absolute;
    height: 105%;
    width: 105%;
    background-size: 110% 110%;
    background-image: inherit;
    background-image: url(/avatars/original/missing.png);
    border-radius: inherit;
  }

  :where(
    .account__avatar, .account__avatar-overlay-overlay
  )[style*="/avatars/original/missing.png"]::before,
  .account__avatar:has(img[src*="/avatars/original/missing.png"])::before {
    top: calc((10em / 6) + var(--padding));
    left: calc((15em / 6) + var(--padding) + var(--start));
    color: #6364ff;
    filter: hue-rotate(300deg);
    animation:
      paths 10s step-end infinite,
      opacity 10s step-end infinite,
      movement 20s step-end infinite;
  }
  :where(
    .account__avatar, .account__avatar-overlay-overlay
  )[style*="/avatars/original/missing.png"]::after,
  .account__avatar:has(img[src*="/avatars/original/missing.png"])::after{
    top: calc((5em / 6) + var(--padding));
    left: calc((-30em / 6) + var(--padding) + var(--start));
    color: #1bc7fb;
    filter: hue-rotate(122deg);
    animation:
      paths 14s step-end infinite,
      opacity 12s step-end infinite,
      movement 16s step-end infinite;
  }

  /* WARNING: This relies on :has and thus won't work well in FF (as of Jan 2023) */
  .column-link--transparent:has(i+i),
  .column-link--transparent:has(i>i) {
    position: relative;
    z-index: 2;
    --padding: 15px;
    --start: 25px;
    padding: var(--padding);

    text-decoration: none;
  }

  .column-link--transparent:has(i+i)::before,
  .column-link--transparent:has(i>i)::before,
  .column-link--transparent:has(i+i)::after,
  .column-link--transparent:has(i>i)::after {
    content: attr(title);
    position: absolute;
    width: 110%;
    z-index: -1;
  }

  .column-link--transparent:has(i+i)::before,
  .column-link--transparent:has(i>i)::before {
    top: calc((10em / 60) + var(--padding));
    left: calc((15em / 60) + var(--padding) + var(--start));
    color: #6364ff;
    animation:
      paths 10s step-end infinite,
      opacity 10s step-end infinite,
      font 16s step-end infinite,
      movement 20s step-end infinite;
  }

  .column-link--transparent:has(i+i)::after,
  .column-link--transparent:has(i>i)::after {
    top: calc((5em / 60) + var(--padding));
    left: calc((-10em / 60) + var(--padding) + var(--start));
    color: #1bc7fb;
    animation:
      paths 10s step-end infinite,
      opacity 10s step-end infinite,
      font 14s step-end infinite,
      movement 16s step-end infinite;
  }
  .column-link--transparent:has(i+i) span,
  .column-link--transparent:has(i>i) span {
    animation: paths 10s step-end infinite;
  }

}

@keyframes paths {
  0% {
    clip-path: polygon(
       0% 43%, 83% 43%, 83% 22%, 23% 22%, 23% 24%, 91% 24%, 91% 26%,
      18% 26%, 18% 83%, 29% 83%, 29% 17%, 41% 17%, 41% 39%, 18% 39%,
      18% 82%, 54% 82%, 54% 88%, 19% 88%, 19%  4%, 39%  4%, 39% 14%,
      76% 14%, 76% 52%, 23% 52%, 23% 35%, 19% 35%, 19%  8%, 36%  8%,
      36% 31%, 73% 31%, 73% 16%,  1% 16%,  1% 56%, 50% 56%, 50%  8%
    );
  }

  5% {
    clip-path: polygon(
       0% 29%, 44% 29%, 44% 83%, 94% 83%, 94% 56%, 11% 56%, 11% 64%,
      94% 64%, 94% 70%, 88% 70%, 88% 32%, 18% 32%, 18% 96%, 10% 96%,
      10% 62%,  9% 62%,  9% 84%, 68% 84%, 68% 50%, 52% 50%, 52% 55%,
      35% 55%, 35% 87%, 25% 87%, 25% 39%, 15% 39%, 15% 88%, 52% 88%
    );
  }

  30% {
    clip-path: polygon(
       0% 53%, 93% 53%, 93% 62%, 68% 62%, 68% 37%, 97% 37%, 97% 89%,
      13% 89%, 13% 45%, 51% 45%, 51% 88%, 17% 88%, 17% 54%, 81% 54%,
      81% 75%, 79% 75%, 79% 76%, 38% 76%, 38% 28%, 61% 28%, 61% 12%,
      55% 12%, 55% 62%, 68% 62%, 68% 51%,  0% 51%,  0% 92%, 63% 92%,
      63%  4%, 65% 4%
    );
  }

  45% {
    clip-path: polygon(
       0% 33%,  2% 33%,  2% 69%, 58% 69%, 58% 94%, 55% 94%, 55% 25%,
      33% 25%, 33% 85%, 16% 85%, 16% 19%,  5% 19%,  5% 20%, 79% 20%,
      79% 96%, 93% 96%, 93% 50%,  5% 50%,  5% 74%, 55% 74%, 55% 57%,
      96% 57%, 96% 59%, 87% 59%, 87% 65%, 82% 65%, 82% 39%, 63% 39%,
      63% 92%,  4% 92%,  4% 36%, 24% 36%, 24% 70%,  1% 70%,  1% 43%,
      15% 43%, 15% 28%, 23% 28%, 23% 71%, 90% 71%, 90% 86%, 97% 86%,
      97%  1%, 60%  1%, 60% 67%, 71% 67%, 71% 91%, 17% 91%, 17% 14%,
      39% 14%, 39% 30%, 58% 30%, 58% 11%, 52% 11%, 52% 83%, 68% 83%
    );
  }

  76% {
    clip-path: polygon(
       0% 26%, 15% 26%, 15% 73%, 72% 73%, 72% 70%, 77% 70%, 77% 75%,
       8% 75%,  8% 42%,  4% 42%,  4% 61%, 17% 61%, 17% 12%, 26% 12%,
      26% 63%, 73% 63%, 73% 43%, 90% 43%, 90% 67%, 50% 67%, 50% 41%,
      42% 41%, 42% 46%, 50% 46%, 50% 84%, 96% 84%, 96% 78%, 49% 78%,
      49% 25%, 63% 25%, 63% 14%
    );
  }

  90% {
    clip-path: polygon(
       0% 41%, 13% 41%, 13%  6%, 87%  6%, 87% 93%, 10% 93%, 10% 13%,
      89% 13%, 89%  6%,  3%  6%,  3%  8%, 16%  8%, 16% 79%,  0% 79%,
       0% 99%, 92% 99%, 92% 90%,  5% 90%,  5% 60%,  0% 60%,  0% 48%,
      89% 48%, 89% 13%, 80% 13%, 80% 43%, 95% 43%, 95% 19%, 80% 19%,
      80% 85%, 38% 85%, 38% 62%
    );
  }

  1%, 7%, 33%, 47%, 78%, 93% {
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
  0%  { opacity: 0.1; }
  5%  { opacity: 0.7; }
  30% { opacity: 0.4; }
  45% { opacity: 0.6; }
  76% { opacity: 0.4; }
  90% { opacity: 0.8; }
  1%, 7%, 33%, 47%, 78%, 93%
      { opacity: 0;   }
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
  }

  // This relies on :has(), without it the styling has no effect due to the @supports query.
  // The statement is used to select a bunch of wrappers that
  // would otherwise have overflow: hidden, and replace that with an overflow: clip that allows images to be expanded, but keeps e.g. ellipsises.
  //
  // This is mostly part of the Cortex-Implant Custom CSS by now, you shouldn't need this.
  GM_addStyle(`

/* Hover-Zoom for emotes */

@supports selector(:has(a, b)) {
  /* Change disable overflow on elements restraining the images while hovering */

  /* Toots */
  :is(.display-name, #fake),
  .display-name__html,
  .status__display-name,

  /* Poll Option */
  label.poll__option,

  /* DMs */
  .conversation__content__names,
  .detailed-status__display-name strong,
  .conversation__content__info,
  .conversation__content,

  /* Boosts */
  .status__prepend > span,

  /* follow notifications */
  .notification__message > span,
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

  /* Picture in picture player */
  .picture-in-picture__header__account,
  .picture-in-picture__header .display-name span,
  .picture-in-picture__header .display-name strong,

  /* admin interface */
  .batch-table__row__content--with-image

  /* FIXME: overflof-clip-margin has kinda bad support
   * this needs a fallback for safari
   * https://caniuse.com/?search=overflow-clip
   */
  {
    overflow: clip;
    overflow-clip-margin: 5em;
  }

  /* some fixes where clip won't work: */
  .announcements__item__content {
    overflow-x: hidden;
  }
  .reply-indicator {
    overflow-y: auto;
  }

  /* fix hovered emotes in a collapsed notification's 1st line */
  .status__content.status__content--with-action:has(img.emojione:hover) {
    z-index: 2;
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

  GM_addStyle(`
  /* Dynamically sized Jonny Cyberdon - change to the custom.css style */

body.layout-single-column::after {
  content: "";
  position: fixed;
  left: 1vw;
  top: 100vh;
  transform: translateY(-100%);
  height: clamp(75px, 28.09vw + -255.06px, 200px);
  aspect-ratio: 1;

  /* background-image: url(/system/site_uploads/files/000/000/007/original/5f3e778f1ff2569e.png); */
  background-repeat: no-repeat;
  background-size: 100%;
  background-position: bottom;

  pointer-events: none;
  z-index: -9999;

  opacity: 0.8;
}
`)
})()
