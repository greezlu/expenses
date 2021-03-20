class Expence {

  table = document.getElementById("expences");
  form = document.forms.control;

  clearLocalStorage () {
    localStorage.removeItem("expences");
    this.calculate();
  }

  setLocalStorage (currentExpences) {
    currentExpences = JSON.stringify(currentExpences);
    localStorage.setItem("expences", currentExpences);
  }

  getLocalStorage () {
    let currentExpences = localStorage.getItem("expences");
    currentExpences = JSON.parse(currentExpences);
    return currentExpences;
  }

  calculate () {

    clearTbody(this.table);
    rebuildTbody(this);

    function clearTbody (table) {

      let tBody = table.getElementsByTagName("tbody")[0];
      tBody?.remove();
      table.prepend(document.createElement("tbody"));

      let tFoot = table.getElementsByTagName("tfoot")[0];
      tFoot?.remove();
      table.append(document.createElement("tfoot"));

    }

    function rebuildTbody (self) {

      let currentExpences = self.getLocalStorage();
      let tBody = self.table.getElementsByTagName("tbody")[0];
      let tFoot = self.table.getElementsByTagName("tfoot")[0];
      let totalValue = 0;

      for (let date in currentExpences) {

        let trDate = createTrDate(date);
        tBody.append(trDate);

        let dayValue = 0;

        for (let item of currentExpences[date]) {
          dayValue += Number(item["item-value"]);
          let rItem = createTrItem(item["item-name"], item["item-value"]);
          tBody.append(rItem);
        }

        totalValue += dayValue;

        let trItemTotal = createTrItemTotal(dayValue);
        tBody.append(trItemTotal);

      }

      if (totalValue > 0) {
        let trTotal = createTrTotal(totalValue);
        tFoot.append(trTotal);
      }

      /* ------------------------------------- */

      function appendWithValue (target, elem, value) {
        if (value) elem.innerText = value;
        target.append(elem);
      }

      /* ------------------------------------- */

      function getCustomDate (str) {
        let date = new Date (Date.parse(str));
        let day = date.getDate()>9 ? date.getDate() : "0"+date.getDate();
        let month = date.getMonth()>10 ? date.getMonth()+1 : "0"+(date.getMonth()+1);
        let year = date.getFullYear();
        return day+"."+month+"."+year;
      }

      /* ------------------------------------- */

      function createTrDate (date) {
        let trDate = createElem("tr", "date-tr");
        let tdDate = createElem("td");
        tdDate.setAttribute("colspan", "2");
        appendWithValue( trDate, tdDate, getCustomDate(date) );
        return trDate;
      }

      /* ------------------------------------- */

      function createTrItem (name, value) {
        let trItem = createElem("tr", "item-tr");

        let tdItemName = createElem("td", "item-name");
        appendWithValue(trItem, tdItemName, name);

        let tdItemValue = createElem("td", "item-value");
        appendWithValue(trItem, tdItemValue, value);

        let tdItemDelete = createElem("td", "cancel");
        appendWithValue(trItem, tdItemDelete, "Delete");

        return trItem;
      }

      /* ------------------------------------- */

      function createTrItemTotal (totalItemValue) {
        let trItemTotal = createElem("tr", "item-total-tr");

        let tdTotalName = createElem("td");
        appendWithValue(trItemTotal, tdTotalName, "Total for day:");

        let tdTotalValue = createElem("td");
        appendWithValue(trItemTotal, tdTotalValue, totalItemValue);

        return trItemTotal;
      }

      /* ------------------------------------- */

      function createTrTotal (totalValue) {
        let trItemTotal = createElem("tr", "item-total-tr");

        let tdTotalName = createElem("td");
        appendWithValue(trItemTotal, tdTotalName, "Total:");

        let tdTotalValue = createElem("td");
        appendWithValue(trItemTotal, tdTotalValue, totalValue);

        return trItemTotal;
      }

      /* ------------------------------------- */

      function createElem (elem, className) {
        let currentElem = document.createElement(elem);
        if (className !== "" && className) currentElem.classList.add(className);
        return currentElem;
      }

      /* ------------------------------------- */

    }

  }

  constructor () {

    let self = this;

    this.form.addEventListener("submit", submitEvent);
    this.table.addEventListener("click", cancelEvent);
    document.addEventListener("DOMContentLoaded", this.calculate.bind(this));
    //Если не использовать bind, теряется this
    //Так как вызов идёт из-под document

    function submitEvent (event) {

      event.preventDefault();

      let currentExpences = self.getLocalStorage() ?? new Object();

      let date = getAndRemoveFromForm("date");
      let name = getAndRemoveFromForm("name");
      let value = getAndRemoveFromForm("value");

      if ( !Array.isArray(currentExpences[date]) ) {
        currentExpences[date] = new Array();
      }

      currentExpences[date].push({
        "item-name": name,
        "item-value": value,
      });

      self.setLocalStorage(currentExpences);

      self.calculate();

    }

    function getAndRemoveFromForm (elemName) {
      let currentElem = self.form.elements[elemName];
      let currentElemText;
      if (currentElem) {
        currentElemText = currentElem.value;
        currentElem.value = "";//TODO ?.
      }
      return currentElemText;
    }

    function cancelEvent (event) {
      if (!event.target.classList.contains("cancel")) {return}

      let currentItem = event.target.parentElement;
      let currentDate = event.target.parentElement.previousElementSibling;

      while (!currentDate.classList.contains("date-tr")) {
        currentDate = currentDate.previousElementSibling;
        if (!currentDate) break;
      }

      removeItemFromStorage(currentDate, currentItem);

      currentItem.remove();
      self.calculate();

      function removeItemFromStorage (date, item) {

        let currentDate = getParsedDate(date.innerText);
        let currentItemName = item.getElementsByClassName("item-name")[0].innerText;
        let currentItemValue = item.getElementsByClassName("item-value")[0].innerText;

        let currentExpences = self.getLocalStorage();
        let currentExpeceItem = currentExpences[currentDate];

        let i = currentExpeceItem?.findIndex(item=>{
          if (item["item-name"] === currentItemName &&
              item["item-value"] === currentItemValue) { return true }
        });

        if (isFinite(i)) currentExpeceItem.splice(i, 1);
        if (!currentExpeceItem.length) delete currentExpences[currentDate];

        self.setLocalStorage(currentExpences);

        function getParsedDate (str) {
          let date = str.split(".");
          date.reverse();
          return date = date.join("-");
        }

      }

    }

  }

}

let expenceTable = new Expence();
console.log(expenceTable);
console.log("To view local storage:\nexpenceTable.getLocalStorage()");
console.log("To clear local storage:\nexpenceTable.clearLocalStorage()");