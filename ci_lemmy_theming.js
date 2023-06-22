// ==UserScript==
// @name         Dataterm CSS Improvements
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Sirs0ri
// @match        https://dataterm.digital/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dataterm.digital
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    console.log("hello world")

    const donateLink = document.querySelector("[href='https://join-lemmy.org/donate']")
    donateLink.title = donateLink.title.replace("Lemmy", "DATACRASH")
    donateLink.href = "https://ko-fi.com/revengeday"
    donateLink.target = "_blank"

    // Main Page
    GM_addStyle(`

/* ====================
 *   general changes
 * ==================== */

body {
    --rgb-red: 235 75 96;
    --color-red: rgb(var(--rgb-red));

    font-size: 1.25rem;
}


/* adjust colors for better readability */
.card,
.post-listing{
    background-color: rgb(var(--rgb-red) / 0.1);
}
.post-listing > .card {
    background-color: transparent;
    border-color: rgba(255 255 255 / 0.3)
}

.text-muted {
    color: rgb(255 255 255 / 0.7);
}


/* increase size for up/downvote buttons */
.icon.upvote, .icon.downvote {
    width: 1.5em;
    height: 2.5em;
}
.icon.downvote {
    margin-top: -5px;
}

/* prevent icon + text links in the account nav from twxt-wrapping */
.nav-link {
    text-wrap: nowrap;
}


/* ====================
 * style/layout changes
 * ==================== */

/* === filter bar above posts === */

.main-content-wrapper > div > div.mb-3 {
    border-style: solid;
    border-color: #ff375c;
    border-radius: 0.2rem;
    border-width: 1px;

    background-color: rgb(var(--rgb-red) / 0.1);

    margin-right: -15px;

    padding: 15px;
    padding-bottom: calc(15px - 0.5rem);
}

.main-content-wrapper > div > div.mb-3 label.false {
    background-color: #161616;
}

/* === community === */

.vote-bar ~ .col-12 {
    margin-bottom: 0 !important;
}

.post-title + ul li {
    margin-bottom: 0.5rem;
}

/* "posted by XY in AB" */
.post-title + ul li:first-child {
    display: block;
}

/* post's language - this is originally a badge with no background, ie a span with padding and smaller font. */
.post-title + ul > span.badge {
    margin-left: 0 !important;
    margin-right: 0.5rem !important;
    font-size: revert;
    padding: 0;
}

/* usually the language badge is the 2nd child. if not, the 2nd one will be the "•" separator
at the start of the 2nd line, which looks bad */
.post-title + ul li:nth-child(2) {
    display: none;
}


/* === comments === */

/* top level comments */
:not(.details + .comments) > .comment {
    margin-top: 1em;
    border: 1px solid rgba(255 255 255 / 0.5)
}
:not(.details + .comments) > .comment > .details.border-top {
    border-top: none !important;
    padding: 1em!important;
}
:not(.details + .comments) > .comment + .comment {
    margin-top: 1em;
}

/* === threaded comments === */
.details + .comments > .comment {
    --border-indicator-width: 6px;
}
.details + .comments > .comment > .details {
    border-top-color: rgba(255 255 255 / 0.2) !important;
    border-left-width: 4px !important;
    padding: 0 !important;
}
.details + .comments > .comment > .details > .ml-2 {
    border-left: inherit;
    margin-left: 0 !important;
    padding: 0.5em;
    border-left-width: var(--border-indicator-width, 0);
    margin-left: -2px !important;
    margin-top: -1px;
}

.comment {
    margin-top: 0;
    border: none;
    margin-left: 0 !important;
    padding: 0;
    margin-left: var(--border-indicator-width, 0) !important;
}


/* === admin interface === */

/* list of admins, blocked users */
.list-unstyled {
    max-height: 80vh;
    overflow-y: auto;
    scrollbar-gutter: stable;
}
.list-unstyled li.list-inline-item {
    display: block;
}
.list-unstyled li.list-inline-item + li.list-inline-item {
    margin-top: 0.5em;
}

/* === sidebars === */

/* remove the inline-layout from admins in sidebar */
.d-none.d-md-block.col-md-4 .card:nth-child(2) .md-div ~ ul.list-inline:last-of-type li {
    display: block !important;
}
.d-none.d-md-block.col-md-4 .card:nth-child(2) .md-div ~ ul.list-inline:last-of-type li + li {
    margin-top: 0.5em;
}
.d-none.d-md-block.col-md-4 .card:nth-child(2) .md-div ~ ul.list-inline:last-of-type li span:first-child {
    margin-left: 2.5em;
}


/* remove the inline-layout from community lists */
.card-body > div > h5 + ul li.list-inline-item.d-inline-block {
    max-width: 100%;
    overflow: hidden;
    display: block !important
}
.card-body > div > h5 + ul li.list-inline-item.d-inline-block + li.list-inline-item.d-inline-block {
    margin-top: 0.5em;
}
.card-body > div > h5 + ul li.list-inline-item.d-inline-block a {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: block;
}

.card-body > div > h5 + ul li.list-inline-item.d-inline-block a span:first-child {
    margin-inline-start: 2.5rem;
}

:where(h1, h2, h3, h4, h5, h6) > * a.text-body {
    color: inherit !important;
}

/* ====================
 *        Misc
 * ==================== */

/* add | between text-links in the main top nav */
.navbar-nav.my-2.mr-auto .nav-item:not(:last-child) a:after {
    content: " |";
    color: rgba(255, 255, 255, 0.6)
}
    `)

})();
