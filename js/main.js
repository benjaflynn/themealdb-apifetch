// object constructor for meal orders
function Order(name, orderID, status) { 
    this.name = name;
    this.orderID = orderID;
    this.status = status; 
}

// empty array to store orders
let orderList = []; 

// initial order ID number
let mealIDnumber = 0;

// variety of possible responses if submitted ingredient is null
let orderRequests = ["Please pick an ingredient.", "I'm sorry, I didn't hear you. Could you repeat that?", "Have you thought of an ingredient you would like yet?", "May I take your order please?", "What may I order for you today?"];

//gets user input, turns it into searchable string, then outputs a random meal and calls displayOrder() and generateOrder() to generate output for user, or catches errors and informs user
const submitIngredient = () => {
    let inputIngredient = document.getElementById("main-ingredient").value;

    //catches null input error and prompts user for input again; ends the function before the API is called
    if (inputIngredient === "") {
        let randomiseQuestion = Math.floor(Math.random() * orderRequests.length);
        document.getElementById("init-question").innerHTML = orderRequests[randomiseQuestion];
        return;
    }

    let searchableIngredient = inputIngredient.toLowerCase().replace(" ", "_");
    
    let searchURL = "https://www.themealdb.com/api/json/v1/1/filter.php?i=" + searchableIngredient;

    fetch(searchURL)
    .then((response) => response.json())
    .then((result) => {
        let mealOptions = result;

        let mealAmount = mealOptions.meals.length;

        let chefChoice = mealOptions.meals[Math.floor(Math.random() * mealAmount)];

        displayOrder(chefChoice);

        generateOrder(chefChoice);
    })

    .catch((error) => {
        console.log(`The following error has occurred: \n${error}`);
        document.getElementById("order-impossible").style.display = "block";
        document.getElementById("order-here").style.display = "none";
        document.getElementById("impossible-ingredient").innerHTML = inputIngredient;
    })

}

//prevents submit button from reloading the page and aborting submitIngredient() before it can fetch the API
document.getElementById("input-order-form").addEventListener("click", function(event) {
    event.preventDefault();
})

//displays the randomly generated meal in its own container and removes the ingredient input text field
const displayOrder = (chefChoice) => {
    document.getElementById("order-here").style.display = "none";
    document.getElementById("order-impossible").style.display = "none";
    document.getElementById("order-information").style.display = "block";
    document.getElementById("navigation-left").style.borderBottomColor = "transparent";
    document.getElementById("title").innerHTML = chefChoice.strMeal;
    document.getElementById("mealIMG").src = chefChoice.strMealThumb;
    document.getElementById("mealIMG").style.height = "100px";
}

//generates order ID number by incrementing mealIDnumber; then generates new order object, pushes it to the array, and stores it in sessionstorage
const generateOrder = (chefChoice) => {
    let orderIDnumber = mealIDnumber + 1;
    console.log(`The orderIDnumber is ${orderIDnumber} and its type is ${typeof orderIDnumber}`);
    
    let newMeal = new Order(chefChoice.strMeal, orderIDnumber, "incomplete");
    
    orderList.push(newMeal);
    
    let orderListString = JSON.stringify(orderList);

    sessionStorage.setItem("lastOrderNumber", JSON.stringify(orderIDnumber));
    
    sessionStorage.setItem("prevOrders", orderListString);

    return mealIDnumber = orderIDnumber;
}

/**
 * clicking the left navigation tab returns user to order form, empties the text input, removes all other main elements from view, 
 * and adds a visual indicator as to which navigation tab is active
*/
document.getElementById("navigation-left").addEventListener("click", function() {
    document.getElementById("order-here").style.display = "block";
    document.getElementById("main-ingredient").value = "";
    document.getElementById("order-information").style.display = "none";
    document.getElementById("order-impossible").style.display = "none";
    document.getElementById("check-orders").style.display = "none";
    document.getElementById("navigation-left").style.borderBottom = "2px solid seagreen";
    document.getElementById("navigation-right").style.borderBottom = "transparent";
})

/**
 * clicking the right navigation tab brings the user to check on incomplete orders and removes all other main elements from view;
 * also adds a visual indicator as to which navigation tab is active;
 * also calls showOrders()
 */
document.getElementById("navigation-right").addEventListener("click", function() {
    document.getElementById("order-here").style.display = "none";
    document.getElementById("order-information").style.display = "none";
    document.getElementById("order-impossible").style.display = "none";
    document.getElementById("check-orders").style.display = "block";
    document.getElementById("incomplete-orders").style.display = "block";
    document.getElementById("navigation-right").style.borderBottom = "2px solid seagreen"
    document.getElementById("navigation-left").style.borderBottom = "transparent";

    showOrders();
})

