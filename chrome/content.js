const main = (function () {
  "use strict";

  const displayTdClassName = "display-td";
  const fakeClassName = "fake-class";
  const highlightedClassName = "highlighted";

  const diff = (diffType, table, checkedIndicies) => {
    const trs = table.querySelectorAll("tr");
    Array.from(trs).forEach((tr, index) => {
      const tds = tr.querySelectorAll("td");
      const selectedTds = Array.from(tds).filter((td, index) => {
        return checkedIndicies.includes(index);
      });
      const left = selectedTds[0].innerText;
      const right = selectedTds[1].innerText;

      const newTd = createElement("td");
      // Insert newTd between selected TDs
      selectedTds[0].parentNode.insertBefore(newTd, selectedTds[1]);
      newTd.classList.add(displayTdClassName);
      newTd.classList.add("diff-results");
      const display = newTd;
      const fragment = document.createDocumentFragment();

      // https://github.com/kpdecker/jsdiff/blob/master/examples/web_example.html
      const diff =
        diffType === "chars" ? Diff.diffChars(left, right) :
          diffType === "words" ? Diff.diffWords(left, right) :
            diffType === "lines" ? Diff.diffLines(left, right) :
              diffType === "sentences" ? Diff.diffSentences(left, right)
                : Diff.diffWords(left, right);
      const allAdded = diff.every((part) => part.added);
      const allRemoved = diff.every((part) => part.removed);
      const allSame = !diff.length || diff.every((part) => !part.added && !part.removed);
      const mixed = !allAdded && !allRemoved && !allSame;

      console.log({
        left,
        right,
        diff,
        allAdded,
        allRemoved,
        allSame,
        mixed,
      });

      if (allAdded) {
        display.classList.add("all-added");
      } else if (allRemoved) {
        display.classList.add("all-removed");
      } else if (allSame) {
        display.classList.add("all-same");
      } else {
        display.classList.add("mixed");
      }

      diff.forEach(function (part) {
        const span = createElement("span");
        span.classList.add(part.added ? "added" : part.removed ? "removed" : "same");
        span.appendChild(document.createTextNode(part.value));
        fragment.appendChild(span);
      });

      display.appendChild(fragment);
    });
  }

  const highlightTable = (diffType, table) => {
    const thead = table.querySelector("thead") || table.querySelector("tbody") || table;
    const tr = thead ? thead?.querySelector("tr") : undefined;
    if (!tr) {
      console.log("no tr", table);
    };
    table.classList.add(highlightedClassName);
    let ths = tr?.querySelectorAll("th");
    if (!ths || ths.length === 0) {
      ths = tr.querySelectorAll("td");
    }


    const checkboxes = [];
    const findCheckedIndicies = () => {
      return checkboxes.map((checkbox, index) => {
        if (checkbox.checked) {
          return index;
        }
      }).filter(Boolean);
    };
    const diffButton = createElement("button");
    const renderDiffButton = () => {
      const checkedIndicies = findCheckedIndicies();
      const numChecked = checkedIndicies.length;
      if (numChecked == 2) {
        diffButton.disabled = false;
      } else {
        diffButton.disabled = true;
      }
    };

    const renderCheckboxes = () => {
      const checkedIndicies = findCheckedIndicies();
      const numChecked = checkedIndicies.length;
      if (numChecked == 2) {
        // Disable all non-checked checkboxes.
        checkboxes.forEach((checkbox, index) => {
          if (!checkedIndicies.includes(index)) {
            checkbox.disabled = true;
          }
        });
      } else {
        // Enable all checkboxes.
        checkboxes.forEach((checkbox) => {
          checkbox.disabled = false;
        });
      }
    };


    ths.forEach((th) => {
      const checkbox = createElement("input");
      checkbox.type = "checkbox";
      // th.appendChild(checkbox);
      th.insertBefore(checkbox, th.firstChild || th.querySelector("td"));
      checkboxes.push(checkbox);
      // When checked or unchecked, toggle a border around the column.
      checkbox.addEventListener("change", (e) => {
        const index = Array.from(th.parentNode.children).indexOf(th);
        const tds = table.querySelectorAll("td");
        tds.forEach((td, i) => {
          if (i % ths.length === index) {
            td.classList.toggle("selected");
          }
        });
        renderDiffButton();
        renderCheckboxes();
      });
    });

    diffButton.innerText = "Diff";
    diffButton.addEventListener("click", (e) => {
      e.preventDefault();
      const checkedIndicies = findCheckedIndicies();
      diff(diffType, table, checkedIndicies);
    });
    table.parentNode.insertBefore(diffButton, table);

    renderDiffButton();
    renderCheckboxes();
  }

  const createElement = (tag) => {
    const el = document.createElement(tag);
    el.classList.add(fakeClassName);
    return el;
  }

  const highlightTables = (diffType) => {
    // Find all tables, add a border around them, add checkboxes to each column and a diff button.
    const tables = document.querySelectorAll("table");
    console.log("have tables", tables.length);
    tables.forEach((table) => {
      console.log("table", table);
      try {
        highlightTable(diffType, table);
      } catch (e) {
        console.error("error", table, e);
      }
    });
  }

  const removeDiffResults = () => {
    const displayTds = document.querySelectorAll(`.${displayTdClassName}`);
    displayTds.forEach((td) => {
      td.remove();
    });
  }

  const clearDiffResults = () => {
    removeDiffResults();
  }

  const removeHighlighting = () => {
    const fakeEls = document.querySelectorAll(`.${fakeClassName}`);
    fakeEls.forEach((el) => {
      el.remove();
    });
    const highlightedTables = document.querySelectorAll(`.${highlightedClassName}`);
    highlightedTables.forEach((table) => {
      table.classList.remove(highlightedClassName);
    });
  }

  const reset = () => {
    removeDiffResults();
    removeHighlighting();
  };

  const main = () => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      note("content handler", "message", message, "sender", sender);

      let { action, data } = message;
      data = data || {};

      if (action === "highlightTables") {
        const { diffType } = data;
        console.log("have diffType", diffType);
        reset();
        highlightTables(diffType);
        return;
      }

      if (action === "clearDiffResults") {
        clearDiffResults();
        return;
      }

      if (action === "reset") {
        reset();
        return;
      }

      note("unhandled content handler", "message", message, "sender", sender);
    });
  }

  return main;
})();

main();