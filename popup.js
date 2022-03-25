'use strict';


const container = document.querySelector('#container');

function urlParse(urlstr) {
    const urlBase = new URL(urlstr);
    const origin = urlBase.origin;
    // todo: google 関係のfavicon 取得のため
    const [, x, y, ..._] = urlBase.pathname.split('/');
    const url = [origin, x, y].join('/');
    return url;
}
// const faviconUrl = (url) => `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`;
const faviconUrl = (url) => `https://www.google.com/s2/favicons?domain=${urlParse(url)}`;



// const convertToSearchItemsFromBookmarks = (bookmarkTreeNodes) => {
//     const result = [];
//     const getTitleAndUrl = (bookmarkTreeNodes, folderNames) => {
//         bookmarkTreeNodes.forEach((node) => {
//             if (node.type !== "bookmark" && node.children) {
//                 const _folderName = node.parentId === "0" ? "" : node.title;
//                 getTitleAndUrl(node.children, [...folderNames, _folderName]);
//                 return;
//             }

//             if (!node.url) return;

//             // Exclude top level folder name
//             const folderName = node.parentId === "1" ? "" : folderNames.filter((name) => name).join("/");
//             result.push({
//                 url: node.url,
//                 title: node.title || node.url,
//                 faviconUrl: faviconUrl(node.url),
//                 folderName,
//             });
//         });
//     };
//     getTitleAndUrl(bookmarkTreeNodes, []);
//     return result;
// };




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
        console.log(faviconUrl(node.url));
        return {
            favicon: faviconUrl(node.url),
            title: node.title || node.url,
            url: node.url
        };
    });
    return bookmarks;
}




document.addEventListener('DOMContentLoaded', async () => {
    const all_bookmark_tree = await chrome.bookmarks.getTree();
    console.log(all_bookmark_tree);
    // const list = convertToSearchItemsFromBookmarks(all_bookmark_tree);
    const list = getBookmarksList(all_bookmark_tree);
    container.innerHTML = setBookmarksTableHTML(list);
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
        let text = row.textContent.toLowerCase(), val = _input.value.toLowerCase();
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
