'use strict';

let bookmark_list = new Array();

// document.addEventListener('DOMContentLoaded', dumpBookmarks);

function dumpBookmarks(query) {
    const bookmarkTreeNodes = chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
        dumpTreeNodes(bookmarkTreeNodes, query);
    });
    console.log(bookmark_list);
    console.log(bookmark_list.length);
}

function dumpTreeNodes(bookmarkNodes, query) {
    for (let i = 0; i < bookmarkNodes.length; i++) {
        dumpNode(bookmarkNodes[i], query);
    }
}

function dumpNode(bookmarkNode, query) {
    console.log(bookmarkNode)
    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
        dumpTreeNodes(bookmarkNode.children, query);
    } else {
        bookmark_list.push(bookmarkNode.title);
    }
}




function makeIndent(indentLength) {
    return '.'.repeat(indentLength);
}

function logItems(bookmarkItem, indent) {
    if (bookmarkItem.url) {
        console.log(makeIndent(indent) + bookmarkItem.url);
    } else {
        console.log(makeIndent(indent) + 'Folder');
        indent++;
    }
    if (bookmarkItem.children) {
        for (child of bookmarkItem.children) {
            logItems(child, indent);
        }
    }
    indent--;
}

function logTree(bookmarkItems) {
    logItems(bookmarkItems[0], 0);
}

function handleClick() {
    chrome.bookmarks.getTree(logTree);
}

// chrome.browserAction.onClicked.addListener(handleClick);
document.addEventListener('DOMContentLoaded', handleClick);