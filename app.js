/*
General:
- code in modules

Modules:
- UI view module
- Data model module
- Controller module
*/

/** Budget data model */
var budgetModel = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome > 0){
        this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    /** the data structure object */
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    /** Calculate total income and total expenses */
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    return {
        /** Add an item to data structure */
        addItem: function(type, descr, val){
            var newItem, ID;
            // create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item bases on "inc or "exp" type
            if(type === "exp"){
                newItem = new Expense(ID, descr, val);
            } else if (type === "inc"){
                newItem = new Income(ID, descr, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },
        /** Delete an item from data structure */
        deleteItem: function(type, id){
            var ids, index;
            // loop over all items
            // map returns a new array
            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            // returns index of the searched id
            index = ids.indexOf(id);

            if(index !== -1){
                // removes 1 element at index
                data.allItems[type].splice(index, 1);
            }

        },
        /** Test function to display data */
        testing: function(){
            console.log(data);
        },
        /** Calculate the total budget */
        calculateBudget: function(){
            // calculate sum of all incomes (total income)
            calculateTotal("inc");

            // calculate sum of all expenses (total expenses)
            calculateTotal("exp");

            // subtract expenses from income (budget)
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        /** Calculate all item percentages */
        calculateAllPercentages: function(){
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            });

        },
        /** Getter for item percentages */
        getAllPercentages: function(){
            var allPercentages = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });
            return allPercentages;
        },
        /** Getter for budget data object */
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        }
    };

})();