/**
 * makes sure document is currently empty of previously added orders, to avoid doubling up, then gets meals from session storage
 * filters for incomplete and complete meals and adds them to their individual arrays
 * then adds incomplete meals and their order numbers to the document and adds styling
 * completed orders are stored in sessionStorage
 */
const showOrders = () => {
    document.querySelectorAll(".mealClass").forEach(e => e.remove());
    
    const storedMealsString = sessionStorage.getItem("prevOrders");
    const storedMeals = JSON.parse(storedMealsString);    

    if (storedMeals != null) {
        let incompleteMeals = storedMeals.filter(meal => meal.status === "incomplete");

        for (let i = 0; i < incompleteMeals.length; i++) {
            let listNode = document.createElement("p");
            let spanNode = document.createElement("span");
            let mealID = document.createTextNode(`#${incompleteMeals[i].orderID}`);
            let mealName = document.createTextNode(incompleteMeals[i].name);
            let breakNode = document.createElement("br");
        
            listNode.className = "mealClass";
            listNode.id = incompleteMeals[i].orderID;
            spanNode.id = `span-${incompleteMeals[i].orderID}`;
            spanNode.appendChild(mealID);
            listNode.appendChild(spanNode);
            listNode.appendChild(breakNode);
            listNode.appendChild(mealName);
        
            document.getElementById("incomplete-order-list").appendChild(listNode);
        
            document.getElementById(`span-${incompleteMeals[i].orderID}`).style.fontWeight = "bold";
        }
        
    }

}

/**
 * get user input on which order to mark complete. get previous orders from session storage and check orderIDnumbers against user input,
 * mark matching order as complete. remove completed order from array so that only incomplete orders remain, and commit incomplete orders to session storage;
 * remove matching element from document; if no match, inform user.
 */
document.getElementById("complete-order-btn").addEventListener("click", function() {
    let input = document.getElementById("complete-order-number").value;
    let numberInput = Number(input);

    document.getElementById("not-incomplete").innerHTML = "";

    const storedMealsString = sessionStorage.getItem("prevOrders");
    const storedMeals = JSON.parse(storedMealsString);

    let remainingMeals = storedMeals.filter(meal => meal.orderID != numberInput);

    let incompleteMeals = JSON.stringify(remainingMeals);
    sessionStorage.setItem("prevOrders", incompleteMeals);

    let getMeal = document.getElementById(`span-${input}`)
    
    if (getMeal != null) {
        getMeal.parentNode.remove();
    } else {
        document.getElementById("not-incomplete").innerHTML = "I'm sorry, but that order number does not appear to be pending completion. <br> Please try another number.";
        document.getElementById("not-incomplete").style.color = "red";
    }

    
    document.getElementById("complete-order-number").value = "";
    
    return orderList = remainingMeals;
});

// prevent complete order button from refreshing the page
document.getElementById("complete-order-btn").addEventListener("click", function(event) {
    event.preventDefault();
})

// if user chooses to politely leave the restaurant, change background image and display polite message
document.getElementById("leave-restaurant").addEventListener("click", function() {
    document.querySelector("body").style.backgroundImage = "url('https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Wooden_gate_with_open_double_door_leading_to_the_garden_of_Isshinin_Buddhist_temple_in_the_compounds_of_Chion-in_Kyoto_Japan.jpg/3840px-Wooden_gate_with_open_double_door_leading_to_the_garden_of_Isshinin_Buddhist_temple_in_the_compounds_of_Chion-in_Kyoto_Japan.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail')";
    document.getElementById("restaurant-box").style.display = "none";
    document.getElementById("new-navigation").style.display = "none";
    document.getElementById("goodbye-polite").style.display = "block";
    document.getElementById("main-ingredient").value = ""
})

// if user chooses to reenter the restaurant, display internal restaurant background image, remove goodbye message, and show order box again
document.getElementById("return").addEventListener("click", function() {
    document.querySelector("body").style.backgroundImage = "url('https://benjaflynn.github.io/themealdb-apifetch/img/Restaurant_room_of_Amantaka_luxury_Resort_&_Hotel_in_Luang_Prabang_Laos.jpg')";
    document.getElementById("goodbye-polite").style.display = "none";
    document.getElementById("restaurant-box").style.display = "block";
    document.getElementById("new-navigation").style.display = "block";
    document.getElementById("order-impossible").style.display = "none";
    document.getElementById("credit-text").style.display = "none";
    document.getElementById("menu-line").style.display = "block";
    document.getElementById("order-here").style.display = "block";
})

