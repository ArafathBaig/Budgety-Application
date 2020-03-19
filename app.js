var budgetController = (function(){
    
    //Creating a constructor for adding income Items
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    
    //Creating a constructor for adding expense items
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        
        if(totalIncome > 0){
            this.percentage = Math.round((this.value/totalIncome)*100);
        }else{
            this.percentage = -1;
        }
        
        
    }
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    
    //calculate budget
    var calculateTotal = function(type){
        var sum = 0;
        
        data.allItems[type].forEach(function(current){
            sum += current.value;
        });
        data.totals[type] = sum;
    }
    
    //Object to store all the data of expense, income items as well as the total
    var data = {
        
        allItems : {
            exp : [],
            inc : []
        },
        totals : {
            exp : 0, 
            inc : 0
        },
        budget : 0,
        percentage : -1
    };
    
    
    return {
        addNewItem : function(type, des, val) {
            var newItem, ID;
            
            
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
        },
        
        calculateBudget : function(type){
            
            //calculate the sum of income and expense
            calculateTotal('inc');
            calculateTotal('exp');
            
            //Calculate the total budget
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate the percentage
            if(data.totals.inc > 0)
            data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
        },
        
        getBudget : function(){
            return{
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            }
        },
        
        deleteItems: function(type, id){
            var ids, index;
            
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
        
        calculatePercentage : function(){
            
            
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        
        
        getPercentages : function(){
            
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            
        return allPerc;
        },
        
        testing : function(){
            console.log(data);
        }
    }
    
})();


//Computing all the UI related data, such as button, texts etc and getting the input
var UIController = (function(){
    
    //Stores all the classes for easy changes and updates when needed
    var DOM = {
        inputType : '.add__type',
        inputDescription: '.add__description',
        inputValue : '.add__value',
        inputButton : '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercentageLabel : '.item__percentage',
        dateMonth : '.budget__title--month'
    };
    
    
    var formatNumber = function(num,type){
            var int, dec, numSplit, sign;
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            dec = numSplit[1];
        
            if(int.length > 3){
                
                int = int.substr(0,int.length-3)+','+int.substr(int.length-3,int.length);
                
            }
            
            type === 'exp' ? sign = '-' : sign = '+';
            
            return sign + ' '+ int + '.'+ dec;
            
        };
    
     
            var nodeList = function(field, callback){
                
                for(var i = 0; i < field.length ;i++){
                    callback(field[i],i);
                }
            };
    
    
    //returns the input and DOMstring
    return {
        
        getInput : function(){
            return {
                type : document.querySelector(DOM.inputType).value,
                description : document.querySelector(DOM.inputDescription).value,
                value: parseFloat(document.querySelector(DOM.inputValue).value)
            };
        },
        
        printItems: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            
            if (type === 'inc') {
                element = DOM.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%descriptio%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOM.expenseContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%descriptio%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%descriptio%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        clearFields:function(){
            
            var fields, arrayFields;
            
            fields = document.querySelectorAll(DOM.inputDescription +', '+DOM.inputValue);
            
            arrayFields = Array.prototype.slice.call(fields);
            
            arrayFields.forEach(function(current, index, array){
                current.value = "";
            });
            
//            arrayFields[0] = "";
//            arrayFields[1] = "";
            
            arrayFields[0].focus();
        },
        
        displayValues : function(obj){
        
            var type = obj.budget > 0 ? '+' : '-';
            
        document.querySelector(DOM.budgetLabel).textContent = formatNumber(obj.budget,type);
        document.querySelector(DOM.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
        document.querySelector(DOM.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOM.percentageLabel).textContent = obj.percentage+"%";
            }else{
                document.querySelector(DOM.percentageLabel).textContent = "---";
            }
        
        },
        
        deleteItemsInUI: function(selectorID){
          
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        displayPercentagesList : function(percentages){
            
          var fields = document.querySelectorAll(DOM.expensePercentageLabel);
           
            
            nodeList(fields, function(current, index){
                
                if(percentages[index]> 0){
                    current.textContent = percentages[index]+'%';
                }else{
                    current.textContent = '---';
                }
            });
            
        },
        
        
        displayMonth : function(){
            
            var now = new Date();
            var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            var year = now.getFullYear();
            var month = now.getMonth();
            document.querySelector(DOM.dateMonth).textContent = months[month-1]+' '+year;
        },
        
        changeFocus : function(){
            
            var fields = document.querySelectorAll(DOM.inputType+ ','+DOM.inputDescription+','+DOM.inputValue);
            nodeList(fields,function(cur){
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOM.inputButton).classList.toggle('red');
        },
        
        
        getDOMString : function(){
            return DOM;
        }
    };
    
})();

var controller = (function(budgetCon , UICon){
    
    //Adding element by clicking enter or tick button
    var setUpEventListener = function(){
        
    var DOM = UICon.getDOMString();      
        
    document.querySelector(DOM.inputButton).addEventListener('click',controlAddItem);
    document.addEventListener('keypress',function(event){
        
        if(event.keyCode === 13 || event.which === 13){
            controlAddItem();
        }
    });
        
        document.querySelector(DOM.container).addEventListener('click',controlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',UICon.changeFocus);
    }
    
    var calculatePercentages = function(){
        
        //calculate percentages
        budgetCon.calculatePercentage();
        
        //Read percentage from user
        var allPercentage = budgetCon.getPercentages();
        
        //print the result on to the UI
        UICon.displayPercentagesList(allPercentage);
    }
    
    var updateBudget = function(){
        
        //Calculate budget
        budgetCon.calculateBudget();
        
        //get the budget and percentage from budgetController
        var budgetResult = budgetCon.getBudget();
        
        //Print the result on to the webpage
        UICon.displayValues(budgetResult);
    }
    
    //Deleting an Item
    var controlDeleteItem = function(event){
        var itemID,splitId,type,id;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            
            splitId = itemID.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]) ;
            
            //delete the item from the datastructure
            budgetCon.deleteItems(type,id);
            
            
            //delete the item from the UI
            UICon.deleteItemsInUI(itemID);
            
            
            //Update the weights
            updateBudget();
            
            //calculate percentages
            calculatePercentages();
            
        }
    
    }

    
    //Adding the item
    var controlAddItem = function(){
        
        //1. Getting the input from the UI Controller
        var input = UICon.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            
        //2. Add item to the budget controller
        var item = budgetCon.addNewItem(input.type, input.description, input.value);
        
        //3. print item to the listview
        UICon.printItems(item, input.type);
        
        //4. For clearing the fields after the entering
        UICon.clearFields();
            
        updateBudget();
            
        //calculate percentages
        calculatePercentages();
        }
        
    }
    
    return{
        initializationFunction : function(){
            console.log("Application has started");
            UICon.displayMonth();
            UICon.displayValues({budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : 0});
            setUpEventListener();
    }
};
    
})(budgetController,UIController);

controller.initializationFunction();