/** UI view controller */
var UIView = (function(){
    // private variable for UI names
    var DOMStrings = {
      inputType: ".add__type",
      inputDescription: ".add__description",
      inputValue: ".add__value",
      inputBtn: ".add__btn",
      incomeContainer: ".income__list",
      expensesContainer: ".expenses__list",
      budgetLabel: ".budget__value",
      incomeLabel: ".budget__income--value",
      expenseslabel: ".budget__expenses--value",
      percentageLabel: ".budget__expenses--percentage",
      container: ".container",
      itemPercentage: ".item__percentage",
      dateLabel: ".budget__title--month",
      redFocus: "red-focus",
      red: "red"
    };
    /** Number formatting with +/- and "," seperators */
    var formatNumber = function(number, type){
        var num, numSplit, int, dec;
        num = Math.abs(number);
        // add two decimals
        num = num.toFixed(2);
        numSplit = num.split(".");
        int = numSplit[0];
        if(int.length > 6){
            int =
              int.substr(0, int.length - 6) +
              "," +
              int.substr(int.length - 6, 3) +
              //int.substr(int.length - 6, int.length - 3) +
              "," +
              int.substr(int.length - 3, 3);
        } else if(int.length > 3){

            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];
        return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
    };

    /** Custom forEach method to loop over nodeList */
    var nodeListForEach = function(list, callback) {
      for (var i = 0; i < list.length; i++) {
        callback(list[i], i);
      }
    };

    // function to use in the other controller (appController)
    return {
        /** Read input fields in UI */
        getInput: function(){
            return {
                type: document.querySelector(DOMStrings.inputType).value, // will be eiterh "inc" or "exp"
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        /** Getter for DOM strings object with class names */
        getDOMStrings: function(){
            return DOMStrings;
        },
        /** Add an income or expense item to UI */
        addListItem: function(obj, type){
            var html, newHTML, element;
            // create html with placeholder text
            if(type === "inc"){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"> <i class="ion-ios-close-outline"> </i> </button> </div> </div> </div>';

            } else if (type === "exp"){
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"> <i class="ion-ios-close-outline"> </i> </button> </div> </div> </div>';
            }
            // replace the placeholder text with actual data
            newHTML = html.replace("%id%", obj.id);
            newHTML = newHTML.replace("%description%", obj.description);
            newHTML = newHTML.replace("%value%", formatNumber(obj.value, type));

            // insert HTML into the DOM as a last child of the class
            document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);

        },
        /** Delete an item from income or expense list in UI */
        deleteListItem: function(selectorID){
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },
        /** Clear input fields after input and focus again on first field */
        clearFields: function(){
            var fieldsList, fieldsArr;

            fieldsList = document.querySelectorAll(DOMStrings.inputDescription + ", " + DOMStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fieldsList);

            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            // reset focus to first field
            fieldsArr[0].focus();
        },
        /** Display available budget in UI */
        displayBudget: function(obj){
            var type;
            obj.budget >= 0 ? type = "inc" : type = "exp";

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber( obj.budget, type);

            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber( obj.totalInc, "inc");

            document.querySelector(DOMStrings.expenseslabel).textContent = formatNumber( obj.totalExp, "exp");

            if (obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent =
              obj.percentage + " %";

            } else{
                document.querySelector(DOMStrings.percentageLabel).textContent = "---";

            }
        },
        /** Display expense percentage in UI */
        displayPercentages: function(percentages){
            var fields;
            fields = document.querySelectorAll(DOMStrings.itemPercentage);

            nodeListForEach(fields, function(current, index){
                if ( percentages[index] > 0){
                    current.textContent = percentages[index] + " %";
                } else {
                    current.textContent = "---";
                }
            });

        },
        /** Display the current date in the UI */
        displayDate: function(){
            var now, year, month;
            now = new Date();
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + " " + year;

        },
        /** Style manipulation when income or expense */
        changedType: function(){
            var fields;
            fields = document.querySelectorAll(
                DOMStrings.inputType + "," +
                DOMStrings.inputDescription + "," +
                DOMStrings.inputValue);

            nodeListForEach(fields, function(current){
                current.classList.toggle(DOMStrings.redFocus);
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle(DOMStrings.red);
        },
        /** Reset type to income in UI */
        resetType: function(){
            var select, option;
            select = document.querySelector(DOMStrings.inputType);
            for(var i = 0; i < select.options.length; i++){
                option = select.options[i];
                if (option.value === "inc"){
                    option.selected = true;
                    return;
                }
            }
        }
    };

})();

/** Global app controller */
var appController = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function (){
        var DOMStrings = UICtrl.getDOMStrings();

        document
              .querySelector(DOMStrings.inputBtn)
              .addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function(event) {
              // old browser use .which
              if (
                event.key === "Enter" ||
                event.keyCode === 13 ||
                event.which === 13
              ) {
                ctrlAddItem();
              }
        });
        document.querySelector(DOMStrings.container).addEventListener("click", ctrlDeleteItem);

        document.querySelector(DOMStrings.inputType).addEventListener("change", UICtrl.changedType);

    };

    var ctrlAddItem = function(){

        var input, newItem;
        // get input data
        input = UICtrl.getInput();

        // check of description and value is filled and not zero
        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
            // add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // add the new item to UI
            UICtrl.addListItem(newItem, input.type);

            // clear the fields
            UICtrl.clearFields();

            // calculate and update budget
            updateBudget();

            // calculate and update percentages
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;

        // navige to a higher element container in the HTML
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            // example: inc-1
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            // delete item from UI
            UICtrl.deleteListItem(itemID);

            // update and show budget
            updateBudget();

            // calculate and update percentages
            updatePercentages();

        }
    };

    var updateBudget = function() {
        // calculate the budget
        budgetCtrl.calculateBudget();

        // return the budget
        var budget = budgetCtrl.getBudget();

        // display the new budget in the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){
        // calculate the percentages
        budgetCtrl.calculateAllPercentages();

        // read percentages from budget controller
        var percentages = budgetCtrl.getAllPercentages();

        // update the user interface with new percentages
        UICtrl.displayPercentages(percentages);

    };

    return {
        /** Initialize the program */
        init: function(){
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            UICtrl.resetType();
            setupEventListeners();
        }
    }

})(budgetModel, UIView);

appController.init();

