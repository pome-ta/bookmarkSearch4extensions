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
    // todo: 登録日ソート
    rawbookmarks.sort((x, y) => (x.dateAdded > y.dateAdded) ? -1 : 1);
    const bookmarks = rawbookmarks.map(node => {
        return {
            favicon: faviconUrl(node.url),
            title: node.title || node.url,
            url: node.url
        };
    });
    return bookmarks;
}





function setBookmarksTableHTML(bookmarks) {
    let insertHtml = '';
    const inputSearch = '<input type="search" class="light-table-filter" data-table="order-table" placeholder="ブックマーク検索"  autofocus /><table class="order-table">';
    const tableHead = '<table class="order-table"><tbody>';
    insertHtml += inputSearch + tableHead;
    for (const bm of bookmarks) {
        insertHtml += `
        <tr>
        <th class="tdImg"><img src="${bm.favicon}" loading="lazy"></th>
        <td>
            <a href="${bm.url}">
                <div>
                    <p class="rows title">${bm.title}</p>
                    <p class="rows url">${bm.url}</p>
                </div>
            </a>
        </td>
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
            document.querySelector('.light-table-filter').oninput = _onInputEvent;
        }
    };
})(new Array());


async function setupBookmarkListConvTabelElement() {
    const all_bookmark_tree = await chrome.bookmarks.getTree();
    const bookmarkList = getBookmarksList(all_bookmark_tree);
    container.innerHTML = setBookmarksTableHTML(bookmarkList);
}

let outViewWidth, inViewWidth, tdWidth;
const container = document.querySelector('#container');


const setupPopupSize = () => {
    outViewWidth = window.innerWidth;
    inViewWidth = window.visualViewport.width;
    document.documentElement.style.setProperty('--outViewWidth', `${outViewWidth}px`);
    document.documentElement.style.setProperty('--inViewWidth', `${inViewWidth}px`)
}


document.addEventListener('DOMContentLoaded', setupBookmarkListConvTabelElement);

document.addEventListener('readystatechange', () => (document.readyState === 'complete') ? LightTableFilter.init() : null);
window.addEventListener('resize', setupPopupSize);