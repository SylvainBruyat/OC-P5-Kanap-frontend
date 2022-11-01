const PRODUCT_ID = new URL(document.URL).searchParams.get("id");

fetch(`https://p5-demo.onrender.com/api/products/${PRODUCT_ID}`)
    .then(function(response) {
        if (response.ok)
            return response.json();
        else
            throw "Something went wrong with the request to get the product info from the API";
    })
    .then(addProductInfoToPage)
    .catch(function(error) {
        let container = document.querySelector("main div");
        let nextChild = container.querySelector("section");
        let errorMessage = document.createElement("div");
        errorMessage.setAttribute("style", "margin-top: 20px; text-align: center; font-size: 24px");
        errorMessage.innerHTML = "Oups ! Nous ne pouvons pas afficher votre produit pour l’instant.<br>Revenez bientôt !";
        container.insertBefore(errorMessage, nextChild);
        console.log(error);
    });

// L'argument "sofa" est un objet renvoyé par l'API qui contient les infos d'un produit
function addProductInfoToPage(sofa) {
    addProductImageToPage(sofa.imageUrl, sofa.altTxt);
    addProductNameToPage(sofa.name);
    addProductPriceToPage(sofa.price);
    addProductDescriptionToPage(sofa.description);
    addProductColorsToPage(sofa.colors);
}

function addProductImageToPage(url, alt) {
    let picture = document.createElement("img");
    picture.setAttribute("src", url);
    picture.setAttribute("alt", alt);

    document
    .querySelector("div.item__img")
    .appendChild(picture);
}

function addProductNameToPage(name) {
    document
    .getElementById("title")
    .textContent = `${name}`;
}

function addProductPriceToPage(price) {
    document
    .getElementById("price")
    .textContent = `${price}`;
}

function addProductDescriptionToPage(description) {
    document
    .getElementById("description")
    .textContent = `${description}`;
}

function addProductColorsToPage(colors) {
    let colorList = document.getElementById("colors");
    for (let color of colors) {
        let colorOption = document.createElement("option");
        colorOption.setAttribute("value", color);
        colorOption.textContent = color;
        colorList
        .appendChild(colorOption);
    }
}

// Création d'une <div> sous l'<input> de quantité pour y mettre les messages d'erreur
let quantityWarningMessage = document.createElement("div");
quantityWarningMessage.setAttribute("style", "color: darkorange;");
document
        .querySelector("div.item__content__settings__quantity")
        .appendChild(quantityWarningMessage);

let quantity = document.getElementById("quantity");
quantity.addEventListener("change", function(event) {
    if (!/^-?[0-9]+$/.test(event.target.value)) { // Cet RegExp n'accepte que les nombres entiers, éventuellement précédés d'un signe moins
        displayWarningMessage("Veuillez entrer un nombre entier");
    }
    else if ((event.target.value < 1) || (event.target.value > 100)) {
        displayWarningMessage("Veuillez entrer une quantité entre 1 et 100");
    }
    else {
        removeWarningMessage();
    }
});

// Fonction d'affichage des messages d'erreur dans la <div> créée sous l'<input> de quantité
function displayWarningMessage(messageToDisplay) {
    quantityWarningMessage.textContent = messageToDisplay;
    setTimeout(function() {
        removeWarningMessage();
    }, 8000);
}

function removeWarningMessage() {
    quantityWarningMessage.textContent = "";
}

let addToCartButton = document.getElementById("addToCart");
addToCartButton.addEventListener("click", function(){
    let productInfo = readFormInfo();
    let formIsValid = validateProductForm(productInfo);
    if (formIsValid) {
        let cart = addProductToCart(productInfo);
        saveCart(cart);
    }
});

// Fonction qui récupère les infos depuis la page produit et crée un objet prêt à être sauvegardé dans le panier du localStorage
function readFormInfo() {
    let id = PRODUCT_ID;
    let color = document.getElementById("colors").value;
    let quantity = document.getElementById("quantity").value;

    return {id, color, quantity};
}

function validateProductForm(product) {
    if (product.color === "") {
        displayErrorMessage("Votre produit n'a pas pu être ajouté au panier car vous n'avez pas choisi de couleur");
        return false;
    }
    else if (!/^[0-9]+$/.test(product.quantity) || product.quantity < 1 || product.quantity > 100) {
        displayErrorMessage("Votre produit n'a pas pu être ajouté au panier. La quantité doit être un nombre entier entre 1 et 100.");
        return false;
    }
    else {
        return true;
    }
}

// Fonction qui affiche un message d'erreur sous le bouton "Ajouter au panier".
function displayErrorMessage(messageToDisplay) {
    let container = document.querySelector(".item__content");
    let errorMessage = document.createElement("div");
    errorMessage.setAttribute("style", "margin-top: 15px; text-align: center; color: darkorange;");
    errorMessage.textContent = messageToDisplay;
    container.appendChild(errorMessage);
    setTimeout(function() {
        container.removeChild(errorMessage);
    },
    8000);
}

function addProductToCart(product) {
    let cart = getCart();
    let productIsAlreadyInCart = checkIfProductIsAlreadyInCart(product, cart);
    if (productIsAlreadyInCart) {
        cart = updateProductQuantity(product, cart);
    }
    else {
        cart.push(product);
        displayConfirmationMessage(`Le canapé couleur ${product.color} a été ajouté à votre panier en ${product.quantity} exemplaire(s).`);
    }
    
    return cart;
}

function getCart() {
    let cart = localStorage.getItem("cart");
    if (cart == null) {
        return [];
    }
    else {
        return JSON.parse(cart);
    }
}

function checkIfProductIsAlreadyInCart(product, cart) {
    for (let item of cart) {
        if (item.id === product.id && item.color === product.color) {
            return true;
        }
    }
    return false;
}

function updateProductQuantity(updatedProduct, cart) {
    for (let cartItem of cart) {
        if (cartItem.id === updatedProduct.id && cartItem.color === updatedProduct.color) {
            let sum = Math.min(100, parseInt(cartItem.quantity, 10) + parseInt(updatedProduct.quantity, 10)); //Limitation de la quantité totale par produit à 100
            let addedQuantity = Math.min(updatedProduct.quantity, 100-cartItem.quantity);
            if (addedQuantity != updatedProduct.quantity) { //Message d'info si la quantité ajoutée est différente de la quantité saisie par l'utilisateur
                displayWarningMessage("La quantité totale de ce produit dans le panier a été limitée à 100.")
            }
            displayConfirmationMessage(`Le canapé couleur ${updatedProduct.color} a été ajouté à votre panier en ${addedQuantity} exemplaire(s).`);
            cartItem.quantity = sum.toString();
            return cart;
        }
    }
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Fonction qui affiche le message de confirmation d'ajout dans le panier sous le bouton "Ajouter au panier"
function displayConfirmationMessage(messageToDisplay) {
    let container = document.querySelector(".item__content");
    let confirmationMessage = document.createElement("div");
    confirmationMessage.setAttribute("style", "margin-top: 15px; text-align: center; color: rgb(0, 120, 0);");
    confirmationMessage.textContent = messageToDisplay;
    container.appendChild(confirmationMessage);
    setTimeout(function() {
        container.removeChild(confirmationMessage);
    },
    8000);
}