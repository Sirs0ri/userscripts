// ==UserScript==
// @name         Backup/Restore Picrew
// @namespace    http://tampermonkey.net/
// @version      2026-08-15
// @description  JSON Import/Export functionality for picrew.me
// @author       @Sirs0ri
// @updateURL    https://raw.githubusercontent.com/Sirs0ri/userscripts/main/picrew-import.user.js
// @downloadURL  https://raw.githubusercontent.com/Sirs0ri/userscripts/main/picrew-import.user.js
// @supportURL   https://github.com/Sirs0ri/userscripts/issues
// @match        https://picrew.me/en/image_maker/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=picrew.me
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let db
    const DB_NAME = "picrew"
    const OS_NAME = "image_maker_parts"

    const url = new URL(window.location)
    const id = url.pathname.split("/").pop()
    console.log("Running for image maker", id)

    const req = indexedDB.open(DB_NAME)
    req.onsuccess = (evt) => {
        const _db = evt.target.result

        if (!_db.objectStoreNames.contains(OS_NAME)) {
            console.warn(`Database is missing the "${OS_NAME}" object store`)
            return
        }
        db = _db
        console.info("Picrew database opened successfully.")
    }

    req.onerror = (event) => {
        // Generic error handler for all errors targeted at this database's
        // requests!
        console.error(`Database error: ${event.target.error?.message}`);
    };

    function validateID(item) {
        return item.image_maker_id == id
    }

    const wrapper = document.createElement("div")
    wrapper.style.position = "absolute"
    wrapper.style.bottom = "3rem"
    wrapper.style.right = "3rem"
    wrapper.style.display = "flex"
    wrapper.style.flexDirection = "column"
    wrapper.style.gap = "1rem"

    const exportBtn = document.createElement("button")
    exportBtn.textContent = "export"
    exportBtn.style.cursor = "pointer"
    exportBtn.onclick = onExport

    const importBtn = document.createElement("button")
    importBtn.textContent = "import"
    importBtn.style.cursor = "pointer"
    importBtn.onclick = onImport

    const dlAnchor = document.createElement("a")
    dlAnchor.id = "download"
    dlAnchor.style.visibility = "hidden"

    const importInput = document.createElement("input")
    importInput.id = "import"
    importInput.type = "file"
    importInput.accept = ".json"
    importInput.style.visibility = "hidden"

    wrapper.appendChild(importBtn)
    wrapper.appendChild(exportBtn)

    document.body.appendChild(wrapper)

    function onExport() {
        if (db == null) {
            console.warn("Database not initialized!")
            return
        }
        const values = []

        const os = db.transaction([OS_NAME]).objectStore(OS_NAME);

        os.openCursor().onsuccess = function (event) {
            console.log("Got cursor")
            const cursor = event.target.result;
            if (cursor) {

                if (validateID(cursor.value)) {
                    console.log(cursor.key);
                    console.log(cursor.primaryKey);
                    console.log(cursor.value);

                    values.push({
                        key: cursor.key,
                        value: cursor.value,
                    })

                }

                cursor.continue();
            } else {
                console.log("No more values")

                const json = JSON.stringify(values, null, 4)
                // prompt("Here's your data:", json)

                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(json)
                dlAnchor.setAttribute("href", dataStr)
                dlAnchor.setAttribute("download", `picrew-${id}.json`)
                dlAnchor.click()
            }
        }
    }

    function onImport() {
        if (db == null) {
            console.warn("Database not initialized!")
            return
        }

        importInput.addEventListener("change", (evt) => {
            const file = evt.target.files[0]

            const reader = new FileReader()
            reader.addEventListener("load", () => {
                // this will then display a text file
                // console.log(reader.result)
                importJson(reader.result)
            })

            reader.readAsText(file)

        }, {once: true})

        importInput.click()
    }

    function importJson(raw) {
        const data = JSON.parse(raw)

        console.log("Importing", data.length, "items")

        const trans = db.transaction([OS_NAME], "readwrite") // 🏳️‍⚧️
        trans.oncomplete = (evt) => {
            console.log("Transaction completed: database modification finished.")
            location.reload()
        }

        trans.onerror = (evt) => {
            console.warn("Failed to add item:", evt)
        };

        const os = trans.objectStore(OS_NAME);

        for (const item of data) {
            if (!validateID(item.value)) {
                console.log("Skipping item", item.key, "since it's for another maker")
            }

            os.put(item.value)
        }

        trans.commit()
    }

    // Your code here...
})();
