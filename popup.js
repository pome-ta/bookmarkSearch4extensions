'use strict';

// --- favicon util
function urlParse(urlstr) {
  const urlBase = new URL(urlstr);
  const origin = urlBase.origin;
  const [, x, y, ..._] = urlBase.pathname.split('/'); // todo: Google 関係のfavicon 取得のため、詳細情報を切り捨て
  return [origin, x, y].join('/');
}
const faviconUrl = (url) =>
  `https://www.google.com/s2/favicons?domain=${urlParse(url)}`;

// --- Chrome Extensions func
function getBookmarksList(bookmarkTreeNodes) {
  const rawbookmarks = new Array();
  const setBookmarkNodes = (treeNodes) => {
    treeNodes.forEach((nodes) => {
      nodes.children
        ? setBookmarkNodes(nodes.children)
        : rawbookmarks.push(nodes);
    });
  };
  setBookmarkNodes(bookmarkTreeNodes);
  rawbookmarks.sort((x, y) => (x.dateAdded > y.dateAdded ? -1 : 1)); // todo: 登録日ソート
  const bookmarks = rawbookmarks.map((node) => {
    return {
      favicon: faviconUrl(node.url),
      title: node.title || node.url,
      url: node.url,
    };
  });
  return bookmarks;
}

// --- search func
// http://kachibito.net/snippets/light-javascript-table-filter
const LightTableFilter = ((array) => {
  let _input;
  function _onInputEvent(e) {
    _input = e.target;
    let tables = document.getElementsByClassName(
      _input.getAttribute('data-table')
    );
    array.forEach.call(tables, (table) => {
      array.forEach.call(table.tBodies, (tbody) => {
        array.forEach.call(tbody.rows, _filter);
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
    },
  };
})(new Array());

// --- DOM
function setBookmarksTableHTML(bookmarks) {
  let insertHtml = '';
  const inputSearch =
    '<input type="search" class="light-table-filter" data-table="order-table" placeholder="🤓 ブックマーク検索"  autofocus />';
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

const container = document.querySelector('#container');
async function setupBookmarkListConvTabelElement() {
  const allBookmarkTree = await chrome.bookmarks.getTree();
  const bookmarkList = getBookmarksList(allBookmarkTree);
  container.innerHTML = setBookmarksTableHTML(bookmarkList);
}

// --- event
document.addEventListener(
  'DOMContentLoaded',
  setupBookmarkListConvTabelElement
);
document.addEventListener('readystatechange', () =>
  document.readyState === 'complete' ? LightTableFilter.init() : null
);
