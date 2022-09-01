'use strict';

// --- favicon util
const faviconUrl = (url) =>
  `https://www.google.com/s2/favicons?domain=${urlParse(url)}`;

function urlParse(urlstr) {
  const urlBase = new URL(urlstr);
  const origin = urlBase.origin;
  const [, x, y, ..._] = urlBase.pathname.split('/'); // todo: Google 関係のfavicon 取得のため、詳細情報を切り捨て
  return [origin, x, y].join('/');
}

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
  // todo: 登録日ソート
  rawbookmarks.sort((x, y) => (x.dateAdded > y.dateAdded ? -1 : 1));

  const bookmarks = rawbookmarks.map((node) => ({
    favicon: faviconUrl(node.url),
    title: node.title || node.url,
    url: node.url,
  }));
  return bookmarks;
}

function inputTrigger(event) {
  const target = event.target;
  const searchStr = target.value.toLowerCase();
  const searchFilter = (row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = ~text.indexOf(searchStr) ? 'table-row' : 'none';
  };
  const tables = document.getElementsByClassName(
    target.getAttribute('data-table')
  );
  Array.prototype.forEach.call(tables, (table) => {
    Array.prototype.forEach.call(table.tBodies, (tbody) => {
      Array.prototype.forEach.call(tbody.rows, searchFilter);
    });
  });
}

// --- DOM
function createInputSearch() {
  const element = document.createElement('input');
  element.type = 'search';
  element.id = 'light-table-filter';
  element.setAttribute('data-table', 'order-table');
  element.placeholder =
    '🤓 ブックマークを検索      起動：[⌘]+[^]+[Space]    選択[Tab](+[Shift])';
  element.autofocus = true;
  return element;
}

// xxx: 汚いすぎるから書き換える
function setBookmarksTableHTML(bookmarks) {
  let insertHtml = '';
  const tableHead = '<table class="order-table"><tbody>';
  insertHtml += tableHead;
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

async function setupBookmarkListConvTabelElement() {
  const all_bookmark_tree = await chrome.bookmarks.getTree();
  const bookmarkList = getBookmarksList(all_bookmark_tree);
  container.innerHTML = setBookmarksTableHTML(bookmarkList);
  container.insertAdjacentElement('afterbegin', searchBox);
}

/* main */
setupBookmarkListConvTabelElement();
const container = document.querySelector('#container');
const searchBox = createInputSearch();
searchBox.addEventListener('input', inputTrigger);
