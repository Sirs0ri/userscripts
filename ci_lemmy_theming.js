// ==UserScript==
// @name         Dataterm CSS Improvements
// @namespace    http://tampermonkey.net/
// @version      0.3
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

    /* TODO:
       - [ ] Mobile Layout

    */

    // Main Page
    GM_addStyle(`

/* ====================
 *   general changes
 * ==================== */

body {
    --rgb-red: 235 75 96;
    --color-red: rgb(var(--rgb-red));

    --rgb-green: 109 235 168;
    --color-green: rgb(var(--rgb-green));

    --rgb-background: 22 22 22;
    --color-background: rgb(var(--rgb-background));

    font-size: 1.25rem;
}


/* === adjust colors for better readability === */

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
.text-success {
    color: var(--color-green) !important;
}

a {
    color: var(--color-green);
}


/* === some other color changes === */

blockquote {
    --secondary: var(--color-green);
}


/* === up/downvote buttons === */

/* increase size */
.icon.upvote, .icon.downvote {
    width: 1.5em;
    height: 2.5em;
}
.icon.downvote {
    margin-top: -5px;
}

/* make active upvoted arrow green not blue/"info" */
.text-info > .icon.upvote {
    color: var(--color-green)
}


/* === prevent icon + text links in the account nav from twxt-wrapping === */

.nav-link {
    text-wrap: nowrap;
}



/* ====================
 * style/layout changes
 * ==================== */

/* === filter bar above posts / comments === */

/* comments */
.container-lg .col-12.col-md-8.mb-3 > :not(.btn-group) + .btn-group,
.container-lg .col-12.col-md-8.mb-3 > .btn-group + .btn-group,
/* posts */
.container-lg > .row > .col-12.col-md-8 > div.mb-3:not(.post-listing ~ div),
.main-content-wrapper > div > div.mb-3,
:where(
  .container-lg > .row > .col-12.col-md-8 > div.mb-3:not(.post-listing ~ div),
  .main-content-wrapper > div > div.mb-3
) ~ .my-2
{
    position: sticky;
    top: 1rem;
    z-index: 1;

    border-style: solid;
    border-color: var(--color-red);
    border-width: 1px;
    grid-column-end: span 1;

    background-color: var(--color-background);
    background-image: linear-gradient(45deg, rgb(var(--rgb-red) / 0.1), rgb(var(--rgb-red) / 0.1));

    padding: 1em;
}

.container-lg > .row > .col-12.col-md-8 > div.mb-3:not(.post-listing ~ div),
.main-content-wrapper > div > div.mb-3,
:where(
  .container-lg > .row > .col-12.col-md-8 > div.mb-3:not(.post-listing ~ div),
  .main-content-wrapper > div > div.mb-3
) ~ .my-2 {
    margin-right: -15px;
    margin-bottom: 2rem !important;

    padding-bottom: calc(1em - 0.5rem);
}
:where(
  .container-lg > .row > .col-12.col-md-8 > div.mb-3:not(.post-listing ~ div),
  .main-content-wrapper > div > div.mb-3
) ~ .my-2 {
    margin-top: 2rem !important;
    padding: 15px;
}

:where(
  .main-content-wrapper > div > div.mb-3,
  .container-lg > .row > .col-12.col-md-8 > div.mb-3,
  .btn-group
) label.false {
    background-color: var(--color-background);
}


/* === spacing between / around posts === */

.post-listing + hr {
    display: none;
}
hr + .post-listing {
    margin-top: 1rem;
}
.post-listing {
    margin-left: 1rem;
}
.col-12.col-md-8 > .post-listing {
    margin-left: 0;
}


/* === comment area beneath posts === */

.post-listing ~ div > form {
    margin: 1rem;
}
.post-listing ~ div > form textarea {
    min-height: 5em;
    font-size: 1.25rem;
}
.post-listing ~ div > form .form-control:focus {
    background-color: rgb(var(--rgb-green) / 0.3);
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


/* === post view === */

.container-lg .col-12.col-md-8.mb-3 {
    display: grid;
    grid-auto-rows: min-content;
    grid-template-columns: 1fr 1fr;
}

.container-lg .col-12.col-md-8.mb-3 > * {
    grid-column-end: span 2;
}

.container-lg .col-12.col-md-8.mb-3 > :not(.btn-group) + .btn-group,
.container-lg .col-12.col-md-8.mb-3 > .btn-group + .btn-group {
    padding: 1em;
    border-style: solid;
    border-color: var(--color-red);
    border-width: 1px;
    grid-column-end: span 1;

    background-color: var(--color-background);
    background-image: linear-gradient(45deg, rgb(var(--rgb-red) / 0.1), rgb(var(--rgb-red) / 0.1));

    position: sticky;
    top: 1rem;
    z-index: 1;
}

.container-lg .col-12.col-md-8.mb-3 > :not(.btn-group) + .btn-group {
    border-radius: 0.2rem 0 0 0.2rem;
    border-right: none;
    margin-right: 0 !important;
    justify-content: flex-start;
}
.container-lg .col-12.col-md-8.mb-3 > .btn-group + .btn-group {
    border-radius: 0 0.2rem 0.2rem 0;
    border-left: none;
    justify-content: flex-end;
}
.container-lg .col-12.col-md-8.mb-3 > .btn-group label {
    flex-grow: 0;
}


/* === comments === */

/* top level comments */
:not(.details + .comments) > .comment {
    margin-top: 1em;
    margin-inline: 1em;
    border: 1px solid rgba(255 255 255 / 0.5);
}
:not(.details + .comments) > .comment > .details.border-top {
    border-top: none !important;
    padding: 1em!important;
}
:not(.details + .comments) > .comment + .comment {
    margin-top: 1em;
}

/* threaded comments */

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
    margin-left: var(--border-indicator-width, 1em) !important;
}

/* other comments related changes */

/* margin around comment body*/
.comment > .details .md-div {
    margin-block: 0.5rem;
}

/* move votes / "sent at" to the end */
.comment > .details .mr-lg-5.flex-lg-grow-0 {
    flex-grow: 1 !important;
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