// if user chooses to pick another ingredient, remove the order-impossible box and return user to regular order box. also empty text input
document.getElementById("choose-other-ingredient").addEventListener("click", function() {
    document.getElementById("order-impossible").style.display = "none";
    document.getElementById("order-here").style.display = "block";
    document.getElementById("main-ingredient").value = "";
})

// empty text input 
const keepInputClear = () => {
    document.getElementById("main-ingredient").value = "";
}

// keep text input empty in case of page reload
keepInputClear();

// allow user to click on credits button to see nothing but the credits for images, font, and api
document.getElementById("credits").addEventListener("click", function() {
    document.getElementById("new-navigation").style.display = "none";
    document.getElementById("order-here").style.display = "none";
    document.getElementById("menu-line").style.display = "none";
    document.getElementById("check-orders").style.display = "none";
    document.getElementById("order-impossible").style.display = "none";
    document.getElementById("goodbye-polite").style.display = "none";
    document.getElementById("restaurant-box").style.display = "block";
    document.getElementById("credit-text").style.display = "block";
})

/**
 *  allow user to navigate away from the credits box and be returned to the order box or outside the restaurant
 *  check current background image to find out where the user last was
*/ 
document.getElementById("close-btn").addEventListener("click", function() {
    let backgroundIMG = document.querySelector("body");
    let bgIMGcomputed = getComputedStyle(backgroundIMG).backgroundImage;
    let splitComputed = bgIMGcomputed.split("_");

    if (splitComputed.includes("Amantaka")) {
        document.getElementById("new-navigation").style.display = "block";
        document.getElementById("order-here").style.display = "block";
        document.getElementById("menu-line").style.display = "block";
        document.getElementById("restaurant-box").style.display = "block";
        document.getElementById("credit-text").style.display = "none";
        
        document.getElementById("navigation-left").click();
    } else {
        document.getElementById("leave-restaurant").click();
    }
})

/**
 * add event listeners to all suggested ingredients; if one is clicked, act as if the user had manually entered an ingredient and call submitIngredient();
 * also empty the text input value
 */
const SuggestIngredientFN = () => {
    let suggestedIngredients = document.querySelectorAll(".suggest-ingredient");

    for (let i = 0; i < suggestedIngredients.length; i++) {
        suggestedIngredients[i].addEventListener("click", function(event) {
            let whatClicked = event.target.id;
            document.getElementById("main-ingredient").value = whatClicked;
            submitIngredient();
        })
    }
}

// call SuggestsIngredientFN() on loading the page to attach event listeners to suggested ingredients
SuggestIngredientFN();

// activate suggested ingredients dropdown on mouseover
const activateDropdown = () => {
    let suggest = document.getElementById("dropdown-suggestions");
    
    suggest.style.display = "block"
    document.getElementById("triangle-left").style.display = "none";
    document.getElementById("triangle-down").style.display = "block";
}

// deactivate suggested ingredients dropdown on mouseleave
const deactivateDropdown = () => {
    let suggest = document.getElementById("dropdown-suggestions");

    suggest.style.display = "none"
    document.getElementById("triangle-left").style.display = "block";
    document.getElementById("triangle-down").style.display = "none";    
}

// check session storage for incomplete meals; if there are any, display them
const getPrevMealsFN = () => {
    let storedMealsString = sessionStorage.getItem("prevOrders");
    let storedMeals = JSON.parse(storedMealsString);

    if (storedMeals != null) {

        for (let i = 0; i < storedMeals.length; i++) {
            let listNode = document.createElement("p");
            let spanNode = document.createElement("span");
            let mealID = document.createTextNode(`#${storedMeals[i].orderID}`);
            let mealName = document.createTextNode(storedMeals[i].name);
            let breakNode = document.createElement("br");
        
            listNode.className = "mealClass";
            listNode.id = storedMeals[i].orderID;
            spanNode.id = `span-${storedMeals[i].orderID}`;
            spanNode.appendChild(mealID);
            listNode.appendChild(spanNode);
            listNode.appendChild(breakNode);
            listNode.appendChild(mealName);
        
            document.getElementById("incomplete-order-list").appendChild(listNode);
        
            document.getElementById(`span-${storedMeals[i].orderID}`).style.fontWeight = "bold";
            
        }
        return orderList = storedMeals;
    }

}

// check session storage for the last order number and return it as the current mealIDnumber
const getPrevNumberFN = () => {
    let lastOrderNumberString = sessionStorage.getItem("lastOrderNumber");
    let lastOrderNumber = JSON.parse(lastOrderNumberString);

    let currentNumberOfOrders = mealIDnumber + lastOrderNumber;

    return mealIDnumber = currentNumberOfOrders;     
    
}

// call upon loading the page to get the last order number to use going forward
getPrevNumberFN();

// call upon loading the page so that any items in session storage are displayed correctly
getPrevMealsFN();

