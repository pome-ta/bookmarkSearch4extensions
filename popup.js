'use strict';

const container = document.querySelector('#container');

const faviconUrl = (url) => `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`;

const convertToSearchItemsFromBookmarks = (bookmarkTreeNodes) => {
    const result = [];
    const getTitleAndUrl = (bookmarkTreeNodes, folderNames) => {
        bookmarkTreeNodes.forEach((node) => {
            if (node.type !== "bookmark" && node.children) {
                const _folderName = node.parentId === "0" ? "" : node.title;
                getTitleAndUrl(node.children, [...folderNames, _folderName]);
                return;
            }

            if (!node.url) return;

            // Exclude top level folder name
            const folderName = node.parentId === "1" ? "" : folderNames.filter((name) => name).join("/");
            result.push({
                url: node.url,
                title: node.title || node.url,
                faviconUrl: faviconUrl(node.url),
                folderName,
            });
        });
    };
    getTitleAndUrl(bookmarkTreeNodes, []);
    return result;
};



document.addEventListener('DOMContentLoaded', async () => {
    const all_bookmark_tree = await chrome.bookmarks.getTree();
    const list = convertToSearchItemsFromBookmarks(all_bookmark_tree);
    container.innerHTML = setBookmarksTableHTML(list);

});





function setBookmarksTableHTML(bookmarks) {
    let insertHtml = '<input type="search" class="light-table-filter" data-table="order-table" placeholder="ブックマーク検索" /><table class="order-table"><thead>';
    insertHtml += '<tr><th>favicon</th><th>title</th><th>URL</th></tr></thead><tbody>';
    for (const bm of bookmarks) {
        insertHtml += `
        <tr>
            <td><img src="${bm.faviconUrl}"></td>
            <td><a href="${bm.url}">${bm.title}</a></td>
            <td>${bm.url}</td>
        </tr>`;
    }
    insertHtml += '</tbody></table>';
    return insertHtml;

}



// http://kachibito.net/snippets/light-javascript-table-filter
const LightTableFilter = (function (Arr) {
    let _input;
    function _onInputEvent(e) {
        _input = e.target;
        let tables = document.getElementsByClassName(_input.getAttribute('data-table'));
        Arr.forEach.call(tables, function (table) {
            Arr.forEach.call(table.tBodies, function (tbody) {
                Arr.forEach.call(tbody.rows, _filter);
            });
        });
    }
    function _filter(row) {
        let text = row.textContent.toLowerCase(), val = _input.value.toLowerCase();
        row.style.display = text.indexOf(val) === -1 ? 'none' : 'table-row';
    }
    return {
        init: function () {
            let inputs = document.getElementsByClassName('light-table-filter');
            Arr.forEach.call(inputs, function (input) {
                input.oninput = _onInputEvent;
            });
        }
    };
})(Array.prototype);


document.addEventListener('readystatechange', function () {
    if (document.readyState === 'complete') {
        LightTableFilter.init();
    }
});

