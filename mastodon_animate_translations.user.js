// ==UserScript==
// @name         Animated translations
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Give translating a toot a cyberpunk2077 inspired "revealing" animation
// @author       @Sirs0ri
// @match        https://corteximplant.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=corteximplant.com
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(`
    .cyan-text { color: cyan; }

    .status__content:not(.translating) .status__content__text.animating,
    .status__content.translating .status__content__text:not(.animating) {
        display: none
    }
    `)

    /** Wrap requestAnimationFrame into a promise */
    async function awaitAnimationFrame () {
        return new Promise (resolve => {
            requestAnimationFrame(() => resolve())
        })
    }

    /** Get a random character formatted as HTML-sequence from the ASCII table, from the printable range (32-126, I'm not including DEL at 127). */
    function getRandomChar() {
        const ascii = 32 + Math.floor(Math.random()*95)
        return `&#${ascii};`
    }

    /** get a span containing 6 random characters */
    function getRandomString () {
        const chars = []
        while (chars.length < 6) {
            chars.push(getRandomChar())
        }
        return ` <span class="cyan-text">${chars.join("")}</span> `
    }

    /** transform text between a "from" and a "to" state, with a callback called on each step */
    async function transformText(from, to, onStep, steps = 100) {
        let step = 0
        let rnd = getRandomString()
        while(++step <= steps) {
            const stepRelative = step / steps
            const intermediate = to.slice(0, to.length * stepRelative) + rnd + from.slice(from.length * stepRelative, step.length)
            onStep(intermediate)

            if ((step % 10) === 0) {
                rnd = stepRelative >= 0.9 ? "" : getRandomString()
            }
            await awaitAnimationFrame()
        }
    }

    const onClickHandler = (evt) => {
        // This handler will be registered to the document's click event, so it'll be called a lot.
        // Check if this is a "translate" button or a "show original" button, otherwise return right away
        const translateButton = evt.target.closest("button.status__content__translate-button")
          ?? evt.target.closest(".translate-button > button.link-button")

        if (translateButton == null) return

        // get the containing ".status__content" element and its text
        const contentEl = evt.target.closest(".status__content")
        const contentTextEl = contentEl?.querySelector(".status__content__text")
        const textBefore = contentTextEl?.innerHTML

        if (textBefore == null) return

        const clone = contentTextEl.cloneNode(true);

        // Set this to true to enable logging along the way!
        const showLogs = false

        // the clone will be invisible until the parent has the class .translating due to css
        // to prevent layout shifts durign insertion/deletion of the clone we'll:
        //   1. make sure the clone has the .animating class
        //   2. insert it (hidden by default through CSS)
        //   3. give the parent the .translating class to hide the original content and show the clone
        //   4. register the Observer
        //   -> this is where mastodon will replace the original content with the translation, triggering the Observer
        //   5. transform the cloned node
        //   -> this will take a moment, at the end the clone will match the translated content
        //   6. remove the parent's .translating class to hide the clone and show the original translation
        //   7. safely delete the clone
        showLogs && console.log("starting animation...")

        clone.classList.add("animating")
        contentEl.insertBefore(clone, contentTextEl)
        showLogs && console.log("clone inserted")

        contentEl.classList.add("translating")
        showLogs && console.log("clone & original switched")

        const undoChanges = () => {
            contentEl.classList.remove("translating")
            showLogs && console.log("original & clone switched")

            contentEl.removeChild(clone)
            showLogs && console.log("clone removed")
        }

        // Create a mutationObserver that will wait for mastodon to apply the translation and then start the animation
        const observer = new MutationObserver(async () => {
            showLogs && console.log("observer triggered")

            // make sure the observer only runs once
            observer.disconnect()

            // get the translated text
            const textAfter = contentEl?.querySelector(".status__content__text:not(.animating)")?.innerHTML

            if (textAfter == null) {
                // something went wrong, undo all changes and let mastodon do its thing
                showLogs && console.log("animation cancelled")
                undoChanges()
                return
            }

            // do the transformation, updating the clone's content at each step
            const longerLength = Math.max(textBefore.length, textAfter.length)
            const steps = Math.ceil(longerLength / 3) // this'll change 3 characters per step, which worked out as a nice speed
            await transformText(textBefore, textAfter, i => {
                clone.innerHTML = i
            })

            showLogs && console.log("animation done")

            undoChanges()


        });

        // Register the observer to wait for the translation to happen
        observer.observe(contentEl, {
            subtree: true,
            childList: true,
        });


    }

    // Register the onClickHandler
    document.addEventListener("click", onClickHandler, true)
})();
