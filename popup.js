'use strict';


function urlParse(urlstr) {
    const urlBase = new URL(urlstr);
    const origin = urlBase.origin;
    // todo: google 関係のfavicon 取得のため
    const [, x, y, ..._] = urlBase.pathname.split('/');
    const url = [origin, x, y].join('/');
    return url;
}
const faviconUrl = (url) => `https://www.google.com/s2/favicons?domain=${urlParse(url)}`;




function getBookmarksList(bookmarkTreeNodes) {
    const rawbookmarks = new Array();
    const setBookmarkNodes = (treeNodes => {
        treeNodes.forEach(nodes => {
            (nodes.children) ? setBookmarkNodes(nodes.children) : rawbookmarks.push(nodes);
        });
    });

    setBookmarkNodes(bookmarkTreeNodes);
    rawbookmarks.sort((x, y) => (x.dateAdded > y.dateAdded) ? -1 : 1);

    const bookmarks = rawbookmarks.map(node => {
        // console.log(faviconUrl(node.url));
        return {
            favicon: faviconUrl(node.url),
            title: node.title || node.url,
            url: node.url
        };
    });
    return bookmarks;
}

// document.addEventListener('DOMContentLoaded')

document.addEventListener('DOMContentLoaded', async () => {
    const all_bookmark_tree = await chrome.bookmarks.getTree();
    // console.log(all_bookmark_tree);
    // const list = convertToSearchItemsFromBookmarks(all_bookmark_tree);
    const bookmarksList = getBookmarksList(all_bookmark_tree);

    const container = createElementAddClass('div', 'container');
    container.innerHTML = setBookmarksTableHTML(bookmarksList);
    document.body.appendChild(container);
    console.log('size');
    console.log('screen.width', screen.width);
    console.log('window.innerWidth', window.innerWidth);
    console.log('visualViewport.width', visualViewport.width);
    console.log('document.documentElement.clientWidth', document.documentElement.clientWidth);
    console.log('document.body.clientWidth', document.body.clientWidth);

});






function setBookmarksTableHTML(bookmarks) {
    // let insertHtml = '<input type="search" class="light-table-filter" data-table="order-table" placeholder="ブックマーク検索" /><table class="order-table"><thead>';
    let insertHtml = '<input type="search" class="light-table-filter" data-table="order-table" placeholder="ブックマーク検索"  autofocus /><table class="order-table">';
    // insertHtml += '<tr><th>favicon</th><th>title</th><th>URL</th></tr></thead><tbody>';
    insertHtml += '<tbody>';
    for (const bm of bookmarks) {
        insertHtml += `
        <tr>
            <td><img src="${bm.favicon}"></td>
            <td><div><a href="${bm.url}">${bm.title}</a>${bm.url}</div></td>
        </tr>`;
    }
    insertHtml += '</tbody></table>';
    return insertHtml;

}


function createElementAddClass(tag, ...names) {
    const element_obj = document.createElement(tag);
    for (const name of names) {
        element_obj.classList.add(name);
    }
    return element_obj;
}




// http://kachibito.net/snippets/light-javascript-table-filter
const LightTableFilter = (Arr => {
    let _input;
    function _onInputEvent(e) {
        _input = e.target;
        let tables = document.getElementsByClassName(_input.getAttribute('data-table'));
        Arr.forEach.call(tables, table => {
            Arr.forEach.call(table.tBodies, tbody => {
                Arr.forEach.call(tbody.rows, _filter);
            });
        });
    }
    function _filter(row) {
        let text = row.textContent.toLowerCase();
        let val = _input.value.toLowerCase();
        row.style.display = text.indexOf(val) === -1 ? 'none' : 'table-row';
    }
    return {
        init: function () {
            let inputs = document.getElementsByClassName('light-table-filter');
            Arr.forEach.call(inputs, input => {
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
